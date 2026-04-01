const express = require('express')
const { callGemini, cleanJSON } = require('../lib/gemini')
const { profileStore } = require('./profile')
const tenders = require('../data/tenders.json')

const router = express.Router()

router.get('/:profile_id', async (req, res) => {
  try {
    const profile = profileStore.get(req.params.profile_id)

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    const systemPrompt = `You are a government tender matching engine for Indian MSMEs.
Score how well a business profile matches a tender from 0 to 100.
Return ONLY valid JSON with no extra text, no markdown, no explanation.`

    // Score all tenders in parallel
    const scoredTenders = await Promise.all(
      tenders.map(async (tender) => {
        const userMessage = `Score this match and return:
{
  "score": <number 0-100>,
  "reason": "<one line explanation>"
}

Business Profile:
- Company: ${profile.company_name}
- Category: ${profile.category}
- Annual Turnover: ₹${profile.turnover}
- Years in Operation: ${profile.years_in_operation}
- Certifications: ${JSON.stringify(profile.certifications || [])}

Tender Requirements:
- Category: ${tender.category}
- Min Turnover: ₹${tender.requirements.min_turnover}
- Min Years: ${tender.requirements.min_years}
- Required Certifications: ${JSON.stringify(tender.requirements.certifications)}
- MSME Only: ${tender.requirements.msme_only}

Score high if profile meets most requirements. Score low if profile misses key criteria.`

        try {
          const result = await callGemini(systemPrompt, userMessage)
          const parsed = JSON.parse(cleanJSON(result))
          return {
            ...tender,
            match_score: parsed.score,
            match_reason: parsed.reason
          }
        } catch {
          return { ...tender, match_score: 0, match_reason: 'Could not score' }
        }
      })
    )

    // Filter and sort
    const matched = scoredTenders
      .filter(t => t.match_score > 40)
      .sort((a, b) => b.match_score - a.match_score)

    res.json({ tenders: matched })

  } catch (err) {
    console.error('Tenders error:', err)
    res.status(500).json({ error: 'Tender matching failed', details: err.message })
  }
})

module.exports = router