'use client';

import { useEffect } from 'react';
import { Hourglass, LogOut, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePendingReviewCountdown } from '@/lib/hooks/usePendingReviewCountdown';

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();
  const secondsLeft = usePendingReviewCountdown();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // secondsLeft is null once the account is no longer pending (either it
  // was never pending, or the countdown hook just flipped it to approved).
  useEffect(() => {
    if (secondsLeft === 0) {
      router.push('/standard/builder');
    }
  }, [secondsLeft, router]);

  const displaySeconds = secondsLeft ?? 0;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;

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

      <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6">
        <Hourglass className="w-8 h-8 text-gold" />
      </div>

      <h1 className="font-display text-3xl text-ink mb-3">
        Your Profile Is Being Reviewed
      </h1>
      <p className="text-ink/60 text-sm leading-relaxed max-w-sm mb-4">
        Greenflag is curated. We review every profile to maintain the standard.
        You'll be notified once you're approved.
      </p>
      <p className="text-gold text-sm font-mono mb-8">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>

      <p className="text-ink/40 text-xs mb-4 max-w-xs">
        You may explore while you wait.
      </p>
      <button
        onClick={() => router.push('/discover')}
        className="btn-primary flex items-center gap-2 px-6"
      >
        <Compass className="w-4 h-4" />
        Enter Discovery
      </button>
    </div>
  );
}
