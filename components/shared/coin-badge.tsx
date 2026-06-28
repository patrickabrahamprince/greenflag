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
        'flex items-center gap-1.5 bg-surface border border-border rounded-full px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-light transition-colors',
        className
      )}
    >
      <span className="text-gold">◆</span>
      {balance}
    </button>
  );
}
