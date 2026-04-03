/**
 * API layer — wired to the real backend at http://localhost:3001
 *
 * Endpoint mapping:
 *   uploadProfile()               → POST  /api/profile
 *   getProfile()                  → GET   /api/profile/:profile_id
 *   getTenders(profileId)         → GET   /api/tenders/:profile_id
 *   getTenderById(id)             → GET   /api/tenders/detail/:id
 *   getTenderDetails(id)          → client-side lookup (extended mock data)
 *   checkEligibility(pid, tid)    → POST  /api/eligibility
 *   generateBid(pid, tid)         → POST  /api/bid
 */

import {
  MOCK_TENDER_DETAILS,
} from '@/lib/mockData';
import type {
  Profile,
  ProfileResponse,
  ProfileUploadPayload,
  TendersResponse,
  Tender,
  TenderDetails,
  Eligibility,
  Bid,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PROFILE_ID_KEY = 'gem_profile_id';
const COMPANY_NAME_KEY = 'gem_company_name';
const DRAFTS_KEY = 'gem_drafts';

export function getProfileId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(PROFILE_ID_KEY) || '';
}

function setProfileId(id: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_ID_KEY, id);
  }
}

export function getCompanyName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(COMPANY_NAME_KEY) || '';
}

function setCompanyName(name: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMPANY_NAME_KEY, name);
  }
}

// Keep for backward compat — pages that still import MOCK_PROFILE_ID at module
// level will get an empty string on first load; use getProfileId() in effects.
export const MOCK_PROFILE_ID = '';

// ─── Draft cache (localStorage) ──────────────────────────────────────────────
export interface DraftEntry {
  tenderId: string;
  tenderTitle: string;
  tenderDept: string;
  createdAt: string;
  bid: Bid;
}

export function getDraftsFromStore(): DraftEntry[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]'); }
  catch { return []; }
}

export function getDraftFromStore(tenderId: string): Bid | null {
  return getDraftsFromStore().find((d) => d.tenderId === tenderId)?.bid ?? null;
}

export function saveDraftToStore(
  tenderId: string,
  tenderTitle: string,
  tenderDept: string,
  bid: Bid,
): void {
  if (typeof window === 'undefined') return;
  const rest = getDraftsFromStore().filter((d) => d.tenderId !== tenderId);
  rest.unshift({ tenderId, tenderTitle, tenderDept, createdAt: new Date().toISOString(), bid });
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(rest));
}

// Saved tenders — persisted to localStorage so they survive page reload
const SAVED_TENDERS_KEY = 'gem_saved_tenders';

function loadSavedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(SAVED_TENDERS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function persistSavedIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVED_TENDERS_KEY, JSON.stringify([...ids]));
}

const savedTenderIds: Set<string> = loadSavedIds();

// ─── POST /api/profile ────────────────────────────────────────────────────────
export async function uploadProfile(
  payload: ProfileUploadPayload
): Promise<ProfileResponse> {
  const form = new FormData();
  form.append('company_name', payload.company_name);
  form.append('category', payload.category);
  form.append('turnover', String(payload.turnover));
  form.append('years_in_operation', String(payload.years_in_operation));

  if (payload.certifications?.length) {
    form.append('certifications', JSON.stringify(payload.certifications));
  }
  if (payload.udyam) form.append('udyam', payload.udyam);
  if (payload.gst) form.append('gst', payload.gst);

  const res = await fetch(`${API_BASE}/api/profile`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Profile upload failed: ${res.status}`);
  const data: ProfileResponse = await res.json();
  setProfileId(data.profile_id);
  setCompanyName(payload.company_name);
  return data;
}

// ─── GET /api/profile/:profile_id ────────────────────────────────────────────
export async function getProfile(): Promise<ProfileResponse> {
  const profileId = getProfileId();
  if (!profileId) throw new Error('No profile found. Please complete onboarding.');
  const res = await fetch(`${API_BASE}/api/profile/${profileId}`);
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  return res.json();
}

// ─── PUT /api/profile/:profile_id ────────────────────────────────────────────
export async function updateProfile(updates: Partial<Profile>): Promise<ProfileResponse> {
  const profileId = getProfileId();
  if (!profileId) throw new Error('No profile found. Please complete onboarding.');
  const res = await fetch(`${API_BASE}/api/profile/${profileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Profile update failed: ${res.status}`);
  if (updates.company_name) setCompanyName(updates.company_name);
  return res.json();
}

// ─── GET /api/tenders/:profile_id ────────────────────────────────────────────
export async function getTenders(
  profileId: string
): Promise<TendersResponse> {
  const id = profileId || getProfileId();
  if (!id) return { tenders: [] };
  const res = await fetch(`${API_BASE}/api/tenders/${id}`);
  if (!res.ok) throw new Error(`Tenders fetch failed: ${res.status}`);
  return res.json();
}

// ─── GET /api/tenders/detail?id=... ──────────────────────────────────────────
// Uses query param because tender IDs contain slashes (e.g. GEM/2026/B/7370638)
// which cannot safely be placed in a URL path segment.
export async function getTenderById(id: string): Promise<Tender | null> {
  const res = await fetch(`${API_BASE}/api/tenders/detail?id=${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Tender fetch failed: ${res.status}`);
  return res.json();
}

// Client-side extended detail — no dedicated backend endpoint yet
export async function getTenderDetails(id: string): Promise<TenderDetails | null> {
  const details = MOCK_TENDER_DETAILS[id as keyof typeof MOCK_TENDER_DETAILS];
  return (details as TenderDetails) ?? null;
}

// ─── POST /api/eligibility  { profile_id, tender_id } ────────────────────────
export async function checkEligibility(
  profileId: string,
  tenderId: string
): Promise<Eligibility> {
  const id = profileId || getProfileId();
  const res = await fetch(`${API_BASE}/api/eligibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id: id, tender_id: tenderId }),
  });
  if (!res.ok) throw new Error(`Eligibility check failed: ${res.status}`);
  return res.json();
}

// ─── POST /api/bid  { profile_id, tender_id } ────────────────────────────────
export async function generateBid(
  profileId: string,
  tenderId: string
): Promise<Bid> {
  const id = profileId || getProfileId();
  const res = await fetch(`${API_BASE}/api/bid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id: id, tender_id: tenderId }),
  });
  if (!res.ok) throw new Error(`Bid generation failed: ${res.status}`);
  return res.json();
}

// ─── Client-side save/unsave ──────────────────────────────────────────────────
export async function saveTender(id: string): Promise<{ success: boolean }> {
  savedTenderIds.add(id);
  persistSavedIds(savedTenderIds);
  return { success: true };
}

export async function unsaveTender(id: string): Promise<{ success: boolean }> {
  savedTenderIds.delete(id);
  persistSavedIds(savedTenderIds);
  return { success: true };
}

export async function getSavedTenders(): Promise<TendersResponse> {
  // Saved tenders are not a separate server resource; the dashboard filters by savedTenderIds.
  // Return an empty list here — this function is not used in the live dashboard flow.
  return { tenders: [] };
}

export function isTenderSaved(id: string): boolean {
  return savedTenderIds.has(id);
}

export function getSavedTenderIds(): Set<string> {
  return new Set(savedTenderIds);
}
