'use client';

import { useRef, useState } from 'react';
import toast, { ToastBar, type Toast } from 'react-hot-toast';

const DISMISS_THRESHOLD = 80;

// Same touch-ref pattern as SwipeToDismiss (notifications list) and
// ProfileImageCarousel -- track start in refs, require the drag be more
// horizontal than vertical before treating it as a swipe, dismiss past a
// distance threshold, snap back otherwise. Wraps react-hot-toast's own
// ToastBar rather than reimplementing it, so every toast.success()/
// toast.error() call site across the app gets this for free.
export function SwipeableToast({ t }: { t: Toast }) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - (touchStartY.current ?? 0);
    if (Math.abs(dx) > Math.abs(dy)) {
      setDragX(dx);
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dragX) >= DISMISS_THRESHOLD) {
      toast.dismiss(t.id);
    } else {
      setDragX(0);
    }
  };

  const opacity = Math.max(0, 1 - Math.abs(dragX) / 150);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${dragX}px)`,
        opacity,
        transition: dragging ? 'none' : 'transform 200ms ease-out, opacity 200ms ease-out',
      }}
    >
      <ToastBar toast={t} />
    </div>
  );
}
