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

    const profile = await getProfileById(profileId)

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    const systemPrompt = `You are a government tender matching engine for Indian MSMEs.
Score how well a business profile matches a tender from 0 to 100.
Give a higher score if the company's service/product category overlaps with the tender scope.
Give a lower score for completely unrelated goods or equipment tenders.
Return ONLY valid JSON with no extra text, no markdown, no explanation.`

    const scoredTenders = await Promise.all(
      tenders.map(async (tender) => {
        const userMessage = `Score this match and return exactly:
{"score": <number 0-100>, "reason": "<one line explanation>"}

Business Profile:
- Category: ${profile.category}
- Turnover: ₹${profile.turnover}
- Years in Operation: ${profile.years_in_operation}
- Certifications: ${JSON.stringify(profile.certifications || [])}

Tender Requirements:
- Category: ${tender.category}
- Min Turnover: ₹${tender.requirements.min_turnover ?? 0}
- Min Years: ${tender.requirements.min_years ?? 0}
- Certifications required: ${JSON.stringify(tender.requirements.certifications)}
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

    const matched = scoredTenders
      .filter(t => t.match_score >= 20)
      .sort((a, b) => b.match_score - a.match_score)

    // Cache so subsequent calls (refresh, Strict Mode double-fire) return the same result
    scoreCache.set(profileId, { tenders: matched, cachedAt: Date.now() })

    res.json({ tenders: matched })

  } catch (err) {
    console.error('Tenders error:', err)
    res.status(500).json({ error: 'Tender matching failed', details: err.message })
  }
})

module.exports = router
