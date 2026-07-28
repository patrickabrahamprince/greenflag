'use client';

import { useState } from 'react';
import { LogOut, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePendingReviewCountdown } from '@/lib/hooks/usePendingReviewCountdown';
import { ReviewTimerRing } from '@/components/onboarding/ReviewTimerRing';

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();
  const { secondsLeft, totalSeconds } = usePendingReviewCountdown();
  const [entering, setEntering] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleContinue = () => {
    setEntering(true);
    router.push('/standard/builder');
  };

  const arrived = secondsLeft === 0;

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col justify-center items-center px-8 text-center bg-[#000000]">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleSignOut}
          className="text-xs text-ink/40 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <LogOut className="w-3 h-3" />
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
          <p className="text-ink/60 text-sm leading-relaxed max-w-sm mb-8">
            Your profile is approved. Now set your Standard — the three days he'll need to
            earn a conversation with you.
          </p>

          <button
            onClick={handleContinue}
            disabled={entering}
            className="btn-primary flex items-center gap-2 px-8 py-4 font-semibold active:scale-95 transition-transform disabled:opacity-60"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
