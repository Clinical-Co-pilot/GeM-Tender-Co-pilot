const crypto = require('crypto')
const { requireFromDeps } = require('../lib/deps')

const express = requireFromDeps('express')
const multer = requireFromDeps('multer')
const { callGemini, cleanJSON } = require('../lib/gemini')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })
const profileStore = new Map()

router.post('/', upload.none(), async (req, res) => {
  try {
    const { company_name, category, turnover, years_in_operation, certifications } = req.body

    const systemPrompt = `You are a business document analyzer for Indian MSMEs.
Return ONLY valid JSON with no extra text, no markdown, no explanation.`

    const userMessage = `Create a business profile and return this exact JSON:
{
  "company_name": "string",
  "udyam_number": null,
  "gst_number": null,
  "business_type": "string",
  "certifications": ["array of certifications"]
}

Business details:
- Company Name: ${company_name}
- Category: ${category}
- Turnover: ${turnover}
- Years in operation: ${years_in_operation}
- Certifications: ${certifications || 'none'}`

    const result = await callGemini(systemPrompt, userMessage)
    const extracted = JSON.parse(cleanJSON(result))

    const profile_id = crypto.randomUUID()
    const profile = {
      ...extracted,
      company_name,
      category,
      turnover: parseFloat(turnover),
      years_in_operation: parseInt(years_in_operation)
    }

    profileStore.set(profile_id, profile)
    res.json({ profile_id, profile })

  } catch (err) {
    console.error('Profile error:', err)
    res.status(500).json({ error: 'Profile processing failed', details: err.message })
  }
})

module.exports = router
module.exports.profileStore = profileStore
