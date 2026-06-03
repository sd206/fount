'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth';

export default function LoginPage() {
  const { signInWithGoogle } = useAuthStore();
  const router = useRouter();

  async function handleGoogleSignIn() {
    await signInWithGoogle();
    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-background-secondary)]">
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border-tertiary)] p-10 w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-brand)] flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-semibold text-lg">F</span>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
          Welcome to Fount
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mb-8">
          Your personal knowledge companion
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 border border-[var(--color-border-secondary)] rounded-xl px-4 py-3 text-sm font-medium hover:bg-[var(--color-background-secondary)] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-6">
          By continuing you agree to Fount's Terms and Privacy Policy
        </p>
      </div>
    </main>
  );
}
