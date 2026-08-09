'use client';

import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// Shimmer needs an explicit oversized background-size for the
// background-position sweep to have room to travel -- 200% width means
// the gradient slides fully off-screen and back, producing the sweep
// instead of a static two-tone split.
function ShimmerBlock({ className }: { className: string }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shimmerClass = prefersReducedMotion
    ? 'animate-pulse bg-surface-light'
    : 'bg-[length:200%_100%] bg-gradient-to-r from-surface-light via-white/10 to-surface-light animate-shimmer';
  return <div className={`${shimmerClass} ${className}`} />;
}

// Mirrors the real Discover card's layout (full-bleed photo, top-left
// badge chip, bottom info bar + action row) so the initial-load state
// doesn't jump when real content replaces it -- previously this was a
// bare centered spinner with no relation to the content about to
// appear.
export function DiscoverySkeleton() {
  return (
    <div className="relative screen-gradient min-h-dvh max-w-app mx-auto overflow-hidden">
      <div className="h-dvh w-full relative">
        <ShimmerBlock className="absolute inset-0" />
        <ShimmerBlock className="absolute top-12 left-3 w-16 h-7 rounded-full" />
        <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-3">
          <ShimmerBlock className="h-6 w-2/3 rounded-lg" />
          <ShimmerBlock className="h-4 w-1/3 rounded-lg" />
          <div className="flex gap-3 mt-2">
            <ShimmerBlock className="h-11 flex-1 rounded-full" />
            <ShimmerBlock className="h-11 w-11 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
