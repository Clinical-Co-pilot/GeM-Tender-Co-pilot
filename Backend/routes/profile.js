const express = require('express')
const multer = require('multer')
const pdfParse = require('pdf-parse')
const { v4: uuidv4 } = require('uuid')
const { callGemini, cleanJSON } = require('../lib/gemini')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Store profiles in memory
const profileStore = new Map()

router.post('/', upload.fields([
  { name: 'udyam', maxCount: 1 },
  { name: 'gst', maxCount: 1 }
]), async (req, res) => {
  try {
    const { company_name, category, turnover, years_in_operation } = req.body

    // Parse PDFs if uploaded
    let udyamText = 'Not provided'
    let gstText = 'Not provided'

    if (req.files?.udyam) {
      const parsed = await pdfParse(req.files.udyam[0].buffer)
      udyamText = parsed.text
    }

    if (req.files?.gst) {
      const parsed = await pdfParse(req.files.gst[0].buffer)
      gstText = parsed.text
    }

    // Extract structured info using Gemini
    const systemPrompt = `You are a business document analyzer for Indian MSMEs.
Extract key business information from provided documents.
Return ONLY valid JSON with no extra text, no markdown, no explanation.`

    const userMessage = `Extract business details and return this exact JSON structure:
{
  "company_name": "string",
  "udyam_number": "string or null",
  "gst_number": "string or null",
  "business_type": "string",
  "certifications": ["array of certifications found"]
}

Manual inputs:
- Company Name: ${company_name}
- Category: ${category}
- Turnover: ${turnover}
- Years in operation: ${years_in_operation}

Udyam document text: ${udyamText}
GST document text: ${gstText}

If document text says "Not provided", use the manual inputs only.`

    const result = await callGemini(systemPrompt, userMessage)
    const extracted = JSON.parse(cleanJSON(result))

    const profile_id = uuidv4()
    const profile = {
      ...extracted,
      company_name: company_name || extracted.company_name,
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