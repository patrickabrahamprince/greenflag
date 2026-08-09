'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
}

// 46x46px circular glass-surface button for card-level icon actions
// (pass, gift, etc). active:scale-[0.92] is more pronounced than the
// pill buttons' 0.98 -- a 46px target needs more visible press feedback
// than a full-width pill does. Formalizes the ad-hoc
// `glass-surface size-11 rounded-full` pattern already used inline on
// Discover into one reusable component.
export function IconButton({ icon, label, className = '', type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={`glass-surface w-[46px] h-[46px] rounded-full flex items-center justify-center active:scale-[0.92] transition-all duration-200 disabled:opacity-50 ${className}`}
      {...rest}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
