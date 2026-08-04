'use client';

import { useEffect, useRef, useState } from 'react';
import { useUserStore } from '@/lib/store';

// Men see this as a "verifying your profile" moment while they browse
// Discover; women wait on a dedicated full-screen countdown with nothing
// else to do, so theirs is shorter before the app hands them straight
// into a welcome screen.
const REVIEW_SECONDS_MAN = 30;
const REVIEW_SECONDS_WOMAN = 5;

// Anchored to profiles.review_started_at (not a per-mount timer, and not
// created_at) so the countdown reads the same real elapsed time no matter
// which page renders it or how many times the component remounts as the
// user navigates around. review_started_at is set once, right when the
// how-it-works screen hands off to pending/discover -- created_at was the
// original anchor, but a real onboarding run (phone OTP, profile+photos,
// 8 quiz questions, interests, 6 rule slides) routinely takes several
// minutes, so by the time anyone reached a screen showing this countdown
// it had almost always already elapsed and self-approved invisibly.
export interface PendingReviewCountdown {
  secondsLeft: number | null;
  totalSeconds: number;
}

export function usePendingReviewCountdown(): PendingReviewCountdown {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const approvedRef = useRef(false);
  const totalSeconds = user?.persona === 'woman' ? REVIEW_SECONDS_WOMAN : REVIEW_SECONDS_MAN;

  useEffect(() => {
    const anchor = user?.review_started_at || user?.created_at;
    if (!user || user.approval_status !== 'pending' || !anchor) {
      setSecondsLeft(null);
      return;
    }
    const windowSeconds = user.persona === 'woman' ? REVIEW_SECONDS_WOMAN : REVIEW_SECONDS_MAN;
    const target = new Date(anchor).getTime() + windowSeconds * 1000;

    const tick = () => {
      const remaining = Math.max(0, Math.round((target - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0 && !approvedRef.current) {
        approvedRef.current = true;
        fetch('/api/onboarding/self-approve', { method: 'POST' })
          .then(async (res) => {
            if (res.ok) {
              setUser({ ...user, approval_status: 'approved' });
              return;
            }
            const body = await res.json().catch(() => ({}));
            // "Not pending" means another path (admin action, an earlier
            // retry that actually landed) already resolved this -- not a
            // failure to retry, just nothing left to do.
            if (body?.error === 'Not pending') return;
            throw new Error('self-approve failed');
          })
          .catch(() => {
            // A network blip or cold serverless function shouldn't
            // permanently strand approval_status at 'pending' server-side
            // with the client having no idea anything went wrong --
            // resetting the ref lets the next tick (1s later, since
            // `remaining` stays at 0) retry instead of giving up forever.
            approvedRef.current = false;
          });
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [user, setUser]);

  return { secondsLeft, totalSeconds };
}
