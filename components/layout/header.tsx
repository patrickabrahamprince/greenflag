'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  return (
    <div className={cn('relative flex items-center justify-between h-16 px-6 bg-base/60 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0 z-40', className)}>
      <div className="flex items-center gap-3">
        {showBack && <BackButton />}
        <div className="flex flex-col">
          <h1 className="font-display font-bold text-xl text-white tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightElement}
        {showBalance && !rightElement && (
          <CoinBadge onClick={() => router.push('/coins')} />
        )}
      </div>
    </div>
  );
}

