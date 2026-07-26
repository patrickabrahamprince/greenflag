'use client';

import { useState, useEffect } from 'react';

function getMidnightIST(): Date {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  istNow.setHours(24, 0, 0, 0);
  return new Date(istNow.getTime() - istOffset);
}

export function DailyLimitReached() {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = getMidnightIST().getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('Refreshing now...');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-6">
        <span className="text-4xl">✨</span>
      </div>
      <h2 className="text-xl font-bold text-[#EDEADE] mb-2">
        Come back tomorrow
      </h2>
      <p className="text-sm text-[#9DA0A6] mb-6 max-w-xs">
        New women daily. You&apos;ve seen them all for today.
      </p>
      <div className="bg-[#1C1C1E] rounded-xl px-6 py-3">
        <p className="text-xs text-[#9DA0A6] mb-1">Resets in</p>
        <p className="text-lg font-mono font-bold text-[#C026D3]">{countdown}</p>
      </div>
    </div>
  );
}
