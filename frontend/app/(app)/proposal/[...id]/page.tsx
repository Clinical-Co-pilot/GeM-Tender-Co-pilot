'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTenderById, generateBid, getProfile, getProfileId, getDraftFromStore, saveDraftToStore } from '@/lib/mockApi';
import { formatDate } from '@/lib/utils';
import type { Tender, Bid, Profile, ScopeMappingRow, TimelineRow, ComplianceMatrixRow } from '@/types';

function ProposalSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10 last:mb-0">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{number}</h3>
      <h2 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">{title}</h2>
      {children}
    </div>
  );
}

function ChecklistDocRow({ item }: { item: { document: string; status: string; note: string } }) {
  const ready = item.status === 'ready';
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${ready ? 'border-green-200 bg-green-50/60' : 'border-red-200 bg-red-50/60'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${ready ? 'bg-green-500' : 'bg-red-400'}`}>
        {ready ? (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800">{item.document}</p>
        <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
      </div>
      <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${ready ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
        {ready ? 'Ready' : 'Missing'}
      </span>
    </div>
  );
}

function ScopeMappingTable({ rows }: { rows: ScopeMappingRow[] }) {
  const statusStyle: Record<string, string> = {
    compliant: 'text-green-700 bg-green-50 border-green-200',
    partial: 'text-amber-700 bg-amber-50 border-amber-200',
    clarification_needed: 'text-red-700 bg-red-50 border-red-200',
  };
  const statusLabel: Record<string, string> = {
    compliant: 'Compliant',
    partial: 'Partial',
    clarification_needed: 'Clarification Needed',
  };
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-2/5">Tender Requirement</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-2/5">Our Response</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-1/5">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
              <td className="px-4 py-3 text-slate-700 leading-relaxed align-top">{row.requirement}</td>
              <td className="px-4 py-3 text-slate-700 leading-relaxed align-top">{row.our_response}</td>
              <td className="px-4 py-3 align-top">
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${statusStyle[row.status] ?? 'text-slate-600 bg-slate-100 border-slate-200'}`}>
                  {statusLabel[row.status] ?? row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimelineTable({ rows }: { rows: TimelineRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-1/4">Phase</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-1/2">Deliverable</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-1/4">Schedule</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
              <td className="px-4 py-3 font-medium text-slate-800 align-top">{row.phase}</td>
              <td className="px-4 py-3 text-slate-700 leading-relaxed align-top">{row.deliverable}</td>
              <td className="px-4 py-3 align-top">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {row.timeline}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComplianceMatrixTable({ rows }: { rows: ComplianceMatrixRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-1/3">Requirement</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-1/3">Our Response</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-1/3">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
              <td className="px-4 py-3 text-slate-700 leading-relaxed align-top">{row.requirement}</td>
              <td className="px-4 py-3 text-slate-700 leading-relaxed align-top">{row.our_response}</td>
              <td className="px-4 py-3 text-slate-500 leading-relaxed align-top">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProposalPreviewPage() {
  const params = useParams<{ id: string[] }>();
  const id = Array.isArray(params.id) ? params.id.join('/') : (params.id ?? '');
  const [tender, setTender] = useState<Tender | null>(null);
  const [bid, setBid] = useState<Bid | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    const cachedBid = getDraftFromStore(id);
    const bidPromise = cachedBid
      ? Promise.resolve(cachedBid)
      : generateBid(getProfileId(), id);
    Promise.all([
      getTenderById(id),
      bidPromise,
      getProfile().catch(() => null),
    ]).then(([t, b, p]) => {
      setTender(t);
      setBid(b);
      setProfile(p?.profile ?? null);
      if (!cachedBid && t) {
        saveDraftToStore(id, t.title, t.department ?? '', b);
      }
      setLoading(false);
    });
  }, [id]);

  async function handleExport() {
    setDownloading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setDownloading(false);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  }

  const readyCount = bid?.checklist.filter((c) => c.status === 'ready').length ?? 0;
  const totalCount = bid?.checklist.length ?? 0;
  const missingCount = totalCount - readyCount;
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
            <div className="h-3 bg-slate-200 rounded w-full mb-2" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (!tender || !bid || !profile) return null;

  // Build declaration paragraphs from bid.declaration_notes or fall back to empty string
  const declarationText = bid.declaration_notes ?? '';

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
        <span>›</span>
        <Link href={`/tender/${id}`} className="hover:text-blue-600 transition-colors truncate max-w-xs">{tender.title}</Link>
        <span>›</span>
        <Link href={`/draft/${id}`} className="hover:text-blue-600 transition-colors">Draft Bid</Link>
        <span>›</span>
        <span className="text-slate-700">Proposal Preview</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main proposal document */}
        <div className="lg:col-span-2">
          {/* Readiness banner */}
          <div className={`rounded-xl p-4 mb-5 flex items-center gap-3 border ${
            missingCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
          }`}>
            {missingCount > 0 ? (
              <>
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    {missingCount} document{missingCount !== 1 ? 's' : ''} still missing
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Upload missing documents before final submission via GeM.
                  </p>
                </div>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-green-800">All documents ready</p>
                  <p className="text-xs text-green-700 mt-0.5">Review carefully before submitting through GeM.</p>
                </div>
              </>
            )}
          </div>

          {/* Proposal document */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Cover block */}
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 px-10 py-10 text-white">
              <div className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-6">
                Government e-Marketplace — Bid Proposal
              </div>

              <h1 className="text-2xl font-bold text-white leading-tight mb-4">{tender.title}</h1>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-xs text-blue-300 mb-1">Procuring Entity</p>
                  <p className="text-sm font-semibold text-white">{tender.department}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-300 mb-1">Tender Reference</p>
                  <p className="text-sm font-semibold text-white font-mono">{tender.id}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-300 mb-1">Tender Value</p>
                  <p className="text-sm font-semibold text-white">{tender.value}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-300 mb-1">Submission Deadline</p>
                  <p className="text-sm font-semibold text-white">{formatDate(tender.deadline)}</p>
                </div>
              </div>

              <div className="border-t border-blue-700/50 pt-6">
                <p className="text-xs text-blue-300 mb-3 uppercase tracking-wide">Submitted by</p>
                <div>
                  <p className="text-lg font-bold text-white">{profile.company_name}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-blue-200">
                    <span>GST: {profile.gst_number}</span>
                    <span>Udyam: {profile.udyam_number}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-1 text-xs text-blue-200">
                    <span>Category: {profile.category}</span>
                    <span>{profile.years_in_operation} years in operation</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-blue-300">Proposal Date: {today}</p>
              </div>
            </div>

            {/* Document body */}
            <div className="px-10 py-10">

              {/* Cover Letter */}
              {bid.cover_letter && (
                <ProposalSection number="Cover Letter" title="Letter of Transmittal">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.cover_letter}</p>
                  </div>
                </ProposalSection>
              )}

              {/* Executive Summary */}
              <ProposalSection number="Section 1" title="Executive Summary">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.executive_summary}</p>
              </ProposalSection>

              {/* Company Overview */}
              <ProposalSection number="Section 2" title="Company Overview">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.company_overview}</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-slate-900">{profile.years_in_operation}+</p>
                    <p className="text-xs text-slate-500 mt-0.5">Years Operating</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-slate-900">{profile.certifications.length}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Certification{profile.certifications.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-slate-900">MSME</p>
                    <p className="text-xs text-slate-500 mt-0.5">Registered</p>
                  </div>
                </div>
              </ProposalSection>

              {/* Understanding of Scope */}
              <ProposalSection number="Section 3" title="Understanding of Client Requirements">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.scope_understanding}</p>
              </ProposalSection>

              {/* Scope Mapping */}
              {bid.scope_mapping && bid.scope_mapping.length > 0 && (
                <ProposalSection number="Section 4" title="Scope Mapping & Compliance Matrix">
                  <p className="text-xs text-slate-500 mb-3">
                    The table below maps each key tender requirement to our proposed solution and indicates compliance status.
                  </p>
                  <ScopeMappingTable rows={bid.scope_mapping} />
                </ProposalSection>
              )}

              {/* Methodology */}
              <ProposalSection
                number={bid.scope_mapping && bid.scope_mapping.length > 0 ? 'Section 5' : 'Section 4'}
                title="Proposed Methodology & Approach"
              >
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.methodology}</p>
              </ProposalSection>

              {/* Deliverables */}
              <ProposalSection
                number={bid.scope_mapping && bid.scope_mapping.length > 0 ? 'Section 6' : 'Section 5'}
                title="Deliverables & Milestones"
              >
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.deliverables}</p>
              </ProposalSection>

              {/* Timeline */}
              {bid.timeline && bid.timeline.length > 0 && (
                <ProposalSection
                  number={bid.scope_mapping && bid.scope_mapping.length > 0 ? 'Section 7' : 'Section 6'}
                  title="Implementation Timeline"
                >
                  <p className="text-xs text-slate-500 mb-3">
                    Indicative project schedule based on a 12-week engagement from the date of award.
                  </p>
                  <TimelineTable rows={bid.timeline} />
                </ProposalSection>
              )}

              {/* Past Experience */}
              <ProposalSection number="Section 8" title="Past Experience & Relevant Projects">
                {bid.past_projects && bid.past_projects.length > 0 ? (
                  <div className="space-y-3">
                    {bid.past_projects.map((project, i) => (
                      <div key={i} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <p className="text-sm font-semibold text-slate-800 leading-snug">{project.title}</p>
                          <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex-shrink-0">{project.value}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-1.5">{project.client} · {project.year}</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{project.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.past_experience}</p>
                )}
              </ProposalSection>

              {/* Team */}
              <ProposalSection number="Section 9" title="Team & Credentials">
                {bid.team_members && bid.team_members.length > 0 ? (
                  <div className="space-y-2.5">
                    {bid.team_members.map((member, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-700">
                            {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role} · {member.experience}</p>
                          {member.certifications.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {member.certifications.map((c) => (
                                <span key={c} className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{c}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.team_credentials}</p>
                )}
              </ProposalSection>

              {/* Assumptions & Exclusions */}
              {bid.assumptions_exclusions && (
                <ProposalSection number="Section 10" title="Assumptions & Exclusions">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.assumptions_exclusions}</p>
                </ProposalSection>
              )}

              {/* Compliance Matrix */}
              {bid.compliance_matrix && bid.compliance_matrix.length > 0 && (
                <ProposalSection number="Section 11" title="Regulatory & Contractual Compliance">
                  <p className="text-xs text-slate-500 mb-3">
                    Confirmation of compliance with all mandatory eligibility, financial, and contractual requirements set forth in the tender.
                  </p>
                  <ComplianceMatrixTable rows={bid.compliance_matrix} />
                </ProposalSection>
              )}

              {/* Compliance & Documents */}
              <ProposalSection number="Section 12" title="Supporting Documents">
                <div className="space-y-2">
                  {bid.checklist.map((item, i) => (
                    <ChecklistDocRow key={i} item={item} />
                  ))}
                </div>
                {missingCount > 0 && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                    <strong>Note:</strong> {missingCount} document{missingCount !== 1 ? 's are' : ' is'} marked missing. These must be uploaded and attached before formal submission on GeM portal.
                  </div>
                )}
              </ProposalSection>

              {/* Declaration */}
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Declaration & Authorised Signatory</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-sm text-slate-700 leading-relaxed mb-4">
                    We, <strong>{profile.company_name}</strong> (Udyam: {profile.udyam_number}, GST: {profile.gst_number}), hereby submit this bid proposal and declare as follows:
                  </p>
                  {declarationText ? (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-5">{declarationText}</p>
                  ) : (
                    <ul className="space-y-2 mb-5">
                      {[
                        'All information provided in this bid proposal is true, accurate, and complete to the best of our knowledge.',
                        'We have read and understood the tender document, RFP, BOQ, and all corrigenda issued.',
                        'We are not debarred or blacklisted by any government authority in India.',
                        'We confirm MSME registration under the Udyam portal and claim EMD exemption as applicable.',
                        'We agree to furnish any additional information or documents as may be required by the procuring entity.',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Authorised Signatory</p>
                      <div className="h-10 border-b border-dashed border-slate-300" />
                      <p className="text-xs text-slate-500 mt-1">{profile.company_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Date</p>
                      <p className="text-sm font-medium text-slate-800 mt-1">{today}</p>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-xs text-slate-400 italic leading-relaxed">
                  This proposal has been prepared using GeM Tender Copilot. GeM Tender Copilot does not submit bids on your behalf. Please review this document carefully and submit formally through the official gem.gov.in portal before the deadline.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Readiness summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Document Readiness</h3>
            <div className="text-center mb-4">
              <div className="relative w-16 h-16 mx-auto">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke={missingCount === 0 ? '#16a34a' : '#f59e0b'}
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - readyCount / totalCount)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-800">{readyCount}/{totalCount}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {bid.checklist.map((item, i) => (
                <ChecklistDocRow key={i} item={item} />
              ))}
            </div>
          </div>

          {/* Tender reference card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Tender Reference</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Ref No.</span>
                <span className="font-mono font-semibold text-slate-700 text-right">{tender.id}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Value</span>
                <span className="font-semibold text-slate-700">{tender.value}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Deadline</span>
                <span className="font-semibold text-slate-700">{formatDate(tender.deadline)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-700">{tender.category}</span>
              </div>
            </div>
          </div>

          {/* Export actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Export Options</h3>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                disabled={downloading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                {downloading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Preparing Export…
                  </>
                ) : exportDone ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Exported Successfully!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export Final Bid Pack
                  </>
                )}
              </button>

              <button
                onClick={handleExport}
                className="w-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Download Proposal PDF
              </button>

              <button className="w-full border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mark as Ready for Submission
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-100 rounded-xl p-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-600">Important:</strong> GeM Tender Copilot does not submit bids on your behalf. Review carefully and submit directly through{' '}
              <span className="text-blue-600 font-medium">gem.gov.in</span>.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Link
              href={`/draft/${id}`}
              className="flex-1 text-center text-sm text-blue-600 font-medium border border-blue-200 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              ← Edit Draft
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 text-center text-sm text-slate-600 font-medium border border-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
