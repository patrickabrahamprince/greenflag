'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, BadgeCheck } from 'lucide-react';
import { usePendingReviewCountdown } from '@/lib/hooks/usePendingReviewCountdown';

export function PendingReviewBanner() {
  const { secondsLeft } = usePendingReviewCountdown();
  const [wasPending, setWasPending] = useState(false);
  const [showVerified, setShowVerified] = useState(false);

  useEffect(() => {
    if (secondsLeft !== null) setWasPending(true);
  }, [secondsLeft]);

  // secondsLeft resets to null the instant approval_status flips away
  // from 'pending' (the countdown hook's own guard treats "not pending"
  // as "nothing to show"). Catching that pending -> null transition here
  // is what surfaces the one-time "You're Verified" window instead of the
  // banner just silently vanishing.
  useEffect(() => {
    if (wasPending && secondsLeft === null) setShowVerified(true);
  }, [wasPending, secondsLeft]);

  if (showVerified) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="w-full max-w-sm bg-[#000000] rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_-8px_rgba(192,38,211,0.6)]">
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
    <div className="fixed top-0 inset-x-0 z-40 flex items-center justify-center gap-2 bg-gold/10 border-b border-gold/30 py-2 backdrop-blur-sm">
      <ShieldCheck className="w-3.5 h-3.5 text-gold animate-pulse" />
      <p className="text-xs text-ink/80 font-medium">
        Verifying your profile — {secondsLeft}s
      </p>
    </div>
  );
}
