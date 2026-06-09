/**
 * API client — wraps all calls to the Fount API.
 * Automatically attaches the Firebase ID token to every request.
 */

import { auth } from './firebase';
import type {
  Drop, Flow, Task, AiCommentary, SearchResult,
  CreateDropInput, UpdateDropInput, CreateFlowInput,
  UpdateFlowInput, GenerateType, OcrScanResult, CalendarEvent,
} from '@fount/shared/types';

// Always use the Firebase Hosting proxy — no env var, no substitution possible.
// For local dev, run: NEXT_PUBLIC_API_URL=http://localhost:8080/v1 next dev
// (next.config.mjs overrides this for production builds anyway)
const BASE = '/api/v1';

async function getToken(): Promise<string> {
  // Wait for Firebase Auth to restore session from persistence
  const user = await new Promise<import('firebase/auth').User | null>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      unsubscribe();
      resolve(u);
    });
  });
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'API error');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Drops ───────────────────────────────────────────────────────────────────

export const api = {
  drops: {
    create: (input: CreateDropInput) =>
      request<Drop>('POST', '/drops', input),
    list: (params?: { tag?: string; type?: string; limit?: number; cursor?: string }) =>
      request<{ drops: Drop[]; nextCursor: string | null }>('GET', `/drops?${new URLSearchParams(params as any)}`),
    get: (id: string) =>
      request<Drop>('GET', `/drops/${id}`),
    update: (id: string, input: UpdateDropInput) =>
      request<Drop>('PATCH', `/drops/${id}`, input),
    delete: (id: string) =>
      request<void>('DELETE', `/drops/${id}`),
    confirmTag: (id: string, tag: string) =>
      request<void>('POST', `/drops/${id}/tags/confirm`, { tag }),
    dismissTag: (id: string, tag: string) =>
      request<void>('POST', `/drops/${id}/tags/dismiss`, { tag }),
  },

  // ─── Flows ──────────────────────────────────────────────────────────────────

  flows: {
    create: (input: CreateFlowInput) =>
      request<Flow>('POST', '/flows', input),
    list: () =>
      request<{ flows: Flow[] }>('GET', '/flows'),
    get: (id: string) =>
      request<Flow>('GET', `/flows/${id}`),
    update: (id: string, input: UpdateFlowInput) =>
      request<Flow>('PATCH', `/flows/${id}`, input),
    delete: (id: string) =>
      request<void>('DELETE', `/flows/${id}`),
    generate: (id: string, type: GenerateType) =>
      request<{ type: GenerateType; content: string }>('POST', `/flows/${id}/generate`, { type }),
  },

  // ─── Search ─────────────────────────────────────────────────────────────────

  search: {
    query: (query: string, limit = 10) =>
      request<SearchResult>('POST', '/search', { query, limit }),
  },

  // ─── AI ─────────────────────────────────────────────────────────────────────

  ai: {
    getCommentary: () =>
      request<{ cards: AiCommentary[] }>('GET', '/ai/commentary'),
    dismissCommentary: (id: string) =>
      request<void>('POST', `/ai/commentary/${id}/dismiss`),
    snoozeCommentary: (id: string, until: string) =>
      request<void>('POST', `/ai/commentary/${id}/snooze`, { until }),
  },

  // ─── Tasks ──────────────────────────────────────────────────────────────────

  tasks: {
    list: () =>
      request<{ tasks: Task[] }>('GET', '/tasks'),
    create: (title: string, dueDate?: string) =>
      request<{ id: string }>('POST', '/tasks', { title, dueDate }),
    update: (id: string, status: Task['status'], dueDate?: string) =>
      request<void>('PATCH', `/tasks/${id}`, { status, dueDate }),
    delete: (id: string) =>
      request<void>('DELETE', `/tasks/${id}`),
  },

  // ─── Calendar ───────────────────────────────────────────────────────────────

  calendar: {
    scan: (imageBase64: string) =>
      request<OcrScanResult>('POST', '/calendar/scan', { imageBase64 }),
    listEvents: () =>
      request<{ events: CalendarEvent[] }>('GET', '/calendar/events'),
    createEvents: (events: Partial<CalendarEvent>[]) =>
      request<{ ids: string[] }>('POST', '/calendar/events', events),
  },
};
