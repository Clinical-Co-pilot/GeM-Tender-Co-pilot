'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { generateDraft, getDraft, getProfile, getTenderById, updateDraft } from '@/lib/mockApi';
import { formatDate } from '@/lib/utils';
import type {
  Bid,
  ChecklistItem,
  ComplianceMatrixRow,
  DraftRecord,
  Profile,
  ScopeMappingRow,
  Tender,
  TimelineRow,
} from '@/types';

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function LockedSectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 bg-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
        <span className="ml-auto text-xs text-slate-400">Backend-backed</span>
      </div>
      <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

function EditableSection({
  sectionKey,
  title,
  value,
  originalValue,
  onSave,
  onReset,
}: {
  sectionKey: keyof Bid;
  title: string;
  value: string;
  originalValue: string;
  onSave: (key: keyof Bid, value: string) => Promise<void>;
  onReset: (key: keyof Bid) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) setDraftValue(value);
  }, [value, editing]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(sectionKey, draftValue);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save this section');
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    setError(null);
    try {
      await onReset(sectionKey);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset this section');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          {value !== originalValue && (
            <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">Edited</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setDraftValue(value);
                  setEditing(false);
                  setError(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg transition-colors font-medium disabled:bg-blue-400"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => void handleReset()}
                disabled={saving || value === originalValue}
                className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors disabled:opacity-40"
              >
                Reset
              </button>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2.5 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-5">
        {editing ? (
          <textarea
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            className="w-full text-sm text-slate-700 leading-relaxed border border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-28"
            rows={6}
          />
        ) : (
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{value}</p>
        )}
        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
      </div>
    </div>
  );
}

function SimpleTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  if (!rows.length) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map((header) => (
                <th key={header} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-b border-slate-100 last:border-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${index}-${cellIndex}`} className="px-4 py-3 text-xs text-slate-700 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChecklistPanel({ items }: { items: ChecklistItem[] }) {
  const readyCount = items.filter((item) => item.status === 'ready').length;
  const total = items.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-24">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-sm">Document Readiness</h3>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            {readyCount}/{total}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {items.map((item) => (
          <div
            key={item.document}
            className={`rounded-lg border p-3 ${item.status === 'ready' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-slate-800 leading-snug">{item.document}</p>
              <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${item.status === 'ready' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'}`}>
                {item.status === 'ready' ? 'Ready' : 'Missing'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

async function loadOrCreateDraft(tenderId: string) {
  try {
    const existing = await getDraft(tenderId);
    return existing.draft;
  } catch (err) {
    if (err instanceof Error && err.message.includes('404')) {
      const created = await generateDraft(tenderId);
      return created.draft;
    }
    throw err;
  }
}

export default function DraftBidPage() {
  const params = useParams<{ id: string[] }>();
  const id = Array.isArray(params.id) ? params.id.join('/') : (params.id ?? '');
  const [tender, setTender] = useState<Tender | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<DraftRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDraftPage() {
      if (!id) return;

      try {
        const [tenderResult, profileResult, draftResult] = await Promise.all([
          getTenderById(id),
          getProfile(),
          loadOrCreateDraft(id),
        ]);

        if (!active) return;

        setTender(tenderResult);
        setProfile(profileResult.profile ?? null);
        setDraft(draftResult);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load the draft');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDraftPage();

    return () => {
      active = false;
    };
  }, [id]);

  async function persistSection(sectionKey: keyof Bid, value: string) {
    const response = await updateDraft(id, { [sectionKey]: value });
    setDraft(response.draft);
  }

  async function resetSection(sectionKey: keyof Bid) {
    if (!draft) return;
    const originalValue = String(draft.original_bid[sectionKey] ?? '');
    const response = await updateDraft(id, { [sectionKey]: originalValue });
    setDraft(response.draft);
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
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
          <h1 className="text-lg font-bold text-slate-900 mb-2">Unable to load draft</h1>
          <p className="text-sm text-slate-500">{error ?? 'This draft could not be loaded right now.'}</p>
        </div>
      </div>
    );
  }

  const bid = draft.bid;

  const scopeRows = (bid.scope_mapping ?? []).map((row: ScopeMappingRow) => [
    row.requirement,
    row.our_response,
    row.status,
  ]);

  const timelineRows = (bid.timeline ?? []).map((row: TimelineRow) => [
    row.phase,
    row.deliverable,
    row.timeline,
  ]);

  const complianceRows = (bid.compliance_matrix ?? []).map((row: ComplianceMatrixRow) => [
    row.requirement,
    row.our_response,
    row.notes,
  ]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
        <span>›</span>
        <Link href={`/tender/${id}`} className="hover:text-blue-600 transition-colors truncate max-w-xs">{tender.title}</Link>
        <span>›</span>
        <span className="text-slate-700">Proposal Builder</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2.5 py-1 rounded-full">Saved Draft</span>
              <span className="text-xs text-slate-500">Updated {formatDate(draft.updated_at)}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-1">{tender.title}</h1>
            <p className="text-sm text-slate-500">{tender.department}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Tender Value</p>
            <p className="text-lg font-bold text-slate-900">{tender.value ?? 'Not disclosed'}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-3">
            <LockedSectionCard title="Tender Details">
              <LockedField label="Tender Title" value={tender.title} />
              <LockedField label="Reference No." value={tender.id} />
              <LockedField label="Issuing Authority" value={tender.department} />
              <LockedField label="Submission Deadline" value={formatDate(tender.deadline)} />
            </LockedSectionCard>

            <LockedSectionCard title="Company Details">
              <LockedField label="Company Name" value={profile.company_name} />
              <LockedField label="Category" value={profile.category} />
              <LockedField label="GST Number" value={profile.gst_number || 'Not uploaded'} />
              <LockedField label="Udyam Number" value={profile.udyam_number || 'Not uploaded'} />
            </LockedSectionCard>
          </div>

          <EditableSection
            sectionKey="cover_letter"
            title="Cover Letter"
            value={bid.cover_letter ?? ''}
            originalValue={draft.original_bid.cover_letter ?? ''}
            onSave={persistSection}
            onReset={resetSection}
          />
          <EditableSection
            sectionKey="executive_summary"
            title="Executive Summary"
            value={bid.executive_summary ?? ''}
            originalValue={draft.original_bid.executive_summary ?? ''}
            onSave={persistSection}
            onReset={resetSection}
          />
          <EditableSection
            sectionKey="scope_understanding"
            title="Understanding of Requirement"
            value={bid.scope_understanding ?? ''}
            originalValue={draft.original_bid.scope_understanding ?? ''}
            onSave={persistSection}
            onReset={resetSection}
          />
          <EditableSection
            sectionKey="methodology"
            title="Proposed Methodology"
            value={bid.methodology}
            originalValue={draft.original_bid.methodology}
            onSave={persistSection}
            onReset={resetSection}
          />
          <EditableSection
            sectionKey="deliverables"
            title="Deliverables & Milestones"
            value={bid.deliverables ?? ''}
            originalValue={draft.original_bid.deliverables ?? ''}
            onSave={persistSection}
            onReset={resetSection}
          />
          <EditableSection
            sectionKey="assumptions_exclusions"
            title="Assumptions & Exclusions"
            value={bid.assumptions_exclusions ?? ''}
            originalValue={draft.original_bid.assumptions_exclusions ?? ''}
            onSave={persistSection}
            onReset={resetSection}
          />
          <EditableSection
            sectionKey="declaration_notes"
            title="Declaration & Signatory Notes"
            value={bid.declaration_notes ?? ''}
            originalValue={draft.original_bid.declaration_notes ?? ''}
            onSave={persistSection}
            onReset={resetSection}
          />

          <SimpleTable
            title="Scope Mapping"
            headers={['Tender Requirement', 'Our Response', 'Status']}
            rows={scopeRows}
          />
          <SimpleTable
            title="Project Timeline"
            headers={['Phase', 'Deliverable', 'Schedule']}
            rows={timelineRows}
          />
          <SimpleTable
            title="Compliance Matrix"
            headers={['Requirement', 'Our Response', 'Notes']}
            rows={complianceRows}
          />

          <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-sm">
            <h3 className="font-bold text-base mb-1">Ready to preview the final proposal?</h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              This draft is saved in the backend. The final preview uses the same persisted content.
            </p>
            <div className="mt-5">
              <Link
                href={`/proposal/${id}`}
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                Preview Final Proposal
              </Link>
            </div>
          </div>
        </div>

        <div>
          <ChecklistPanel items={bid.checklist} />
        </div>
      </div>
    </div>
  );
}
