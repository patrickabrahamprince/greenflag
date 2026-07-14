import React from 'react';

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
    const isSelected = selected.includes(option);
    if (isSelected) {
      onToggle('have', option);
    } else if (selected.length < max) {
      onToggle('have', option);
    }
  };

  return (
    <div className="interest-grid my-6">
      {title && <h2 className="font-['Playfair_Display'] text-xl text-ink mb-2">{title}</h2>}
      {description && <p className="text-sm text-[#9DA0A6] mb-4">{description}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          const baseClasses =
            'px-3 py-1 rounded-xl text-xs transition-all cursor-pointer select-none';
          const selectedClasses =
            'bg-gold/10 border border-gold text-ink font-medium';
          const unselectedClasses =
            'bg-[#1C1C1E] border border-[#2A2A2A] text-ink/70 hover:border-ink/30';
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
