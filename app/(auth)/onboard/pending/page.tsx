'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createClient } from '@/lib/supabase/client';
import { usePendingReviewCountdown } from '@/lib/hooks/usePendingReviewCountdown';
import { ReviewTimerRing } from '@/components/onboarding/ReviewTimerRing';
import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground';
import { useOnboardingNav } from '@/lib/onboarding/useOnboardingNav';

const WELCOME_DISPLAY_MS = 1800;

export default function PendingApprovalPage() {
  const { goTo } = useOnboardingNav();
  const supabase = createClient();
  const { secondsLeft, totalSeconds } = usePendingReviewCountdown();
  const [arrived, setArrived] = useState(false);

  // goTo isn't a stable reference across renders the way useRouter()'s
  // router is -- depending on it directly would reset this effect (and
  // its setTimeout) on every re-render while the countdown hook is still
  // ticking, so the redirect would never actually fire.
  const goToRef = useRef(goTo);
  goToRef.current = goTo;

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

  // Same locked palette as ConnectedScreen's match confetti -- this is
  // the other big "you made it" moment in the app, and it had a Sparkles
  // icon but nothing actually celebrating the approval.
  useEffect(() => {
    if (!arrived) return;
    confetti({ particleCount: 150, spread: 80, colors: ['#D2042D', '#45050C', '#fff'] });
  }, [arrived]);

  // Fully automatic -- no button to tap. A woman always needs her
  // Standard set before Discover means anything for her, so that's where
  // this lands once the review moment has played out.
  useEffect(() => {
    if (!arrived) return;
    const timer = setTimeout(() => goToRef.current('/standard/builder'), WELCOME_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [arrived]);

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col justify-center items-center px-8 text-center bg-base">
      <OnboardingBackground image="/onboarding/pending.jpg" />

      {!arrived ? (
        <>
          <ReviewTimerRing secondsLeft={secondsLeft ?? totalSeconds} totalSeconds={totalSeconds} />

          <h1 className="font-display text-3xl text-ink mb-3 mt-4">
            Verifying Your Profile
          </h1>
          <p className="text-ink/60 text-sm leading-relaxed max-w-sm">
            Greenflag is curated. We review every profile to maintain the standard.
            Hang tight — this only takes a moment.
          </p>
        </>
      ) : (
        <div className="animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-8px_rgba(210,4,45,0.6)]">
            <Sparkles className="w-9 h-9 text-gold" />
          </div>

          <h1 className="font-display text-3xl text-ink mb-3">Verified.</h1>
          <p className="text-ink/60 text-sm leading-relaxed max-w-sm">
            Your profile is approved. Taking you to set your Standard...
          </p>
        </div>
      )}
    </div>
  );
}
