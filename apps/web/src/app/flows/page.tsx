'use client';

import Link from 'next/link';
import { AppShell } from '../../components/layout/AppShell';
import { useFlows } from '../../hooks/useFlows';
import type { Flow } from '@fount/shared/types';

export default function FlowsPage() {
  const { data, isLoading } = useFlows();
  const flows = data?.flows ?? [];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Flows</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <i className="ti ti-loader-2 animate-spin text-[var(--color-text-tertiary)] text-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flows.map(flow => <FlowCard key={flow.id} flow={flow} />)}

            {/* New Flow card */}
            <Link
              href="/flows/new"
              className="border-2 border-dashed border-[var(--color-border-secondary)] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-[var(--color-brand)] transition-colors group"
            >
              <i className="ti ti-plus text-2xl text-[var(--color-text-tertiary)] group-hover:text-[var(--color-brand)]" />
              <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand)]">New Flow</span>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function FlowCard({ flow }: { flow: Flow }) {
  return (
    <Link
      href={`/flows/${flow.id}`}
      className="bg-white border border-[var(--color-border-tertiary)] rounded-2xl p-5 hover:shadow-sm transition-shadow"
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--color-background-tertiary)] flex items-center justify-center mb-3">
        <i className="ti ti-stack-2 text-[var(--color-text-secondary)]" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{flow.name}</h3>
      <p className="text-xs text-[var(--color-text-tertiary)]">
        {flow.dropIds.length} drop{flow.dropIds.length !== 1 ? 's' : ''}
      </p>
    </Link>
  );
}
