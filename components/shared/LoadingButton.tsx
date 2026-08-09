'use client';

import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface LoadingButtonProps {
  loading: boolean;
  loadingLabel: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  type?: 'button' | 'submit';
}

// Stacks the idle and loading content in the same grid cell (both
// col-start-1 row-start-1, grid sizing to whichever is larger) so the
// button's footprint is fixed as soon as both states exist in the DOM --
// toggling `loading` crossfades in place instead of reflowing the
// button (and whatever sits next to it) the way a plain text-swap
// ternary does.
export function LoadingButton({
  loading,
  loadingLabel,
  icon,
  variant = 'primary',
  disabled,
  onClick,
  className = '',
  children,
  type = 'button',
}: LoadingButtonProps) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${base} grid ${className}`}
    >
      <span
        className={`col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-opacity duration-150 ${loading ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden={loading}
      >
        {icon}
        {children}
      </span>
      <span
        className={`col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-opacity duration-150 ${loading ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden={!loading}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        {loadingLabel}
      </span>
    </button>
  );
}
