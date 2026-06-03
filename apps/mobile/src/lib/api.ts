/**
 * Mobile API client — identical contract to web, but uses Expo SecureStore
 * for token caching and reads the API URL from app config.
 */

import { getAuth } from 'firebase/auth';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/v1';

async function getToken(): Promise<string> {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
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

// Re-export same api shape as web — screens use identical hooks
export { request };
