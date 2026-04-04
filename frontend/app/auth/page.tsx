'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signupUser, loginUser, uploadProfile } from '@/lib/mockApi';
import { DocumentUploadRow } from '@/components/DocumentUploadRow';
import type { DocumentState } from '@/components/DocumentUploadRow';
import { PROFILE_DOCUMENT_DEFINITIONS, getOnboardingCompletenessPreview } from '@/lib/profileContract';
import type { ProfileDocumentKey, ProfileUploadPayload } from '@/types';

const CERTIFICATION_OPTIONS = [
  'ISO 9001', 'ISO 27001', 'ISO 14001', 'CMMI Level 3', 'CMMI Level 5',
  'STQC Certified', 'NASSCOM Member', 'CII Member',
];

const CATEGORY_OPTIONS = [
  'IT Services',
  'Software Development',
  'Consulting',
  'Consulting / Engineering Design',
  'Architecture / BIM Services',
  'Civil / Infrastructure Engineering',
  'Digital Marketing',
  'Cloud Services',
  'Cybersecurity',
  'Hardware Supply',
  'Manpower / Staffing Services',
  'Training & Education',
  'Other',
];

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Signup fields
  const docFilesRef = useRef<Partial<Record<ProfileDocumentKey, File | null>>>({});
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    company_name: '',
    category: '',
    turnover: '',
    years_in_operation: '',
    certifications: [] as string[],
    docs: {} as Partial<Record<ProfileDocumentKey, DocumentState>>,
  });

  const completeness = getOnboardingCompletenessPreview(signupData);

  function handleCertToggle(cert: string) {
    setSignupData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  }

  function handleFileSelected(key: string, file: File) {
    docFilesRef.current[key as ProfileDocumentKey] = file;
    setSignupData((prev) => ({
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = await loginUser(loginData.email, loginData.password);
      if (data.profile_id) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setSubmitting(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await signupUser(signupData.email, signupData.password);

      const payload: ProfileUploadPayload = {
        company_name: signupData.company_name,
        category: signupData.category,
        turnover: Number(signupData.turnover) || 0,
        years_in_operation: Number(signupData.years_in_operation) || 0,
        certifications: signupData.certifications,
        documents: docFilesRef.current,
      };

      await uploadProfile(payload);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      setSubmitting(false);
    }
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
          <div className="text-sm text-slate-500">{mode === 'login' ? 'Sign In' : 'Create Account'}</div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Mode toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* ── LOGIN ── */}
        {mode === 'login' && (
          <div className="max-w-md mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
              <p className="text-slate-500 text-sm">Sign in to your GeM Tender Copilot account</p>
            </div>

            <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Create one free
                </button>
              </p>
            </form>
          </div>
        )}

        {/* ── SIGNUP ── */}
        {mode === 'signup' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
                <p className="text-slate-500 text-sm">Set up your account and company profile to start finding matching tenders.</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-8">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Account credentials */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h2 className="font-semibold text-slate-800 text-base mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                    Account Credentials
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={signupData.email}
                        onChange={(e) => setSignupData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="you@company.com"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={signupData.password}
                        onChange={(e) => setSignupData((p) => ({ ...p, password: e.target.value }))}
                        placeholder="At least 8 characters"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Company details */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h2 className="font-semibold text-slate-800 text-base mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
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
                        value={signupData.company_name}
                        onChange={(e) => setSignupData((p) => ({ ...p, company_name: e.target.value }))}
                        placeholder="e.g. Test BIM Design Consultants Pvt Ltd"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Business Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={signupData.category}
                        onChange={(e) => setSignupData((p) => ({ ...p, category: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
                      >
                        <option value="">Select category</option>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Annual Turnover (Rs) <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={signupData.turnover}
                          onChange={(e) => setSignupData((p) => ({ ...p, turnover: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
                        >
                          <option value="">Select range</option>
                          <option value="500000">Under Rs 10 Lakh</option>
                          <option value="2000000">Rs 10L - Rs 50L</option>
                          <option value="7500000">Rs 50L - Rs 1 Crore</option>
                          <option value="25000000">Rs 1 Cr - Rs 5 Crore</option>
                          <option value="60000000">Above Rs 5 Crore</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Years in Operation <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={signupData.years_in_operation}
                          onChange={(e) => setSignupData((p) => ({ ...p, years_in_operation: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
                        >
                          <option value="">Select</option>
                          <option value="1">Less than 1 year</option>
                          <option value="2">1-2 years</option>
                          <option value="3">3-4 years</option>
                          <option value="5">5-7 years</option>
                          <option value="8">8+ years</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h2 className="font-semibold text-slate-800 text-base mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                    Certifications
                  </h2>
                  <p className="text-xs text-slate-500 mb-4 ml-8">Select all certifications your company currently holds</p>
                  <div className="flex flex-wrap gap-2">
                    {CERTIFICATION_OPTIONS.map((cert) => {
                      const selected = signupData.certifications.includes(cert);
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
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
                    Documents
                  </h2>
                  <p className="text-xs text-slate-500 mb-4 ml-8">Upload your documents once. The same saved state will appear on Profile.</p>
                  <div className="space-y-3">
                    {PROFILE_DOCUMENT_DEFINITIONS.map((doc) => (
                      <DocumentUploadRow
                        key={doc.key}
                        docKey={doc.key}
                        label={doc.label}
                        required={doc.required}
                        state={signupData.docs[doc.key] ?? { status: 'missing' }}
                        onFileSelected={handleFileSelected}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      !signupData.email ||
                      !signupData.password ||
                      !signupData.company_name ||
                      !signupData.category ||
                      !signupData.turnover ||
                      !signupData.years_in_operation
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating your account...
                      </>
                    ) : (
                      <>
                        Create Account & View Tenders
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-sm text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </div>

            {/* Completeness sidebar */}
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm sticky top-24">
                <h3 className="font-semibold text-slate-800 text-sm mb-4">Profile Completeness</h3>
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
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
                    { label: 'Company name', done: !!signupData.company_name },
                    { label: 'Business category', done: !!signupData.category },
                    { label: 'Turnover', done: !!signupData.turnover },
                    { label: 'Years in operation', done: !!signupData.years_in_operation },
                    { label: 'Certifications', done: signupData.certifications.length > 0 },
                    { label: 'Udyam uploaded', done: signupData.docs.udyam?.status === 'uploaded' },
                    { label: 'GST uploaded', done: signupData.docs.gst?.status === 'uploaded' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'bg-slate-200'}`}>
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
                {completeness === 100 ? (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700 font-medium text-center">
                    Profile complete! Ready to match tenders.
                  </div>
                ) : (
                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-600 text-center">
                    Fill all required fields for best matches.
                  </div>
                )}
              </div>

              <div className="bg-slate-800 rounded-xl p-5 text-white">
                <h3 className="font-semibold text-sm mb-3">Why complete your profile?</h3>
                <ul className="space-y-2">
                  {[
                    'More accurate tender matching',
                    'Pre-filled proposal sections',
                    'Precise eligibility scoring',
                    'Consistent document checklist',
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
        )}
      </div>
    </div>
  );
}
