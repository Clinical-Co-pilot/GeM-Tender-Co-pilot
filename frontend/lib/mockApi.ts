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
  MOCK_TENDERS,
  MOCK_TENDER_DETAILS,
} from '@/lib/mockData';
import type {
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

export function getProfileId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(PROFILE_ID_KEY) || '';
}

function setProfileId(id: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_ID_KEY, id);
  }
}

// Keep for backward compat — pages that still import MOCK_PROFILE_ID at module
// level will get an empty string on first load; use getProfileId() in effects.
export const MOCK_PROFILE_ID = '';

// Saved tenders stored in memory (simulates session state)
const savedTenderIds = new Set<string>();

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

// ─── GET /api/tenders/:profile_id ────────────────────────────────────────────
export async function getTenders(
  profileId: string
): Promise<TendersResponse> {
  const id = profileId || getProfileId();
  if (!id) return MOCK_TENDERS as TendersResponse;
  const res = await fetch(`${API_BASE}/api/tenders/${id}`);
  if (!res.ok) throw new Error(`Tenders fetch failed: ${res.status}`);
  return res.json();
}

// ─── GET /api/tenders/detail/:id ─────────────────────────────────────────────
export async function getTenderById(id: string): Promise<Tender | null> {
  const res = await fetch(`${API_BASE}/api/tenders/detail/${id}`);
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
  return { success: true };
}

export async function unsaveTender(id: string): Promise<{ success: boolean }> {
  savedTenderIds.delete(id);
  return { success: true };
}

export async function getSavedTenders(): Promise<TendersResponse> {
  const tenders = MOCK_TENDERS.tenders.filter((t) => savedTenderIds.has(t.id));
  return { tenders };
}

export function isTenderSaved(id: string): boolean {
  return savedTenderIds.has(id);
}
