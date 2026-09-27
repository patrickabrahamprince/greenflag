'use client';

import { useEffect, useRef, useState } from 'react';
import { Coins, Sparkles } from 'lucide-react';

interface CoinBalanceProps {
  balance: number;
}

const COUNT_UP_MS = 600;

export function CoinBalance({ balance }: CoinBalanceProps) {
  const [displayed, setDisplayed] = useState(balance);
  const prevBalance = useRef(balance);
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    const from = prevBalance.current;
    prevBalance.current = balance;

    if (balance <= from) {
      setDisplayed(balance);
      return;
    }

    setPopped(true);
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_UP_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (balance - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const popTimer = setTimeout(() => setPopped(false), COUNT_UP_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(popTimer);
    };
  }, [balance]);

  return (
    <div data-testid="coin-balance" className="relative flex flex-col items-center pt-4 pb-8">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-gradient-to-r from-emerald/20 via-gold/25 to-emerald/20 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="relative mb-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/25 via-gold/10 to-transparent border border-gold/30 flex items-center justify-center shadow-glow-gold">
          <Coins className="w-7 h-7 text-gold" />
        </div>
        <Sparkles className="w-4 h-4 text-emerald absolute -top-1 -right-1 animate-bounce" />
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <p className={`text-5xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold to-amber-500 transition-transform duration-300 ${popped ? 'scale-110' : 'scale-100'}`}>
          {displayed.toLocaleString()}
        </p>
      </div>
      <p className="text-xs font-semibold text-ink/50 uppercase tracking-widest mt-1">Available Coins</p>
    </div>
  );
}

