'use client';

import { useRef, useState } from 'react';

interface SwipeToDismissProps {
  onDelete: () => void;
  onPin?: () => void;
  pinned?: boolean;
  children: React.ReactNode;
}

const ACTION_THRESHOLD = 80;

// Same touch-ref pattern as ProfileImageCarousel (touchStartX/Y refs,
// horizontal-dominant + distance check on touchend) but driving a live
// translateX instead of a discrete index change, so the card visibly
// follows the finger. Direction decides the action: swipe left reveals
// delete on the right (and removes the card), swipe right reveals pin on
// the left (and just snaps back -- pinning doesn't remove anything).
export function SwipeToDismiss({ onDelete, onPin, pinned, children }: SwipeToDismissProps) {
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
      // Dragging right without a pin handler has nothing to reveal.
      setDragX(dx > 0 && !onPin ? 0 : dx);
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (dragX <= -ACTION_THRESHOLD) {
      setRemoving(true);
      setDragX(-400);
      setTimeout(onDelete, 180);
    } else if (dragX >= ACTION_THRESHOLD && onPin) {
      onPin();
      setDragX(0);
    } else {
      setDragX(0);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex bg-[#1C1C1E]">
        <div className="flex-1 flex items-center pl-5">
          {onPin && <span className="text-xs text-ink/50">{pinned ? 'Unpin' : 'Pin'}</span>}
        </div>
        <div className="flex-1 flex items-center justify-end pr-5">
          <span className="text-xs text-ink/50">Delete</span>
        </div>
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
