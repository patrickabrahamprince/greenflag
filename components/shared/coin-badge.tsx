'use client';

import { useCoinStore, useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface CoinBadgeProps {
  onClick?: () => void;
  className?: string;
}

export function CoinBadge({ onClick, className }: CoinBadgeProps) {
  const balance = useCoinStore((s) => s.balance);
  const persona = useUserStore((s) => s.user?.persona);

  // Women never pay on the app -- surfacing a coin balance she can't
  // (mostly) spend is just confusing. Hiding it here, in the one shared
  // component, covers every screen that renders a CoinBadge.
  if (persona === 'woman') return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'glass-surface border-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-display font-bold text-ink transition-colors',
        className
      )}
    >
      <span className="text-gold">◆</span>
      {balance}
    </button>
  );
}
