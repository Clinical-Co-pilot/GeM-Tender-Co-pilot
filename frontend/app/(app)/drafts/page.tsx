'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listDrafts } from '@/lib/mockApi';
import { formatDate } from '@/lib/utils';
import type { DraftRecord } from '@/types';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listDrafts()
      .then((response) => {
        if (!active) return;
        setDrafts(response.drafts);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load drafts');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        {[1, 2].map((index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
            <div className="h-3 bg-slate-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Drafts</h1>
        <p className="text-sm text-slate-500 mt-0.5">Backend-saved bid drafts and proposals in progress</p>
      </div>

      {error ? (
        <div className="bg-white border border-red-200 rounded-2xl p-10 text-center">
          <h3 className="font-semibold text-slate-700 mb-2">Unable to load drafts</h3>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      ) : drafts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
          <h3 className="font-semibold text-slate-700 mb-2">No drafts yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Analyze a matching tender and click “Generate Draft Bid” to create your first saved proposal draft.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            Browse Matching Tenders
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => {
            const readyCount = draft.bid.checklist.filter((item) => item.status === 'ready').length;
            const totalCount = draft.bid.checklist.length;
            return (
              <div
                key={draft.tender_id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-0.5 rounded-full">Draft</span>
                      <span className="text-xs text-slate-400">{formatDate(draft.updated_at)}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{draft.tender_title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{draft.tender_department}</p>
                    <p className="text-xs text-slate-500">
                      Documents ready: <span className="font-semibold text-slate-700">{readyCount}/{totalCount}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href={`/draft/${draft.tender_id}`}
                      className="text-sm text-blue-600 font-medium border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Continue Editing
                    </Link>
                    <Link
                      href={`/proposal/${draft.tender_id}`}
                      className="text-sm text-white bg-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
