const { PROFILE_DOCUMENT_DEFINITIONS } = require('./profileContract')

function formatCurrency(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return 'Not specified'
  return `Rs ${Number(amount).toLocaleString('en-IN')}`
}

function formatDate(value) {
  if (!value) return 'Not specified'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not specified'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value = '') {
  return [...new Set(
    normalizeText(value)
      .split(' ')
      .filter((token) => token.length >= 3)
  )]
}

function getDocumentStatus(profile, key) {
  return profile.documents?.[key]?.status === 'uploaded'
}

function hasRegistration(profile, key) {
  if (key === 'gst') return Boolean(profile.gst_number) || getDocumentStatus(profile, 'gst')
  if (key === 'udyam') return Boolean(profile.udyam_number) || getDocumentStatus(profile, 'udyam')
  return getDocumentStatus(profile, key)
}

function certificationMatch(profile, requiredCertifications = []) {
  const owned = (profile.certifications || []).map((value) => normalizeText(value))
  if (!requiredCertifications.length) {
    return {
      status: owned.length > 0 ? 'pass' : 'pass',
      detail: owned.length > 0
        ? `Tender does not mandate a certification. Available certifications: ${(profile.certifications || []).join(', ')}`
        : 'Tender does not mandate a certification.',
    }
  }

  const missing = requiredCertifications.filter((certification) => {
    const normalized = normalizeText(certification)
    return !owned.some((value) => value.includes(normalized) || normalized.includes(value))
  })

  if (!missing.length) {
    return {
      status: 'pass',
      detail: `All required certifications available: ${requiredCertifications.join(', ')}`,
    }
  }

  if (missing.length < requiredCertifications.length) {
    return {
      status: 'partial',
      detail: `Missing certifications: ${missing.join(', ')}`,
    }
  }

  return {
    status: 'fail',
    detail: `Required certifications missing: ${requiredCertifications.join(', ')}`,
  }
}

function buildDomainAlignment(profile, tender) {
  const tenderText = normalizeText(`${tender.title} ${tender.category} ${tender.full_text}`)
  const profileTokens = tokenize(`${profile.company_name} ${profile.category}`)
  const matched = profileTokens.filter((token) => token && tenderText.includes(token))

  if (matched.length >= 2) {
    return {
      status: 'pass',
      detail: `Tender scope aligns on ${matched.slice(0, 3).join(', ')}.`,
    }
  }

  if (matched.length === 1) {
    return {
      status: 'partial',
      detail: `Limited domain overlap on ${matched[0]}. Review scope manually.`,
    }
  }

  return {
    status: 'fail',
    detail: 'No strong domain overlap detected from the saved company profile.',
  }
}

function mapTenderDocumentRequirement(label, profile) {
  const normalized = normalizeText(label)
  const hasAnyCertificationEvidence = getDocumentStatus(profile, 'iso') || (profile.certifications || []).length > 0

  if (normalized.includes('udyam') || normalized.includes('msme')) {
    return {
      document: 'Udyam Registration Certificate',
      status: hasRegistration(profile, 'udyam') ? 'ready' : 'missing',
      note: hasRegistration(profile, 'udyam')
        ? 'Saved in profile and available for tender submission.'
        : 'Upload the Udyam registration certificate in Profile.',
      mapped: true,
    }
  }

  if (normalized.includes('gst')) {
    return {
      document: 'GST Registration Certificate',
      status: hasRegistration(profile, 'gst') ? 'ready' : 'missing',
      note: hasRegistration(profile, 'gst')
        ? 'Saved in profile and available for tender submission.'
        : 'Upload the GST certificate in Profile.',
      mapped: true,
    }
  }

  if (normalized.includes('pan')) {
    return {
      document: 'PAN Card (Company)',
      status: getDocumentStatus(profile, 'pan') ? 'ready' : 'missing',
      note: getDocumentStatus(profile, 'pan')
        ? 'Company PAN is uploaded in Profile.'
        : 'Upload the company PAN copy in Profile.',
      mapped: true,
    }
  }

  if (
    normalized.includes('turnover') ||
    normalized.includes('financial') ||
    normalized.includes('itr') ||
    normalized.includes('balance sheet') ||
    normalized.includes('ca certificate')
  ) {
    return {
      document: 'Turnover / Financial Proof',
      status: getDocumentStatus(profile, 'itr') ? 'ready' : 'missing',
      note: getDocumentStatus(profile, 'itr')
        ? 'Financial proof is uploaded in Profile.'
        : 'Upload ITR or CA-backed turnover proof in Profile.',
      mapped: true,
    }
  }

  if (
    normalized.includes('experience') ||
    normalized.includes('past performance') ||
    normalized.includes('completion') ||
    normalized.includes('work order')
  ) {
    return {
      document: 'Experience / Completion Proof',
      status: getDocumentStatus(profile, 'experience') ? 'ready' : 'missing',
      note: getDocumentStatus(profile, 'experience')
        ? 'Experience evidence is uploaded in Profile.'
        : 'Upload work orders, completion certificates, or portfolio evidence in Profile.',
      mapped: true,
    }
  }

  if (normalized.includes('iso') || normalized.includes('quality certification')) {
    return {
      document: 'Certification Proof',
      status: hasAnyCertificationEvidence ? 'ready' : 'missing',
      note: hasAnyCertificationEvidence
        ? 'Certification details exist in the saved profile.'
        : 'Add certification details and upload the supporting certificate if required.',
      mapped: true,
    }
  }

  if (normalized.includes('certificate')) {
    return {
      document: label,
      status: hasAnyCertificationEvidence ? 'missing' : 'missing',
      note: hasAnyCertificationEvidence
        ? 'Tender-specific certificate requested in ATC. Review manually before submission.'
        : 'Tender-specific certificate requested in ATC. No matching proof is currently tracked.',
      mapped: false,
    }
  }

  return {
    document: label,
    status: 'missing',
    note: 'Tender-specific document is not yet tracked in the current profile contract. Review manually.',
    mapped: false,
  }
}

function buildChecklist(profile, tender) {
  const items = []
  const seen = new Set()

  const pushItem = (item) => {
    if (seen.has(item.document)) return
    seen.add(item.document)
    items.push(item)
  }

  for (const label of tender.documents_required || []) {
    pushItem(mapTenderDocumentRequirement(label, profile))
  }

  for (const definition of PROFILE_DOCUMENT_DEFINITIONS) {
    const alreadyCovered = [...seen].some((value) => normalizeText(value).includes(normalizeText(definition.label)))
    if (alreadyCovered) continue

    pushItem({
      document: definition.label,
      status: getDocumentStatus(profile, definition.key) ? 'ready' : (definition.required ? 'missing' : 'missing'),
      note: getDocumentStatus(profile, definition.key)
        ? 'Saved in the profile document vault.'
        : definition.required
          ? 'Required core profile document is still missing.'
          : 'Optional supporting document. Upload if the tender asks for it.',
      mapped: true,
    })
  }

  return items.map(({ document, status, note }) => ({ document, status, note }))
}

function buildEligibility(profile, tender) {
  const criteria = []
  const requirements = tender.requirements || {}
  const checklist = buildChecklist(profile, tender)
  const missingDocuments = checklist
    .filter((item) => item.status !== 'ready')
    .map((item) => ({
      name: item.document,
      status: 'fail',
      detail: item.note,
    }))

  criteria.push({
    name: 'GST Registration',
    status: hasRegistration(profile, 'gst') ? 'pass' : 'fail',
    detail: hasRegistration(profile, 'gst')
      ? `GST record available${profile.gst_number ? ` (${profile.gst_number})` : ''}.`
      : 'GST registration is not uploaded in the saved profile.',
  })

  criteria.push({
    name: 'Udyam / MSME Registration',
    status: hasRegistration(profile, 'udyam') ? 'pass' : (requirements.msme_only ? 'fail' : 'partial'),
    detail: hasRegistration(profile, 'udyam')
      ? `Udyam record available${profile.udyam_number ? ` (${profile.udyam_number})` : ''}.`
      : requirements.msme_only
        ? 'Tender is restricted to MSME bidders and Udyam proof is missing.'
        : 'Udyam proof is not uploaded. MSME exemptions may not be claimable.',
  })

  criteria.push({
    name: 'Minimum Turnover',
    status: requirements.min_turnover == null
      ? 'pass'
      : Number(profile.turnover) >= requirements.min_turnover ? 'pass' : 'fail',
    detail: requirements.min_turnover == null
      ? 'Tender does not specify a minimum turnover.'
      : `Required ${formatCurrency(requirements.min_turnover)}; profile shows ${formatCurrency(profile.turnover)}.`,
  })

  criteria.push({
    name: 'Years in Operation',
    status: requirements.min_years == null
      ? 'pass'
      : Number(profile.years_in_operation) >= requirements.min_years ? 'pass' : 'fail',
    detail: requirements.min_years == null
      ? 'Tender does not specify a minimum operating history.'
      : `Required ${requirements.min_years} years; profile shows ${profile.years_in_operation} years.`,
  })

  const certificationStatus = certificationMatch(profile, requirements.certifications || [])
  criteria.push({
    name: 'Required Certifications',
    status: certificationStatus.status,
    detail: certificationStatus.detail,
  })

  criteria.push({
    name: 'Past Experience Evidence',
    status: requirements.past_experience_required
      ? getDocumentStatus(profile, 'experience') ? 'pass' : 'partial'
      : 'pass',
    detail: requirements.past_experience_required
      ? getDocumentStatus(profile, 'experience')
        ? 'Experience/completion evidence is uploaded in Profile.'
        : 'Tender asks for similar experience. Company history exists, but supporting experience proof is not uploaded.'
      : 'Tender does not explicitly require past experience evidence.',
  })

  criteria.push({
    name: 'Category / Domain Alignment',
    ...buildDomainAlignment(profile, tender),
  })

  if (requirements.oem_authorization_required) {
    criteria.push({
      name: 'OEM Authorization Requirement',
      status: 'fail',
      detail: 'Tender requires OEM authorization. The current profile contract does not track OEM authorization evidence.',
    })
  } else {
    criteria.push({
      name: 'OEM Authorization Requirement',
      status: 'pass',
      detail: 'Tender does not require OEM authorization.',
    })
  }

  if (missingDocuments.length) {
    criteria.push({
      name: 'Tender Supporting Documents',
      status: missingDocuments.some((item) => item.status === 'fail') ? 'fail' : 'partial',
      detail: `${missingDocuments.length} supporting document item(s) still need review or upload.`,
    })
  } else {
    criteria.push({
      name: 'Tender Supporting Documents',
      status: 'pass',
      detail: 'Tracked supporting documents are ready in the saved profile.',
    })
  }

  const riskFlags = [
    ...(tender.penalty_clauses || []),
    ...(requirements.oem_authorization_required ? ['OEM authorization is mandatory and not currently tracked in the profile documents.'] : []),
    ...(missingDocuments.length ? [`${missingDocuments.length} supporting document item(s) still need action before submission.`] : []),
    ...(tender.payment_terms ? [`Payment terms: ${tender.payment_terms}`] : []),
  ]

  const passCount = criteria.filter((criterion) => criterion.status === 'pass').length
  const failCount = criteria.filter((criterion) => criterion.status === 'fail').length
  let recommendation = 'Proceed with drafting and final document review.'

  if (failCount >= 3) {
    recommendation = 'High review needed before bidding. Resolve failed eligibility checks first.'
  } else if (failCount > 0 || missingDocuments.length > 0) {
    recommendation = 'Tender is workable, but complete the missing checks and supporting documents before submission.'
  } else if (criteria.some((criterion) => criterion.status === 'partial')) {
    recommendation = 'Tender looks eligible overall. Review the partial checks and tender-specific documents before submission.'
  }

  return {
    score: passCount,
    total: criteria.length,
    criteria,
    missing_documents: missingDocuments,
    risk_flags: riskFlags,
    recommendation,
    checklist,
  }
}

function buildScopeHighlights(tender) {
  const text = tender.full_text || ''
  return text
    .split(/[.;]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 4)
}

function buildFallbackBid(profile, tender) {
  const eligibility = buildEligibility(profile, tender)
  const highlights = buildScopeHighlights(tender)
  const checklist = eligibility.checklist

  const scopeLines = highlights.length
    ? highlights.map((line) => `- ${line}`).join('\n')
    : `- Deliver the scope described in the tender titled "${tender.title}".`

  const deliverableLines = [
    'Tender requirement review and kickoff alignment',
    'Execution plan with milestones and responsibilities',
    'Delivery artefacts aligned to the published scope and contract period',
    'Final submission support pack with required annexures and declarations',
  ]

  const complianceMatrix = [
    {
      requirement: 'GST Registration',
      our_response: hasRegistration(profile, 'gst') ? 'Available' : 'Pending upload',
      notes: hasRegistration(profile, 'gst')
        ? 'GST details are saved in Profile.'
        : 'Upload GST registration proof before submission.',
    },
    {
      requirement: 'Udyam / MSME Registration',
      our_response: hasRegistration(profile, 'udyam') ? 'Available' : 'Pending upload',
      notes: hasRegistration(profile, 'udyam')
        ? 'MSME proof is saved in Profile.'
        : 'Upload Udyam proof if MSME benefits are to be claimed.',
    },
    {
      requirement: 'Minimum Turnover',
      our_response: tender.requirements?.min_turnover == null || profile.turnover >= tender.requirements.min_turnover
        ? 'Requirement met'
        : 'Below threshold',
      notes: tender.requirements?.min_turnover == null
        ? 'No turnover threshold specified in the tender.'
        : `Required ${formatCurrency(tender.requirements.min_turnover)}; profile shows ${formatCurrency(profile.turnover)}.`,
    },
    {
      requirement: 'Experience Evidence',
      our_response: getDocumentStatus(profile, 'experience') ? 'Supporting evidence uploaded' : 'Supporting evidence pending',
      notes: tender.requirements?.past_experience_required
        ? 'Tender requests similar experience evidence.'
        : 'Past experience proof may still strengthen the proposal.',
    },
  ]

  return {
    cover_letter: `We, ${profile.company_name}, submit this proposal in response to the tender "${tender.title}" issued by ${tender.department}. We confirm that we have reviewed the published tender conditions, saved company profile data, and currently available supporting documents for this opportunity.\n\nOur organisation operates in the ${profile.category} domain with annual turnover of ${formatCurrency(profile.turnover)} and ${profile.years_in_operation} years of operating experience. We are submitting this draft to support a structured, reviewable bid preparation workflow before final submission on the GeM portal.`,
    executive_summary: `${profile.company_name} is preparing to bid for ${tender.title}. The opportunity aligns with our recorded business category of ${profile.category}. Based on the saved profile, the bid can be pursued using the attached company credentials, tender readiness checklist, and the supporting documents already uploaded in the profile.\n\nThis draft is intended to provide a clean working proposal that can be reviewed, edited, and exported without relying on transient AI generation.`,
    company_overview: `${profile.company_name} is a ${profile.category} business with ${profile.years_in_operation} years of operational history and recorded annual turnover of ${formatCurrency(profile.turnover)}. The company profile currently includes the following certifications: ${(profile.certifications || []).length ? profile.certifications.join(', ') : 'No certifications recorded yet'}.\n\nThe company maintains a backend-backed profile with uploaded statutory and supporting tender documents so that tender evaluation, draft generation, and final proposal preparation stay consistent across the application.`,
    scope_understanding: `Based on the tender title, category, and saved tender text, the key scope areas identified for this opportunity are:\n${scopeLines}\n\nThe final submission should be reviewed against the full tender document and any ATC clauses before formal filing on GeM.`,
    methodology: `Our proposed bid-preparation methodology for this tender is:\n\n1. Confirm eligibility against the published commercial and technical thresholds.\n2. Validate all required supporting documents and tender-specific annexures.\n3. Tailor the technical response and scope narrative to the tender's published requirements.\n4. Complete declaration, compliance, and supporting evidence review before final export.\n\nThis keeps the proposal grounded in the saved backend profile and the tender record currently loaded in the system.`,
    past_experience: getDocumentStatus(profile, 'experience')
      ? 'Relevant experience evidence is already uploaded in the profile and should be referenced in the final annexure set for this tender.'
      : 'Experience evidence is not yet uploaded in the profile. Upload work orders, completion certificates, or portfolio proof before final submission.',
    team_credentials: `The proposal currently draws from the saved company profile and certifications. Additional team CVs or named key personnel should be added only where the tender explicitly requests them.`,
    deliverables: deliverableLines.map((line, index) => `${index + 1}. ${line}`).join('\n'),
    assumptions_exclusions: `This draft is based on the tender record currently available in the application and the saved company profile as of ${formatDate(new Date().toISOString())}. Any tender-specific annexure, OEM document, bank document, or special declaration not tracked in the current profile contract should be reviewed manually before submission.`,
    declaration_notes: `We confirm that the information referenced in this draft has been prepared from the saved company profile and the tender data currently loaded in GeM Tender Copilot. Final submission should be made only after verifying all uploaded documents, declarations, and tender-specific compliance requirements on the official GeM portal.`,
    checklist,
    scope_mapping: highlights.map((highlight, index) => ({
      requirement: highlight,
      our_response: `Response section ${index + 1} should be aligned to this tender requirement during final review.`,
      status: 'compliant',
    })),
    timeline: [
      { phase: 'Review & Qualification', deliverable: 'Eligibility and document review completed', timeline: 'Day 1' },
      { phase: 'Draft Refinement', deliverable: 'Proposal narrative and compliance sections refined', timeline: 'Day 2-3' },
      { phase: 'Final Submission Pack', deliverable: 'Exported proposal and annexures ready', timeline: 'Before tender deadline' },
    ],
    compliance_matrix: complianceMatrix,
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderChecklistHtml(checklist = []) {
  return checklist.map((item) => `
    <tr>
      <td>${escapeHtml(item.document)}</td>
      <td>${escapeHtml(item.status)}</td>
      <td>${escapeHtml(item.note)}</td>
    </tr>
  `).join('')
}

function renderProposalExportHtml(profile, tender, draft) {
  const bid = draft.bid || {}
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Proposal - ${escapeHtml(tender.id)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 40px; line-height: 1.5; }
    h1, h2, h3 { margin-bottom: 8px; }
    h1 { font-size: 28px; }
    h2 { font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 28px; }
    .meta { margin-bottom: 24px; padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; }
    .meta p { margin: 4px 0; }
    .section { margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; }
    pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  <h1>${escapeHtml(tender.title)}</h1>
  <div class="meta">
    <p><strong>Tender ID:</strong> ${escapeHtml(tender.id)}</p>
    <p><strong>Department:</strong> ${escapeHtml(tender.department || 'Not specified')}</p>
    <p><strong>Deadline:</strong> ${escapeHtml(formatDate(tender.deadline))}</p>
    <p><strong>Company:</strong> ${escapeHtml(profile.company_name)}</p>
    <p><strong>Category:</strong> ${escapeHtml(profile.category)}</p>
  </div>

  <div class="section"><h2>Cover Letter</h2><pre>${escapeHtml(bid.cover_letter || '')}</pre></div>
  <div class="section"><h2>Executive Summary</h2><pre>${escapeHtml(bid.executive_summary || '')}</pre></div>
  <div class="section"><h2>Company Overview</h2><pre>${escapeHtml(bid.company_overview || '')}</pre></div>
  <div class="section"><h2>Scope Understanding</h2><pre>${escapeHtml(bid.scope_understanding || '')}</pre></div>
  <div class="section"><h2>Methodology</h2><pre>${escapeHtml(bid.methodology || '')}</pre></div>
  <div class="section"><h2>Deliverables</h2><pre>${escapeHtml(bid.deliverables || '')}</pre></div>
  <div class="section"><h2>Assumptions & Exclusions</h2><pre>${escapeHtml(bid.assumptions_exclusions || '')}</pre></div>
  <div class="section"><h2>Declaration</h2><pre>${escapeHtml(bid.declaration_notes || '')}</pre></div>

  <div class="section">
    <h2>Supporting Documents</h2>
    <table>
      <thead>
        <tr>
          <th>Document</th>
          <th>Status</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>${renderChecklistHtml(bid.checklist || [])}</tbody>
    </table>
  </div>
</body>
</html>`
}

module.exports = {
  buildEligibility,
  buildChecklist,
  buildFallbackBid,
  renderProposalExportHtml,
  formatCurrency,
  formatDate,
}
