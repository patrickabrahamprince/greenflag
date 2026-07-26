'use client';

import { useCoinStore } from '@/lib/store';
import { cn } from '@/lib/utils';

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
        'glass-surface flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-display font-bold text-ink transition-colors',
        className
      )}
    >
      <span className="text-gold">◆</span>
      {balance}
    </button>
  );
}
