/**
 * Data access layer â€” MongoDB with in-memory degraded fallback.
 * All routes use this module so DB logic is centralised here.
 */

// The local router DNS refuses SRV queries (needed by mongodb+srv:// URIs).
// Prepend public DNS servers so the MongoDB driver can resolve SRV records,
// while still falling back to the system resolver for everything else.
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()])

const { MongoClient } = require('mongodb')

const MONGODB_URL = process.env.MONGODB_URL
const DB_NAME = 'gem_tender_copilot'

let client = null
let db = null
let storageMode = 'memory'
const memoryProfiles = new Map()
const memoryTenderWorkflows = new Map()
const memoryDrafts = new Map()
const memoryUsers = new Map()

function workflowKey(profileId, tenderId) {
  return `${profileId}::${tenderId}`
}

function draftKey(profileId, tenderId) {
  return `${profileId}::${tenderId}`
}

function stripInternalFields(doc = {}) {
  const { _id, updatedAt, ...record } = doc
  return record
}

async function connect() {
  if (db) return db
  if (!MONGODB_URL) return null

  try {
    client = new MongoClient(MONGODB_URL, { serverSelectionTimeoutMS: 8000 })
    await client.connect()
    db = client.db(DB_NAME)
    storageMode = 'mongo'
    console.log(`MongoDB connected â€” database: ${DB_NAME}`)
    return db
  } catch (err) {
    storageMode = 'memory'
    db = null
    console.warn(`[MongoDB] Falling back to in-memory profile store: ${err.message}`)
    return null
  }
}

async function saveProfile(id, profile) {
  const database = await connect()
  const record = { profile_id: id, ...profile, updatedAt: new Date() }

  if (database) {
    await database.collection('profiles').replaceOne(
      { profile_id: id },
      record,
      { upsert: true }
    )
    return
  }

  memoryProfiles.set(id, record)
}

async function getProfileById(id) {
  const database = await connect()
  const doc = database
    ? await database.collection('profiles').findOne({ profile_id: id })
    : memoryProfiles.get(id)

  if (!doc) return null

  const { _id, profile_id, updatedAt, ...profile } = doc
  return profile
}

async function saveTenderWorkflow(profileId, tenderId, workflow) {
  const database = await connect()
  const record = {
    profile_id: profileId,
    tender_id: tenderId,
    ...workflow,
    updatedAt: new Date(),
  }

  if (database) {
    await database.collection('tender_workflows').replaceOne(
      { profile_id: profileId, tender_id: tenderId },
      record,
      { upsert: true }
    )
    return stripInternalFields(record)
  }

  memoryTenderWorkflows.set(workflowKey(profileId, tenderId), record)
  return stripInternalFields(record)
}

async function getTenderWorkflow(profileId, tenderId) {
  const database = await connect()
  const doc = database
    ? await database.collection('tender_workflows').findOne({ profile_id: profileId, tender_id: tenderId })
    : memoryTenderWorkflows.get(workflowKey(profileId, tenderId))

  if (!doc) return null
  return stripInternalFields(doc)
}

async function listTenderWorkflows(profileId) {
  const database = await connect()
  const docs = database
    ? await database.collection('tender_workflows').find({ profile_id: profileId }).toArray()
    : [...memoryTenderWorkflows.values()].filter((record) => record.profile_id === profileId)

  return docs.map(stripInternalFields)
}

async function saveDraft(profileId, tenderId, draft) {
  const database = await connect()
  const record = {
    profile_id: profileId,
    tender_id: tenderId,
    ...draft,
    updatedAt: new Date(),
  }

  if (database) {
    await database.collection('drafts').replaceOne(
      { profile_id: profileId, tender_id: tenderId },
      record,
      { upsert: true }
    )
    return stripInternalFields(record)
  }

  memoryDrafts.set(draftKey(profileId, tenderId), record)
  return stripInternalFields(record)
}

async function getDraft(profileId, tenderId) {
  const database = await connect()
  const doc = database
    ? await database.collection('drafts').findOne({ profile_id: profileId, tender_id: tenderId })
    : memoryDrafts.get(draftKey(profileId, tenderId))

  if (!doc) return null
  return stripInternalFields(doc)
}

async function listDrafts(profileId) {
  const database = await connect()
  const docs = database
    ? await database.collection('drafts').find({ profile_id: profileId }).sort({ updatedAt: -1 }).toArray()
    : [...memoryDrafts.values()]
        .filter((record) => record.profile_id === profileId)
        .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())

  return docs.map(stripInternalFields)
}

async function saveUser(user) {
  const database = await connect()
  const record = { ...user, updatedAt: new Date() }

  if (database) {
    await database.collection('users').replaceOne(
      { email: user.email },
      record,
      { upsert: true }
    )
    return
  }

  memoryUsers.set(user.email, record)
}

async function getUserByEmail(email) {
  const database = await connect()
  const doc = database
    ? await database.collection('users').findOne({ email })
    : memoryUsers.get(email)

  if (!doc) return null
  return doc
}

async function setUserProfileId(userId, profileId) {
  const database = await connect()

  if (database) {
    await database.collection('users').updateOne(
      { user_id: userId },
      { $set: { profile_id: profileId, updatedAt: new Date() } }
    )
    return
  }

  for (const [email, user] of memoryUsers.entries()) {
    if (user.user_id === userId) {
      memoryUsers.set(email, { ...user, profile_id: profileId })
      break
    }
  }
}

function getStorageMode() {
  return storageMode
}

module.exports = {
  connect,
  saveProfile,
  getProfileById,
  saveTenderWorkflow,
  getTenderWorkflow,
  listTenderWorkflows,
  saveDraft,
  getDraft,
  listDrafts,
  saveUser,
  getUserByEmail,
  setUserProfileId,
  getStorageMode,
}
