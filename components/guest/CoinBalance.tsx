'use client';

import { useEffect, useRef, useState } from 'react';
import { Coins } from 'lucide-react';

interface CoinBalanceProps {
  balance: number;
}

const COUNT_UP_MS = 600;

// Snaps instantly to a lower balance (a spend, or the initial load) but
// animates a count-up when it increases (a purchase landing) -- that's
// the moment worth celebrating, not every render.
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
    <div data-testid="coin-balance" className="flex flex-col items-center py-8">
      <Coins className="w-10 h-10 text-gold mb-3" />
      <p className={`text-5xl font-display text-gold transition-transform duration-300 ${popped ? 'scale-110' : 'scale-100'}`}>
        {displayed}
      </p>
      <p className="text-muted text-sm mt-1">coins</p>
    </div>
  );
}
