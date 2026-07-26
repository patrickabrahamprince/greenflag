'use client';

import { useEffect, useRef, useState } from 'react';
import { useUserStore } from '@/lib/store';

const REVIEW_SECONDS = 90;

// Anchored to profiles.review_started_at (not a per-mount timer, and not
// created_at) so the countdown reads the same real elapsed time no matter
// which page renders it or how many times the component remounts as the
// user navigates around. review_started_at is set once, right when the
// how-it-works screen hands off to pending/discover -- created_at was the
// original anchor, but a real onboarding run (phone OTP, profile+photos,
// 8 quiz questions, interests, 6 rule slides) routinely takes several
// minutes, so by the time anyone reached a screen showing this countdown
// it had almost always already elapsed and self-approved invisibly.
export function usePendingReviewCountdown(): number | null {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const approvedRef = useRef(false);

  useEffect(() => {
    const anchor = user?.review_started_at || user?.created_at;
    if (!user || user.approval_status !== 'pending' || !anchor) {
      setSecondsLeft(null);
      return;
    }
    const target = new Date(anchor).getTime() + REVIEW_SECONDS * 1000;

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
