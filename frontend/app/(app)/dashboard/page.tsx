'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getTenders, getProfile, saveTender, unsaveTender, isTenderSaved, MOCK_PROFILE_ID } from '@/lib/mockApi';
import { formatDate, getDaysUntilDeadline, getMatchScoreMeta, getDeadlineLabel } from '@/lib/utils';
import type { Tender, Profile, DashboardTab } from '@/types';

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'suggested', label: 'Suggested' },
  { id: 'saved', label: 'Saved' },
  { id: 'analyzed', label: 'Analyzed' },
  { id: 'draft_ready', label: 'Draft Ready' },
];

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="h-6 w-14 bg-slate-200 rounded-full" />
      </div>
      <div className="h-3 bg-slate-200 rounded w-1/3 mb-3" />
      <div className="h-3 bg-slate-200 rounded w-full mb-2" />
      <div className="h-3 bg-slate-200 rounded w-4/5 mb-4" />
      <div className="flex gap-3 pt-3 border-t border-slate-100">
        <div className="h-3 bg-slate-200 rounded w-20" />
        <div className="h-3 bg-slate-200 rounded w-24" />
        <div className="h-3 bg-slate-200 rounded w-16" />
      </div>
    </div>
  );
}

function TenderCard({
  tender,
  onSaveToggle,
}: {
  tender: Tender;
  onSaveToggle: (id: string) => void;
}) {
  const scoreMeta = getMatchScoreMeta(tender.match_score);
  const deadlineMeta = getDeadlineLabel(tender.deadline);
  const days = getDaysUntilDeadline(tender.deadline);
  const saved = isTenderSaved(tender.id);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
            {tender.title}
          </h3>
        </div>
        <div className={`flex-shrink-0 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${scoreMeta.color} ${scoreMeta.bg} ${scoreMeta.border}`}>
          <span>{tender.match_score}%</span>
        </div>
      </div>

      {/* Department */}
      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
        {tender.department}
      </p>

      {/* Match reason */}
      <p className="text-xs text-slate-600 mb-4 bg-slate-50 rounded-lg px-3 py-2 border-l-2 border-blue-300 leading-relaxed">
        {tender.match_reason}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pb-4 border-b border-slate-100">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-slate-700">{tender.value}</span>
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
          </svg>
          {formatDate(tender.deadline)}
        </span>
        <span className={`px-2 py-0.5 rounded-full font-medium ${deadlineMeta.color}`}>
          {days <= 7 ? '⚡ ' : ''}{deadlineMeta.label}
        </span>
        <span className="ml-auto text-slate-400">{tender.category}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4">
        <Link
          href={`/tender/${tender.id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors text-center"
        >
          Analyze Tender
        </Link>
        <button
          onClick={() => onSaveToggle(tender.id)}
          className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
            saved
              ? 'border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100'
              : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
          }`}
          title={saved ? 'Remove from saved' : 'Save tender'}
        >
          {saved ? (
            <svg className="w-4 h-4 fill-blue-600" viewBox="0 0 24 24">
              <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('suggested');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([getTenders(MOCK_PROFILE_ID), getProfile()]).then(([tendersData, profileData]) => {
      setTenders(tendersData.tenders);
      setProfile(profileData.profile);
      setLoading(false);
    });
  }, []);

  function handleSaveToggle(id: string) {
    if (isTenderSaved(id)) {
      unsaveTender(id);
      setSavedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    } else {
      saveTender(id);
      setSavedIds((prev) => new Set([...prev, id]));
    }
  }

  const filteredTenders = useMemo(() => {
    let list = [...tenders];

    if (activeTab === 'saved') {
      list = list.filter((t) => savedIds.has(t.id));
    } else if (activeTab === 'analyzed') {
      list = list.slice(0, 2);
    } else if (activeTab === 'draft_ready') {
      list = list.slice(0, 1);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (filterCategory) {
      list = list.filter((t) => t.category === filterCategory);
    }

    return list;
  }, [tenders, activeTab, searchQuery, filterCategory, savedIds]);

  const highMatchCount = tenders.filter((t) => t.match_score >= 80).length;
  const blockedCount = 1; // mock: tenders blocked by missing docs
  const urgentCount = tenders.filter((t) => getDaysUntilDeadline(t.deadline) <= 21).length;

  const profileCompleteness = 72; // mock completeness

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* LEFT: Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {profile ? `Welcome, ${profile.company_name.split(' ')[0]}` : 'Dashboard'}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {tenders.length} matching tenders found for your profile
              </p>
            </div>
            <Link
              href="/onboarding"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Update Profile
            </Link>
          </div>

          {/* Quick insights */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">High Match</span>
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{loading ? '—' : highMatchCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">Tenders ≥80% match</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Blocked</span>
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{loading ? '—' : blockedCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">Missing docs</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Due Soon</span>
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{loading ? '—' : urgentCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">Deadline within 21 days</p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search tenders by title, department, category…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-600 min-w-36"
            >
              <option value="">All Categories</option>
              <option value="IT Services">IT Services</option>
              <option value="Software Development">Software Development</option>
              <option value="Consulting">Consulting</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
                {tab.id === 'suggested' && !loading && (
                  <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                    {tenders.length}
                  </span>
                )}
                {tab.id === 'saved' && savedIds.size > 0 && (
                  <span className="ml-1.5 bg-slate-100 text-slate-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                    {savedIds.size}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tender cards */}
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredTenders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">No tenders found</h3>
              <p className="text-sm text-slate-500">
                {activeTab === 'saved'
                  ? 'Save tenders from the Suggested tab to track them here.'
                  : 'Try adjusting your search or filters.'}
              </p>
              {activeTab === 'saved' && (
                <button
                  onClick={() => setActiveTab('suggested')}
                  className="mt-4 text-sm text-blue-600 font-medium hover:text-blue-700"
                >
                  View suggested tenders →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTenders.map((tender) => (
                <TenderCard
                  key={tender.id}
                  tender={tender}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-5">
          {/* Company card */}
          {profile && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-base">
                    {profile.company_name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{profile.company_name}</h3>
                  <p className="text-xs text-slate-500">{profile.category}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">GST</span>
                  <span className="text-slate-700 font-mono">{profile.gst_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Udyam</span>
                  <span className="text-slate-700 font-mono text-xs truncate ml-2">{profile.udyam_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Turnover</span>
                  <span className="text-slate-700 font-semibold">₹{(profile.turnover / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Experience</span>
                  <span className="text-slate-700">{profile.years_in_operation} years</span>
                </div>
              </div>
              {profile.certifications.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.certifications.map((c) => (
                      <span key={c} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Link
                href="/profile"
                className="mt-4 block w-full text-center text-xs text-blue-600 font-medium border border-blue-200 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                View Full Profile
              </Link>
            </div>
          )}

          {/* Profile completeness */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Profile Completeness</h3>
              <span className="text-sm font-bold text-blue-700">{profileCompleteness}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> GST &amp; Udyam uploaded
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Turnover &amp; experience set
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">○</span> <span className="text-slate-400">Bank solvency certificate missing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">○</span> <span className="text-slate-400">Work completion certificates needed</span>
              </div>
            </div>
            <Link
              href="/onboarding"
              className="mt-4 block text-center text-xs text-blue-600 font-medium bg-blue-50 border border-blue-100 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Complete Profile →
            </Link>
          </div>

          {/* Tip */}
          <div className="bg-blue-700 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              <span className="text-xs font-semibold text-blue-100 uppercase tracking-wide">Pro Tip</span>
            </div>
            <p className="text-xs text-blue-200 leading-relaxed">
              Upload your bank solvency certificate to unlock 2 additional tenders you currently qualify for.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
