const crypto = require('crypto')
const { requireFromDeps } = require('../lib/deps')

const express = requireFromDeps('express')
const { callGemini, cleanJSON } = require('../lib/gemini')
const { getProfileById } = require('../lib/store')
const { tenders } = require('../data/tenders.json')

const router = express.Router()

// In-memory cache: profile_id → { tenders, cachedAt, fingerprint }
// Keeps repeated dashboard loads stable without preserving stale results after profile edits.
const scoreCache = new Map()
const CACHE_TTL_MS = 15 * 60 * 1000

// In-flight deduplication: profile_id:fingerprint → Promise<scored tenders>
const scoringInFlight = new Map()

const AI_ENRICH_SYSTEM_PROMPT = `You are a government tender matching assistant for Indian MSMEs.
Review a deterministic tender match score and refine only if the tender clearly fits better or worse than the baseline.
Return ONLY valid JSON with no extra text, no markdown, no explanation.`

const STOP_WORDS = new Set([
  'and', 'the', 'for', 'with', 'from', 'into', 'your', 'this', 'that', 'are', 'was', 'were',
  'have', 'has', 'had', 'their', 'its', 'our', 'under', 'based', 'services', 'service', 'private',
  'limited', 'pvt', 'ltd', 'llp', 'company', 'consultants', 'consultant', 'solutions', 'solution',
  'test', 'yes', 'specified', 'scope', 'work', 'milestone', 'deliverable',
])

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value = '') {
  return [...new Set(
    normalizeText(value)
      .split(' ')
      .filter((token) => token.length >= 3 && !STOP_WORDS.has(token))
  )]
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function buildProfileFingerprint(profile) {
  return crypto
    .createHash('sha1')
    .update(JSON.stringify({
      company_name: profile.company_name || '',
      category: profile.category || '',
      turnover: profile.turnover || 0,
      years_in_operation: profile.years_in_operation || 0,
      certifications: profile.certifications || [],
      documents: profile.documents || {},
    }))
    .digest('hex')
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

function deterministicScoreTender(profile, tender) {
  const tenderText = normalizeText(`${tender.title} ${tender.category} ${tender.full_text}`)
  const profileText = normalizeText(`${profile.company_name} ${profile.category}`)
  const profileTokens = tokenize(`${profile.company_name} ${profile.category}`)
  const matchedTokens = profileTokens.filter((token) => tenderText.includes(token))
  const reasonParts = []
  let score = 0

  if (matchedTokens.length > 0) {
    score += Math.min(60, matchedTokens.length * 15)
    reasonParts.push(`Domain overlap on ${matchedTokens.slice(0, 3).join(', ')}`)
  }

  if (profileText.includes('consult') && tenderText.includes('consult')) {
    score += 10
    reasonParts.push('Consultancy scope aligned')
  }

  if (
    (profileText.includes('engineering') || profileText.includes('design') || profileText.includes('architect')) &&
    (tenderText.includes('engineering') || tenderText.includes('design') || tenderText.includes('architect'))
  ) {
    score += 12
    reasonParts.push('Engineering/design keywords aligned')
  }

  if (tender.requirements.min_turnover != null) {
    if (Number(profile.turnover) >= tender.requirements.min_turnover) {
      score += 10
      reasonParts.push(`Turnover clears ${formatCurrency(tender.requirements.min_turnover)}`)
    } else {
      score -= 20
      reasonParts.push(`Turnover below ${formatCurrency(tender.requirements.min_turnover)}`)
    }
  } else if (Number(profile.turnover) > 0) {
    score += 4
  }

  if (tender.requirements.min_years != null) {
    if (Number(profile.years_in_operation) >= tender.requirements.min_years) {
      score += 10
      reasonParts.push(`Experience clears ${tender.requirements.min_years} years`)
    } else {
      score -= 15
      reasonParts.push(`Needs ${tender.requirements.min_years}+ years experience`)
    }
  } else if (Number(profile.years_in_operation) > 0) {
    score += 4
  }

  const requiredCertifications = tender.requirements.certifications || []
  const profileCertifications = (profile.certifications || []).map((item) => normalizeText(item))
  if (requiredCertifications.length > 0) {
    const matchedCertifications = requiredCertifications.filter((certification) => {
      const normalized = normalizeText(certification)
      return profileCertifications.some((owned) => owned.includes(normalized) || normalized.includes(owned))
    })

    if (matchedCertifications.length === requiredCertifications.length) {
      score += 8
      reasonParts.push('Required certifications available')
    } else if (matchedCertifications.length > 0) {
      score += 4
      reasonParts.push('Partial certification match')
    } else {
      score -= 6
    }
  } else if (profileCertifications.length > 0) {
    score += 4
  }

  if (tender.requirements.past_experience_required) {
    if (profile.documents?.experience?.status === 'uploaded') {
      score += 8
      reasonParts.push('Experience documents uploaded')
    } else if (Number(profile.years_in_operation) >= (tender.requirements.min_years || 1)) {
      score += 3
    }
  }

  if (tender.requirements.msme_only) {
    if (profile.documents?.udyam?.status === 'uploaded') {
      score += 5
    } else {
      score -= 10
    }
  }

  if (tender.requirements.oem_authorization_required) {
    if (profileText.includes('hardware') || profileText.includes('supply')) {
      score += 4
    } else {
      score -= 8
    }
  }

  score = clamp(Math.round(score), 0, 100)

  return {
    ...tender,
    match_score: score,
    match_reason: reasonParts.slice(0, 3).join('; ') || 'Limited scope overlap with tender requirements',
  }
}

async function maybeEnrichTenderScore(profile, tender) {
  if (!process.env.GEMINI_API_KEY || tender.match_score < 40) {
    return tender
  }

  const userMessage = `Refine this tender match and return exactly:
{"score": <number 0-100>, "reason": "<one line explanation>"}

Baseline score: ${tender.match_score}
Baseline reason: ${tender.match_reason}

Company Profile:
- Company Name: ${profile.company_name}
- Business Category: ${profile.category}
- Annual Turnover: ${profile.turnover}
- Years in Operation: ${profile.years_in_operation}
- Certifications: ${JSON.stringify(profile.certifications || [])}

Tender:
- Title: ${tender.title}
- Category: ${tender.category}
- Description: ${tender.full_text}
- Min Turnover Required: ${tender.requirements.min_turnover ?? 0}
- Min Years Required: ${tender.requirements.min_years ?? 0}`

  try {
    const result = await callGemini(AI_ENRICH_SYSTEM_PROMPT, userMessage)
    const parsed = JSON.parse(cleanJSON(result))
    const blendedScore = clamp(
      Math.round((tender.match_score * 0.75) + (Number(parsed.score || tender.match_score) * 0.25)),
      0,
      100
    )

    return {
      ...tender,
      match_score: blendedScore,
      match_reason: parsed.reason || tender.match_reason,
    }
  } catch {
    return tender
  }
}

async function scoreAllTenders(profile) {
  const deterministic = tenders
    .map((tender) => deterministicScoreTender(profile, tender))
    .filter((tender) => tender.match_score >= 20)
    .sort((a, b) => b.match_score - a.match_score)

  if (deterministic.length === 0) {
    return []
  }

  const topIds = new Set(deterministic.slice(0, 5).map((tender) => tender.id))
  const enriched = await Promise.all(
    deterministic.map((tender) => (
      topIds.has(tender.id)
        ? maybeEnrichTenderScore(profile, tender)
        : Promise.resolve(tender)
    ))
  )

  return enriched.sort((a, b) => b.match_score - a.match_score)
}

// GET /api/tenders/all?profile_id=... — returns ALL tenders scored (no score filter)
router.get('/all', async (req, res) => {
  try {
    const profileId = req.query.profile_id
    if (!profileId) {
      const all = tenders.map((tender) => ({ ...tender, match_score: 0, match_reason: 'Login to see your match score.' }))
      return res.json({ tenders: all })
    }

    const profile = await getProfileById(profileId)
    if (!profile) {
      const all = tenders.map((tender) => ({ ...tender, match_score: 0, match_reason: 'Profile not found.' }))
      return res.json({ tenders: all })
    }

    const scored = tenders
      .map((tender) => deterministicScoreTender(profile, tender))
      .sort((a, b) => b.match_score - a.match_score)

    return res.json({ tenders: scored })
  } catch (err) {
    console.error('All tenders error:', err)
    res.status(500).json({ error: 'Failed to fetch all tenders', details: err.message })
  }
})

// GET /api/tenders/detail?id=... — uses query param because tender IDs contain slashes
router.get('/detail', async (req, res) => {
  const tender = tenders.find((item) => item.id === req.query.id)
  if (!tender) return res.status(404).json({ error: 'Tender not found' })

  const profileId = req.query.profile_id
  if (!profileId) {
    return res.json({
      ...tender,
      match_score: 0,
      match_reason: 'Profile-specific match score unavailable without a profile context.',
    })
  }

  try {
    const profile = await getProfileById(profileId)
    if (!profile) {
      return res.json({
        ...tender,
        match_score: 0,
        match_reason: 'Profile not found for this tender view.',
      })
    }

    return res.json(deterministicScoreTender(profile, tender))
  } catch (err) {
    console.warn('Tender detail scoring fallback:', err.message)
    return res.json({
      ...tender,
      match_score: 0,
      match_reason: 'Unable to compute match score for this tender view.',
    })
  }
})

// GET /api/tenders/:profile_id — return scored matching tenders
router.get('/:profile_id', async (req, res) => {
  try {
    const profileId = req.params.profile_id
    const profile = await getProfileById(profileId)

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    const fingerprint = buildProfileFingerprint(profile)
    const cached = scoreCache.get(profileId)
    if (
      cached &&
      cached.fingerprint === fingerprint &&
      Date.now() - cached.cachedAt < CACHE_TTL_MS
    ) {
      return res.json({ tenders: cached.tenders })
    }

    const inFlightKey = `${profileId}:${fingerprint}`
    if (scoringInFlight.has(inFlightKey)) {
      const matched = await scoringInFlight.get(inFlightKey)
      return res.json({ tenders: matched })
    }

    const scoringPromise = scoreAllTenders(profile)
    scoringInFlight.set(inFlightKey, scoringPromise)

    try {
      const matched = await scoringPromise
      scoreCache.set(profileId, { tenders: matched, cachedAt: Date.now(), fingerprint })
      res.json({ tenders: matched })
    } finally {
      scoringInFlight.delete(inFlightKey)
    }
  } catch (err) {
    console.error('Tenders error:', err)
    res.status(500).json({ error: 'Tender matching failed', details: err.message })
  }
})

module.exports = router
