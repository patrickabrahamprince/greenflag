import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn('min-h-dvh bg-base max-w-app mx-auto px-4 pb-24', className)}>
      {children}
    </div>
  );
}
