import { useRef, useState } from 'react';

interface Options {
  // Which edge the gesture arms from. Defaults to 'top', the conventional
  // pull-to-refresh position for a normal list. Chat threads need 'bottom'
  // instead -- they auto-scroll to the newest message on open, so scrollTop
  // is never 0 and the gesture would never arm at all if gated on 'top'.
  // Both variants use the same downward-drag motion and the same
  // top-of-container indicator placement -- only the arming condition
  // (which edge counts as "nowhere further to scroll") changes.
  edge?: 'top' | 'bottom';
}

// Extracted from app/discover/page.tsx, which had this same touch-tracking
// logic inline -- every other main tab (Messages, My Connections,
// Notifications, Profile) lacked both this AND the overscroll-none class
// Discover pairs it with, so pulling down there fell through to the
// WKWebView's native rubber-band bounce, which briefly reveals the plain
// black body background (see the `background: #0B0614 !important` on
// html/body in globals.css) instead of scrolling or refreshing anything.
export function usePullToRefresh<T extends HTMLElement = HTMLDivElement>(
  onRefresh: () => Promise<void> | void,
  options?: Options
) {
  const edge = options?.edge ?? 'top';
  const scrollRef = useRef<T>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  function isAtArmedEdge(): boolean {
    const el = scrollRef.current;
    if (!el) return false;
    if (edge === 'top') return el.scrollTop <= 2;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= 2;
  }

  function onTouchStart(e: React.TouchEvent) {
    if (!isAtArmedEdge() || refreshing) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    pulling.current = false;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null || touchStartX.current === null || refreshing) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);

    // If horizontal movement is dominant, let horizontal gestures win
    if (deltaX > Math.abs(deltaY)) {
      touchStartY.current = null;
      touchStartX.current = null;
      pulling.current = false;
      return;
    }

    if (deltaY > 15 && isAtArmedEdge()) {
      pulling.current = true;
      setPullDistance(Math.min((deltaY - 15) * 0.45, 80));
    } else if (deltaY <= 0) {
      pulling.current = false;
      if (pullDistance !== 0) setPullDistance(0);
    }
  }

  async function onTouchEnd() {
    const wasPulling = pulling.current;
    const dist = pullDistance;
    pulling.current = false;
    touchStartY.current = null;
    touchStartX.current = null;

    if (wasPulling && dist > 55) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }

  return { scrollRef, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd };
}
