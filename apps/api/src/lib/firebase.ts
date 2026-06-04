import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  // On Cloud Run, Application Default Credentials are provided automatically.
  // For local dev, run: gcloud auth application-default login
  initializeApp({
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const db = getFirestore();
export const storage = getStorage();
export const auth = getAuth();
