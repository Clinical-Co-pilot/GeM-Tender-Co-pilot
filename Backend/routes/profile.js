const crypto = require('crypto')
const { requireFromDeps } = require('../lib/deps')

const express = requireFromDeps('express')
const multer = requireFromDeps('multer')
const { callGemini, cleanJSON, extractFromDocument } = require('../lib/gemini')
const { saveProfile, getProfileById } = require('../lib/store')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// POST /api/profile — create profile, extract numbers from uploaded documents
router.post('/', upload.fields([{ name: 'udyam' }, { name: 'gst' }]), async (req, res) => {
  try {
    const { company_name, category, turnover, years_in_operation, certifications } = req.body

    const udyamFile = req.files?.udyam?.[0] || null
    const gstFile = req.files?.gst?.[0] || null

    // Extract registration numbers from uploaded images/PDFs using Gemini Vision
    let udyam_number = null
    let gst_number = null

    if (udyamFile) {
      try {
        const raw = await extractFromDocument(udyamFile.buffer, udyamFile.mimetype, 'udyam')
        const parsed = JSON.parse(cleanJSON(raw))
        udyam_number = parsed.udyam_number || null
      } catch (e) {
        console.warn('Udyam extraction failed:', e.message)
      }
    }

    if (gstFile) {
      try {
        const raw = await extractFromDocument(gstFile.buffer, gstFile.mimetype, 'gst')
        const parsed = JSON.parse(cleanJSON(raw))
        gst_number = parsed.gst_number || null
      } catch (e) {
        console.warn('GST extraction failed:', e.message)
      }
    }

    // Normalise certifications — can arrive as comma string or JSON array
    let certsArray = []
    if (certifications) {
      if (Array.isArray(certifications)) {
        certsArray = certifications
      } else {
        try {
          const parsed = JSON.parse(certifications)
          certsArray = Array.isArray(parsed) ? parsed : [certifications]
        } catch {
          certsArray = certifications.split(',').map(s => s.trim()).filter(Boolean)
        }
      }
    }

    // Use Gemini to classify business_type from the inputs
    const systemPrompt = `You are a business document analyzer for Indian MSMEs.
Return ONLY valid JSON with no extra text, no markdown, no explanation.`

    const userMessage = `Classify this business and return exactly:
{"business_type": "one of: Sole Proprietorship, Partnership, LLP, Private Limited, Public Limited, Other"}

Company Name: ${company_name}
Category: ${category}`

    let business_type = category
    try {
      const result = await callGemini(systemPrompt, userMessage)
      const parsed = JSON.parse(cleanJSON(result))
      business_type = parsed.business_type || category
    } catch {
      // fallback to category
    }

    const profile_id = crypto.randomUUID()
    const profile = {
      company_name,
      udyam_number,
      gst_number,
      business_type,
      category,
      turnover: parseFloat(turnover),
      years_in_operation: parseInt(years_in_operation),
      certifications: certsArray,
    }

    await saveProfile(profile_id, profile)
    res.json({ profile_id, profile })

  } catch (err) {
    console.error('Profile error:', err)
    res.status(500).json({ error: 'Profile processing failed', details: err.message })
  }
})

// GET /api/profile/:profile_id
router.get('/:profile_id', async (req, res) => {
  const profile = await getProfileById(req.params.profile_id)
  if (!profile) return res.status(404).json({ error: 'Profile not found' })
  res.json({ profile_id: req.params.profile_id, profile })
})

module.exports = router
