import { create } from 'zustand';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

// Initialize Firebase (same config as web, from env)
if (!getApps().length) {
  initializeApp({
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  });
}

interface AuthState {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  _init: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  logout: async () => {
    await signOut(getAuth());
    set({ user: null });
  },

  _init: () => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      set({ user, loading: false });
    });
    return unsubscribe;
  },
}));
