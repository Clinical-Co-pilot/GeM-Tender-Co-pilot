/**
 * Mock API layer — mirrors the real backend contract at http://localhost:3001
 *
 * Endpoint mapping:
 *   uploadProfile()               → POST  /api/profile
 *   getTenders(profileId)         → GET   /api/tenders/:profile_id
 *   getTenderById(id)             → client-side lookup (no dedicated endpoint)
 *   checkEligibility(pid, tid)    → POST  /api/eligibility
 *   generateBid(pid, tid)         → POST  /api/bid
 *
 * Swap these implementations for real fetch() calls when the backend is ready.
 */

import {
  MOCK_PROFILE_RESPONSE,
  MOCK_TENDERS,
  MOCK_ELIGIBILITY,
  MOCK_BID,
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

// Simulate network latency
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Saved tenders stored in memory (simulates session state)
const savedTenderIds = new Set<string>();

// ─── Client-side profile getter (no GET /api/profile in contract) ────────────
// Returns the stored profile from session. Replace with local state or
// a session endpoint when the backend is ready.
export async function getProfile(): Promise<ProfileResponse> {
  await delay(600);
  return MOCK_PROFILE_RESPONSE as ProfileResponse;
}

// ─── POST /api/profile ────────────────────────────────────────────────────────
// In production: build a FormData and POST to /api/profile
export async function uploadProfile(
  _payload: ProfileUploadPayload
): Promise<ProfileResponse> {
  await delay(1200);
  return MOCK_PROFILE_RESPONSE as ProfileResponse;
}

// ─── GET /api/tenders/:profile_id ────────────────────────────────────────────
export async function getTenders(
  _profileId: string
): Promise<TendersResponse> {
  await delay(800);
  return MOCK_TENDERS as TendersResponse;
}

// Client-side lookup — no dedicated backend endpoint
export async function getTenderById(id: string): Promise<Tender | null> {
  await delay(500);
  const tender = MOCK_TENDERS.tenders.find((t) => t.id === id);
  return tender ?? null;
}

// Client-side extended detail lookup — no dedicated backend endpoint yet
// Wire to GET /api/tenders/:id when available
export async function getTenderDetails(id: string): Promise<TenderDetails | null> {
  await delay(400);
  const details = MOCK_TENDER_DETAILS[id as keyof typeof MOCK_TENDER_DETAILS];
  return (details as TenderDetails) ?? null;
}

// ─── POST /api/eligibility  { profile_id, tender_id } ────────────────────────
export async function checkEligibility(
  _profileId: string,
  _tenderId: string
): Promise<Eligibility> {
  await delay(900);
  return MOCK_ELIGIBILITY as Eligibility;
}

// ─── POST /api/bid  { profile_id, tender_id } ────────────────────────────────
export async function generateBid(
  _profileId: string,
  _tenderId: string
): Promise<Bid> {
  await delay(700);
  return MOCK_BID as Bid;
}

// ─── Client-side save/unsave (no backend endpoint in contract) ────────────────
export async function saveTender(id: string): Promise<{ success: boolean }> {
  await delay(300);
  savedTenderIds.add(id);
  return { success: true };
}

export async function unsaveTender(id: string): Promise<{ success: boolean }> {
  await delay(300);
  savedTenderIds.delete(id);
  return { success: true };
}

export async function getSavedTenders(): Promise<TendersResponse> {
  await delay(600);
  const tenders = MOCK_TENDERS.tenders.filter((t) => savedTenderIds.has(t.id));
  return { tenders };
}

export function isTenderSaved(id: string): boolean {
  return savedTenderIds.has(id);
}

// Expose the mock profile_id so pages can pass it to contract-aligned calls
export const MOCK_PROFILE_ID = MOCK_PROFILE_RESPONSE.profile_id;
