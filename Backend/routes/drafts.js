const { requireFromDeps } = require('../lib/deps')

const express = requireFromDeps('express')
const {
  getProfileById,
  getDraft,
  listDrafts,
  saveDraft,
  getTenderWorkflow,
  saveTenderWorkflow,
} = require('../lib/store')
const { tenders } = require('../data/tenders.json')
const {
  buildFallbackBid,
  renderProposalExportHtml,
} = require('../lib/tenderEngine')

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

async function markDraftWorkflow(profileId, tenderId, extra = {}) {
  const now = new Date().toISOString()
  const existing = normalizeWorkflow(profileId, tenderId, await getTenderWorkflow(profileId, tenderId) || {})
  const next = {
    ...existing,
    analyzed_at: existing.analyzed_at || now,
    draft_generated_at: existing.draft_generated_at || now,
    updated_at: now,
    ...extra,
  }

  return saveTenderWorkflow(profileId, tenderId, next)
}

function normalizeDraftRecord(profileId, tenderId, tender, draft) {
  return {
    profile_id: profileId,
    tender_id: tenderId,
    tender_title: tender?.title || draft.tender_title || '',
    tender_department: tender?.department || draft.tender_department || '',
    created_at: draft.created_at,
    updated_at: draft.updated_at,
    bid: draft.bid,
    original_bid: draft.original_bid,
  }
}

router.get('/:profile_id', async (req, res) => {
  try {
    const { profile_id } = req.params
    const { tender_id } = req.query
    const profile = await getProfileById(profile_id)

    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    if (tender_id) {
      const tender = tenders.find((item) => item.id === tender_id)
      const draft = await getDraft(profile_id, tender_id)

      if (!draft) return res.status(404).json({ error: 'Draft not found' })

      return res.json({
        draft: normalizeDraftRecord(profile_id, tender_id, tender, draft),
      })
    }

    const drafts = await listDrafts(profile_id)
    const items = drafts.map((draft) => {
      const tender = tenders.find((item) => item.id === draft.tender_id)
      return normalizeDraftRecord(profile_id, draft.tender_id, tender, draft)
    })

    return res.json({ drafts: items })
  } catch (err) {
    console.error('Draft fetch error:', err)
    res.status(500).json({ error: 'Draft fetch failed', details: err.message })
  }
})

router.post('/generate', async (req, res) => {
  try {
    const { profile_id, tender_id } = req.body

    if (!profile_id || !tender_id) {
      return res.status(400).json({ error: 'profile_id and tender_id are required' })
    }

    const profile = await getProfileById(profile_id)
    const tender = tenders.find((item) => item.id === tender_id)

    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    if (!tender) return res.status(404).json({ error: 'Tender not found' })

    const existing = await getDraft(profile_id, tender_id)
    if (existing) {
      await markDraftWorkflow(profile_id, tender_id)
      return res.json({
        draft: normalizeDraftRecord(profile_id, tender_id, tender, existing),
      })
    }

    const initialBid = buildFallbackBid(profile, tender)
    const now = new Date().toISOString()
    const draftRecord = {
      tender_title: tender.title,
      tender_department: tender.department,
      created_at: now,
      updated_at: now,
      original_bid: initialBid,
      bid: initialBid,
    }

    const saved = await saveDraft(profile_id, tender_id, draftRecord)
    await markDraftWorkflow(profile_id, tender_id)

    res.json({
      draft: normalizeDraftRecord(profile_id, tender_id, tender, saved),
    })
  } catch (err) {
    console.error('Draft generation error:', err)
    res.status(500).json({ error: 'Draft generation failed', details: err.message })
  }
})

router.put('/:profile_id', async (req, res) => {
  try {
    const { profile_id } = req.params
    const { tender_id, bid } = req.body

    if (!tender_id || !bid) {
      return res.status(400).json({ error: 'tender_id and bid are required' })
    }

    const profile = await getProfileById(profile_id)
    const tender = tenders.find((item) => item.id === tender_id)
    const existing = await getDraft(profile_id, tender_id)

    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    if (!tender) return res.status(404).json({ error: 'Tender not found' })
    if (!existing) return res.status(404).json({ error: 'Draft not found' })

    const updatedDraft = {
      ...existing,
      tender_title: tender.title,
      tender_department: tender.department,
      updated_at: new Date().toISOString(),
      bid: {
        ...existing.bid,
        ...bid,
      },
    }

    const saved = await saveDraft(profile_id, tender_id, updatedDraft)
    await markDraftWorkflow(profile_id, tender_id)

    res.json({
      draft: normalizeDraftRecord(profile_id, tender_id, tender, saved),
    })
  } catch (err) {
    console.error('Draft update error:', err)
    res.status(500).json({ error: 'Draft update failed', details: err.message })
  }
})

router.get('/:profile_id/export', async (req, res) => {
  try {
    const { profile_id } = req.params
    const { tender_id } = req.query

    if (!tender_id) return res.status(400).json({ error: 'tender_id is required' })

    const profile = await getProfileById(profile_id)
    const tender = tenders.find((item) => item.id === tender_id)
    const draft = await getDraft(profile_id, tender_id)

    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    if (!tender) return res.status(404).json({ error: 'Tender not found' })
    if (!draft) return res.status(404).json({ error: 'Draft not found' })

    const html = renderProposalExportHtml(profile, tender, draft)
    const safeTenderId = String(tender_id).replace(/[^a-zA-Z0-9._-]/g, '-')

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="proposal-${safeTenderId}.html"`)
    return res.send(html)
  } catch (err) {
    console.error('Draft export error:', err)
    res.status(500).json({ error: 'Draft export failed', details: err.message })
  }
})

module.exports = router
