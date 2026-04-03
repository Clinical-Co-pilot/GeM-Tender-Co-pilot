const fs = require('fs/promises')
const path = require('path')

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads', 'profiles')

function sanitizeFilename(filename = 'document') {
  return String(filename)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildRelativeStoragePath(profileId, key, storedFilename) {
  return path.join('uploads', 'profiles', profileId, key, storedFilename).replace(/\\/g, '/')
}

async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function storeProfileDocument(profileId, key, file) {
  const dirPath = path.join(UPLOAD_ROOT, profileId, key)
  const safeOriginalName = sanitizeFilename(file.originalname || `${key}-document`)
  const storedFilename = `${Date.now()}-${safeOriginalName}`
  const absolutePath = path.join(dirPath, storedFilename)

  await ensureDirectory(dirPath)
  await fs.writeFile(absolutePath, file.buffer)

  return {
    storage_path: buildRelativeStoragePath(profileId, key, storedFilename),
    mime_type: file.mimetype || 'application/octet-stream',
    size_bytes: Number(file.size) || Buffer.byteLength(file.buffer),
    filename: file.originalname || safeOriginalName,
    uploaded_at: new Date().toISOString(),
  }
}

function resolveStoredPath(relativeStoragePath = '') {
  const normalized = path.normalize(relativeStoragePath)
  return path.join(__dirname, '..', normalized)
}

module.exports = {
  storeProfileDocument,
  resolveStoredPath,
}
