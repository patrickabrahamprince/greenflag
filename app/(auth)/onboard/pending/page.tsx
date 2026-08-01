'use client';

import { useEffect, useState } from 'react';
import { LogOut, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePendingReviewCountdown } from '@/lib/hooks/usePendingReviewCountdown';
import { ReviewTimerRing } from '@/components/onboarding/ReviewTimerRing';

const WELCOME_DISPLAY_MS = 1800;

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();
  const { secondsLeft, totalSeconds } = usePendingReviewCountdown();
  const [arrived, setArrived] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Latched, not derived fresh every render -- the countdown hook resets
  // secondsLeft back to null the instant approval_status flips away from
  // 'pending' (its own guard treats "not pending" as "nothing to show"
  // and clears the countdown). Deriving `arrived` straight from
  // secondsLeft === 0 meant that reset flipped this back to false right
  // after self-approve succeeded, dumping the screen back onto a
  // freshly-reset 10s ring -- looked exactly like it was stuck.
  useEffect(() => {
    if (secondsLeft === 0) setArrived(true);
  }, [secondsLeft]);

  // Fully automatic -- no button to tap. A woman always needs her
  // Standard set before Discover means anything for her, so that's where
  // this lands once the review moment has played out.
  useEffect(() => {
    if (!arrived) return;
    const timer = setTimeout(() => router.push('/standard/builder'), WELCOME_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [arrived, router]);

  return (
    <div className="w-full animate-fade-in min-h-dvh flex flex-col justify-center items-center px-8 text-center bg-[#000000]">
      <div className="absolute top-safe-top right-4">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-xs text-ink/40 hover:text-red-500 flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          {signingOut ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
          Sign Out
        </button>
      </div>

      {!arrived ? (
        <>
          <ReviewTimerRing secondsLeft={secondsLeft ?? totalSeconds} totalSeconds={totalSeconds} />

          <h1 className="font-display text-3xl text-ink mb-3 mt-4">
            Your Profile Is Being Reviewed
          </h1>
          <p className="text-ink/60 text-sm leading-relaxed max-w-sm">
            Greenflag is curated. We review every profile to maintain the standard.
            Hang tight — this only takes a moment.
          </p>
        </>
      ) : (
        <div className="animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-8px_rgba(192,38,211,0.6)]">
            <Sparkles className="w-9 h-9 text-gold" />
          </div>

          <h1 className="font-display text-3xl text-ink mb-3">You're In.</h1>
          <p className="text-ink/60 text-sm leading-relaxed max-w-sm">
            Your profile is approved. Taking you to set your Standard...
          </p>
        </div>
      )}
    </div>
  );
}
