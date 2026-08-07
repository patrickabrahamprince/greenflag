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
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  function isAtArmedEdge(): boolean {
    const el = scrollRef.current;
    if (!el) return true;
    if (edge === 'top') return el.scrollTop <= 0;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= 1;
  }

  function onTouchStart(e: React.TouchEvent) {
    if (!isAtArmedEdge()) return;
    touchStartY.current = e.touches[0].clientY;
    pulling.current = true;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!pulling.current || touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && isAtArmedEdge()) {
      setPullDistance(Math.min(delta * 0.5, 90));
    } else {
      pulling.current = false;
    }
  }

  async function onTouchEnd() {
    if (!pulling.current) return;
    pulling.current = false;
    touchStartY.current = null;
    if (pullDistance > 60) {
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
