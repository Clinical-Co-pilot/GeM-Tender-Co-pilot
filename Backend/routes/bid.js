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

    const systemPrompt = `You are an expert government tender bid writer for Indian MSMEs.
Write professional, formal bid sections in Indian government tender language.
Base all content strictly on the company profile provided.
Return ONLY valid JSON with no extra text, no markdown, no explanation.`

    const userMessage = `Generate a complete technical bid draft and return this exact JSON:
{
  "company_overview": "3-4 paragraph formal company overview for government bid",
  "methodology": "detailed project methodology specific to this tender requirements",
  "past_experience": "relevant experience section based on company profile",
  "team_credentials": "team expertise and credentials section",
  "checklist": [
    {
      "document": "exact document name",
      "status": "ready or missing",
      "note": "helpful note about this document"
    }
  ]
}

Company Profile:
- Name: ${profile.company_name}
- Category: ${profile.category}
- Turnover: ₹${profile.turnover}
- Years in Operation: ${profile.years_in_operation}
- Certifications: ${JSON.stringify(profile.certifications || [])}
- GST Number: ${profile.gst_number || 'Registered'}
- Udyam Number: ${profile.udyam_number || 'Registered'}

Tender Details:
- Title: ${tender.title}
- Department: ${tender.department}
- Value: ${tender.value}
- Requirements: ${tender.full_text}

For the checklist include these standard GeM documents:
GST Registration Certificate, Udyam/MSME Certificate, 
PAN Card, Last 3 Years ITR, Bank Solvency Certificate,
Work Completion Certificates (minimum 2),
Company Registration Certificate, Cancelled Cheque.
Mark as ready if the profile suggests it exists, missing if not mentioned.`

    const result = await callGemini(systemPrompt, userMessage)
    const parsed = JSON.parse(cleanJSON(result))

    res.json(parsed)

  } catch (err) {
    console.error('Bid error:', err)
    res.status(500).json({ error: 'Bid generation failed', details: err.message })
  }
})

module.exports = router