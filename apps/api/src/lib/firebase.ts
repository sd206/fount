import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  // Inside Firebase Functions, initializeApp() with no args automatically uses
  // the function's own project credentials — no env vars needed.
  initializeApp(
    process.env.FIREBASE_PROJECT_ID
      ? {
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        }
      : undefined,
  );
}

export const db = getFirestore();
export const storage = getStorage();
export const auth = getAuth();
