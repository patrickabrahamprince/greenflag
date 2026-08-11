'use client';

import { Loader2 } from 'lucide-react';

interface AppleButtonProps {
  onClick: () => void;
  loading?: boolean;
}

// Apple requires offering Sign in with Apple wherever a third-party
// social login (Google, here) is offered -- guideline 4.8. Styled to
// match GoogleButton for visual consistency between the two.
export function AppleButton({ onClick, loading }: AppleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-4 rounded-xl border border-raised/20 hover:bg-white/90 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="black">
          <path d="M16.365 1.43c0 1.14-.415 2.06-1.245 2.76-.9.78-1.98 1.23-3.06 1.14-.09-1.11.42-2.13 1.2-2.85.87-.81 2.16-1.29 3.09-1.05.03.33.045.66.015 1zm2.865 17.28c-.51 1.14-.75 1.65-1.41 2.64-.93 1.38-2.25 3.12-3.87 3.12-1.44 0-1.8-.93-3.75-.93-1.95 0-2.37.9-3.81.96-1.62.06-2.85-1.5-3.78-2.88-2.07-3.03-3.66-8.55-1.53-12.27 1.05-1.86 2.94-3.03 4.98-3.06 1.5-.03 2.91.99 3.84.99.93 0 2.64-1.23 4.44-1.05.75.03 2.88.3 4.23 2.28-.105.075-2.52 1.47-2.49 4.38.03 3.48 3.06 4.62 3.09 4.65-.03.075-.48 1.62-1.59 3.15z" />
        </svg>
      )}
      {loading ? 'Connecting...' : 'Continue with Apple'}
    </button>
  );
}
