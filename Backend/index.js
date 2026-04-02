const { requireFromDeps } = require('./lib/deps')

const express = requireFromDeps('express')
const cors = requireFromDeps('cors')

requireFromDeps('dotenv').config()

const { connect } = require('./lib/store')
const profileRoutes = require('./routes/profile')
const tenderRoutes = require('./routes/tenders')
const eligibilityRoutes = require('./routes/eligibility')
const bidRoutes = require('./routes/bid')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', async (req, res) => {
  try {
    await connect()
    res.json({ status: 'ok', message: 'GeM Tender Copilot API running', db: 'connected' })
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'DB not connected', details: err.message })
  }
})

app.use('/api/profile', profileRoutes)
app.use('/api/tenders', tenderRoutes)
app.use('/api/eligibility', eligibilityRoutes)
app.use('/api/bid', bidRoutes)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

connect()
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.warn('[MongoDB] Connection failed — running in degraded mode.')
    console.warn('[MongoDB]', err.message)
    console.warn('[MongoDB] Profile/tender routes will return 503 until DB is reachable.')
  })
