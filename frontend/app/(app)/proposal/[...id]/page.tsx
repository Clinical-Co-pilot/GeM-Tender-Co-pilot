'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getDraft,
  getDraftExportUrl,
  getProfile,
  getTenderById,
  getTenderWorkflow,
  updateTenderWorkflow,
} from '@/lib/mockApi';
import { formatDate } from '@/lib/utils';
import type { DraftRecord, Profile, Tender } from '@/types';

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

export default function ProposalPreviewPage() {
  const params = useParams<{ id: string[] }>();
  const id = Array.isArray(params.id) ? params.id.join('/') : (params.id ?? '');
  const [tender, setTender] = useState<Tender | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<DraftRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readyMarked, setReadyMarked] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      if (!id) return;

      try {
        const [tenderResult, profileResult, draftResult, workflowResult] = await Promise.all([
          getTenderById(id),
          getProfile(),
          getDraft(id),
          getTenderWorkflow(),
        ]);

        if (!active) return;

        setTender(tenderResult);
        setProfile(profileResult.profile ?? null);
        setDraft(draftResult.draft);
        setReadyMarked(Boolean(workflowResult.find((item) => item.tender_id === id)?.ready_at));
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load the saved proposal preview');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPreview();

    return () => {
      active = false;
    };
  }, [id]);

  async function markReady() {
    try {
      await updateTenderWorkflow(id, { ready: true });
      setReadyMarked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to mark this proposal as ready');
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
            <div className="h-3 bg-slate-200 rounded w-full mb-2" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !tender || !profile || !draft) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
          <h1 className="text-lg font-bold text-slate-900 mb-2">Saved proposal not available</h1>
          <p className="text-sm text-slate-500">{error ?? 'Generate and save a draft before opening the final preview.'}</p>
          <Link
            href={`/draft/${id}`}
            className="inline-flex items-center gap-2 mt-5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            Open Draft Builder
          </Link>
        </div>
      </div>
    );
  }

  const bid = draft.bid;
  const readyCount = bid.checklist.filter((item) => item.status === 'ready').length;
  const totalCount = bid.checklist.length;
  const missingCount = totalCount - readyCount;
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
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
        <div className="lg:col-span-2">
          <div className={`rounded-xl p-4 mb-5 flex items-center gap-3 border ${missingCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <div>
              <p className={`text-sm font-semibold ${missingCount > 0 ? 'text-amber-800' : 'text-green-800'}`}>
                {missingCount > 0 ? `${missingCount} document item(s) still need attention` : 'All tracked document items are ready'}
              </p>
              <p className={`text-xs mt-0.5 ${missingCount > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                This preview is sourced from the saved backend draft updated on {formatDate(draft.updated_at)}.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 px-10 py-10 text-white">
              <div className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-6">
                GeM Tender Copilot — Final Proposal Export
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
                  <p className="text-sm font-semibold text-white">{tender.value ?? 'Not disclosed'}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-300 mb-1">Submission Deadline</p>
                  <p className="text-sm font-semibold text-white">{formatDate(tender.deadline)}</p>
                </div>
              </div>

              <div className="border-t border-blue-700/50 pt-6">
                <p className="text-xs text-blue-300 mb-3 uppercase tracking-wide">Submitted by</p>
                <p className="text-lg font-bold text-white">{profile.company_name}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-blue-200">
                  <span>GST: {profile.gst_number || 'Not uploaded'}</span>
                  <span>Udyam: {profile.udyam_number || 'Not uploaded'}</span>
                </div>
                <p className="mt-4 text-xs text-blue-300">Proposal Date: {today}</p>
              </div>
            </div>

            <div className="px-10 py-10">
              <ProposalSection number="Section 1" title="Cover Letter">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.cover_letter}</p>
              </ProposalSection>

              <ProposalSection number="Section 2" title="Executive Summary">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.executive_summary}</p>
              </ProposalSection>

              <ProposalSection number="Section 3" title="Company Overview">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.company_overview}</p>
              </ProposalSection>

              <ProposalSection number="Section 4" title="Understanding of Requirement">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.scope_understanding}</p>
              </ProposalSection>

              <ProposalSection number="Section 5" title="Methodology">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.methodology}</p>
              </ProposalSection>

              <ProposalSection number="Section 6" title="Deliverables & Milestones">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.deliverables}</p>
              </ProposalSection>

              <ProposalSection number="Section 7" title="Assumptions & Exclusions">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.assumptions_exclusions}</p>
              </ProposalSection>

              <ProposalSection number="Section 8" title="Supporting Documents">
                <div className="space-y-2">
                  {bid.checklist.map((item) => (
                    <div key={item.document} className={`flex items-start gap-3 p-3 rounded-lg border ${item.status === 'ready' ? 'border-green-200 bg-green-50/60' : 'border-red-200 bg-red-50/60'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.status === 'ready' ? 'bg-green-500' : 'bg-red-400'}`}>
                        <span className="text-white text-xs">{item.status === 'ready' ? '✓' : '!'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{item.document}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ProposalSection>

              <ProposalSection number="Section 9" title="Declaration & Signatory Notes">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{bid.declaration_notes}</p>
              </ProposalSection>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Document Readiness</h3>
            <p className="text-sm font-bold text-slate-900">{readyCount}/{totalCount} ready</p>
            <div className="mt-3 space-y-2">
              {bid.checklist.map((item) => (
                <div key={item.document} className="flex items-start justify-between gap-2 text-xs">
                  <span className="text-slate-600">{item.document}</span>
                  <span className={item.status === 'ready' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {item.status === 'ready' ? 'Ready' : 'Missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Export Options</h3>
            <div className="space-y-3">
              <a
                href={getDraftExportUrl(id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                Download Proposal HTML
              </a>

              <button
                onClick={() => void markReady()}
                className="w-full border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                {readyMarked ? 'Marked as Ready' : 'Mark as Ready for Submission'}
              </button>
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl p-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              This preview uses the saved backend draft artifact. Exporting downloads the same persisted content shown on this page.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/draft/${id}`}
              className="flex-1 text-center text-sm text-blue-600 font-medium border border-blue-200 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Edit Draft
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
