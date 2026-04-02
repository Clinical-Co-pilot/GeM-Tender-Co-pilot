'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDraftsFromStore, type DraftEntry } from '@/lib/mockApi';
import { formatDate } from '@/lib/utils';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);

  useEffect(() => {
    setDrafts(getDraftsFromStore());
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Drafts</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your saved bid drafts and proposals in progress</p>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-700 mb-2">No drafts yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Analyze a matching tender and click &ldquo;Generate Draft Bid&rdquo; to start your first proposal draft.
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
            const readyCount = draft.bid.checklist?.filter((c) => c.status === 'ready').length ?? 0;
            const totalCount = draft.bid.checklist?.length ?? 0;
            const encodedId = draft.tenderId.split('/').join('/'); // already a valid path for [...id]
            return (
              <div
                key={draft.tenderId}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-0.5 rounded-full">Draft</span>
                      <span className="text-xs text-slate-400">
                        {formatDate(draft.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{draft.tenderTitle}</h3>
                    <p className="text-xs text-slate-500 mb-3">{draft.tenderDept}</p>

                    {totalCount > 0 && (
                      <>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>
                            Documents:{' '}
                            <span className={`font-semibold ${readyCount === totalCount ? 'text-green-600' : 'text-amber-600'}`}>
                              {readyCount}/{totalCount} ready
                            </span>
                          </span>
                        </div>
                        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${(readyCount / totalCount) * 100}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href={`/draft/${encodedId}`}
                      className="text-sm text-blue-600 font-medium border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Continue Editing
                    </Link>
                    <Link
                      href={`/proposal/${encodedId}`}
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
