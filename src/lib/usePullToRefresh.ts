"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDist = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      pullDist.current = 0;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && startY.current > 0) {
      const dist = e.touches[0].clientY - startY.current;
      if (dist > 0) {
        pullDist.current = Math.min(dist * 0.5, 120);
        setPulling(true);
      }
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDist.current > 60 && !refreshing) {
      setRefreshing(true);
      setPulling(false);
      try { await onRefresh(); } catch {}
      setRefreshing(false);
    } else {
      setPulling(false);
    }
    startY.current = 0;
    pullDist.current = 0;
  }, [onRefresh, refreshing]);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = pullDist.current / 120;

  return { pulling, refreshing, pullDist: pullDist.current, pullProgress };
}
