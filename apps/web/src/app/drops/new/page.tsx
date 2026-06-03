'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { useCreateDrop } from '../../../hooks/useDrops';
import type { DropType } from '@fount/shared/types';

const TABS: { type: DropType; label: string; icon: string }[] = [
  { type: 'note', label: 'Note', icon: 'file-text' },
  { type: 'link', label: 'Link', icon: 'link' },
  { type: 'file', label: 'File', icon: 'paperclip' },
  { type: 'voice', label: 'Voice', icon: 'microphone' },
  { type: 'scan', label: 'Scan', icon: 'scan' },
];

export default function NewDropPage() {
  const [activeTab, setActiveTab] = useState<DropType>('note');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const router = useRouter();
  const createDrop = useCreateDrop();

  async function handleSave() {
    await createDrop.mutateAsync({
      type: activeTab,
      title: title || undefined,
      body: activeTab === 'note' ? body : undefined,
      url: activeTab === 'link' ? url : undefined,
    });
    router.push('/dashboard');
  }

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Drop</h1>
          <button
            onClick={handleSave}
            disabled={createDrop.isPending}
            className="bg-[var(--color-brand)] text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50"
          >
            {createDrop.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Tab row */}
        <div className="flex gap-1 bg-[var(--color-background-secondary)] rounded-xl p-1 mb-5">
          {TABS.map(tab => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.type
                  ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-tertiary)]'
              }`}
            >
              <i className={`ti ti-${tab.icon}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="bg-white rounded-2xl border border-[var(--color-border-tertiary)] p-4">
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-sm font-medium outline-none border-b border-[var(--color-border-tertiary)] pb-3 mb-3 placeholder:text-[var(--color-text-tertiary)]"
          />

          {activeTab === 'note' && (
            <textarea
              placeholder="Write anything..."
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
              className="w-full text-sm outline-none resize-none placeholder:text-[var(--color-text-tertiary)]"
            />
          )}

          {activeTab === 'link' && (
            <input
              type="url"
              placeholder="Paste a URL..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
          )}

          {(activeTab === 'file' || activeTab === 'scan') && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[var(--color-border-secondary)] rounded-xl text-[var(--color-text-tertiary)]">
              <i className={`ti ti-${activeTab === 'scan' ? 'camera' : 'upload'} text-3xl mb-2`} />
              <p className="text-sm">
                {activeTab === 'scan' ? 'Take a photo or upload' : 'Choose a file to upload'}
              </p>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="flex flex-col items-center justify-center py-8">
              <button className="w-16 h-16 rounded-full bg-[var(--color-brand)] flex items-center justify-center">
                <i className="ti ti-microphone text-white text-2xl" />
              </button>
              <p className="text-sm text-[var(--color-text-tertiary)] mt-3">Tap to record</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
