export interface Profile {
  company_name: string;
  udyam_number: string;
  gst_number: string;
  category: string;
  turnover: number;
  years_in_operation: number;
  certifications: string[];
  past_projects?: ProfileProject[];
}

export interface ProfileResponse {
  profile_id: string;
  profile: Profile;
}

export interface Tender {
  id: string;
  title: string;
  department: string;
  value: string | null;
  deadline: string;
  category: string;
  match_score: number;
  match_reason: string;
}

export interface TendersResponse {
  tenders: Tender[];
}

// Contract: POST /api/eligibility — status is "pass" | "fail" | "partial"
export type EligibilityStatus = 'pass' | 'fail' | 'partial';

export interface EligibilityCriterion {
  name: string;
  status: EligibilityStatus;
  detail: string;
}

export interface Eligibility {
  score: number;
  total: number;
  criteria: EligibilityCriterion[];
  risk_flags: string[];
  recommendation: string;
}

// Contract: POST /api/bid checklist status is "ready" | "missing" only
export type ChecklistStatus = 'ready' | 'missing';

export interface ChecklistItem {
  document: string;
  status: ChecklistStatus;
  note: string;
}

export interface TeamMember {
  name: string;
  role: string;
  experience: string;
  certifications: string[];
  // Optional fields for tender-specific proposed team members (set in draft builder)
  summary?: string;
  expertise?: string;
  similar_experience?: string;
  availability?: string;
  has_cv?: boolean;
}

export interface PastProject {
  title: string;
  client: string;
  year: string;
  value: string;
  description: string;
}

// Company-level past project stored in Profile — richer than PastProject (which is bid-level display)
export interface ProfileProject {
  id: string;
  title: string;
  client: string;
  industry: string;
  duration: string;         // e.g. "Jan 2023 – Oct 2023" or "2023"
  value?: string;
  scope_of_work: string;
  technologies: string;
  outcome: string;
  client_reference?: string;
  has_completion_certificate: boolean;
}

export interface ScopeMappingRow {
  requirement: string;
  our_response: string;
  status: 'compliant' | 'partial' | 'clarification_needed';
}

export interface TimelineRow {
  phase: string;
  deliverable: string;
  timeline: string;
}

export interface ComplianceMatrixRow {
  requirement: string;
  our_response: string;
  notes: string;
}

export interface Bid {
  company_overview: string;
  methodology: string;
  // Structured sections:
  team_members?: TeamMember[];
  past_projects?: PastProject[];
  scope_mapping?: ScopeMappingRow[];
  timeline?: TimelineRow[];
  compliance_matrix?: ComplianceMatrixRow[];
  // Prose sections:
  cover_letter?: string;
  executive_summary?: string;
  scope_understanding?: string;
  deliverables?: string;
  assumptions_exclusions?: string;
  declaration_notes?: string;
  // Backward compat fallbacks:
  past_experience: string;
  team_credentials: string;
  checklist: ChecklistItem[];
}

export type DashboardTab = 'suggested' | 'saved' | 'analyzed' | 'draft_ready';

// ─── Tender Detail (client-side extended data, no dedicated backend endpoint yet) ─
export interface TenderEMD {
  amount: string;
  exempted: boolean;
  exemption_reason?: string;
  savings?: string;
}

export interface TenderDates {
  published: string;
  bid_submission: string;
  technical_bid_opening?: string;
  financial_bid_opening?: string;
}

export interface TenderWorkExperience {
  minimum_value: string;
  minimum_projects: number;
  description: string;
}

export interface TenderSourceDocument {
  type: 'tender_pdf' | 'attachment' | 'boq' | 'rfp' | 'corrigendum';
  label: string;
  file_size?: string;
}

export interface TenderDetails {
  id: string;
  scope_of_work: string;
  emd: TenderEMD;
  important_dates: TenderDates;
  geographic_eligibility: string;
  work_experience: TenderWorkExperience;
  source_documents: TenderSourceDocument[];
  special_conditions: string[];
}

// Payload for POST /api/profile (multipart/form-data)
export interface ProfileUploadPayload {
  company_name: string;
  category: string;
  turnover: number;
  years_in_operation: number;
  certifications?: string[];
  udyam?: File | null;
  gst?: File | null;
}

// Local form state for the onboarding page (superset of ProfileUploadPayload)
export interface OnboardingFormData {
  company_name: string;
  category: string;           // maps to contract field "category"
  turnover: string;           // stored as string in form, converted to number on submit
  years_in_operation: string; // stored as string in form, converted to number on submit
  certifications: string[];   // frontend-only; returned by backend in profile response
  // Contract upload fields:
  udyam: boolean;
  gst: boolean;
  // Frontend-only optional UX fields (not part of backend contract):
  pan: boolean;
  itr: boolean;
  iso: boolean;
  experience: boolean;
}
