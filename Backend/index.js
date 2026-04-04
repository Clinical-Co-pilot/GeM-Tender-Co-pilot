const { requireFromDeps } = require('./lib/deps')

const express = requireFromDeps('express')
const cors = requireFromDeps('cors')

requireFromDeps('dotenv').config()

const { connect, getStorageMode } = require('./lib/store')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const tenderRoutes = require('./routes/tenders')
const eligibilityRoutes = require('./routes/eligibility')
const bidRoutes = require('./routes/bid')
const workflowRoutes = require('./routes/workflow')
const draftRoutes = require('./routes/drafts')

const app = express()

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://gem-tender-co-pilot.vercel.app'
  ]
}))
app.use(express.json())

app.get('/health', async (req, res) => {
  try {
    await connect()
    const storageMode = getStorageMode()
    res.json({
      status: storageMode === 'mongo' ? 'ok' : 'degraded',
      message: 'GeM Tender Copilot API running',
      db: storageMode === 'mongo' ? 'connected' : 'unavailable',
      storage: storageMode,
    })
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'DB not connected', details: err.message })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/tenders', tenderRoutes)
app.use('/api/eligibility', eligibilityRoutes)
app.use('/api/bid', bidRoutes)
app.use('/api/workflow', workflowRoutes)
app.use('/api/drafts', draftRoutes)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

connect()
  .then(() => {
    const storageMode = getStorageMode()
    console.log(storageMode === 'mongo' ? 'MongoDB connected' : 'Using in-memory profile store')
  })
  .catch((err) => {
    console.warn('[MongoDB] Connection failed, continuing in degraded mode.')
    console.warn('[MongoDB]', err.message)
    console.warn('[MongoDB] Backend will continue with in-memory profile storage.')
  })
