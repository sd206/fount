import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  // On Cloud Run, Application Default Credentials are provided automatically.
  // FIREBASE_PROJECT_ID must match the Firebase project that issues Auth tokens.
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const db = getFirestore();
export const storage = getStorage();
export const auth = getAuth();
