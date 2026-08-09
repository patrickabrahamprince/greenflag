'use client';

import { useEffect } from 'react';
import { Flag } from 'lucide-react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

interface MatchMomentOverlayProps {
  open: boolean;
  myPhoto: string | null;
  theirPhoto: string | null;
  onContinue: () => void;
}

const AUTO_DISMISS_MS = 1800;

// The one place in the app with a dedicated celebration sequence: two
// photo cards settle at opposing angles, the flag mark (same glyph as
// the app icon and the Discover badge -- the signature element now
// appears in three places) pops with a glow where they overlap, then
// the title fades up last. Reduced motion drops straight to the settled
// end-state with a plain fade instead of the choreographed entrance.
// Auto-dismisses like CelebrationInterstitial (components/shared/
// CelebrationInterstitial.tsx) but is also tap-to-continue at any time.
export function MatchMomentOverlay({ open, myPhoto, theirPhoto, onContinue }: MatchMomentOverlayProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onContinue, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [open, onContinue]);

  if (!open) return null;

  const leftCardAnim = prefersReducedMotion ? 'animate-fade-in -rotate-6' : 'animate-match-card-left';
  const rightCardAnim = prefersReducedMotion ? 'animate-fade-in rotate-6' : 'animate-match-card-right';
  const glowAnim = prefersReducedMotion ? 'animate-fade-in' : 'animate-match-glow';
  const textAnim = prefersReducedMotion ? 'animate-fade-in' : 'animate-match-text';

  return (
    <div
      onClick={onContinue}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center px-8 cursor-pointer"
      style={{
        background: 'radial-gradient(ellipse 120% 80% at 20% 20%, rgba(192, 38, 211, 0.55) 0%, transparent 55%), radial-gradient(ellipse 100% 90% at 90% 85%, rgba(134, 25, 143, 0.5) 0%, transparent 60%), #0B0614',
      }}
    >
      <div className="relative w-full max-w-[280px] h-[200px] mb-10">
        <div className={`absolute left-0 top-0 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl ${leftCardAnim}`}>
          {myPhoto ? (
            <img src={myPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-light" />
          )}
        </div>
        <div className={`absolute right-0 top-0 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl ${rightCardAnim}`}>
          {theirPhoto ? (
            <img src={theirPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-light" />
          )}
        </div>
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center ${glowAnim}`}
          style={{ background: 'linear-gradient(135deg, #E879F9 0%, #C026D3 45%, #86198F 100%)', boxShadow: '0 0 40px 10px rgba(192, 38, 211, 0.6)' }}
        >
          <Flag className="w-7 h-7 text-white" fill="white" />
        </div>
      </div>
      <div className={`text-center ${textAnim}`}>
        <h1 className="font-display text-3xl font-bold text-ink leading-tight mb-2">You&apos;ve Met Her Standard</h1>
        <p className="text-ink/70 text-sm">Your connection is on its way</p>
      </div>
      <p className="text-ink/40 text-xs mt-10 uppercase tracking-wide">Tap to continue</p>
    </div>
  );
}
