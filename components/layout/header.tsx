'use client';

import type { ReactNode } from 'react';
import { BackButton } from './back-button';
import { CoinBadge } from '@/components/shared/coin-badge';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: ReactNode;
  showBalance?: boolean;
  className?: string;
}

export function Header({
  title,
  subtitle,
  showBack = true,
  rightElement,
  showBalance,
  className,
}: HeaderProps) {
  return (
    <div className={cn('relative flex items-center justify-center py-4', className)}>
      {showBack && <BackButton />}
      <div className="flex flex-col items-center">
        <h1 className="text-lg font-display font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-[10px] text-[#8E8E93]">{subtitle}</p>
        )}
      </div>
      {rightElement ? (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>
      ) : showBalance ? (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <CoinBadge />
        </div>
      ) : null}
    </div>
  );
}
