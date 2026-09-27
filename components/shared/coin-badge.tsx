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
        'group relative flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-display font-bold text-white',
        'bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 backdrop-blur-xl',
        'shadow-[0_2px_12px_rgba(0,0,0,0.4)] hover:shadow-glow-gold hover:border-gold/40',
        'transition-all duration-200 active:scale-95',
        className
      )}
    >
      <div className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center text-gold">
        <Coins className="w-2.5 h-2.5 text-gold" />
      </div>
      <span className="tracking-tight text-white font-mono">{balance.toLocaleString()}</span>
    </button>
  );
}

