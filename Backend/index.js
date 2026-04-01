const express = require('express')
const cors = require('cors')
require('dotenv').config()

const profileRoutes = require('./routes/profile')
const tenderRoutes = require('./routes/tenders')
const eligibilityRoutes = require('./routes/eligibility')
const bidRoutes = require('./routes/bid')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GeM Tender Copilot API running' })
})

app.use('/api/profile', profileRoutes)
app.use('/api/tenders', tenderRoutes)
app.use('/api/eligibility', eligibilityRoutes)
app.use('/api/bid', bidRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})