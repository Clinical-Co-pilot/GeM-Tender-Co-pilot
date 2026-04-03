import type {
  Profile,
  ProfileDocument,
  ProfileDocumentDefinition,
  ProfileDocumentKey,
} from '@/types';

export const PROFILE_DOCUMENT_DEFINITIONS: ProfileDocumentDefinition[] = [
  {
    key: 'udyam',
    label: 'Udyam Registration Certificate',
    description: 'MSME registration proof from udyamregistration.gov.in',
    required: true,
  },
  {
    key: 'gst',
    label: 'GST Registration Certificate',
    description: 'GST registration certificate or GSTIN proof',
    required: true,
  },
  {
    key: 'pan',
    label: 'PAN Card (Company)',
    description: 'Self-attested copy of company PAN',
    required: false,
  },
  {
    key: 'itr',
    label: 'Income Tax Returns (Last 3 Years)',
    description: 'ITR filings or CA-backed turnover proof',
    required: false,
  },
  {
    key: 'iso',
    label: 'ISO Certificate',
    description: 'ISO 9001 or other applicable certification proof',
    required: false,
  },
  {
    key: 'experience',
    label: 'Work Experience / Completion Certificates',
    description: 'Past work orders, completion certificates, or portfolio evidence',
    required: false,
  },
];

export function buildMissingDocumentsState() {
  return Object.fromEntries(
    PROFILE_DOCUMENT_DEFINITIONS.map((definition) => [
      definition.key,
      {
        key: definition.key,
        label: definition.label,
        description: definition.description,
        required: definition.required,
        status: 'missing' as const,
      },
    ])
  ) as Record<ProfileDocumentKey, ProfileDocument>;
}

export function getDocumentDisplayDate(uploadedAt?: string): string | undefined {
  if (!uploadedAt) return undefined;
  return new Date(uploadedAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getOnboardingCompletenessPreview(data: {
  company_name: string;
  category: string;
  turnover: string;
  years_in_operation: string;
  certifications: string[];
  docs: Partial<Record<ProfileDocumentKey, { status: 'uploaded' | 'missing' }>>;
}) {
  const checks = [
    Boolean(data.company_name),
    Boolean(data.category),
    Boolean(data.turnover),
    Boolean(data.years_in_operation),
    data.certifications.length > 0,
    data.docs.udyam?.status === 'uploaded',
    data.docs.gst?.status === 'uploaded',
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export function getProfileCompleteness(profile: Profile | null): number {
  return profile?.completeness?.score ?? 0;
}

export function getRegistrationDisplayValue(
  profile: Profile,
  key: 'udyam' | 'gst'
): string {
  const number = key === 'udyam' ? profile.udyam_number : profile.gst_number;
  if (number) return number;
  return profile.documents[key]?.status === 'uploaded' ? 'Uploaded' : 'Not uploaded';
}
