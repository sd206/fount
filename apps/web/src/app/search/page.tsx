'use client';

import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { useSearch } from '../../hooks/useSearch';
import type { Drop } from '@fount/shared/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const search = useSearch();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) search.mutate({ query });
  }

  const result = search.data;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="relative mb-6">
          <i className="ti ti-search absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] text-lg" />
          <input
            type="text"
            placeholder="Search anything..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white border border-[var(--color-border-secondary)] rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[var(--color-brand)] transition-colors"
          />
          {search.isPending && (
            <i className="ti ti-loader-2 animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          )}
        </form>

        {result && (
          <>
            {/* AI Answer Card */}
            <div className="bg-gradient-to-br from-[#1D9E75] to-[#157a5a] rounded-2xl p-5 mb-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <i className="ti ti-sparkles text-white/80" />
                <span className="text-sm font-medium text-white/80">Fount found</span>
              </div>
              <p className="text-sm leading-relaxed">{result.answer}</p>
            </div>

            {/* Source drops */}
            {result.sources.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">
                  From your drops
                </p>
                <div className="flex flex-col gap-2">
                  {result.sources.map((drop: Drop) => (
                    <SourceCard key={drop.id} drop={drop} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function SourceCard({ drop }: { drop: Drop }) {
  const iconMap: Record<string, string> = {
    note: 'file-text', link: 'link', file: 'paperclip',
    voice: 'microphone', scan: 'scan',
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border-tertiary)] px-4 py-3 flex items-start gap-3">
      <i className={`ti ti-${iconMap[drop.type] ?? 'file'} text-[var(--color-text-tertiary)] mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {drop.title ?? drop.url ?? 'Untitled'}
        </p>
        {drop.aiSummary && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">{drop.aiSummary}</p>
        )}
        {drop.tags?.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {drop.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] bg-[var(--color-background-tertiary)] px-2 py-0.5 rounded-full text-[var(--color-text-secondary)]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
