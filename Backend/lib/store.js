/**
 * Data access layer — MongoDB.
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
let connectError = null

async function connect() {
  if (db) return db
  if (connectError) throw connectError
  if (!MONGODB_URL) throw new Error('MONGODB_URL is not set in .env')
  try {
    client = new MongoClient(MONGODB_URL, { serverSelectionTimeoutMS: 8000 })
    await client.connect()
    db = client.db(DB_NAME)
    connectError = null
    console.log(`MongoDB connected — database: ${DB_NAME}`)
    return db
  } catch (err) {
    connectError = err
    throw err
  }
}

async function saveProfile(id, profile) {
  const database = await connect()
  await database.collection('profiles').replaceOne(
    { profile_id: id },
    { profile_id: id, ...profile, updatedAt: new Date() },
    { upsert: true }
  )
}

async function getProfileById(id) {
  const database = await connect()
  const doc = await database.collection('profiles').findOne({ profile_id: id })
  if (!doc) return null
  const { _id, profile_id, updatedAt, ...profile } = doc
  return profile
}

module.exports = { connect, saveProfile, getProfileById }
