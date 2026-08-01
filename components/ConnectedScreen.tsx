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
    confetti({ particleCount: 150, spread: 80, colors: ['#D946EF', '#fff', '#6B21A8'] });
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#D946EF] to-[#6B21A8]">
      <p className="text-4xl font-serif text-white mb-4">✦ 8 / 8 ✦</p>
      <h1 className="text-5xl font-display text-white mb-8">Connected</h1>
      <img
        src={womanPhoto}
        alt={womanName}
        className="w-40 h-40 rounded-full object-cover border-4 border-white mb-6"
      />
      <p className="text-2xl font-display text-white mb-6">{womanName}</p>
      <div className="w-16 h-px bg-white/40 mb-6" />
      <p className="text-white/80 text-center text-sm font-thin max-w-xs mb-8">
        Contact exchange is now unlocked. You can share Instagram, phone, or anything in chat.
      </p>
      <button
        onClick={() => router.push(`/messages/${connectionId}`)}
        className="bg-gold text-black font-display text-lg px-8 py-3 rounded-full font-medium hover:bg-[#86198F] transition-colors"
      >
        Open Chat →
      </button>
    </div>
  );
}
