'use client';

import { useCoinStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Coins } from 'lucide-react';

interface CoinBadgeProps {
  onClick?: () => void;
  className?: string;
}

export function CoinBadge({ onClick, className }: CoinBadgeProps) {
  const balance = useCoinStore((s) => s.balance);

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-display font-bold text-ink',
        'bg-white hover:bg-well border border-black/[0.08] backdrop-blur-xl',
        'shadow-sm hover:border-gold/40',
        'transition-all duration-200 active:scale-95',
        className
      )}
    >
      <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
        <Coins className="w-2.5 h-2.5 text-amber-600" />
      </div>
      <span className="tracking-tight text-ink font-mono">{balance.toLocaleString()}</span>
    </button>
  );
}

