'use client';

import { useEffect, useRef, useState } from 'react';
import { useUserStore } from '@/lib/store';

const REVIEW_SECONDS = 90;

// Anchored to profiles.created_at (not a per-mount timer) so the countdown
// reads the same real elapsed time no matter which page renders it or how
// many times the component remounts as the user navigates around.
export function usePendingReviewCountdown(): number | null {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const approvedRef = useRef(false);

  useEffect(() => {
    if (!user || user.approval_status !== 'pending' || !user.created_at) {
      setSecondsLeft(null);
      return;
    }
    const target = new Date(user.created_at).getTime() + REVIEW_SECONDS * 1000;

    const tick = () => {
      const remaining = Math.max(0, Math.round((target - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0 && !approvedRef.current) {
        approvedRef.current = true;
        fetch('/api/onboarding/self-approve', { method: 'POST' }).then(() => {
          setUser({ ...user, approval_status: 'approved' });
        });
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [user, setUser]);

  return secondsLeft;
}
