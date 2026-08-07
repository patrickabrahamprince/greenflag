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
    <div className={cn('relative flex items-center justify-center h-16 px-8 bg-[#000000]/80 backdrop-blur-xl border-b border-[#2A2A2A]', className)}>
      {showBack && <BackButton />}
      <div className="flex flex-col items-center">
        <h1 className="font-display text-2xl text-ink tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[10px] uppercase tracking-widest text-ink/40">{subtitle}</p>
        )}
      </div>
      {rightElement ? (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>
      ) : showBalance ? (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <CoinBadge onClick={() => router.push('/coins')} />
        </div>
      ) : null}
    </div>
  );
}
