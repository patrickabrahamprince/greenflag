'use client';

import { useEffect } from 'react';

interface CelebrationInterstitialProps {
  open: boolean;
  heading: string;
  subtext: string;
  onContinue: () => void;
  autoAdvanceMs?: number;
}

// A full-screen celebratory interstitial dropped between onboarding steps
// to break up form fatigue with a delight moment -- oversized display
// type over GreenFlag's own magenta/violet gradient (not happn's
// lilac/green blob treatment). Auto-advances after autoAdvanceMs if set,
// otherwise waits for a tap anywhere on the screen.
export function CelebrationInterstitial({
  open, heading, subtext, onContinue, autoAdvanceMs,
}: CelebrationInterstitialProps) {
  useEffect(() => {
    if (!open || !autoAdvanceMs) return;
    const id = setTimeout(onContinue, autoAdvanceMs);
    return () => clearTimeout(id);
  }, [open, autoAdvanceMs, onContinue]);

  if (!open) return null;

  return (
    <div
      onClick={onContinue}
      className="fixed inset-0 z-50 flex flex-col justify-center px-8 cursor-pointer animate-fade-in"
      style={{
        background: 'radial-gradient(ellipse 120% 80% at 20% 20%, rgba(192, 38, 211, 0.55) 0%, transparent 55%), radial-gradient(ellipse 100% 90% at 90% 85%, rgba(124, 58, 237, 0.5) 0%, transparent 60%), #0B0614',
      }}
    >
      <h1 className="font-display text-6xl text-ink leading-[1.05] mb-4">{heading}</h1>
      <p className="text-xl text-ink/80 font-medium">{subtext}</p>
      <p className="text-ink/40 text-xs mt-10 uppercase tracking-wide">Tap to continue</p>
    </div>
  );
}
