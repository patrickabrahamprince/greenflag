'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

interface ConnectedScreenProps {
  womanPhoto: string;
  womanName: string;
  connectionId: string;
}

export function ConnectedScreen({ womanPhoto, womanName, connectionId }: ConnectedScreenProps) {
  const router = useRouter();

  useEffect(() => {
    // Locked palette confetti (Mindaro/Lavender/Electric Violet/white),
    // was a much brighter magenta/purple pair outside the design system
    // entirely.
    confetti({ particleCount: 150, spread: 80, colors: ['#D2042D', '#45050C', '#fff'] });
  }, []);

  return (
    // Flat base fill, matching the design system's "no gradient
    // backgrounds" direction (same treatment as MatchMomentOverlay) --
    // was a full-bleed bright magenta-to-purple gradient outside the
    // locked palette.
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-base">
      <p className="text-4xl font-serif text-ink mb-4">✦ 8 / 8 ✦</p>
      <h1 className="text-5xl font-display text-ink mb-8">Connected</h1>
      <img
        src={womanPhoto}
        alt={womanName}
        className="w-40 h-40 rounded-full object-cover border-4 border-ink mb-6"
      />
      <p className="text-2xl font-display text-ink mb-6">{womanName}</p>
      <div className="w-16 h-px bg-ink/40 mb-6" />
      <p className="text-ink/80 text-center text-sm font-thin max-w-xs mb-8">
        Contact exchange is now unlocked. You can share Instagram, phone, or anything in chat.
      </p>
      <button
        onClick={() => router.push(`/messages/${connectionId}`)}
        className="bg-gold text-ink font-display text-lg px-8 py-3 rounded-pill font-medium hover:bg-[#E8324F] transition-colors"
      >
        Open Chat →
      </button>
    </div>
  );
}
