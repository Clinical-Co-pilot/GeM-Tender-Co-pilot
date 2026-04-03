const PROFILE_DOCUMENT_DEFINITIONS = [
  {
    key: 'udyam',
    label: 'Udyam Registration Certificate',
    description: 'MSME registration proof from udyamregistration.gov.in',
    required: true,
  },
  {
    key: 'gst',
    label: 'GST Registration Certificate',
    description: 'GST registration certificate or GSTIN proof',
    required: true,
  },
  {
    key: 'pan',
    label: 'PAN Card (Company)',
    description: 'Self-attested copy of company PAN',
    required: false,
  },
  {
    key: 'itr',
    label: 'Income Tax Returns (Last 3 Years)',
    description: 'ITR filings or CA-backed turnover proof',
    required: false,
  },
  {
    key: 'iso',
    label: 'ISO Certificate',
    description: 'ISO 9001 or other applicable certification proof',
    required: false,
  },
  {
    key: 'experience',
    label: 'Work Experience / Completion Certificates',
    description: 'Past work orders, completion certificates, or portfolio evidence',
    required: false,
  },
]

function buildDefaultDocuments() {
  return Object.fromEntries(
    PROFILE_DOCUMENT_DEFINITIONS.map((definition) => [
      definition.key,
      {
        key: definition.key,
        label: definition.label,
        description: definition.description,
        required: definition.required,
        status: 'missing',
      },
    ])
  )
}

function normalizeDocuments(documents = {}) {
  const defaults = buildDefaultDocuments()

  for (const definition of PROFILE_DOCUMENT_DEFINITIONS) {
    const existing = documents?.[definition.key] || {}
    defaults[definition.key] = {
      ...defaults[definition.key],
      ...existing,
      key: definition.key,
      label: definition.label,
      description: definition.description,
      required: definition.required,
      status: existing.status === 'uploaded' ? 'uploaded' : 'missing',
    }
  }

  return defaults
}

function markDocumentUploaded(documents, key, file, extra = {}) {
  const next = normalizeDocuments(documents)
  if (!next[key]) return next

  next[key] = {
    ...next[key],
    status: 'uploaded',
    filename: file?.originalname || next[key].filename,
    uploaded_at: new Date().toISOString(),
    ...extra,
  }

  return next
}

function hydrateDocumentsFromProfile(profile) {
  const documents = normalizeDocuments(profile.documents)

  if (profile.udyam_number && documents.udyam.status !== 'uploaded') {
    documents.udyam = {
      ...documents.udyam,
      status: 'uploaded',
      filename: documents.udyam.filename || 'Udyam Registration Certificate',
    }
  }

  if (profile.gst_number && documents.gst.status !== 'uploaded') {
    documents.gst = {
      ...documents.gst,
      status: 'uploaded',
      filename: documents.gst.filename || 'GST Registration Certificate',
    }
  }

  return documents
}

function calculateProfileCompleteness(profile) {
  const documents = hydrateDocumentsFromProfile(profile)
  const checks = [
    { key: 'company_name', label: 'Company name', done: Boolean(profile.company_name) },
    { key: 'category', label: 'Business category', done: Boolean(profile.category) },
    { key: 'turnover', label: 'Annual turnover', done: Number(profile.turnover) > 0 },
    { key: 'years_in_operation', label: 'Years in operation', done: Number(profile.years_in_operation) > 0 },
    { key: 'certifications', label: 'Certifications added', done: (profile.certifications || []).length > 0 },
    { key: 'udyam', label: 'Udyam uploaded', done: documents.udyam.status === 'uploaded' },
    { key: 'gst', label: 'GST uploaded', done: documents.gst.status === 'uploaded' },
  ]

  const completed = checks.filter((check) => check.done).length
  return {
    score: Math.round((completed / checks.length) * 100),
    completed,
    total: checks.length,
    checks,
  }
}

function sanitizeCertifications(certifications) {
  if (!certifications) return []

  if (Array.isArray(certifications)) {
    return certifications
      .map((value) => String(value).trim())
      .filter(Boolean)
  }

  if (typeof certifications === 'string') {
    try {
      const parsed = JSON.parse(certifications)
      if (Array.isArray(parsed)) {
        return parsed
          .map((value) => String(value).trim())
          .filter(Boolean)
      }
    } catch {
      // Fall through to comma-separated parsing.
    }

    return certifications
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  }

  return []
}

function prepareProfileForSave(profile) {
  const sanitized = {
    ...profile,
    certifications: sanitizeCertifications(profile.certifications),
    documents: hydrateDocumentsFromProfile(profile),
  }

  delete sanitized.completeness
  return sanitized
}

function buildProfileResponse(profile) {
  const prepared = prepareProfileForSave(profile)
  return {
    ...prepared,
    completeness: calculateProfileCompleteness(prepared),
  }
}

function isDocumentKey(key) {
  return PROFILE_DOCUMENT_DEFINITIONS.some((definition) => definition.key === key)
}

module.exports = {
  PROFILE_DOCUMENT_DEFINITIONS,
  buildDefaultDocuments,
  normalizeDocuments,
  markDocumentUploaded,
  hydrateDocumentsFromProfile,
  calculateProfileCompleteness,
  sanitizeCertifications,
  prepareProfileForSave,
  buildProfileResponse,
  isDocumentKey,
}
