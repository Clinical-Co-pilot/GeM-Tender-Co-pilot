const express = require('express')
const { callGemini, cleanJSON } = require('../lib/gemini')
const { profileStore } = require('./profile')
const tenders = require('../data/tenders.json')

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { profile_id, tender_id } = req.body

    const profile = profileStore.get(profile_id)
    const tender = tenders.find(t => t.id === tender_id)

    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    if (!tender) return res.status(404).json({ error: 'Tender not found' })

    const systemPrompt = `You are a government tender eligibility checker for Indian MSMEs.
Analyze if a business meets every tender requirement precisely.
Return ONLY valid JSON with no extra text, no markdown, no explanation.`

    const userMessage = `Check eligibility and return this exact JSON:
{
  "score": <number of criteria passed>,
  "total": <total criteria checked>,
  "criteria": [
    {
      "name": "criterion name",
      "status": "pass or fail or partial",
      "detail": "specific explanation with numbers from the profile"
    }
  ],
  "risk_flags": ["list of risks the business should know before bidding"],
  "recommendation": "one line overall recommendation"
}

Check ALL of these criteria:
1. GST Registration
2. MSME/Udyam Registration
3. Minimum Turnover (required: ₹${tender.requirements.min_turnover}, business has: ₹${profile.turnover})
4. Years in Operation (required: ${tender.requirements.min_years}, business has: ${profile.years_in_operation})
5. Required Certifications (required: ${JSON.stringify(tender.requirements.certifications)}, business has: ${JSON.stringify(profile.certifications || [])})
6. MSME Only Requirement (tender MSME only: ${tender.requirements.msme_only})
7. EMD Requirement (required: ${tender.requirements.emd_required}, amount: ₹${tender.requirements.emd_amount})
8. Category Match (tender: ${tender.category}, business: ${profile.category})
9. Past Order Value (required: ₹${tender.requirements.past_order_value})
10. Geographic Eligibility

Risk factors to flag:
- Penalty clauses: ${JSON.stringify(tender.penalty_clauses)}
- Payment terms: ${tender.payment_terms}

Business Profile: ${JSON.stringify(profile)}
Tender Full Text: ${tender.full_text}`

    const result = await callGemini(systemPrompt, userMessage)
    const parsed = JSON.parse(cleanJSON(result))

    res.json(parsed)

  } catch (err) {
    console.error('Eligibility error:', err)
    res.status(500).json({ error: 'Eligibility check failed', details: err.message })
  }
})

module.exports = router