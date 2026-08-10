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

// Confetti geometry -- circles, a rounded triangle, and four-point
// stars clustered above and below the content, per the design system's
// match-moment spec. Fixed positions/rotations (not randomized) so the
// choreographed entrance stays deterministic across renders. Every
// shape is pointer-events-none and sits behind the content (z-0) so it
// never blocks the tap-to-continue click handler on the container.
function MatchConfetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute w-10 h-10 rounded-full bg-gold/70" style={{ top: '8%', left: '12%' }} />
      <div className="absolute w-6 h-6 rounded-full bg-[#45050C]/70" style={{ top: '16%', right: '18%' }} />
      <div
        className="absolute w-8 h-8 bg-lavender/50"
        style={{ top: '10%', right: '35%', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', borderRadius: '4px' }}
      />
      <div className="absolute w-5 h-5 rounded-full border-2 border-gold/60" style={{ bottom: '14%', left: '20%' }} />
      <div className="absolute w-7 h-7 rounded-full bg-lavender/60" style={{ bottom: '10%', right: '14%' }} />
      <div
        className="absolute w-6 h-6 bg-[#45050C]/60"
        style={{ bottom: '20%', left: '38%', clipPath: 'polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%)' }}
      />
      <div
        className="absolute w-9 h-9 bg-gold/40"
        style={{ bottom: '6%', right: '38%', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
      />
    </div>
  );
}

// The one place in the app with a dedicated celebration sequence: two
// photo cards settle at opposing angles, the flag mark (same glyph as
// the app icon and the Discover badge -- the signature element now
// appears in three places) pops with a glow where they overlap, then
// the title fades up last. Reduced motion drops straight to the settled
// end-state with a plain fade instead of the choreographed entrance.
// Auto-dismisses like CelebrationInterstitial (components/shared/
// CelebrationInterstitial.tsx) but is also tap-to-continue at any time.
//
// The deck's own match screen shows a "Say hi!" message input right on
// this screen -- deliberately not copied here. Chat only unlocks after
// a real 3-day pursuit (see chat_unlocked in the matches table), so a
// message box at this exact moment would be a fake affordance pointing
// at a feature that isn't actually available yet.
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
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center px-8 cursor-pointer bg-base overflow-hidden"
    >
      <MatchConfetti />
      <div className="relative z-10 w-full max-w-[280px] h-[200px] mb-10">
        <div className={`absolute left-0 top-0 w-32 h-44 rounded-photo overflow-hidden border-2 border-white/20 shadow-2xl ${leftCardAnim}`}>
          {myPhoto ? (
            <img src={myPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-light" />
          )}
        </div>
        <div className={`absolute right-0 top-0 w-32 h-44 rounded-photo overflow-hidden border-2 border-white/20 shadow-2xl ${rightCardAnim}`}>
          {theirPhoto ? (
            <img src={theirPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-light" />
          )}
        </div>
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center bg-gold ${glowAnim}`}
          style={{ boxShadow: '0 0 40px 10px rgba(210, 4, 45, 0.5)' }}
        >
          <Flag className="w-7 h-7 text-ink" fill="currentColor" />
        </div>
      </div>
      <div className={`relative z-10 text-center ${textAnim}`}>
        <h1 className="font-display text-display text-ink leading-tight mb-2">You&apos;ve Met Her Standard</h1>
        <p className="text-ink/70 text-sm">Your connection is on its way</p>
      </div>
      <p className="relative z-10 text-ink/40 text-xs mt-10 uppercase tracking-wide">Tap to continue</p>
    </div>
  );
}
