const { requireFromDeps } = require('../lib/deps')

const express = requireFromDeps('express')
const {
  getProfileById,
  getTenderWorkflow,
  listTenderWorkflows,
  saveTenderWorkflow,
} = require('../lib/store')
const { tenders } = require('../data/tenders.json')

const router = express.Router()

function normalizeWorkflow(profileId, tenderId, workflow = {}) {
  return {
    profile_id: profileId,
    tender_id: tenderId,
    saved: Boolean(workflow.saved),
    analyzed_at: workflow.analyzed_at || null,
    draft_generated_at: workflow.draft_generated_at || null,
    ready_at: workflow.ready_at || null,
    updated_at: workflow.updated_at || new Date().toISOString(),
  }
}

function applyWorkflowPatch(existing, patch) {
  const now = new Date().toISOString()
  const next = normalizeWorkflow(existing.profile_id, existing.tender_id, existing)

  if (typeof patch.saved === 'boolean') {
    next.saved = patch.saved
  }

  if (patch.analyzed === true && !next.analyzed_at) {
    next.analyzed_at = now
  }

  if (patch.analyzed === false) {
    next.analyzed_at = null
  }

  if (patch.draft_generated === true && !next.draft_generated_at) {
    next.draft_generated_at = now
  }

  if (patch.draft_generated === false) {
    next.draft_generated_at = null
  }

  if (patch.ready === true && !next.ready_at) {
    next.ready_at = now
  }

  if (patch.ready === false) {
    next.ready_at = null
  }

  next.updated_at = now
  return next
}

router.get('/:profile_id', async (req, res) => {
  try {
    const { profile_id } = req.params
    const profile = await getProfileById(profile_id)
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const items = await listTenderWorkflows(profile_id)
    res.json({ items: items.map((item) => normalizeWorkflow(profile_id, item.tender_id, item)) })
  } catch (err) {
    console.error('Workflow list error:', err)
    res.status(500).json({ error: 'Workflow fetch failed', details: err.message })
  }
})

router.patch('/:profile_id', async (req, res) => {
  try {
    const { profile_id } = req.params
    const { tender_id } = req.body

    if (!tender_id) return res.status(400).json({ error: 'tender_id is required' })

    const profile = await getProfileById(profile_id)
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const tender = tenders.find((item) => item.id === tender_id)
    if (!tender) return res.status(404).json({ error: 'Tender not found' })

    const existing = await getTenderWorkflow(profile_id, tender_id)
    const next = applyWorkflowPatch(
      normalizeWorkflow(profile_id, tender_id, existing || {}),
      req.body
    )

    const saved = await saveTenderWorkflow(profile_id, tender_id, next)
    res.json({ item: normalizeWorkflow(profile_id, tender_id, saved) })
  } catch (err) {
    console.error('Workflow patch error:', err)
    res.status(500).json({ error: 'Workflow update failed', details: err.message })
  }
})

module.exports = router
