'use client';

import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuOptionProps {
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export function MenuOption({
  icon: Icon,
  iconClassName,
  title,
  description,
  selected,
  disabled,
  onClick,
  className,
}: MenuOptionProps) {
  const isSelectable = selected !== undefined;

  return (
    <button
      type="button"
      role={isSelectable ? 'radio' : undefined}
      aria-checked={isSelectable ? selected : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-tile border border-raised/60 p-4 text-left',
        'transition-all duration-200 ease-out hover:border-raised hover:bg-white/[0.03] active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-50',
        selected && 'border-gold/60 bg-gold/[0.06]',
        className
      )}
    >
      {Icon && (
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5',
            iconClassName
          )}
        >
          <Icon size={18} />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-xs text-ink/50">{description}</span>}
      </span>

      {isSelectable && (
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected ? 'border-gold bg-gold text-ink' : 'border-ink/20 text-transparent'
          )}
        >
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
