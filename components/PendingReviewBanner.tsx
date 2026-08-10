'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, BadgeCheck } from 'lucide-react';
import { usePendingReviewCountdown } from '@/lib/hooks/usePendingReviewCountdown';
import { useUserStore } from '@/lib/store';

export function PendingReviewBanner() {
  const user = useUserStore((s) => s.user);
  const { secondsLeft } = usePendingReviewCountdown();
  const [showVerified, setShowVerified] = useState(false);

  // Persisted via localStorage, not just latched component state -- this
  // component gets re-mounted fresh on every route change (BottomNav is
  // rendered from each route segment's own layout.tsx, not one shared
  // persistent layout), so a purely in-memory "did the countdown just
  // finish" check would miss the moment entirely for anyone who navigates
  // during the 30s window, since a brand-new mount elsewhere never
  // observes the pending -> approved transition happening. Checking
  // "is he approved and have I not shown this yet" on every mount instead
  // is what survives that.
  useEffect(() => {
    if (!user || user.persona !== 'man' || user.approval_status !== 'approved') return;
    const key = `gf_verified_seen:${user.id}`;
    if (localStorage.getItem(key) === '1') return;
    localStorage.setItem(key, '1');
    setShowVerified(true);
  }, [user]);

  if (showVerified) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="w-full max-w-sm bg-base rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_-8px_rgba(210,4,45,0.6)]">
            <BadgeCheck className="w-8 h-8 text-gold" />
          </div>
          <h3 className="font-display text-2xl text-ink mb-2">You're Verified</h3>
          <p className="text-ink/60 text-sm leading-relaxed mb-6">
            Your profile is confirmed. You're all set to start discovering.
          </p>
          <button onClick={() => setShowVerified(false)} className="btn-primary w-full">
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (secondsLeft === null) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-40 flex items-center justify-center gap-2 bg-gold/10 border-b border-gold/30 py-2 pt-safe-top backdrop-blur-sm">
      <ShieldCheck className="w-3.5 h-3.5 text-gold animate-pulse" />
      <p className="text-xs text-ink/80 font-medium">
        Verifying your profile — {secondsLeft}s
      </p>
    </div>
  );
}
