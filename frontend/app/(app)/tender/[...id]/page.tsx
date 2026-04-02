'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getTenderById,
  getTenderDetails,
  checkEligibility,
  saveTender,
  unsaveTender,
  isTenderSaved,
  getProfileId,
} from '@/lib/mockApi';
import { formatDate, getDaysUntilDeadline, getMatchScoreMeta, getDeadlineLabel } from '@/lib/utils';
import type { Tender, TenderDetails, Eligibility, EligibilityCriterion } from '@/types';

function StatusBadge({ status }: { status: string }) {
  if (status === 'pass') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Pass
      </span>
    );
  }
  if (status === 'partial') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      Fail
    </span>
  );
}

function EligibilityRow({ criterion }: { criterion: EligibilityCriterion }) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
      criterion.status === 'pass'
        ? 'border-green-200 bg-green-50/50'
        : criterion.status === 'partial'
        ? 'border-amber-200 bg-amber-50/50'
        : 'border-red-200 bg-red-50/50'
    }`}>
      <StatusBadge status={criterion.status} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{criterion.name}</p>
        <p className={`text-xs mt-0.5 ${
          criterion.status === 'pass' ? 'text-green-700' : criterion.status === 'partial' ? 'text-amber-700' : 'text-red-700'
        }`}>
          {criterion.detail}
        </p>
      </div>
    </div>
  );
}

function DocTypeIcon({ type }: { type: string }) {
  if (type === 'tender_pdf' || type === 'rfp') {
    return (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 10.5h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    );
  }
  if (type === 'boq') {
    return (
      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375z" />
      </svg>
    );
  }
  if (type === 'corrigendum') {
    return (
      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

export default function TenderDetailPage() {
  const params = useParams<{ id: string[] }>();
  const id = Array.isArray(params.id) ? params.id.join('/') : (params.id ?? '');
  const router = useRouter();
  const [tender, setTender] = useState<Tender | null>(null);
  const [details, setDetails] = useState<TenderDetails | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  useEffect(() => {
    if (!id) return;
    setSaved(isTenderSaved(id));
    Promise.all([
      getTenderById(id),
      getTenderDetails(id),
      checkEligibility(getProfileId(), id).catch(() => null),
    ]).then(([tenderData, detailsData, eligibilityData]) => {
      if (!tenderData) {
        router.push('/dashboard');
        return;
      }
      setTender(tenderData);
      setDetails(detailsData);
      setEligibility(eligibilityData);
      setLoading(false);
    });
  }, [id, router]);

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    if (saved) {
      await unsaveTender(id);
      setSaved(false);
    } else {
      await saveTender(id);
      setSaved(true);
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 2000);
    }
    setSaving(false);
  }

  const passCount = eligibility?.criteria.filter((c) => c.status === 'pass').length ?? 0;
  const failCount = eligibility?.criteria.filter((c) => c.status === 'fail').length ?? 0;
  const missingDocs = eligibility?.criteria.filter((c) => c.status === 'fail') ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Dashboard
        </Link>
        <span>›</span>
        <span className="text-slate-700 truncate max-w-sm">
          {loading ? '...' : tender?.title}
        </span>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-7 space-y-4">
            <SkeletonBlock className="h-6 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <SkeletonBlock className="h-14" />
              <SkeletonBlock className="h-14" />
              <SkeletonBlock className="h-14" />
            </div>
          </div>
        </div>
      ) : tender && eligibility ? (
        <div className="space-y-6">
          {/* Hero header card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{tender.id}</span>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">{tender.category}</span>
                  {details?.emd.exempted && (
                    <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">EMD Exempt</span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight mb-2">{tender.title}</h1>
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                  {tender.department}
                </p>
              </div>

              {/* Match score dial */}
              <div className="flex-shrink-0 text-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="38"
                      fill="none"
                      stroke={tender.match_score >= 80 ? '#16a34a' : tender.match_score >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 38}`}
                      strokeDashoffset={`${2 * Math.PI * 38 * (1 - tender.match_score / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-900">{tender.match_score}%</span>
                  </div>
                </div>
                <p className={`text-xs font-semibold mt-1 ${getMatchScoreMeta(tender.match_score).color}`}>
                  {getMatchScoreMeta(tender.match_score).label}
                </p>
              </div>
            </div>

            {/* Tender stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Tender Value</p>
                <p className="text-base font-bold text-slate-900">{tender.value ?? 'Not disclosed'}</p>
              </div>
              <div className={`rounded-xl p-4 border ${getDeadlineLabel(tender.deadline).color} border-current/20`}>
                <p className="text-xs opacity-70 mb-1">Submission Deadline</p>
                <p className="text-base font-bold">{formatDate(tender.deadline)}</p>
                <p className="text-xs mt-0.5 opacity-70">{getDeadlineLabel(tender.deadline).label}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-xs text-blue-600 mb-1">Days Remaining</p>
                <p className="text-base font-bold text-blue-700">{getDaysUntilDeadline(tender.deadline)} days</p>
              </div>
            </div>

            {/* Match reason */}
            <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-start gap-3">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-blue-800 mb-0.5">Why you match</p>
                <p className="text-sm text-blue-700">{tender.match_reason}</p>
              </div>
            </div>
          </div>

          {/* EMD / Earnest Money Deposit */}
          {details?.emd && (
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 8.465 12.219 7 13.09c-1.172.879-1.172 2.303 0 3.182.543.406 1.17.61 1.795.61" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">Earnest Money Deposit (EMD)</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">EMD Amount</p>
                  <p className="text-lg font-bold text-slate-900">{details.emd.amount}</p>
                </div>
                <div className={`rounded-xl p-4 border ${details.emd.exempted ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-xs text-slate-500 mb-1">Your Status</p>
                  <p className={`text-base font-bold ${details.emd.exempted ? 'text-green-700' : 'text-red-700'}`}>
                    {details.emd.exempted ? `Exempt — saves ${details.emd.savings}` : 'Payment Required'}
                  </p>
                </div>
              </div>
              {details.emd.exemption_reason && (
                <p className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {details.emd.exemption_reason}
                </p>
              )}
            </div>
          )}

          {/* Important Dates */}
          {details?.important_dates && (
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">Important Dates</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Published On', value: details.important_dates.published },
                  { label: 'Bid Submission', value: details.important_dates.bid_submission, highlight: true },
                  details.important_dates.technical_bid_opening && { label: 'Technical Bid Opening', value: details.important_dates.technical_bid_opening },
                  details.important_dates.financial_bid_opening && { label: 'Financial Bid Opening', value: details.important_dates.financial_bid_opening },
                ].filter(Boolean).map((item, i) => {
                  const entry = item as { label: string; value: string; highlight?: boolean };
                  return (
                    <div key={i} className={`rounded-xl p-4 border ${entry.highlight ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-xs text-slate-500 mb-1">{entry.label}</p>
                      <p className={`text-sm font-semibold ${entry.highlight ? 'text-amber-800' : 'text-slate-800'}`}>
                        {formatDate(entry.value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scope of Work */}
          {details?.scope_of_work && (
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">Scope of Work</h2>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{details.scope_of_work}</p>
            </div>
          )}

          {/* Geographic Eligibility + Work Experience */}
          {details && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Geographic Eligibility</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{details.geographic_eligibility}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Work Experience Required</h3>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-base font-bold text-slate-900">{details.work_experience.minimum_value}+</span>
                  <span className="text-xs text-slate-500">minimum total value</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{details.work_experience.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">
                    Min {details.work_experience.minimum_projects} project{details.work_experience.minimum_projects !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Eligibility Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900">Eligibility Matrix</h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-green-700 font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  {passCount} Pass
                </span>
                <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  {failCount} Fail
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Score: <strong className="text-slate-700">{eligibility.score}/{eligibility.total}</strong> criteria met
            </p>

            {/* Score bar */}
            <div className="mb-6">
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                {eligibility.criteria.map((c, i) => (
                  <div
                    key={i}
                    className={`flex-1 ${
                      c.status === 'pass' ? 'bg-green-500' : c.status === 'partial' ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0</span>
                <span>{eligibility.total}</span>
              </div>
            </div>

            {/* Criteria grid */}
            <div className="grid gap-3">
              {eligibility.criteria.map((criterion, i) => (
                <EligibilityRow key={i} criterion={criterion} />
              ))}
            </div>
          </div>

          {/* Missing documents */}
          {missingDocs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">Missing Documents</h2>
              </div>
              <div className="space-y-3">
                {missingDocs.map((doc, i) => (
                  <div key={i} className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-800">{doc.name}</p>
                      <p className="text-xs text-red-600 mt-0.5">{doc.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Upload these documents in your Profile to improve your match score for this tender.
              </div>
            </div>
          )}

          {/* Risk flags */}
          {eligibility.risk_flags.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">Risk Flags</h2>
              </div>
              <div className="space-y-2.5">
                {eligibility.risk_flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <span className="text-red-500 flex-shrink-0 text-sm mt-0.5">⚠</span>
                    <p className="text-sm text-slate-700">{flag}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Conditions */}
          {details?.special_conditions && details.special_conditions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125V18.75m-7.5-10.5v10.5" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">Special Conditions</h2>
              </div>
              <ul className="space-y-2.5">
                {details.special_conditions.map((condition, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {condition}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Original Tender Documents */}
          {details?.source_documents && details.source_documents.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Original Tender Documents</h2>
                  <p className="text-xs text-slate-500">Source documents from the GeM portal — review before submitting</p>
                </div>
              </div>
              <div className="grid gap-3">
                {details.source_documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-blue-200">
                      <DocTypeIcon type={doc.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{doc.label}</p>
                      {doc.file_size && (
                        <p className="text-xs text-slate-400 mt-0.5">{doc.file_size}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => alert('Mock: In production, this will open the document from the GeM portal.')}
                        className="text-xs text-blue-600 font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('Mock: In production, this will download the document from GeM.')}
                        className="text-xs text-slate-600 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Documents are sourced from the official GeM portal. GeM Tender Copilot does not host or modify these files.
              </p>
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-7 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <h2 className="text-base font-bold">Copilot Recommendation</h2>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">{eligibility.recommendation}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/draft/${id}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Generate Draft Bid
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-3.5 rounded-xl font-semibold border text-sm flex items-center justify-center gap-2 transition-all ${
                saved
                  ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                  : 'border-slate-300 text-slate-700 bg-white hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              {saving ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : saved ? (
                <>
                  <svg className="w-4 h-4 fill-blue-600" viewBox="0 0 24 24">
                    <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                  {saveFeedback ? 'Saved!' : 'Saved'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                  Save Tender
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm flex items-center justify-center gap-2 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
