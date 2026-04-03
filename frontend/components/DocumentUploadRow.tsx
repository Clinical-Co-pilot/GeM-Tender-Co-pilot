'use client';

/**
 * DocumentUploadRow — reusable file upload row component.
 */

import { useRef } from 'react';

export interface DocumentState {
  status: 'uploaded' | 'missing';
  filename?: string;
  date?: string;
  uploaded_at?: string;
}

interface DocumentUploadRowProps {
  docKey: string;
  label: string;
  required?: boolean;
  state: DocumentState;
  onFileSelected: (key: string, file: File) => void;
  accept?: string;
  busy?: boolean;
}

export function DocumentUploadRow({
  docKey,
  label,
  required = false,
  state,
  onFileSelected,
  accept = '.pdf,.jpg,.jpeg,.png',
  busy = false,
}: DocumentUploadRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleButtonClick() {
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelected(docKey, file);
    e.target.value = '';
  }

  const uploaded = state.status === 'uploaded';
  const uploadedDate = state.date || (
    state.uploaded_at
      ? new Date(state.uploaded_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : undefined
  );

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
        uploaded ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        aria-label={`Upload ${label}`}
        disabled={busy}
      />

      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          uploaded
            ? 'bg-green-50 border border-green-200'
            : 'bg-amber-50 border border-amber-200'
        }`}
      >
        {uploaded ? (
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 10.5h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-800 truncate">{label}</p>
          {required && <span className="text-xs text-slate-400 flex-shrink-0">(Required)</span>}
        </div>
        {uploaded ? (
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {state.filename ? `${state.filename} · ` : ''}Uploaded {uploadedDate}
          </p>
        ) : (
          <p className="text-xs text-amber-600 mt-0.5">Not uploaded - may limit tender eligibility</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {uploaded ? (
          <>
            <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              Uploaded
            </span>
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={busy}
              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors border border-slate-200 disabled:opacity-60"
            >
              {busy ? 'Uploading...' : 'Replace'}
            </button>
          </>
        ) : (
          <>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Missing
            </span>
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={busy}
              className="text-xs text-blue-600 font-medium hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-60"
            >
              {busy ? 'Uploading...' : 'Upload'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
