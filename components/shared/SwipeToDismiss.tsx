'use client';

import { useRef, useState } from 'react';
import { Pin, Trash2 } from 'lucide-react';

interface SwipeToDismissProps {
  onDelete: () => void;
  onPin?: () => void;
  pinned?: boolean;
  children: React.ReactNode;
}

const ACTION_THRESHOLD = 80;
const REVEAL_FADE_START = 10;

// Same touch-ref pattern as ProfileImageCarousel (touchStartX/Y refs,
// horizontal-dominant + distance check on touchend) but driving a live
// translateX instead of a discrete index change, so the card visibly
// follows the finger. Direction decides the action: swipe left reveals
// delete on the right (and removes the card), swipe right reveals pin on
// the left (and just snaps back -- pinning doesn't remove anything).
//
// The pin/delete affordances are small icon chips that fade in via
// opacity as you drag past REVEAL_FADE_START, rather than a full-width
// solid panel sitting behind the row at all times -- the previous
// always-there bg-[#1C1C1E] rectangle was visible through any row whose
// own foreground wasn't fully opaque, which read as an unwanted "black
// box" on every row instead of only appearing mid-swipe.
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

  const pinOpacity = dragX > REVEAL_FADE_START ? Math.min((dragX - REVEAL_FADE_START) / (ACTION_THRESHOLD - REVEAL_FADE_START), 1) : 0;
  const deleteOpacity = dragX < -REVEAL_FADE_START ? Math.min((-dragX - REVEAL_FADE_START) / (ACTION_THRESHOLD - REVEAL_FADE_START), 1) : 0;

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 flex items-center">
        {onPin && (
          <div
            className="ml-3 w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center shrink-0"
            style={{ opacity: pinOpacity, transition: dragging ? 'none' : 'opacity 200ms ease-out' }}
          >
            <Pin className="w-4 h-4 text-gold" fill={pinned ? 'currentColor' : 'none'} />
          </div>
        )}
        <div className="flex-1" />
        <div
          className="mr-3 w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center shrink-0"
          style={{ opacity: deleteOpacity, transition: dragging ? 'none' : 'opacity 200ms ease-out' }}
        >
          <Trash2 className="w-4 h-4 text-red-400" />
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
