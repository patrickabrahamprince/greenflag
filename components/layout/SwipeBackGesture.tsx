'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';

const EDGE_ZONE_PX = 24;
const SWIPE_THRESHOLD_PX = 70;

interface SwipeBackGestureProps {
  children: React.ReactNode;
}

// Next.js App Router client navigation doesn't touch WKWebView's own
// back-forward list, so the native iOS edge-swipe-to-go-back gesture has
// nothing to act on in this app (see OnboardingBackground's sibling
// investigation for why enabling the native WKWebView property wouldn't
// work here). This reimplements just the edge-swipe part in JS: only a
// touch that STARTS within the left edge strip is tracked, so it never
// steals a horizontal swipe that begins mid-screen (photo carousels,
// notification dismiss, etc).
export function SwipeBackGesture({ children }: SwipeBackGestureProps) {
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const tracking = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    tracking.current = x <= EDGE_ZONE_PX;
    if (tracking.current) {
      touchStartX.current = x;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!tracking.current || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - (touchStartY.current ?? 0);
    tracking.current = false;
    if (dx > SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
      router.back();
    }
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {children}
    </div>
  );
}
