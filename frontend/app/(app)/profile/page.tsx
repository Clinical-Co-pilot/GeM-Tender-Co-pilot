'use client';

import { useEffect, useState } from 'react';
import { getProfile, getTenderWorkflow, listDrafts, updateProfile, uploadProfileDocument } from '@/lib/mockApi';
import { DocumentUploadRow } from '@/components/DocumentUploadRow';
import { PROFILE_DOCUMENT_DEFINITIONS, getProfileCompleteness, getRegistrationDisplayValue } from '@/lib/profileContract';
import type { Profile, ProfileDocumentKey, ProfileProject } from '@/types';

const EMPTY_PROJECT_FORM = {
  title: '', client: '', industry: '', duration: '', value: '',
  scope_of_work: '', technologies: '', outcome: '', client_reference: '',
  has_completion_certificate: false,
};

type EditableProfileState = Pick<
  Profile,
  'company_name' | 'category' | 'turnover' | 'years_in_operation' | 'certifications'
>;

function getEditableProfileState(profile: Profile): EditableProfileState {
  return {
    company_name: profile.company_name,
    category: profile.category,
    turnover: profile.turnover,
    years_in_operation: profile.years_in_operation,
    certifications: [...profile.certifications],
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<EditableProfileState | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingDocumentKey, setUploadingDocumentKey] = useState<ProfileDocumentKey | null>(null);
  const [showCertInput, setShowCertInput] = useState(false);
  const [newCertification, setNewCertification] = useState('');
  // Past projects library — local state until backend is connected
  // TODO: persist via POST /api/profile/projects when backend is ready
  const [profileProjects, setProfileProjects] = useState<ProfileProject[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT_FORM);
  const [activityStats, setActivityStats] = useState({
    analyzed: 0,
    drafts: 0,
    saved: 0,
  });

  useEffect(() => {
    let active = true;

    Promise.allSettled([getProfile(), getTenderWorkflow(), listDrafts()])
      .then(([profileResult, workflowResult, draftResult]) => {
        if (!active) return;

        if (profileResult.status === 'fulfilled') {
          setProfile(profileResult.value.profile);
          setEditData(getEditableProfileState(profileResult.value.profile));
          setProfileProjects(profileResult.value.profile.past_projects ?? []);
        } else {
          setSaveError(profileResult.reason instanceof Error ? profileResult.reason.message : 'Unable to load profile');
        }

        const workflowItems = workflowResult.status === 'fulfilled' ? workflowResult.value : [];
        const drafts = draftResult.status === 'fulfilled' ? draftResult.value.drafts : [];

        setActivityStats({
          analyzed: workflowItems.filter((item) => Boolean(item.analyzed_at)).length,
          drafts: drafts.length,
          saved: workflowItems.filter((item) => item.saved).length,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function handleAddProject() {
    if (!projectForm.title.trim() || !projectForm.client.trim()) return;
    const newProject: ProfileProject = {
      id: `pp-${Date.now()}`,
      title: projectForm.title.trim(),
      client: projectForm.client.trim(),
      industry: projectForm.industry.trim(),
      duration: projectForm.duration.trim(),
      value: projectForm.value.trim() || undefined,
      scope_of_work: projectForm.scope_of_work.trim(),
      technologies: projectForm.technologies.trim(),
      outcome: projectForm.outcome.trim(),
      client_reference: projectForm.client_reference.trim() || undefined,
      has_completion_certificate: projectForm.has_completion_certificate,
    };
    setProfileProjects((prev) => [...prev, newProject]);
    setProjectForm(EMPTY_PROJECT_FORM);
    setShowProjectForm(false);
  }

  function handleRemoveProject(id: string) {
    setProfileProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function handleStartEdit() {
    if (!profile) return;
    setSaveError(null);
    setEditData(getEditableProfileState(profile));
    setEditing(true);
  }

  function handleCancelEdit() {
    if (!profile) return;
    setEditData(getEditableProfileState(profile));
    setEditing(false);
    setShowCertInput(false);
    setNewCertification('');
    setSaveError(null);
  }

  async function handleSaveProfile() {
    if (!editData) return;
    setSavingProfile(true);
    setSaveError(null);

    try {
      const res = await updateProfile(editData);
      setProfile(res.profile);
      setEditData(getEditableProfileState(res.profile));
      setEditing(false);
      setShowCertInput(false);
      setNewCertification('');
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Profile save failed');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleFileSelected(key: string, file: File) {
    setSaveError(null);
    setUploadingDocumentKey(key as ProfileDocumentKey);

    try {
      const res = await uploadProfileDocument(key as ProfileDocumentKey, file);
      setProfile(res.profile);
      if (!editing) {
        setEditData(getEditableProfileState(res.profile));
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Document upload failed');
    } finally {
      setUploadingDocumentKey(null);
    }
  }

  function handleAddCertification() {
    const certification = newCertification.trim();
    if (!certification) return;

    setEditData((prev) => {
      if (!prev) return prev;
      if (prev.certifications.some((item) => item.toLowerCase() === certification.toLowerCase())) {
        return prev;
      }

      return {
        ...prev,
        certifications: [...prev.certifications, certification],
      };
    });

    setNewCertification('');
    setShowCertInput(false);
  }

  function handleRemoveCertification(certification: string) {
    setEditData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        certifications: prev.certifications.filter((item) => item !== certification),
      };
    });
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!profile || !editData) return null;

  const uploadedCount = PROFILE_DOCUMENT_DEFINITIONS.filter(
    (doc) => profile.documents[doc.key]?.status === 'uploaded'
  ).length;
  const totalDocs = PROFILE_DOCUMENT_DEFINITIONS.length;
  const profileCompletenessScore = getProfileCompleteness(profile);
  const displayedCertifications = editing ? editData.certifications : profile.certifications;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Company Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your company details and uploaded documents</p>
        </div>
        {profileSaved && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Profile saved
          </div>
        )}
      </div>

      {saveError && (
        <div className="mb-6 border border-red-200 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">
          {saveError}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left column: main details */}
        <div className="lg:col-span-3 space-y-5">
          {/* Company info card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
                Company Details
              </h2>
              {editing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5"
                  >
                    {savingProfile && (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 text-xs text-blue-600 font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
            <div className="p-6">
              {/* Company name banner */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">
                    {profile.company_name.charAt(0)}
                  </span>
                </div>
                <div>
                  {editing ? (
                    <input
                      value={editData.company_name}
                      onChange={(e) => setEditData((p) => (p ? { ...p, company_name: e.target.value } : p))}
                      className="text-lg font-bold text-slate-900 bg-white border border-blue-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                  ) : (
                    <h3 className="text-lg font-bold text-slate-900">{profile.company_name}</h3>
                  )}
                  <p className="text-sm text-blue-700 font-medium">{editing ? editData.category : profile.category}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Registration info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Registration Details</h4>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Udyam</label>
                    <p className="text-sm font-mono text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">{getRegistrationDisplayValue(profile, 'udyam')}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">GST</label>
                    <p className="text-sm font-mono text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">{getRegistrationDisplayValue(profile, 'gst')}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Business Category</label>
                    {editing ? (
                      <input
                        value={editData.category}
                        onChange={(e) => setEditData((p) => (p ? { ...p, category: e.target.value } : p))}
                        className="w-full text-sm bg-white border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">{profile.category}</p>
                    )}
                  </div>
                </div>

                {/* Business metrics */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Business Metrics</h4>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Annual Turnover</label>
                    {editing ? (
                      <input
                        type="number"
                        value={editData.turnover}
                        onChange={(e) => setEditData((p) => (p ? { ...p, turnover: Number(e.target.value) } : p))}
                        className="w-full text-sm bg-white border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                        Rs {(profile.turnover / 100000).toFixed(1)} Lakh
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Years in Operation</label>
                    {editing ? (
                      <input
                        type="number"
                        value={editData.years_in_operation}
                        onChange={(e) => setEditData((p) => (p ? { ...p, years_in_operation: Number(e.target.value) } : p))}
                        className="w-full text-sm bg-white border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                        {profile.years_in_operation} years
                      </p>
                    )}
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-2">Certifications</label>
                    <div className="flex flex-wrap gap-2">
                      {displayedCertifications.map((cert) => (
                        <span key={cert} className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {cert}
                          {editing && (
                            <button type="button" onClick={() => handleRemoveCertification(cert)} className="text-blue-500 hover:text-blue-700">
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          if (!editing) handleStartEdit();
                          setShowCertInput(true);
                        }}
                        className="text-xs text-blue-600 border border-dashed border-blue-300 px-2.5 py-1 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                    {showCertInput && (
                      <div className="mt-3 flex gap-2">
                        <input
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          placeholder="Add certification"
                          className="flex-1 text-sm bg-white border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="button" onClick={handleAddCertification} className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg font-medium">
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCertInput(false);
                            setNewCertification('');
                          }}
                          className="text-xs text-slate-500 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Documents
              </h2>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                {uploadedCount}/{totalDocs} uploaded
              </span>
            </div>
            <div className="p-5 space-y-3">
              {PROFILE_DOCUMENT_DEFINITIONS.map((doc) => (
                <DocumentUploadRow
                  key={doc.key}
                  docKey={doc.key}
                  label={doc.label}
                  required={doc.required}
                  state={{
                    status: profile.documents[doc.key]?.status ?? 'missing',
                    filename: profile.documents[doc.key]?.filename,
                    uploaded_at: profile.documents[doc.key]?.uploaded_at,
                  }}
                  busy={uploadingDocumentKey === doc.key}
                  onFileSelected={handleFileSelected}
                />
              ))}
            </div>
          </div>

          {/* Past Projects Library */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                </svg>
                Past Projects Library
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{profileProjects.length} project{profileProjects.length !== 1 ? 's' : ''}</span>
                {!showProjectForm && (
                  <button
                    onClick={() => setShowProjectForm(true)}
                    className="flex items-center gap-1 text-xs text-blue-600 font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Project
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 space-y-3">
              {profileProjects.length === 0 && !showProjectForm && (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-400 mb-1">No past projects added yet.</p>
                  <p className="text-xs text-slate-400">Add projects here to make them available for selection in the proposal builder.</p>
                </div>
              )}

              {profileProjects.map((project) => (
                <div key={project.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{project.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{project.client} · {project.industry} · {project.duration}</p>
                      {project.value && (
                        <p className="text-xs font-semibold text-green-700 mt-0.5">{project.value}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveProject(project.id)}
                      className="text-xs text-slate-400 hover:text-red-600 px-2 py-1 rounded border border-slate-200 hover:border-red-200 transition-colors flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-1">
                    <span className="font-medium text-slate-700">Scope: </span>{project.scope_of_work}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-1">
                    <span className="font-medium text-slate-700">Technologies: </span>{project.technologies}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-medium text-slate-700">Outcome: </span>{project.outcome}
                  </p>
                  <div className="flex items-center gap-3 mt-2.5">
                    {project.has_completion_certificate && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Completion certificate
                      </span>
                    )}
                    {project.client_reference && (
                      <span className="text-xs text-slate-400 truncate">{project.client_reference}</span>
                    )}
                  </div>
                </div>
              ))}

              {showProjectForm && (
                <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Add Past Project</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-slate-500 block mb-1">Project Title *</label>
                      <input
                        value={projectForm.title}
                        onChange={(e) => setProjectForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        placeholder="e.g. ERP Implementation — Maharashtra State Government"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Client / Organisation *</label>
                      <input
                        value={projectForm.client}
                        onChange={(e) => setProjectForm((p) => ({ ...p, client: e.target.value }))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        placeholder="e.g. Maharashtra State Government"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Industry / Department *</label>
                      <input
                        value={projectForm.industry}
                        onChange={(e) => setProjectForm((p) => ({ ...p, industry: e.target.value }))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        placeholder="e.g. Government / Public Administration"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Year / Duration *</label>
                      <input
                        value={projectForm.duration}
                        onChange={(e) => setProjectForm((p) => ({ ...p, duration: e.target.value }))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        placeholder="e.g. Jan 2023 – Oct 2023"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Contract Value</label>
                      <input
                        value={projectForm.value}
                        onChange={(e) => setProjectForm((p) => ({ ...p, value: e.target.value }))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        placeholder="e.g. ₹15,00,000 (if permitted)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Scope of Work *</label>
                    <textarea
                      value={projectForm.scope_of_work}
                      onChange={(e) => setProjectForm((p) => ({ ...p, scope_of_work: e.target.value }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
                      rows={2}
                      placeholder="Describe the key deliverables and scope of work..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Technologies / Services *</label>
                      <input
                        value={projectForm.technologies}
                        onChange={(e) => setProjectForm((p) => ({ ...p, technologies: e.target.value }))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        placeholder="e.g. Oracle ERP, Java, AWS"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Client Reference</label>
                      <input
                        value={projectForm.client_reference}
                        onChange={(e) => setProjectForm((p) => ({ ...p, client_reference: e.target.value }))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        placeholder="Contact name / designation (optional)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Outcome / Impact *</label>
                    <textarea
                      value={projectForm.outcome}
                      onChange={(e) => setProjectForm((p) => ({ ...p, outcome: e.target.value }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
                      rows={2}
                      placeholder="Describe results, metrics, and any certifications received..."
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={projectForm.has_completion_certificate}
                        onChange={(e) => setProjectForm((p) => ({ ...p, has_completion_certificate: e.target.checked }))}
                        className="accent-blue-600"
                      />
                      <span className="text-xs text-slate-600">Completion certificate available</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowProjectForm(false); setProjectForm(EMPTY_PROJECT_FORM); }}
                        className="text-xs text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddProject}
                        disabled={!projectForm.title.trim() || !projectForm.client.trim() || !projectForm.scope_of_work.trim()}
                        className="text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 px-3 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        Add Project
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Work order / completion certificate upload will be available when backend is connected.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Profile completeness */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Profile Strength</h3>
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="38"
                  fill="none"
                  stroke={profileCompletenessScore >= 80 ? '#2563eb' : '#f59e0b'}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - profileCompletenessScore / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{profileCompletenessScore}%</span>
              </div>
            </div>
            <p className="text-xs text-center text-slate-500 mb-3">
              {profileCompletenessScore >= 80
                ? 'Strong profile backed by core details and required documents'
                : 'Complete the missing core details for stronger matches'}
            </p>
            <div className="space-y-1.5 text-xs">
              {profile.completeness.checks.map((check) => (
                <div key={check.key} className="flex items-center gap-2">
                  <span className={check.done ? 'text-green-500' : 'text-amber-500'}>
                    {check.done ? '✓' : '○'}
                  </span>
                  <span className={`truncate ${check.done ? 'text-slate-600' : 'text-slate-400'}`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GeM Eligibility summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">GeM Eligibility</h3>
            <div className="space-y-2.5">
              {[
                { label: 'MSME Registered', pass: profile.documents.udyam.status === 'uploaded' },
                { label: 'GST Active', pass: profile.documents.gst.status === 'uploaded' },
                { label: 'Turnover >= Rs 20L', pass: profile.turnover >= 2000000 },
                { label: '3+ Years Operation', pass: profile.years_in_operation >= 3 },
                { label: 'ISO Certified', pass: profile.certifications.some((cert) => cert.toLowerCase().includes('iso')) },
                { label: 'Experience Proof Uploaded', pass: profile.documents.experience.status === 'uploaded' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{item.label}</span>
                  <span className={`font-semibold ${item.pass ? 'text-green-600' : 'text-amber-600'}`}>
                    {item.pass ? '✓ Pass' : '○ Missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-slate-800 rounded-xl p-5 text-white">
            <h3 className="font-semibold text-sm mb-3">Activity Summary</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Tenders Analyzed', value: `${activityStats.analyzed}` },
                { label: 'Drafts Created', value: `${activityStats.drafts}` },
                { label: 'Tenders Saved', value: `${activityStats.saved}` },
                { label: 'Documents Uploaded', value: `${uploadedCount}` },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between text-xs">
                  <span className="text-slate-400">{stat.label}</span>
                  <span className="text-white font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
