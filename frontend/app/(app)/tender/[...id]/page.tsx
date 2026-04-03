'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  checkEligibility,
  getProfileId,
  getTenderById,
  saveTender,
  unsaveTender,
  updateTenderWorkflow,
} from '@/lib/mockApi';
import { formatDate, getDaysUntilDeadline, getDeadlineLabel, getMatchScoreMeta } from '@/lib/utils';
import type { Eligibility, EligibilityCriterion, Tender } from '@/types';

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pass: 'text-green-700 bg-green-50 border-green-200',
    partial: 'text-amber-700 bg-amber-50 border-amber-200',
    fail: 'text-red-700 bg-red-50 border-red-200',
  } as const;

  const label = status === 'pass' ? 'Pass' : status === 'partial' ? 'Review' : 'Fail';

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[status as keyof typeof styles] ?? styles.fail}`}>
      {label}
    </span>
  );
}

function EligibilityRow({ criterion }: { criterion: EligibilityCriterion }) {
  const bg = criterion.status === 'pass'
    ? 'border-green-200 bg-green-50/50'
    : criterion.status === 'partial'
      ? 'border-amber-200 bg-amber-50/50'
      : 'border-red-200 bg-red-50/50';

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border ${bg}`}>
      <StatusBadge status={criterion.status} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{criterion.name}</p>
        <p className="text-xs text-slate-600 mt-0.5">{criterion.detail}</p>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'blue' | 'amber';
}) {
  const styles = tone === 'blue'
    ? 'bg-blue-50 border-blue-200 text-blue-700'
    : tone === 'amber'
      ? 'bg-amber-50 border-amber-200 text-amber-800'
      : 'bg-slate-50 border-slate-200 text-slate-900';

  return (
    <div className={`rounded-xl p-4 border ${styles}`}>
      <p className="text-xs opacity-70 mb-1">{label}</p>
      <p className="text-sm font-semibold leading-snug">{value}</p>
    </div>
  );
}

function buildSpecialConditions(tender: Tender) {
  const items = [
    tender.payment_terms ? `Payment terms: ${tender.payment_terms}` : null,
    tender.contract_period ? `Contract period: ${tender.contract_period}` : null,
    tender.bid_offer_validity_days ? `Bid validity: ${tender.bid_offer_validity_days} days` : null,
    tender.requirements?.oem_authorization_required ? 'OEM authorization is required for this tender.' : null,
    ...(tender.penalty_clauses ?? []),
  ].filter(Boolean) as string[];

  return items;
}

function buildRequirementCards(tender: Tender) {
  return [
    {
      label: 'Minimum Turnover',
      value: tender.requirements?.min_turnover
        ? `Rs ${Number(tender.requirements.min_turnover).toLocaleString('en-IN')}`
        : 'Not specified',
    },
    {
      label: 'Minimum Experience',
      value: tender.requirements?.min_years
        ? `${tender.requirements.min_years} years`
        : 'Not specified',
    },
    {
      label: 'Past Experience Evidence',
      value: tender.requirements?.past_experience_required ? 'Required' : 'Not explicitly required',
    },
    {
      label: 'EMD',
      value: tender.requirements?.emd_required
        ? tender.requirements.emd_amount
          ? `Required: Rs ${Number(tender.requirements.emd_amount).toLocaleString('en-IN')}`
          : 'Required'
        : 'Not required / not specified',
    },
  ];
}

export default function TenderDetailPage() {
  const params = useParams<{ id: string[] }>();
  const id = Array.isArray(params.id) ? params.id.join('/') : (params.id ?? '');
  const router = useRouter();
  const [tender, setTender] = useState<Tender | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTenderPage() {
      if (!id) return;

      const [tenderResult, eligibilityResult] = await Promise.allSettled([
        getTenderById(id),
        checkEligibility(getProfileId(), id),
      ]);

      if (!active) return;

      if (tenderResult.status !== 'fulfilled' || !tenderResult.value) {
        router.push('/dashboard');
        return;
      }

      setTender(tenderResult.value);

      if (eligibilityResult.status === 'fulfilled') {
        setEligibility(eligibilityResult.value);
        setEligibilityError(null);
      } else {
        setEligibility(null);
        setEligibilityError(
          eligibilityResult.reason instanceof Error
            ? eligibilityResult.reason.message
            : 'Eligibility could not be computed right now.'
        );
      }

      try {
        const workflow = await updateTenderWorkflow(id, { analyzed: true });
        if (active) setSaved(Boolean(workflow.saved));
      } catch {
        if (active) setSaved(false);
      }

      if (active) setLoading(false);
    }

    void loadTenderPage();

    return () => {
      active = false;
    };
  }, [id, router]);

  async function handleSave() {
    if (!id) return;
    setSaving(true);

    try {
      if (saved) {
        await unsaveTender(id);
        setSaved(false);
      } else {
        await saveTender(id);
        setSaved(true);
        setSaveFeedback(true);
        setTimeout(() => setSaveFeedback(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  const scoreMeta = tender ? getMatchScoreMeta(tender.match_score) : null;
  const deadlineMeta = tender ? getDeadlineLabel(tender.deadline) : null;
  const passCount = eligibility?.criteria.filter((criterion) => criterion.status === 'pass').length ?? 0;
  const failCount = eligibility?.criteria.filter((criterion) => criterion.status === 'fail').length ?? 0;
  const missingDocuments = eligibility?.missing_documents ?? [];
  const specialConditions = useMemo(() => (tender ? buildSpecialConditions(tender) : []), [tender]);
  const requirementCards = useMemo(() => (tender ? buildRequirementCards(tender) : []), [tender]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-7 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-6" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-slate-200 rounded-xl" />
            <div className="h-20 bg-slate-200 rounded-xl" />
            <div className="h-20 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!tender) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
        <span>›</span>
        <span className="text-slate-700 truncate max-w-sm">{tender.title}</span>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{tender.id}</span>
                <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">{tender.category}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight mb-2">{tender.title}</h1>
              <p className="text-sm text-slate-500">{tender.department}</p>
            </div>

            <div className="flex-shrink-0 text-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke={tender.match_score >= 80 ? '#16a34a' : tender.match_score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - tender.match_score / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-900">{tender.match_score}%</span>
                </div>
              </div>
              <p className={`text-xs font-semibold mt-1 ${scoreMeta?.color ?? 'text-slate-500'}`}>
                {scoreMeta?.label ?? 'Match'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <InfoCard label="Tender Value" value={tender.value ?? 'Not disclosed'} />
            <InfoCard label="Submission Deadline" value={formatDate(tender.deadline)} tone="amber" />
            <InfoCard label="Days Remaining" value={`${getDaysUntilDeadline(tender.deadline)} days`} tone="blue" />
          </div>

          <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-1">Why you match</p>
            <p className="text-sm text-blue-700">{tender.match_reason}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <Link
              href={`/draft/${id}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              Generate Draft Bid
            </Link>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className={`px-6 py-3.5 rounded-xl font-semibold border text-sm flex items-center justify-center gap-2 transition-all ${
                saved
                  ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                  : 'border-slate-300 text-slate-700 bg-white hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              {saving ? 'Saving...' : saved ? (saveFeedback ? 'Saved!' : 'Saved') : 'Save Tender'}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm flex items-center justify-center gap-2 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Tender Overview</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{tender.full_text || 'Detailed tender description is not available in the current dataset.'}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Timeline & Publishing Data</h2>
            <div className="grid grid-cols-2 gap-3">
              <InfoCard label="Bid Submission" value={formatDate(tender.deadline)} tone="amber" />
              <InfoCard label="Bid Opening" value={tender.bid_opening_datetime ? formatDate(tender.bid_opening_datetime) : 'Not specified'} />
              <InfoCard label="Bid Validity" value={tender.bid_offer_validity_days ? `${tender.bid_offer_validity_days} days` : 'Not specified'} />
              <InfoCard label="Contract Period" value={tender.contract_period || 'Not specified'} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Key Requirements</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {requirementCards.map((card) => (
              <InfoCard key={card.label} label={card.label} value={card.value} />
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Eligibility Matrix</h2>
            {eligibility ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-700 font-semibold">{passCount} Pass</span>
                <span className="text-red-600 font-semibold">{failCount} Fail</span>
              </div>
            ) : null}
          </div>

          {eligibility ? (
            <>
              <p className="text-xs text-slate-500 mb-4">
                Score: <strong className="text-slate-700">{eligibility.score}/{eligibility.total}</strong> criteria met
              </p>
              <div className="grid gap-3">
                {eligibility.criteria.map((criterion) => (
                  <EligibilityRow key={criterion.name} criterion={criterion} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">Eligibility is temporarily unavailable</p>
              <p className="text-xs text-amber-700 mt-1">
                {eligibilityError ?? 'The analyzer could not compute eligibility right now.'}
              </p>
              <p className="text-xs text-amber-700 mt-2">
                Tender details still loaded successfully, so you can review the opportunity and proceed to draft preparation if appropriate.
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Required Supporting Documents</h2>
            {(tender.documents_required?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {tender.documents_required?.map((document) => (
                  <div key={document} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="text-xs font-semibold text-slate-500 mt-0.5">Doc</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{document}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Review this against your saved profile documents before final submission.</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No explicit supporting document list is available in the current tender record.</p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Commercial & Special Conditions</h2>
            {specialConditions.length > 0 ? (
              <ul className="space-y-2.5">
                {specialConditions.map((condition) => (
                  <li key={condition} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-center mt-0.5">•</span>
                    {condition}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No additional special conditions are available in the current tender record.</p>
            )}
          </div>
        </div>

        {missingDocuments.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Missing / Review Items</h2>
            <div className="space-y-3">
              {missingDocuments.map((document) => (
                <div key={document.name} className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <StatusBadge status={document.status} />
                  <div>
                    <p className="text-sm font-semibold text-red-800">{document.name}</p>
                    <p className="text-xs text-red-700 mt-0.5">{document.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(eligibility?.risk_flags.length ?? 0) > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Risk Flags</h2>
            <div className="space-y-2.5">
              {eligibility?.risk_flags.map((flag) => (
                <div key={flag} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <span className="text-red-500 text-sm mt-0.5">!</span>
                  <p className="text-sm text-slate-700">{flag}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-7 text-white shadow-sm">
          <h2 className="text-base font-bold mb-2">Copilot Recommendation</h2>
          <p className="text-sm text-blue-100 leading-relaxed">
            {eligibility?.recommendation
              ?? 'Review the tender requirements and supporting documents, then proceed to the draft builder when you are ready.'}
          </p>
          {eligibilityError && (
            <p className="text-xs text-blue-200 mt-3">
              Eligibility details are partially unavailable, but the tender record is still usable for review and draft preparation.
            </p>
          )}
          {deadlineMeta && (
            <p className="text-xs text-blue-200 mt-3">Deadline status: {deadlineMeta.label}</p>
          )}
        </div>
      </div>
    </div>
  );
}
