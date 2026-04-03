const crypto = require('crypto')
const { requireFromDeps } = require('../lib/deps')

const express = requireFromDeps('express')
const multer = requireFromDeps('multer')
const { callGemini, cleanJSON, extractFromDocument } = require('../lib/gemini')
const { saveProfile, getProfileById } = require('../lib/store')
const {
  PROFILE_DOCUMENT_DEFINITIONS,
  markDocumentUploaded,
  sanitizeCertifications,
  prepareProfileForSave,
  buildProfileResponse,
  isDocumentKey,
} = require('../lib/profileContract')
const { storeProfileDocument, resolveStoredPath } = require('../lib/fileStorage')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })
const uploadFields = PROFILE_DOCUMENT_DEFINITIONS.map((definition) => ({
  name: definition.key,
  maxCount: 1,
}))

function getUploadedFiles(files = {}) {
  return Object.fromEntries(
    PROFILE_DOCUMENT_DEFINITIONS
      .map((definition) => [definition.key, files?.[definition.key]?.[0] || null])
      .filter(([, file]) => Boolean(file))
  )
}

async function extractRegistrationNumber(file, type) {
  if (!file) return null

  try {
    const raw = await extractFromDocument(file.buffer, file.mimetype, type)
    const parsed = JSON.parse(cleanJSON(raw))
    return type === 'udyam'
      ? parsed.udyam_number || null
      : parsed.gst_number || null
  } catch (err) {
    console.warn(`${type.toUpperCase()} extraction failed:`, err.message)
    return null
  }
}

async function applyUploadedDocuments(profileId, profile, uploadedFiles) {
  let documents = profile.documents

  for (const [key, file] of Object.entries(uploadedFiles)) {
    const storedMeta = await storeProfileDocument(profileId, key, file)
    documents = markDocumentUploaded(documents, key, file, storedMeta)
  }

  return {
    ...profile,
    documents,
  }
}

async function classifyBusinessType(companyName, category) {
  const systemPrompt = `You are a business document analyzer for Indian MSMEs.
Return ONLY valid JSON with no extra text, no markdown, no explanation.`

  const userMessage = `Classify this business and return exactly:
{"business_type": "one of: Sole Proprietorship, Partnership, LLP, Private Limited, Public Limited, Other"}

Company Name: ${companyName}
Category: ${category}`

  try {
    const result = await callGemini(systemPrompt, userMessage)
    const parsed = JSON.parse(cleanJSON(result))
    return parsed.business_type || category
  } catch {
    return category
  }
}

// POST /api/profile — create profile, extract numbers from uploaded documents
router.post('/', upload.fields(uploadFields), async (req, res) => {
  try {
    const { company_name, category, turnover, years_in_operation } = req.body
    const certifications = sanitizeCertifications(req.body.certifications)
    const uploadedFiles = getUploadedFiles(req.files)
    const profile_id = crypto.randomUUID()

    const [udyam_number, gst_number, business_type] = await Promise.all([
      extractRegistrationNumber(uploadedFiles.udyam, 'udyam'),
      extractRegistrationNumber(uploadedFiles.gst, 'gst'),
      classifyBusinessType(company_name, category),
    ])

    const baseProfile = prepareProfileForSave({
      company_name,
      udyam_number,
      gst_number,
      business_type,
      category,
      turnover: parseFloat(turnover) || 0,
      years_in_operation: parseInt(years_in_operation, 10) || 0,
      certifications,
      documents: {},
    })

    const profile = prepareProfileForSave(await applyUploadedDocuments(profile_id, baseProfile, uploadedFiles))

    await saveProfile(profile_id, profile)
    res.json({ profile_id, profile: buildProfileResponse(profile) })
  } catch (err) {
    console.error('Profile error:', err)
    res.status(500).json({ error: 'Profile processing failed', details: err.message })
  }
})

// POST /api/profile/:profile_id/documents — upload or replace one profile document
router.post('/:profile_id/documents', upload.single('file'), async (req, res) => {
  try {
    const { profile_id } = req.params
    const { key } = req.body
    const existing = await getProfileById(profile_id)

    if (!existing) return res.status(404).json({ error: 'Profile not found' })
    if (!isDocumentKey(key)) return res.status(400).json({ error: 'Invalid document key' })
    if (!req.file) return res.status(400).json({ error: 'File is required' })

    let nextProfile = await applyUploadedDocuments(profile_id, existing, { [key]: req.file })

    if (key === 'udyam') {
      const extracted = await extractRegistrationNumber(req.file, 'udyam')
      if (extracted) nextProfile.udyam_number = extracted
    }

    if (key === 'gst') {
      const extracted = await extractRegistrationNumber(req.file, 'gst')
      if (extracted) nextProfile.gst_number = extracted
    }

    nextProfile = prepareProfileForSave(nextProfile)

    await saveProfile(profile_id, nextProfile)
    res.json({ profile_id, profile: buildProfileResponse(nextProfile) })
  } catch (err) {
    console.error('Profile document upload error:', err)
    res.status(500).json({ error: 'Document upload failed', details: err.message })
  }
})

// GET /api/profile/:profile_id/documents/:key/file — download a stored uploaded file
router.get('/:profile_id/documents/:key/file', async (req, res) => {
  try {
    const { profile_id, key } = req.params
    const profile = await getProfileById(profile_id)

    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    if (!isDocumentKey(key)) return res.status(400).json({ error: 'Invalid document key' })

    const document = profile.documents?.[key]
    if (!document?.storage_path) {
      return res.status(404).json({ error: 'Stored file not found' })
    }

    return res.download(resolveStoredPath(document.storage_path), document.filename || `${key}-document`)
  } catch (err) {
    console.error('Profile document download error:', err)
    res.status(500).json({ error: 'Document download failed', details: err.message })
  }
})

// GET /api/profile/:profile_id
router.get('/:profile_id', async (req, res) => {
  try {
    const profile = await getProfileById(req.params.profile_id)
    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    res.json({ profile_id: req.params.profile_id, profile: buildProfileResponse(profile) })
  } catch (err) {
    console.error('Profile fetch error:', err)
    res.status(503).json({ error: 'Profile unavailable', details: err.message })
  }
})

// PUT /api/profile/:profile_id — update mutable profile fields
router.put('/:profile_id', async (req, res) => {
  try {
    const { profile_id } = req.params
    const existing = await getProfileById(profile_id)
    if (!existing) return res.status(404).json({ error: 'Profile not found' })

    const {
      profile_id: _ignoredProfileId,
      completeness: _ignoredCompleteness,
      documents: _ignoredDocuments,
      ...updates
    } = req.body

    const merged = prepareProfileForSave({
      ...existing,
      ...updates,
      certifications: updates.certifications !== undefined
        ? sanitizeCertifications(updates.certifications)
        : existing.certifications,
    })

    await saveProfile(profile_id, merged)
    const updated = await getProfileById(profile_id)
    res.json({ profile_id, profile: buildProfileResponse(updated) })
  } catch (err) {
    console.error('Profile update error:', err)
    res.status(503).json({ error: 'Profile update failed', details: err.message })
  }
})

module.exports = router
