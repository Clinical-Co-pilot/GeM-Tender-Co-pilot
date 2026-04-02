const { requireFromDeps } = require('../lib/deps')

const express = requireFromDeps('express')
const { callGemini, cleanJSON } = require('../lib/gemini')
const { getProfileById } = require('../lib/store')
const tenders = require('../data/tenders.json')

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { profile_id, tender_id } = req.body
    const profile = await getProfileById(profile_id)
    const tender = tenders.find(t => t.id === tender_id)

    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    if (!tender) return res.status(404).json({ error: 'Tender not found' })

    const systemPrompt = `You are an expert government tender bid writer for Indian MSMEs.
Write professional formal bid sections in Indian government tender language.
Return ONLY valid JSON with no extra text, no markdown, no explanation.`

    const userMessage = `Generate a technical bid draft and return this exact JSON:
{
  "company_overview": "3-4 paragraph formal company overview",
  "methodology": "detailed project methodology for this tender",
  "past_experience": "relevant experience section",
  "team_credentials": "team expertise section",
  "checklist": [
    {"document": "document name", "status": "ready or missing", "note": "helpful note"}
  ]
}

Company:
- Name: ${profile.company_name}
- Category: ${profile.category}
- Turnover: ${profile.turnover}
- Years: ${profile.years_in_operation}
- Certifications: ${JSON.stringify(profile.certifications || [])}
- GST: ${profile.gst_number || 'Not provided — mark GST Certificate as missing'}
- Udyam: ${profile.udyam_number || 'Not provided — mark Udyam Certificate as missing'}

Tender:
- Title: ${tender.title}
- Department: ${tender.department}
- Value: ${tender.value}
- Requirements: ${tender.full_text}

For the checklist, set status to "ready" only if the company has the document evidence above.
Set status to "missing" if the company has null/not provided for that field.
Checklist must include:
GST Certificate, Udyam Certificate, PAN Card,
Last 3 Years ITR, Bank Solvency Certificate,
Work Completion Certificates, Company Registration, Cancelled Cheque`

    const result = await callGemini(systemPrompt, userMessage)
    const parsed = JSON.parse(cleanJSON(result))
    res.json(parsed)

  } catch (err) {
    console.error('Bid error:', err)
    res.status(500).json({ error: 'Bid generation failed', details: err.message })
  }
})

module.exports = router
