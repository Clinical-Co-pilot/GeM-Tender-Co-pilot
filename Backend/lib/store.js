/**
 * Data access layer — MongoDB.
 * All routes use this module so DB logic is centralised here.
 */

const { MongoClient } = require('mongodb')

const MONGODB_URL = process.env.MONGODB_URL
const DB_NAME = 'gem_tender_copilot'

let client = null
let db = null

async function connect() {
  if (db) return db
  if (!MONGODB_URL) throw new Error('MONGODB_URL is not set in .env')
  client = new MongoClient(MONGODB_URL)
  await client.connect()
  db = client.db(DB_NAME)
  console.log(`MongoDB connected — database: ${DB_NAME}`)
  return db
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
