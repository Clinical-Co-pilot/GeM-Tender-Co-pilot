const { requireFromDeps } = require('../lib/deps')

const express = requireFromDeps('express')
const { getProfileById } = require('../lib/store')
const { buildEligibility } = require('../lib/tenderEngine')
const { tenders } = require('../data/tenders.json')

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { profile_id, tender_id } = req.body
    const profile = await getProfileById(profile_id)
    const tender = tenders.find(t => t.id === tender_id)

    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    if (!tender) return res.status(404).json({ error: 'Tender not found' })
    res.json(buildEligibility(profile, tender))

  } catch (err) {
    console.error('Eligibility error:', err)
    res.status(500).json({ error: 'Eligibility check failed', details: err.message })
  }
})

module.exports = router
