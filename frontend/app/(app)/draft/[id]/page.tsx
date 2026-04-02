'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTenderById, generateBid, getProfile, MOCK_PROFILE_ID } from '@/lib/mockApi';
import { formatDate } from '@/lib/utils';
import type { Tender, Bid, ChecklistItem, TeamMember, PastProject, ScopeMappingRow, TimelineRow, ComplianceMatrixRow, Profile } from '@/types';

// ─── Locked section ──────────────────────────────────────────────────────────
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
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
        <span className="ml-auto text-xs text-slate-400">Auto-filled</span>
      </div>
      <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

// ─── Rich-text editable section ───────────────────────────────────────────────
const AI_HELPERS = ['Make more professional', 'Shorten', 'Align to tender'] as const;

function RichSection({
  sectionKey,
  title,
  originalContent,
  savedContent,
  onSave,
}: {
  sectionKey: string;
  title: string;
  originalContent: string;
  savedContent: string;
  onSave: (key: string, value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(savedContent);
  const [justSaved, setJustSaved] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [aiHelper, setAiHelper] = useState<string | null>(null);

  // Sync if parent savedContent changes (e.g. after regenerate resets it)
  useEffect(() => {
    if (!editing) setValue(savedContent);
  }, [savedContent, editing]);

  function handleSave() {
    onSave(sectionKey, value);
    setEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  function handleCancel() {
    setValue(savedContent);
    setEditing(false);
  }

  async function handleRegenerate() {
    // Mock: spinner → restore AI-generated original content
    // TODO: Replace with POST /api/ai/regenerate { section: sectionKey, tender_id, profile_id }
    setRegenerating(true);
    await new Promise((r) => setTimeout(r, 1400));
    setValue(originalContent);
    onSave(sectionKey, originalContent);
    setRegenerating(false);
  }

  async function handleAiHelper(helper: string) {
    // Mock: spinner on textarea → no actual change
    // TODO: Replace with POST /api/ai/rewrite { section: sectionKey, instruction: helper, content: value }
    setAiHelper(helper);
    await new Promise((r) => setTimeout(r, 1200));
    setAiHelper(null);
  }

  const isModified = savedContent !== originalContent;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          {isModified && (
            <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">Edited</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors disabled:opacity-60"
                title="Regenerate with AI (resets to AI draft)"
              >
                {regenerating ? (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                )}
                {regenerating ? 'Regenerating…' : 'Regenerate'}
              </button>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2.5 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
                {justSaved ? 'Saved ✓' : 'Edit'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-5">
        {editing ? (
          <>
            <div className={`relative ${aiHelper ? 'opacity-60 pointer-events-none' : ''}`}>
              {aiHelper && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {aiHelper}…
                  </div>
                </div>
              )}
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full text-sm text-slate-700 leading-relaxed border border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-28"
                rows={6}
              />
            </div>
            {/* AI helper actions — mock until backend AI is connected */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">AI assist:</span>
              {AI_HELPERS.map((helper) => (
                <button
                  key={helper}
                  type="button"
                  onClick={() => handleAiHelper(helper)}
                  disabled={!!aiHelper}
                  className="text-xs text-slate-500 hover:text-blue-600 px-2 py-1 rounded border border-slate-200 hover:border-blue-300 transition-colors disabled:opacity-40"
                >
                  {helper}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{value}</p>
        )}
      </div>
    </div>
  );
}

// ─── Scope Mapping table ─────────────────────────────────────────────────────
function ScopeMappingTable({ rows }: { rows: ScopeMappingRow[] }) {
  const statusStyle: Record<string, string> = {
    compliant: 'text-green-700 bg-green-50 border-green-200',
    partial: 'text-amber-700 bg-amber-50 border-amber-200',
    clarification_needed: 'text-red-700 bg-red-50 border-red-200',
  };
  const statusLabel: Record<string, string> = {
    compliant: 'Compliant',
    partial: 'Partial',
    clarification_needed: 'Needs Clarification',
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200">
            <th className="text-left text-xs font-semibold text-slate-600 px-4 py-2.5 w-2/5">Tender Requirement</th>
            <th className="text-left text-xs font-semibold text-slate-600 px-4 py-2.5">Our Response</th>
            <th className="text-left text-xs font-semibold text-slate-600 px-4 py-2.5 w-28">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
              <td className="px-4 py-3 text-xs font-medium text-slate-700 align-top">{row.requirement}</td>
              <td className="px-4 py-3 text-xs text-slate-600 leading-relaxed align-top">{row.our_response}</td>
              <td className="px-4 py-3 align-top">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusStyle[row.status] ?? statusStyle.compliant}`}>
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

// ─── Timeline table ───────────────────────────────────────────────────────────
function TimelineTable({ rows }: { rows: TimelineRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200">
            <th className="text-left text-xs font-semibold text-slate-600 px-4 py-2.5 w-1/3">Phase</th>
            <th className="text-left text-xs font-semibold text-slate-600 px-4 py-2.5">Key Deliverable</th>
            <th className="text-left text-xs font-semibold text-slate-600 px-4 py-2.5 w-28">Schedule</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
              <td className="px-4 py-3 text-xs font-semibold text-slate-700 align-top">{row.phase}</td>
              <td className="px-4 py-3 text-xs text-slate-600 leading-relaxed align-top">{row.deliverable}</td>
              <td className="px-4 py-3 text-xs font-medium text-blue-700 align-top whitespace-nowrap">{row.timeline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Compliance matrix table ──────────────────────────────────────────────────
function ComplianceMatrixTable({ rows }: { rows: ComplianceMatrixRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200">
            <th className="text-left text-xs font-semibold text-slate-600 px-4 py-2.5 w-1/3">Requirement</th>
            <th className="text-left text-xs font-semibold text-slate-600 px-4 py-2.5">Our Response</th>
            <th className="text-left text-xs font-semibold text-slate-600 px-4 py-2.5">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
              <td className="px-4 py-3 text-xs font-medium text-slate-700 align-top">{row.requirement}</td>
              <td className="px-4 py-3 text-xs text-slate-700 font-medium align-top">{row.our_response}</td>
              <td className="px-4 py-3 text-xs text-slate-500 leading-relaxed align-top">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Team member card ────────────────────────────────────────────────────────
function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 bg-white">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-blue-700">{member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{member.name}</p>
        <p className="text-xs text-slate-500">{member.role} · {member.experience}</p>
        {member.certifications.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {member.certifications.map((c) => (
              <span key={c} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{c}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Past project card ───────────────────────────────────────────────────────
function PastProjectCard({ project }: { project: PastProject }) {
  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{project.title}</p>
        <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex-shrink-0">{project.value}</span>
      </div>
      <p className="text-xs text-slate-500 mb-1.5">{project.client} · {project.year}</p>
      <p className="text-xs text-slate-600 leading-relaxed">{project.description}</p>
    </div>
  );
}

// ─── Structured list section wrapper ─────────────────────────────────────────
function StructuredSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        {badge && (
          <span className="text-xs text-slate-400">{badge}</span>
        )}
      </div>
      <div className="p-5 space-y-3">
        {children}
      </div>
    </div>
  );
}

// ─── Compliance checklist sidebar ─────────────────────────────────────────────
function ChecklistPanel({ items }: { items: ChecklistItem[] }) {
  const readyCount = items.filter((i) => i.status === 'ready').length;
  const total = items.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-24">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-sm">Compliance Checklist</h3>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            {readyCount}/{total}
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all"
            style={{ width: `${(readyCount / total) * 100}%` }}
          />
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 ${
              item.status === 'ready'
                ? 'border-green-200 bg-green-50/50'
                : 'border-red-200 bg-red-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-slate-800 leading-snug">{item.document}</p>
              <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                item.status === 'ready'
                  ? 'text-green-700 bg-green-50 border border-green-200'
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {item.status === 'ready' ? 'Ready' : 'Missing'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{item.note}</p>
          </div>
        ))}
      </div>
      {items.some((i) => i.status === 'missing') && (
        <div className="px-4 pb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            <strong>Action needed:</strong> Upload missing documents to your profile before finalizing.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DraftBidPage() {
  const { id } = useParams<{ id: string }>();
  const [tender, setTender] = useState<Tender | null>(null);
  const [bid, setBid] = useState<Bid | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // sections holds current saved text per rich-text section key
  const [sections, setSections] = useState<Record<string, string>>({});
  // originals holds AI-generated baseline — used by Regenerate to reset
  const [originals, setOriginals] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getTenderById(id),
      generateBid(MOCK_PROFILE_ID, id),
      getProfile(),
    ]).then(([t, b, p]) => {
      setTender(t);
      setBid(b);
      setProfile(p.profile);
      const initial = {
        cover_letter: b.cover_letter ?? '',
        executive_summary: b.executive_summary ?? '',
        scope_understanding: b.scope_understanding ?? '',
        methodology: b.methodology,
        deliverables: b.deliverables ?? '',
        assumptions_exclusions: b.assumptions_exclusions ?? '',
        declaration_notes: b.declaration_notes ?? '',
      };
      setSections(initial);
      setOriginals(initial);
      setLoading(false);
    });
  }, [id]);

  function handleSectionSave(key: string, value: string) {
    setSections((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 rounded w-5/6 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse h-64" />
        </div>
      </div>
    );
  }

  if (!tender || !bid || !profile) return null;

  const missingDocCount = bid.checklist.filter((c) => c.status === 'missing').length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
        <span>›</span>
        <Link href={`/tender/${id}`} className="hover:text-blue-600 transition-colors truncate max-w-xs">{tender.title}</Link>
        <span>›</span>
        <span className="text-slate-700">Proposal Builder</span>
      </div>

      {/* Page header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2.5 py-1 rounded-full">Proposal Builder</span>
              {missingDocCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2.5 py-1 rounded-full">{missingDocCount} docs missing</span>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-1">{tender.title}</h1>
            <p className="text-sm text-slate-500">{tender.department}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-500 mb-1">Tender Value</p>
            <p className="text-lg font-bold text-slate-900">{tender.value}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main builder */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── A. Locked sections ─── */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Tender & Company Details</p>
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
                <LockedField label="GST Number" value={profile.gst_number} />
                <LockedField label="Udyam Number" value={profile.udyam_number} />
              </LockedSectionCard>
            </div>
          </div>

          {/* ── B. Core narrative sections ─── */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Core Proposal Content</p>
            <div className="space-y-4">
              <RichSection
                sectionKey="cover_letter"
                title="Cover Letter"
                originalContent={originals.cover_letter}
                savedContent={sections.cover_letter}
                onSave={handleSectionSave}
              />
              <RichSection
                sectionKey="executive_summary"
                title="Executive Summary"
                originalContent={originals.executive_summary}
                savedContent={sections.executive_summary}
                onSave={handleSectionSave}
              />
              <RichSection
                sectionKey="scope_understanding"
                title="Understanding of Requirement"
                originalContent={originals.scope_understanding}
                savedContent={sections.scope_understanding}
                onSave={handleSectionSave}
              />
              <RichSection
                sectionKey="methodology"
                title="Proposed Approach / Execution Methodology"
                originalContent={originals.methodology}
                savedContent={sections.methodology}
                onSave={handleSectionSave}
              />
              <RichSection
                sectionKey="deliverables"
                title="Deliverables & Milestones"
                originalContent={originals.deliverables}
                savedContent={sections.deliverables}
                onSave={handleSectionSave}
              />
              <RichSection
                sectionKey="assumptions_exclusions"
                title="Assumptions & Exclusions"
                originalContent={originals.assumptions_exclusions}
                savedContent={sections.assumptions_exclusions}
                onSave={handleSectionSave}
              />
            </div>
          </div>

          {/* ── C. Structured table sections ─── */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Structured Sections</p>
            <div className="space-y-4">
              {/* Scope Mapping */}
              {bid.scope_mapping && bid.scope_mapping.length > 0 && (
                <StructuredSection title="Scope Mapping / Response to Tender Requirements" badge="AI-generated from tender data">
                  <ScopeMappingTable rows={bid.scope_mapping} />
                </StructuredSection>
              )}

              {/* Project Timeline */}
              {bid.timeline && bid.timeline.length > 0 && (
                <StructuredSection title="Project Timeline / Schedule" badge="Based on proposed methodology">
                  <TimelineTable rows={bid.timeline} />
                </StructuredSection>
              )}

              {/* Compliance Matrix */}
              {bid.compliance_matrix && bid.compliance_matrix.length > 0 && (
                <StructuredSection title="Compliance Matrix" badge="Derived from tender eligibility criteria">
                  <ComplianceMatrixTable rows={bid.compliance_matrix} />
                </StructuredSection>
              )}

              {/* Team Members */}
              {bid.team_members && bid.team_members.length > 0 && (
                <StructuredSection title="Proposed Team" badge="From company profile">
                  {bid.team_members.map((member, i) => (
                    <TeamMemberCard key={i} member={member} />
                  ))}
                </StructuredSection>
              )}

              {/* Similar Experience */}
              {bid.past_projects && bid.past_projects.length > 0 && (
                <StructuredSection title="Similar Experience / Past Projects" badge="From company profile">
                  {bid.past_projects.map((project, i) => (
                    <PastProjectCard key={i} project={project} />
                  ))}
                </StructuredSection>
              )}

              {/* Supporting Documents */}
              <StructuredSection title="Supporting Documents / Annexure References" badge="From compliance checklist">
                {bid.checklist.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      item.status === 'ready' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.status === 'ready' ? 'bg-green-500' : 'bg-red-400'
                    }`}>
                      {item.status === 'ready' ? (
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
                      <p className="text-sm font-medium text-slate-800">{item.document}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      item.status === 'ready' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                    }`}>
                      {item.status === 'ready' ? 'Ready' : 'Missing'}
                    </span>
                  </div>
                ))}
                {missingDocCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Go to <Link href="/profile" className="underline font-medium">Profile</Link> to upload missing documents before submitting.
                  </div>
                )}
              </StructuredSection>
            </div>
          </div>

          {/* ── D. Closing section ─── */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Closing</p>
            <RichSection
              sectionKey="declaration_notes"
              title="Declaration & Authorized Signatory"
              originalContent={originals.declaration_notes}
              savedContent={sections.declaration_notes}
              onSave={handleSectionSave}
            />
          </div>

          {/* CTA to final preview */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-sm">
            <h3 className="font-bold text-base mb-1">Ready to preview the final proposal?</h3>
            <p className="text-blue-200 text-sm leading-relaxed mb-1">
              All sections above compile into a formatted submission-ready document.
            </p>
            {missingDocCount > 0 && (
              <p className="text-amber-200 text-xs mt-1">
                ⚠ {missingDocCount} document{missingDocCount !== 1 ? 's' : ''} still missing — consider resolving before finalizing.
              </p>
            )}
            <div className="mt-5">
              <Link
                href={`/proposal/${id}`}
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Preview Final Proposal
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar: compliance checklist */}
        <div>
          <ChecklistPanel items={bid.checklist} />
        </div>
      </div>
    </div>
  );
}
