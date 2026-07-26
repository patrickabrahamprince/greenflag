'use client';

import { useEffect, useRef, useState } from 'react';
import { Hourglass, LogOut, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BottomNav } from '@/components/layout/bottom-nav';

const REVIEW_SECONDS = 90;

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();
  const [secondsLeft, setSecondsLeft] = useState(REVIEW_SECONDS);
  const approvedRef = useRef(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!approvedRef.current) {
            approvedRef.current = true;
            fetch('/api/onboarding/self-approve', { method: 'POST' }).finally(() => {
              router.push('/standard/builder');
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="w-full animate-fade-in min-h-screen flex flex-col bg-[#000000]">
      <div className="flex-1 flex flex-col justify-center items-center px-8 text-center">
        <div className="absolute top-4 right-4">
          <button
            onClick={handleSignOut}
            className="text-xs text-ink/40 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sign out
          </button>
        </div>

        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6">
          <Hourglass className="w-8 h-8 text-gold" />
        </div>

        <h1 className="font-display text-3xl text-ink mb-3">
          Your application is under review
        </h1>
        <p className="text-ink/60 text-sm leading-relaxed max-w-sm mb-4">
          GreenFlag is a curated community. We're reviewing your profile to make sure
          it's the right fit — you'll be notified the moment you're approved.
        </p>
        <p className="text-gold text-sm font-mono mb-8">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>

        <p className="text-ink/40 text-xs mb-4 max-w-xs">
          Feel free to look around while you wait — nothing is locked.
        </p>
        <button
          onClick={() => router.push('/discover')}
          className="btn-primary flex items-center gap-2 px-6"
        >
          <Compass className="w-4 h-4" />
          Start Discovering
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
