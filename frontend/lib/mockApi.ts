/**
 * API layer wired to the backend at http://localhost:3001.
 */

import type {
  Profile,
  ProfileResponse,
  ProfileDocumentKey,
  ProfileUploadPayload,
  TendersResponse,
  Tender,
  Eligibility,
  Bid,
  DraftResponse,
  DraftListResponse,
  TenderWorkflow,
  TenderWorkflowResponse,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PROFILE_ID_KEY = 'gem_profile_id';
const COMPANY_NAME_KEY = 'gem_company_name';
const USER_ID_KEY = 'gem_user_id';
const USER_EMAIL_KEY = 'gem_user_email';

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

export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(USER_ID_KEY) || '';
}

export function getUserEmail(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(USER_EMAIL_KEY) || '';
}

export function isLoggedIn(): boolean {
  return !!getUserId();
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(PROFILE_ID_KEY);
  localStorage.removeItem(COMPANY_NAME_KEY);
}

export async function signupUser(email: string, password: string): Promise<{ user_id: string; email: string }> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Signup failed');
  }
  const data = await res.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ID_KEY, data.user_id);
    localStorage.setItem(USER_EMAIL_KEY, data.email);
  }
  return data;
}

export async function loginUser(email: string, password: string): Promise<{ user_id: string; email: string; profile_id: string | null }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  const data = await res.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ID_KEY, data.user_id);
    localStorage.setItem(USER_EMAIL_KEY, data.email);
    if (data.profile_id) {
      localStorage.setItem(PROFILE_ID_KEY, data.profile_id);
      // Fetch and cache company name so AppNav shows it immediately
      try {
        const profileRes = await fetch(`${API_BASE}/api/profile/${data.profile_id}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const name = profileData.profile?.company_name;
          if (name) localStorage.setItem(COMPANY_NAME_KEY, name);
        }
      } catch {
        // non-critical — AppNav will show fallback
      }
    }
  }
  return data;
}

export const MOCK_PROFILE_ID = '';

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

  const userId = getUserId();
  if (userId) form.append('user_id', userId);

  for (const [key, file] of Object.entries(payload.documents ?? {})) {
    if (file) form.append(key, file);
  }

  const res = await fetch(`${API_BASE}/api/profile`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error(`Profile upload failed: ${res.status}`);
  const data: ProfileResponse = await res.json();
  setProfileId(data.profile_id);
  setCompanyName(payload.company_name);
  return data;
}

export async function getProfile(): Promise<ProfileResponse> {
  const profileId = getProfileId();
  if (!profileId) throw new Error('No profile found. Please complete onboarding.');
  const res = await fetch(`${API_BASE}/api/profile/${profileId}`);
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  return res.json();
}

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

export async function uploadProfileDocument(
  key: ProfileDocumentKey,
  file: File
): Promise<ProfileResponse> {
  const profileId = getProfileId();
  if (!profileId) throw new Error('No profile found. Please complete onboarding.');

  const form = new FormData();
  form.append('key', key);
  form.append('file', file);

  const res = await fetch(`${API_BASE}/api/profile/${profileId}/documents`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error(`Document upload failed: ${res.status}`);
  return res.json();
}

export async function getAllTenders(): Promise<TendersResponse> {
  const profileId = getProfileId();
  const query = profileId ? `?profile_id=${profileId}` : '';
  const res = await fetch(`${API_BASE}/api/tenders/all${query}`);
  if (!res.ok) throw new Error(`All tenders fetch failed: ${res.status}`);
  return res.json();
}

export async function getTenders(profileId: string): Promise<TendersResponse> {
  const id = profileId || getProfileId();
  if (!id) return { tenders: [] };
  const res = await fetch(`${API_BASE}/api/tenders/${id}`);
  if (!res.ok) throw new Error(`Tenders fetch failed: ${res.status}`);
  return res.json();
}

export async function getTenderById(id: string): Promise<Tender | null> {
  const profileId = getProfileId();
  const query = new URLSearchParams({ id });
  if (profileId) query.set('profile_id', profileId);

  const res = await fetch(`${API_BASE}/api/tenders/detail?${query.toString()}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Tender fetch failed: ${res.status}`);
  return res.json();
}

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

export async function getTenderWorkflow(): Promise<TenderWorkflow[]> {
  const profileId = getProfileId();
  if (!profileId) return [];
  const res = await fetch(`${API_BASE}/api/workflow/${profileId}`);
  if (!res.ok) throw new Error(`Workflow fetch failed: ${res.status}`);
  const data: TenderWorkflowResponse = await res.json();
  return data.items;
}

export async function updateTenderWorkflow(
  tenderId: string,
  updates: Partial<{
    saved: boolean;
    analyzed: boolean;
    draft_generated: boolean;
    ready: boolean;
  }>
): Promise<TenderWorkflow> {
  const profileId = getProfileId();
  if (!profileId) throw new Error('No profile found. Please complete onboarding.');

  const res = await fetch(`${API_BASE}/api/workflow/${profileId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tender_id: tenderId, ...updates }),
  });

  if (!res.ok) throw new Error(`Workflow update failed: ${res.status}`);
  const data: { item: TenderWorkflow } = await res.json();
  return data.item;
}

export async function saveTender(id: string): Promise<{ success: boolean }> {
  await updateTenderWorkflow(id, { saved: true });
  return { success: true };
}

export async function unsaveTender(id: string): Promise<{ success: boolean }> {
  await updateTenderWorkflow(id, { saved: false });
  return { success: true };
}

export async function getDraft(tenderId: string): Promise<DraftResponse> {
  const profileId = getProfileId();
  if (!profileId) throw new Error('No profile found. Please complete onboarding.');
  const query = new URLSearchParams({ tender_id: tenderId });
  const res = await fetch(`${API_BASE}/api/drafts/${profileId}?${query.toString()}`);
  if (!res.ok) throw new Error(`Draft fetch failed: ${res.status}`);
  return res.json();
}

export async function listDrafts(): Promise<DraftListResponse> {
  const profileId = getProfileId();
  if (!profileId) throw new Error('No profile found. Please complete onboarding.');
  const res = await fetch(`${API_BASE}/api/drafts/${profileId}`);
  if (!res.ok) throw new Error(`Draft list fetch failed: ${res.status}`);
  return res.json();
}

export async function generateDraft(tenderId: string): Promise<DraftResponse> {
  const profileId = getProfileId();
  if (!profileId) throw new Error('No profile found. Please complete onboarding.');

  const res = await fetch(`${API_BASE}/api/drafts/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id: profileId, tender_id: tenderId }),
  });

  if (!res.ok) throw new Error(`Draft generation failed: ${res.status}`);
  return res.json();
}

export async function updateDraft(
  tenderId: string,
  bid: Partial<Bid>
): Promise<DraftResponse> {
  const profileId = getProfileId();
  if (!profileId) throw new Error('No profile found. Please complete onboarding.');

  const res = await fetch(`${API_BASE}/api/drafts/${profileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tender_id: tenderId, bid }),
  });

  if (!res.ok) throw new Error(`Draft update failed: ${res.status}`);
  return res.json();
}

export function getDraftExportUrl(tenderId: string): string {
  const profileId = getProfileId();
  const query = new URLSearchParams({ tender_id: tenderId });
  return `${API_BASE}/api/drafts/${profileId}/export?${query.toString()}`;
}
