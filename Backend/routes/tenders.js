const { requireFromDeps } = require('../lib/deps')

const express = requireFromDeps('express')
const { callGemini, cleanJSON } = require('../lib/gemini')
const { getProfileById } = require('../lib/store')
const { tenders } = require('../data/tenders.json')

const router = express.Router()

// In-memory cache: profile_id → { tenders, cachedAt }
// Prevents non-deterministic Gemini rescoring on every refresh/re-render.
const scoreCache = new Map()
const CACHE_TTL_MS = 15 * 60 * 1000  // 15 minutes

// In-flight deduplication: profile_id → Promise<scored tenders>
// Ensures concurrent requests (e.g. React Strict Mode double-fire) share one Gemini call
// instead of racing and writing conflicting results to the cache.
const scoringInFlight = new Map()

const systemPrompt = `You are a government tender matching engine for Indian MSMEs.
Score how well a business profile matches a tender from 0 to 100.
Consider the company name, its business category, and the tender title and description together.
A company named after a specific domain (e.g. BIM consultancy, IT services, civil engineering)
should score high against tenders in that domain even if the category label alone is broad.
Give a score >= 60 for a clear domain match with met eligibility criteria.
Give a score of 20-59 for a plausible but indirect match.
Give a score < 20 for unrelated goods/equipment tenders.
Return ONLY valid JSON with no extra text, no markdown, no explanation.`

async function scoreAllTenders(profile) {
  const scored = await Promise.all(
    tenders.map(async (tender) => {
      const userMessage = `Score this tender-profile match and return exactly:
{"score": <number 0-100>, "reason": "<one line explanation>"}

Company Profile:
- Company Name: ${profile.company_name}
- Business Category: ${profile.category}
- Annual Turnover: ₹${profile.turnover}
- Years in Operation: ${profile.years_in_operation}
- Certifications: ${JSON.stringify(profile.certifications || [])}

Tender:
- Title: ${tender.title}
- Category: ${tender.category}
- Description: ${tender.full_text}
- Min Turnover Required: ₹${tender.requirements.min_turnover ?? 0}
- Min Years Required: ${tender.requirements.min_years ?? 0}
- Required Certifications: ${JSON.stringify(tender.requirements.certifications)}
- MSME Only: ${tender.requirements.msme_only}`

      try {
        const result = await callGemini(systemPrompt, userMessage)
        const parsed = JSON.parse(cleanJSON(result))
        return { ...tender, match_score: parsed.score, match_reason: parsed.reason }
      } catch {
        return { ...tender, match_score: 0, match_reason: 'Could not score' }
      }
    })
  )

  return scored
    .filter(t => t.match_score >= 20)
    .sort((a, b) => b.match_score - a.match_score)
}

// GET /api/tenders/detail?id=... — uses query param because tender IDs contain slashes
router.get('/detail', (req, res) => {
  const tender = tenders.find(t => t.id === req.query.id)
  if (!tender) return res.status(404).json({ error: 'Tender not found' })
  res.json(tender)
})

// GET /api/tenders/:profile_id — return AI-scored matching tenders
router.get('/:profile_id', async (req, res) => {
  try {
    const profileId = req.params.profile_id

    // Return cached results if still fresh — prevents score flicker on repeated calls
    const cached = scoreCache.get(profileId)
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return res.json({ tenders: cached.tenders })
    }

    // Deduplicate concurrent requests for same profile — prevents race condition where
    // two simultaneous Gemini calls give different scores and corrupt the cache.
    if (scoringInFlight.has(profileId)) {
      const matched = await scoringInFlight.get(profileId)
      return res.json({ tenders: matched })
    }

    const profile = await getProfileById(profileId)
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    const scoringPromise = scoreAllTenders(profile)
    scoringInFlight.set(profileId, scoringPromise)

    try {
      const matched = await scoringPromise
      scoreCache.set(profileId, { tenders: matched, cachedAt: Date.now() })
      res.json({ tenders: matched })
    } finally {
      scoringInFlight.delete(profileId)
    }

  } catch (err) {
    console.error('Tenders error:', err)
    res.status(500).json({ error: 'Tender matching failed', details: err.message })
  }
})

module.exports = router
