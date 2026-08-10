import React from 'react';
import { hapticTap } from '@/lib/haptics';

/** Props for the Bumble‑style interest grid. */
interface InterestGridProps {
  /** Optional prefix for test IDs */
  dataTestIdPrefix?: string;
  /** Optional title displayed above the grid */
  title?: string;
  /** Optional description displayed below the title */
  description?: string;
  /** List of all possible interest options */
  options: string[];
  /** Currently selected interests */
  selected: string[];
  /** Maximum number of selectable items (defaults to all) */
  max?: number;
  /** If true, the grid is read‑only and cannot be changed */
  readOnly?: boolean;
  /** Callback when an option is toggled */
  onToggle?: (key: string, value: string) => void;
}

/** Bumble‑style interest grid. Displays options as toggleable pills. */
export const InterestGrid: React.FC<InterestGridProps> = ({
  dataTestIdPrefix,
  title,
  description,
  options,
  selected,
  max = options.length,
  readOnly = false,
  onToggle,
}) => {
  const handleClick = (option: string) => {
    if (readOnly || !onToggle) return;
    // Every other tappable control in onboarding pairs a scale-down with
    // a haptic tap -- these chips only had the scale, which read as dead
    // next to everything around them.
    hapticTap();
    const isSelected = selected.includes(option);
    if (isSelected) {
      onToggle('have', option);
    } else if (selected.length < max) {
      onToggle('have', option);
    }
  };

  return (
    <div className="interest-grid my-4">
      <div className="flex items-baseline justify-between mb-1.5">
        {title && <h2 className="font-display text-base text-ink">{title}</h2>}
        <span className="text-xs font-semibold text-gold">{selected.length}/{max}</span>
      </div>
      {description && <p className="text-xs text-ink/50 mb-2.5">{description}</p>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          const baseClasses =
            'px-3 py-1.5 rounded-pill text-xs font-medium transition-all cursor-pointer select-none active:scale-90';
          // Selected = solid Mindaro + dark text, unselected = transparent
          // + 1px Lavender border + white text, per the design system's
          // chip spec. The selected state was previously bg-gold
          // (Mindaro) + text-white -- the exact unreadable pairing the
          // system's own contrast rule warns about.
          const selectedClasses = 'bg-gold text-ink-dark';
          const unselectedClasses =
            'bg-transparent border border-lavender/40 text-ink hover:border-lavender/70';
          return (
            <span
              key={opt}
              className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
              onClick={() => handleClick(opt)}
              {...(dataTestIdPrefix ? { 'data-testid': `${dataTestIdPrefix}-${opt.replace(/\s+/g, '-').toLowerCase()}` } : {})}
            >
              {opt}
            </span>
          );
        })}
      </div>
    </div>
  );
};
