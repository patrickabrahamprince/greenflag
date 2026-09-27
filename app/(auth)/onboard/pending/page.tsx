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
    const timer = setTimeout(() => goToRef.current('/trips'), WELCOME_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [arrived]);

  return (
    <div className="relative isolate w-full animate-fade-in min-h-dvh flex flex-col justify-center items-center px-5 pt-safe-top pb-safe-bottom text-center bg-[#FAF9F6]">
      <OnboardingBackground image="/onboarding/pending.jpg" />

      <div className="max-w-sm mx-auto w-full bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-[36px] p-8 shadow-md">
        {!arrived ? (
          <div className="flex flex-col items-center">
            <ReviewTimerRing secondsLeft={secondsLeft ?? totalSeconds} totalSeconds={totalSeconds} />

            <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-2">
              Verifying Your Profile
            </h1>
            <p className="text-stone-600 text-sm leading-relaxed font-medium">
              GreenFlag is a trusted travel community. We review profiles to keep adventures safe and authentic. Hang tight!
            </p>
          </div>
        ) : (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Sparkles className="w-10 h-10 text-emerald-700" />
            </div>

            <h1 className="font-display text-3xl font-extrabold text-[#382A21] mb-2">You&apos;re Verified!</h1>
            <p className="text-stone-600 text-sm leading-relaxed font-medium">
              Welcome to the community. Taking you to explore upcoming trips and road trips...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
