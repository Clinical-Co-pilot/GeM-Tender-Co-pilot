export const MOCK_PROFILE_RESPONSE = {
  profile_id: "mock-123",
  profile: {
    company_name: "Sharma Tech Solutions Pvt Ltd",
    udyam_number: "UDYAM-MH-12-0012345",
    gst_number: "27AABCS1429B1ZB",
    category: "IT Services",
    turnover: 2100000,
    years_in_operation: 5,
    certifications: ["ISO 9001"],
    past_projects: [
      {
        id: "pp-1",
        title: "ERP Implementation — Maharashtra State Government",
        client: "Maharashtra State Government",
        industry: "Government / Public Administration",
        duration: "Jan 2023 – Oct 2023",
        value: "₹15,00,000",
        scope_of_work: "End-to-end ERP rollout across 6 departments including Finance, HR, and Procurement. Covered requirements study, process design, development, UAT, go-live, and post-go-live support.",
        technologies: "Oracle ERP, Java Spring Boot, PostgreSQL, AWS (Mumbai region)",
        outcome: "On-time delivery, zero critical defects post go-live. 40% reduction in manual processing time. Formal completion certificate issued.",
        client_reference: "Project Director, DIT Maharashtra (reference available on request)",
        has_completion_certificate: true,
      },
      {
        id: "pp-2",
        title: "Digital Workflow Automation",
        client: "Central PSU (Confidential)",
        industry: "Central PSU / Manufacturing",
        duration: "Mar 2022 – Jun 2022",
        value: "₹8,00,000",
        scope_of_work: "Automated 14 manual processes across procurement and HR functions. Designed workflow engine, approval routing, and notification framework integrated with existing ERP.",
        technologies: "Python, React, MySQL, Docker, Jenkins",
        outcome: "Deployed within 90 days. 40% reduction in processing time. System handles 500+ daily workflow transactions. Completion certificate issued.",
        has_completion_certificate: true,
      },
      {
        id: "pp-3",
        title: "Cybersecurity Audit & Remediation",
        client: "State Education Board",
        industry: "Government / Education",
        duration: "Jul 2023 – Sep 2023",
        value: "₹6,00,000",
        scope_of_work: "Comprehensive security audit, vulnerability assessment and remediation across 200+ endpoints. Delivered staff awareness training and hardened network perimeter configurations.",
        technologies: "Nessus, OpenVAS, Fortinet, PfSense, Windows Server",
        outcome: "Resolved 47 critical vulnerabilities. ISO 27001-aligned security posture achieved. Formal completion certificate issued.",
        has_completion_certificate: true,
      },
    ],
  }
}

export const MOCK_TENDERS = {
  tenders: [
    {
      id: "GEM-2024-IT-001",
      title: "IT Consulting Services for Digital Transformation",
      department: "Ministry of Electronics and IT",
      value: "₹45,00,000",
      deadline: "2026-04-20",
      category: "IT Services",
      match_score: 92,
      match_reason: "Strong category match, turnover qualifies"
    },
    {
      id: "GEM-2024-IT-002",
      title: "Website Development and Maintenance",
      department: "Ministry of Agriculture",
      value: "₹12,00,000",
      deadline: "2026-04-25",
      category: "IT Services",
      match_score: 78,
      match_reason: "MSME eligible, turnover exceeds requirement"
    },
    {
      id: "GEM-2024-IT-003",
      title: "Cloud Infrastructure Management Services",
      department: "Ministry of Finance",
      value: "₹28,00,000",
      deadline: "2026-05-01",
      category: "IT Services",
      match_score: 71,
      match_reason: "Category match, missing one certification"
    }
  ]
}

export const MOCK_ELIGIBILITY = {
  score: 8,
  total: 10,
  criteria: [
    { name: "GST Registration", status: "pass", detail: "Verified — 27AABCS1429B1ZB" },
    { name: "Udyam MSME Registration", status: "pass", detail: "Registered MSME confirmed" },
    { name: "Minimum Turnover ₹20L", status: "pass", detail: "Your turnover ₹21L — qualifies" },
    { name: "3 Years in Operation", status: "pass", detail: "5 years — exceeds requirement" },
    { name: "ISO 9001 Certification", status: "pass", detail: "Found in your profile" },
    { name: "Past Order ₹10L+", status: "fail", detail: "No proof uploaded yet" },
    { name: "EMD Exemption", status: "pass", detail: "Exempt as MSME — saves ₹2.25L" },
    { name: "Category Match", status: "pass", detail: "IT Services — exact match" },
    { name: "Geographic Eligibility", status: "pass", detail: "Pan-India registration" },
    { name: "Bank Solvency Certificate", status: "fail", detail: "Certificate not uploaded" }
  ],
  risk_flags: [
    "10% penalty for delays beyond 30 days",
    "45-day payment terms — plan cash flow"
  ],
  recommendation: "Strong match — upload work completion certificates to qualify fully"
}

export const MOCK_BID = {
  cover_letter: "We, Sharma Tech Solutions Pvt Ltd, are pleased to submit our Technical and Financial Bid in response to the Notice Inviting Tender (NIT) for IT Consulting Services for Digital Transformation issued by the Ministry of Electronics and Information Technology, Government of India (Reference: GEM-2024-IT-001).\n\nOur firm has carefully reviewed the complete Tender Document, the Request for Proposal (RFP), the Scope of Work, the Bill of Quantities, and Corrigendum No. 1 dated as published on the GeM portal. We confirm our full understanding of the requirements and affirm our readiness to deliver the specified scope within the prescribed timelines, quality standards, and contractual obligations.\n\nAs a registered MSME entity under Udyam (UDYAM-MH-12-0012345) with valid GST registration (27AABCS1429B1ZB) and ISO 9001 certification, Sharma Tech Solutions Pvt Ltd is fully eligible to participate in this tender. We are entitled to an EMD exemption under the provisions of the MSME Development Act, 2006, and are not debarred or blacklisted by any Central or State Government authority.\n\nOur team has successfully executed similar IT consulting and digital transformation engagements for government clients, and we bring domain expertise, structured delivery methodology, and demonstrated track record to this mandate. All requisite supporting documents have been enclosed as part of this bid submission.\n\nWe remain committed to the highest standards of quality, transparency, and timely delivery. We look forward to the opportunity to contribute to the Ministry's digital transformation goals.",

  executive_summary: "Sharma Tech Solutions Pvt Ltd is pleased to submit this proposal in response to the Notice Inviting Tender issued by the Ministry of Electronics and Information Technology for IT Consulting Services for Digital Transformation (Ref: GEM-2024-IT-001).\n\nWe are a MSME-registered IT services firm with over five years of experience delivering digital transformation solutions to government and private sector clients across India. Holding ISO 9001 certification and valid Udyam registration, we are fully eligible to bid for this engagement and are entitled to EMD exemption under the MSME Development Act, 2006.\n\nOur proposed engagement model follows a structured four-phase delivery approach — Discovery & Assessment, Solution Design, Implementation, and Knowledge Transfer — spanning twelve weeks, with clearly defined milestones, formal sign-off points, and a 30-day hypercare period post-deployment.\n\nWe have successfully delivered three comparable IT consulting and digital transformation engagements for State Government and Central PSU clients, with a combined order value exceeding ₹29 lakhs. Work completion certificates and client references are enclosed as Annexure A.\n\nUpon award, we are prepared to mobilise within seven calendar days and commit to full compliance with all contractual obligations including payment terms, performance security, and data localisation requirements as specified in the tender document.",

  company_overview: "Sharma Tech Solutions Pvt Ltd is a private limited company incorporated under the Companies Act 2013, with its registered office in Maharashtra. The company holds valid MSME registration under Udyam (UDYAM-MH-12-0012345), GST registration (27AABCS1429B1ZB), and ISO 9001:2015 certification for Quality Management Systems.\n\nThe company has been in operation for over five years, with a consistent focus on IT consulting, digital transformation, enterprise software implementation, and cybersecurity services for government and private sector clients. Our annual turnover exceeds ₹21 lakhs, and we maintain a clean financial and compliance record with no pending litigation, debarment, or blacklisting orders from any government authority.\n\nWe operate a delivery team of twelve qualified professionals including certified project managers, solution architects, senior developers, business analysts, and QA engineers. Our leadership team holds PMP, CBAP, AWS, and ISTQB certifications, with direct experience in government IT project delivery across Maharashtra and Pan-India engagements.\n\nAs a registered MSME, Sharma Tech Solutions Pvt Ltd is entitled to applicable preferences under the Public Procurement Policy for MSEs, including EMD exemption, and is committed to fulfilling all obligations under the GeM Seller Code of Conduct.",

  scope_understanding: "We have studied the Scope of Work and Request for Proposal issued by the Ministry of Electronics and IT in detail, and we confirm our understanding of the following key requirements:\n\nThe Ministry seeks a qualified IT consulting partner to (a) conduct a comprehensive digital readiness assessment across 14 designated offices, (b) design a structured technology modernisation roadmap aligned to the Ministry's mandate, (c) provide solution architecture recommendations for cloud migration and data management, (d) oversee phased implementation in accordance with the approved blueprint, and (e) deliver formal knowledge transfer and documentation upon project close.\n\nWe recognise that this engagement demands not merely advisory output but active implementation support, including technical resource deployment, change management, and capacity building for Ministry staff. The Ministry has also specified that all data handling must comply with MeitY data localisation norms, and that team continuity must be maintained throughout the engagement.\n\nSharma Tech Solutions Pvt Ltd has executed comparable mandates and understands the procedural, compliance, and stakeholder management complexity inherent in government IT transformations. We are prepared to align our delivery model to the Ministry's existing processes and governance structures.",

  methodology: "Our proposed execution approach follows a structured four-phase delivery methodology designed for government IT transformation mandates:\n\nPhase 1 — Discovery & Assessment (Weeks 1–2)\nWe will conduct structured stakeholder interviews across all 14 designated offices, prepare an AS-IS process map for all in-scope functions, perform a comprehensive infrastructure and application audit, and deliver a Digital Maturity Assessment Report with a prioritised gap analysis and readiness score.\n\nPhase 2 — Solution Design (Weeks 3–4)\nBased on assessment findings, we will prepare a TO-BE architecture blueprint, evaluate relevant technology vendors, and present a Ministry-approved solution blueprint and implementation roadmap. A formal sign-off will be obtained from the Ministry PMO before proceeding to implementation.\n\nPhase 3 — Implementation (Weeks 5–10)\nDelivery will proceed on an agile sprint basis with two-week sprint cycles. Each sprint will include progress reporting, user acceptance testing (UAT), documented sign-off, and rollback contingency planning. Weekly status meetings will be held with the Ministry's designated project authority.\n\nPhase 4 — Knowledge Transfer & Hypercare (Weeks 11–12)\nUpon implementation completion, we will conduct structured knowledge transfer sessions, deliver all documentation (technical runbooks, user manuals, admin guides), and provide 30 days of hypercare support at no additional cost before formal project handover.",

  past_experience: "We have successfully delivered similar IT consulting engagements including:\n\n• ₹15 lakh ERP implementation for Maharashtra State Government (2023) — on-time delivery, zero critical defects post-go-live\n• ₹8 lakh digital workflow automation for a leading Central PSU (2022) — 40% reduction in processing time\n• ₹6 lakh cybersecurity audit and remediation for a State Education Board (2023)\n\nWork completion certificates from all three engagements are available on request.",

  deliverables: "The following formal deliverables are committed under this proposal, each subject to Ministry sign-off before proceeding to the next phase:\n\n1. Digital Maturity Assessment Report — comprehensive readiness score, gap analysis, and prioritised findings across all 14 offices (Week 2)\n2. Current State Infrastructure Inventory — application, hardware, network, and data inventory with ownership mapping (Week 2)\n3. Solution Architecture Blueprint — approved TO-BE design for cloud, applications, and data architecture (Week 4)\n4. Technology Vendor Evaluation Matrix — comparative vendor assessment with Ministry recommendation (Week 4)\n5. Implementation Plan & Sprint Schedule — detailed sprint plan with milestones, owners, and acceptance criteria (Week 4)\n6. Bi-weekly Sprint Progress Reports — status, issues, risks, and completion metrics (Weeks 5–10)\n7. User Acceptance Testing (UAT) Sign-off Reports — per-sprint UAT evidence and formal approvals (Weeks 6–10)\n8. Training Materials & User Runbooks — role-specific documentation for Ministry staff (Week 11)\n9. Technical Administration Guide — infrastructure and application admin documentation (Week 11)\n10. Final Handover Report — project summary, SLA benchmarks, open items register, and post-handover support plan (Week 12)",

  assumptions_exclusions: "Assumptions\n\n1. The Ministry will designate a single Project Authority (SPOC) within five working days of contract execution, with authority to review and sign off on deliverables.\n2. Access to all 14 designated offices, their IT infrastructure, and relevant Ministry personnel will be facilitated by the Ministry within the timelines specified in the project plan.\n3. Existing infrastructure documentation, application lists, and data inventories, to the extent available, will be shared by the Ministry at the commencement of Phase 1.\n4. Third-party software licensing requirements identified during solution design will be procured by the Ministry separately; this proposal covers consulting and implementation services only.\n5. The implementation scope covers systems and processes within the 14 designated offices as described in the Scope of Work document. Any additional offices or functions not listed in the RFP are outside the scope of this proposal.\n6. The Ministry's network and connectivity infrastructure is assumed to be operational at all delivery locations. Network provisioning delays are not within the project's risk register.\n\nExclusions\n\n1. Hardware procurement, installation, and on-site physical infrastructure work are excluded from this proposal.\n2. Ongoing managed services or support beyond the 30-day hypercare period are not included and will require a separate engagement.\n3. Third-party software licensing and subscription fees are excluded.\n4. Legal, regulatory advisory, or audit services are excluded.\n5. Any scope additions arising after the solution blueprint sign-off will be treated as change requests and assessed separately.",

  declaration_notes: "We, Sharma Tech Solutions Pvt Ltd, hereby solemnly declare and affirm that:\n\n1. All information, representations, and declarations submitted in this bid proposal are true, accurate, and complete to the best of our knowledge and belief.\n2. We have read, understood, and accepted all terms and conditions of the Tender Document, RFP, Corrigendum No. 1, and any other documents forming part of this tender.\n3. We are not debarred, blacklisted, or otherwise ineligible to bid with any Central or State Government authority in India as on the date of this submission.\n4. We confirm our MSME registration under the Udyam portal (UDYAM-MH-12-0012345) and claim EMD exemption as admissible under the MSME Development Act, 2006.\n5. We agree to provide a Performance Security Deposit as specified in the tender document within 15 calendar days of award of contract.\n6. We accept the payment terms of 45 days from invoice submission and understand the applicable penalty clauses for delayed deliverables.\n7. We agree that all data accessed, processed, or generated during this engagement shall remain within India in compliance with MeitY data localisation requirements.\n8. We undertake to maintain team continuity throughout the contract period and will seek prior written approval from the Ministry for any changes to key personnel.\n9. We understand that misrepresentation of any information in this proposal may result in rejection of bid, cancellation of contract, and debarment from future tenders.",

  team_credentials: "Our delivery team comprises 12 qualified IT professionals including:\n\n• Project Manager: 2× PMP-certified PMs with 8+ years government project experience\n• Technical Lead: 1× Solution Architect (AWS Certified, 10 years)\n• Developers: 4 senior full-stack developers (avg. 6 years)\n• Business Analysts: 2× BAs with government domain expertise\n• QA Engineers: 2× with automated testing certifications\n• Support: 1 dedicated change management consultant",

  // team_members and past_projects are now managed in the draft builder (draftStore)
  // and sourced from Profile.past_projects respectively — not hardcoded in the bid.
  team_members: [],
  past_projects: [],
  scope_mapping: [
    { requirement: "Digital readiness assessment across 14 offices", our_response: "Structured assessment methodology covering infrastructure, applications, processes, and data. Delivered as Digital Maturity Assessment Report by Week 2.", status: "compliant" },
    { requirement: "Technology modernisation roadmap design", our_response: "TO-BE architecture blueprint and prioritised roadmap, incorporating cloud migration, data management, and cybersecurity posture recommendations. Delivered by Week 4 post sign-off.", status: "compliant" },
    { requirement: "Solution architecture and cloud migration advisory", our_response: "Dedicated Solution Architect (AWS Certified, 10 years) assigned for architecture design and vendor evaluation. Cloud options assessed against MeitY empanelled providers.", status: "compliant" },
    { requirement: "Implementation oversight with weekly progress reporting", our_response: "Agile sprint-based delivery with bi-weekly progress reports, UAT sign-off per sprint, and weekly governance meetings with Ministry SPOC.", status: "compliant" },
    { requirement: "Knowledge transfer and staff capacity building", our_response: "Structured knowledge transfer in Weeks 11–12 including role-specific training, technical admin guide, and user runbooks. 30-day hypercare included.", status: "compliant" },
    { requirement: "MeitY data localisation compliance", our_response: "All systems, data storage, and processing will be confined to MeitY-approved data centres within India. Compliance confirmed as a contractual obligation.", status: "compliant" },
    { requirement: "ISO 9001 or equivalent certification", our_response: "Sharma Tech Solutions Pvt Ltd holds ISO 9001:2015 certification for Quality Management Systems. Certificate enclosed as Annexure B.", status: "compliant" },
    { requirement: "Team continuity for duration of contract", our_response: "Key personnel are named in this proposal (Annexure C). Any replacement will require prior written approval from the Ministry as per tender conditions.", status: "compliant" },
  ],
  timeline: [
    { phase: "Phase 1 — Discovery & Assessment", deliverable: "Digital Maturity Assessment Report + Infrastructure Inventory", timeline: "Weeks 1–2" },
    { phase: "Phase 2 — Solution Design", deliverable: "Solution Architecture Blueprint + Vendor Evaluation Matrix + Implementation Plan", timeline: "Weeks 3–4" },
    { phase: "Phase 3 — Implementation (Sprint 1)", deliverable: "Sprint 1 delivery + UAT sign-off + Progress Report", timeline: "Weeks 5–6" },
    { phase: "Phase 3 — Implementation (Sprint 2)", deliverable: "Sprint 2 delivery + UAT sign-off + Progress Report", timeline: "Weeks 7–8" },
    { phase: "Phase 3 — Implementation (Sprint 3)", deliverable: "Sprint 3 delivery + UAT sign-off + Progress Report", timeline: "Weeks 9–10" },
    { phase: "Phase 4 — Knowledge Transfer", deliverable: "Training Materials, User Runbooks, Technical Admin Guide", timeline: "Week 11" },
    { phase: "Phase 4 — Project Handover", deliverable: "Final Handover Report + SLA benchmarks + Hypercare commencement", timeline: "Week 12" },
    { phase: "Hypercare Period", deliverable: "Bug fixes, support calls, post-go-live stability monitoring", timeline: "Weeks 13–16 (30 days)" },
  ],
  compliance_matrix: [
    { requirement: "MSME / Udyam Registration", our_response: "Registered — UDYAM-MH-12-0012345", notes: "EMD exemption claimed under MSME Development Act, 2006" },
    { requirement: "GST Registration", our_response: "Registered — 27AABCS1429B1ZB", notes: "GST certificate enclosed as Annexure D" },
    { requirement: "Minimum turnover ₹20L", our_response: "Annual turnover ₹21L — qualifies", notes: "Audited financials available on request" },
    { requirement: "Minimum 3 years in operation", our_response: "5 years in operation", notes: "Certificate of Incorporation + audited accounts enclosed" },
    { requirement: "ISO 9001 certification", our_response: "ISO 9001:2015 — valid", notes: "Certificate enclosed as Annexure B" },
    { requirement: "Past order value ₹10L+", our_response: "3 comparable projects — combined value ₹29L", notes: "Work completion certificates enclosed as Annexure A" },
    { requirement: "Bank Solvency Certificate", our_response: "Pending — to be uploaded", notes: "Being obtained from bank; estimated 2 working days" },
    { requirement: "Performance Security (10%)", our_response: "Agreed — will submit within 15 days of award", notes: "As per Clause 8.3 of the Tender Document" },
    { requirement: "45-day payment terms", our_response: "Accepted", notes: "Cash flow provisioned; no deviations requested" },
    { requirement: "MeitY data localisation norms", our_response: "Fully compliant", notes: "All infrastructure scoped to MeitY empanelled cloud providers" },
    { requirement: "Team continuity obligation", our_response: "Accepted — named personnel in Annexure C", notes: "No resource substitution without Ministry approval" },
  ],
  checklist: [
    { document: "GST Registration Certificate", status: "ready", note: "Upload latest certificate" },
    { document: "Udyam Certificate", status: "ready", note: "Already uploaded" },
    { document: "Last 3 Years ITR", status: "ready", note: "Upload all 3 years" },
    { document: "Bank Solvency Certificate", status: "missing", note: "Get from your bank — takes 2 days" },
    { document: "Work Completion Certificates", status: "missing", note: "Minimum 2 required" },
    { document: "PAN Card", status: "ready", note: "Self-attested copy needed" }
  ]
}

export const MOCK_TENDER_DETAILS = {
  "GEM-2024-IT-001": {
    id: "GEM-2024-IT-001",
    scope_of_work: "The selected vendor shall provide end-to-end IT consulting services encompassing digital readiness assessment, technology roadmap design, solution architecture, implementation oversight, and knowledge transfer across 14 offices of the Ministry. The engagement includes advisory on cloud migration, cybersecurity posture, and data management practices.",
    emd: {
      amount: "₹2,25,000",
      exempted: true,
      exemption_reason: "MSME registered under Udyam — exempted under MSME Development Act, 2006",
      savings: "₹2,25,000"
    },
    important_dates: {
      published: "2026-03-10",
      bid_submission: "2026-04-20",
      technical_bid_opening: "2026-04-22",
      financial_bid_opening: "2026-04-29"
    },
    geographic_eligibility: "Pan-India — vendor must have registered office in India. Services to be delivered at Ministry HQ, New Delhi with remote support permitted for implementation phases.",
    work_experience: {
      minimum_value: "₹10,00,000",
      minimum_projects: 2,
      description: "Bidder must have completed at least 2 similar IT consulting / digital transformation projects with a combined order value of ₹10 lakh or more in the last 5 years. Government or PSU projects preferred."
    },
    source_documents: [
      { type: "tender_pdf", label: "Tender Notice (NIT)", file_size: "1.2 MB" },
      { type: "rfp", label: "Request for Proposal (RFP)", file_size: "3.8 MB" },
      { type: "boq", label: "Bill of Quantities (BOQ)", file_size: "540 KB" },
      { type: "attachment", label: "Scope of Work Document", file_size: "2.1 MB" },
      { type: "corrigendum", label: "Corrigendum #1 (Deadline Extension)", file_size: "128 KB" }
    ],
    special_conditions: [
      "10% performance security deposit required within 15 days of award letter",
      "45-day payment terms from invoice submission — plan working capital accordingly",
      "10% penalty per week for delays beyond scheduled milestones (max 10 weeks)",
      "All data handled during engagement is subject to MeitY data localisation norms",
      "Vendor must maintain project team continuity — no key resource replacement without prior approval"
    ]
  },
  "GEM-2024-IT-002": {
    id: "GEM-2024-IT-002",
    scope_of_work: "Design, develop, deploy, and maintain the Ministry of Agriculture's official web presence including the main portal and 6 sub-portals. Includes CMS setup, hosting, SSL, monthly security patches, and 99.5% uptime SLA for 3 years.",
    emd: {
      amount: "₹60,000",
      exempted: true,
      exemption_reason: "MSME Udyam registered — EMD exempted",
      savings: "₹60,000"
    },
    important_dates: {
      published: "2026-03-18",
      bid_submission: "2026-04-25",
      technical_bid_opening: "2026-04-28",
      financial_bid_opening: "2026-05-05"
    },
    geographic_eligibility: "Pan-India — remote delivery permitted. Final deployment on NIC (National Informatics Centre) approved infrastructure.",
    work_experience: {
      minimum_value: "₹5,00,000",
      minimum_projects: 1,
      description: "At least 1 government or PSU website development project of ₹5 lakh or above in the last 3 years."
    },
    source_documents: [
      { type: "tender_pdf", label: "Tender Notice", file_size: "890 KB" },
      { type: "rfp", label: "Technical Specifications", file_size: "1.4 MB" },
      { type: "boq", label: "BOQ & Pricing Template", file_size: "320 KB" }
    ],
    special_conditions: [
      "Website must comply with GIGW (Guidelines for Indian Government Websites) v3.0",
      "Must support accessibility standards — WCAG 2.1 AA",
      "30-day defect liability period post go-live",
      "Source code and all assets become property of the Ministry upon project completion"
    ]
  },
  "GEM-2024-IT-003": {
    id: "GEM-2024-IT-003",
    scope_of_work: "Provision, configuration, and ongoing managed services for cloud infrastructure including compute, storage, networking, and security tooling for the Ministry of Finance's internal systems. Includes 24×7 monitoring, incident response SLA, and quarterly DR drills.",
    emd: {
      amount: "₹1,40,000",
      exempted: true,
      exemption_reason: "MSME registered — EMD waived per government MSME preference policy",
      savings: "₹1,40,000"
    },
    important_dates: {
      published: "2026-03-22",
      bid_submission: "2026-05-01",
      technical_bid_opening: "2026-05-05",
      financial_bid_opening: "2026-05-12"
    },
    geographic_eligibility: "Data must reside within India (RBI/MeitY compliant data centres only). Vendor operations may be remote.",
    work_experience: {
      minimum_value: "₹15,00,000",
      minimum_projects: 2,
      description: "Minimum 2 cloud managed services contracts for government or financial sector entities, each valued ₹15 lakh+, with ISO 27001 certified infrastructure."
    },
    source_documents: [
      { type: "tender_pdf", label: "Tender Document (NIT)", file_size: "1.6 MB" },
      { type: "rfp", label: "Technical RFP", file_size: "4.2 MB" },
      { type: "boq", label: "Cloud Resource BOQ", file_size: "780 KB" },
      { type: "attachment", label: "Security & Compliance Requirements", file_size: "2.9 MB" }
    ],
    special_conditions: [
      "ISO 27001 certification mandatory for the bidding entity",
      "Minimum uptime SLA of 99.9% — penalties apply for SLA breach",
      "All infrastructure must be MeitY empanelled cloud service provider stack",
      "Background verification of all personnel with access to Ministry data",
      "Quarterly security audits at bidder's cost for the contract duration"
    ]
  }
}

// ─── Draft builder seed data ──────────────────────────────────────────────────
// Pre-populated team members and project selection for the demo tender.
// These seed the draftStore on first load so the demo flows end-to-end.
// TODO: Replace with draft API endpoints when backend is ready.

export const MOCK_DRAFT_TEAM = [
  {
    name: "Rajesh Sharma",
    role: "Project Manager",
    experience: "8 years in government IT projects",
    certifications: ["PMP", "PRINCE2"],
    summary: "Seasoned PM with 8 years leading government IT transformation engagements across Maharashtra and New Delhi.",
    expertise: "Government IT project management, stakeholder coordination, risk management, GeM procurement",
    similar_experience: "Led ERP rollout for Maharashtra State Government (₹15L, 2023). Managed PSU workflow automation project (₹8L, 2022).",
    availability: "Full-time for project duration",
    has_cv: false,
  },
  {
    name: "Anita Verma",
    role: "Solution Architect",
    experience: "10 years, cloud & enterprise systems",
    certifications: ["AWS Certified Solutions Architect", "Azure Solutions Architect"],
    summary: "Expert solution architect with 10 years designing enterprise and cloud-native systems for government and large enterprise clients.",
    expertise: "Cloud architecture (AWS/Azure), microservices, API design, MeitY empanelled cloud stacks",
    similar_experience: "Designed cloud architecture for PSU workflow automation project. Led technical evaluation of vendors for State ERP rollout.",
    availability: "Full-time for Phases 1–3; advisory in Phase 4",
    has_cv: false,
  },
  {
    name: "Priya Nair",
    role: "Business Analyst",
    experience: "6 years, government domain",
    certifications: ["CBAP"],
    summary: "Certified BA with 6 years of domain experience in government IT, specialising in requirements elicitation and process redesign.",
    expertise: "Requirements management, AS-IS/TO-BE process mapping, government procurement domain",
    similar_experience: "Conducted requirements workshops for Maharashtra ERP project (14 departments). Authored scope documentation for PSU automation.",
    availability: "Full-time",
    has_cv: false,
  },
  {
    name: "Suresh Iyer",
    role: "Senior Developer",
    experience: "7 years, full-stack",
    certifications: ["Oracle Certified Developer"],
    summary: "Full-stack developer with 7 years of experience in enterprise web applications and government portals.",
    expertise: "Java Spring Boot, React, PostgreSQL, REST APIs, government portal integrations (NIC stack)",
    similar_experience: "Lead developer for Maharashtra ERP backend modules. Built workflow engine for PSU automation project.",
    availability: "Full-time",
    has_cv: false,
  },
  {
    name: "Meena Pillai",
    role: "QA Lead",
    experience: "5 years, automated testing",
    certifications: ["ISTQB Certified"],
    summary: "QA lead with 5 years of experience in structured testing for government and enterprise software, including UAT facilitation.",
    expertise: "Test planning, automated testing (Selenium, JUnit), UAT management, government acceptance protocols",
    similar_experience: "Led UAT for Maharashtra ERP go-live (zero critical defects). Conducted security testing for cybersecurity audit project.",
    availability: "Full-time from Phase 2 onwards",
    has_cv: false,
  },
];

// Default selected past project IDs per tender (all selected by default for demo)
export const MOCK_DRAFT_PROJECT_SELECTION: Record<string, string[]> = {
  "GEM-2024-IT-001": ["pp-1", "pp-2", "pp-3"],
};