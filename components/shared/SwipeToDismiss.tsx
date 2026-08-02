'use client';

import { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';

interface SwipeToDismissProps {
  onDismiss: () => void;
  children: React.ReactNode;
}

const DISMISS_THRESHOLD = 80;

// Same touch-ref pattern as ProfileImageCarousel (touchStartX/Y refs,
// horizontal-dominant + distance check on touchend) but driving a live
// translateX instead of a discrete index change, so the card visibly
// follows the finger and only commits to removal past the threshold.
export function SwipeToDismiss({ onDismiss, children }: SwipeToDismissProps) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [removing, setRemoving] = useState(false);

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
    if (Math.abs(dragX) > DISMISS_THRESHOLD) {
      setRemoving(true);
      setDragX(dragX > 0 ? 400 : -400);
      setTimeout(onDismiss, 180);
    } else {
      setDragX(0);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex items-center justify-between px-5 bg-red-950/50">
        <Trash2 className="w-4 h-4 text-red-400" />
        <Trash2 className="w-4 h-4 text-red-400" />
      </div>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? 'none' : removing ? 'transform 180ms ease-in' : 'transform 200ms ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
