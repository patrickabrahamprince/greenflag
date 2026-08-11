'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonVariant = 'glass' | 'dark' | 'lavender' | 'accent';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: IconButtonVariant;
}

// Deck's circular card actions (Dismiss/Gift/Like row) are flat fills,
// not the glassmorphism this app used before the Dateasy system --
// 'dark' is the recessed/well fill for dismiss-style actions, 'lavender'
// a secondary positive action, 'accent' the Pinkish-Red primary/like
// treatment. 'glass' is kept as the original translucent style for any
// future non-card-action consumer. active:scale-[0.92] is more
// pronounced than the pill buttons' 0.98 -- a small circular target
// needs more visible press feedback than a full-width pill does.
const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  glass: 'glass-surface text-ink',
  dark: 'bg-well text-ink',
  lavender: 'bg-lavender text-ink',
  accent: 'bg-[#D2042D] text-white',
};

export function IconButton({ icon, label, variant = 'dark', className = '', type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={`${VARIANT_CLASSES[variant]} w-14 h-14 rounded-full flex items-center justify-center active:scale-[0.92] transition-all duration-200 disabled:opacity-50 ${className}`}
      {...rest}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
