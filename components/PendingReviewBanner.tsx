'use client';

import { Hourglass } from 'lucide-react';
import { usePendingReviewCountdown } from '@/lib/hooks/usePendingReviewCountdown';

export function PendingReviewBanner() {
  const { secondsLeft } = usePendingReviewCountdown();
  if (secondsLeft === null) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="fixed top-0 inset-x-0 z-40 flex items-center justify-center gap-2 bg-gold/10 border-b border-gold/30 py-2 backdrop-blur-sm">
      <Hourglass className="w-3.5 h-3.5 text-gold" />
      <p className="text-xs text-ink/80 font-medium">
        Application under review — {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
    </div>
  );
}
