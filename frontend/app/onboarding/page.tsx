'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { uploadProfile } from '@/lib/mockApi';
import { DocumentUploadRow } from '@/components/DocumentUploadRow';
import type { DocumentState } from '@/components/DocumentUploadRow';
import type { ProfileUploadPayload } from '@/types';

const CERTIFICATION_OPTIONS = [
  'ISO 9001', 'ISO 27001', 'ISO 14001', 'CMMI Level 3', 'CMMI Level 5',
  'STQC Certified', 'NASSCOM Member', 'CII Member',
];

const CATEGORY_OPTIONS = [
  'IT Services', 'Software Development', 'Consulting', 'Digital Marketing',
  'Cloud Services', 'Cybersecurity', 'Hardware Supply', 'Training & Education',
  'Other',
];

// Contract upload fields: udyam and gst only.
// pan, itr, iso, experience are frontend-only UX fields — not sent to POST /api/profile.
const CONTRACT_DOCS = [
  { key: 'udyam', label: 'Udyam Registration Certificate', desc: 'MSME registration proof from udyamregistration.gov.in', contractField: true },
  { key: 'gst',   label: 'GST Registration Certificate',   desc: 'GST-3B or GST registration certificate',               contractField: true },
];

const FRONTEND_ONLY_DOCS = [
  { key: 'pan',        label: 'PAN Card (Company)',                          desc: 'Self-attested copy of company PAN' },
  { key: 'itr',        label: 'Income Tax Returns (Last 3 Years)',           desc: 'ITR filings for FY 2021-22, 2022-23, 2023-24' },
  { key: 'iso',        label: 'ISO Certificate',                             desc: 'ISO 9001 or other applicable certificates' },
  { key: 'experience', label: 'Work Experience / Completion Certificates',   desc: 'Client certificates for past government or private orders' },
];

const ALL_DOCS = [...CONTRACT_DOCS, ...FRONTEND_ONLY_DOCS];

function getCompleteness(data: {
  company_name: string;
  category: string;
  turnover: string;
  years_in_operation: string;
  certifications: string[];
  docs: Record<string, DocumentState>;
}) {
  const fields = [
    data.company_name,
    data.category,
    data.turnover,
    data.years_in_operation,
  ];
  const filledFields = fields.filter(Boolean).length;
  // Completeness considers only the two contract upload fields
  const contractUploaded = CONTRACT_DOCS.filter((d) => data.docs[d.key]?.status === 'uploaded').length;
  const hasCert = data.certifications.length > 0 ? 1 : 0;
  const total = fields.length + CONTRACT_DOCS.length + 1;
  const filled = filledFields + contractUploaded + hasCert;
  return Math.round((filled / total) * 100);
}

// Tracks the actual File object selected for contract upload fields
const docFiles: Record<string, File | null> = {};

export default function OnboardingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    category: '',           // contract field name
    turnover: '',
    years_in_operation: '',
    certifications: [] as string[],
    docs: {} as Record<string, DocumentState>,
  });

  const completeness = getCompleteness(formData);

  function handleCertToggle(cert: string) {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  }

  function handleFileSelected(key: string, file: File) {
    // Store the actual File for contract fields (udyam, gst) to pass to uploadProfile
    docFiles[key] = file;
    setFormData((prev) => ({
      ...prev,
      docs: {
        ...prev.docs,
        [key]: {
          status: 'uploaded',
          filename: file.name,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        },
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // Build the contract-aligned payload for POST /api/profile
    const payload: ProfileUploadPayload = {
      company_name: formData.company_name,
      category: formData.category,
      turnover: Number(formData.turnover) || 0,
      years_in_operation: Number(formData.years_in_operation) || 0,
      // Real File objects when selected; null if not uploaded yet
      udyam: docFiles['udyam'] ?? null,
      gst: docFiles['gst'] ?? null,
    };
    await uploadProfile(payload);
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900 text-base tracking-tight">GeM Tender Copilot</span>
          </Link>
          <div className="text-sm text-slate-500">Company Setup</div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Set up your company profile</h1>
              <p className="text-slate-500 text-sm">This information helps us match you with the most relevant GeM tenders and pre-fill your proposals.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Company Details */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-slate-800 text-base mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                  Company Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData((p) => ({ ...p, company_name: e.target.value }))}
                      placeholder="e.g. Sharma Tech Solutions Pvt Ltd"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Business Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
                    >
                      <option value="">Select category</option>
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Annual Turnover (₹) <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.turnover}
                        onChange={(e) => setFormData((p) => ({ ...p, turnover: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
                      >
                        <option value="">Select range</option>
                        <option value="500000">Under ₹10 Lakh</option>
                        <option value="2000000">₹10L – ₹50L</option>
                        <option value="7500000">₹50L – ₹1 Crore</option>
                        <option value="25000000">₹1 Cr – ₹5 Crore</option>
                        <option value="60000000">Above ₹5 Crore</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Years in Operation <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.years_in_operation}
                        onChange={(e) => setFormData((p) => ({ ...p, years_in_operation: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
                      >
                        <option value="">Select</option>
                        <option value="1">Less than 1 year</option>
                        <option value="2">1–2 years</option>
                        <option value="3">3–4 years</option>
                        <option value="5">5–7 years</option>
                        <option value="8">8+ years</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-slate-800 text-base mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                  Certifications
                </h2>
                <p className="text-xs text-slate-500 mb-4 ml-8">Select all certifications your company currently holds</p>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATION_OPTIONS.map((cert) => {
                    const selected = formData.certifications.includes(cert);
                    return (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => handleCertToggle(cert)}
                        className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-all ${
                          selected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {selected && <span className="mr-1">✓</span>}
                        {cert}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-slate-800 text-base mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                  Documents
                </h2>
                <p className="text-xs text-slate-500 mb-4 ml-8">Upload your documents — clicking Upload opens the file picker</p>
                <div className="space-y-3">
                  {ALL_DOCS.map((doc) => {
                    const isContractField = CONTRACT_DOCS.some((d) => d.key === doc.key);
                    return (
                      <DocumentUploadRow
                        key={doc.key}
                        docKey={doc.key}
                        label={doc.label}
                        required={isContractField}
                        state={formData.docs[doc.key] ?? { status: 'missing' }}
                        onFileSelected={handleFileSelected}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !formData.company_name || !formData.category || !formData.turnover || !formData.years_in_operation}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Setting up your profile…
                    </>
                  ) : (
                    <>
                      View Matching Tenders
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar: Profile Completeness */}
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm sticky top-24">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Profile Completeness</h3>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke={completeness >= 70 ? '#2563eb' : completeness >= 40 ? '#f59e0b' : '#94a3b8'}
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - completeness / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-800">{completeness}%</span>
                </div>
              </div>
              <div className="space-y-2.5 mt-4">
                {[
                  { label: 'Company name',       done: !!formData.company_name },
                  { label: 'Business category',  done: !!formData.category },
                  { label: 'Turnover',           done: !!formData.turnover },
                  { label: 'Years in operation', done: !!formData.years_in_operation },
                  { label: 'Certifications',     done: formData.certifications.length > 0 },
                  { label: 'Udyam & GST docs',   done: CONTRACT_DOCS.every((d) => formData.docs[d.key]?.status === 'uploaded') },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done ? 'bg-green-500' : 'bg-slate-200'
                    }`}>
                      {item.done && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs ${item.done ? 'text-slate-700' : 'text-slate-400'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
              {completeness === 100 && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700 font-medium text-center">
                  Profile complete! Ready to match tenders.
                </div>
              )}
              {completeness < 100 && (
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-600 text-center">
                  Fill all required fields for best matches
                </div>
              )}
            </div>

            {/* Why this matters */}
            <div className="bg-slate-800 rounded-xl p-5 text-white">
              <h3 className="font-semibold text-sm mb-3">Why complete your profile?</h3>
              <ul className="space-y-2">
                {[
                  'More accurate tender matching',
                  'Pre-filled proposal sections',
                  'Precise eligibility scoring',
                  'Correct document checklist',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-blue-400 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
