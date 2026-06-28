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
      {title && <h2 className="text-xl font-display text-white mb-2">{title}</h2>}
      {description && <p className="text-sm text-[#8E8E93] mb-4">{description}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          const baseClasses =
            'px-3 py-1 rounded-full text-xs transition-all cursor-pointer select-none';
          const selectedClasses =
            'bg-gold/10 border border-gold text-white font-medium shadow-md shadow-gold/5';
          const unselectedClasses =
            'bg-[#1C1C1E] border border-[#2C2CE] text-[#EDEADE]/80 hover:border-[#3C3C3E]';
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
