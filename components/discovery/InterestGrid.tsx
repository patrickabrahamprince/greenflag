import React from 'react';

interface InterestGridProps {
  title?: string;
  description?: string;
  options: string[];
  selected: string[];
  max?: number;
  readOnly?: boolean;
  onToggle?: (key: string, value: string) => void; // key is 'have' or 'looking'
}

export const InterestGrid: React.FC<InterestGridProps> = ({
  title,
  description,
  options,
  selected,
  max = options.length,
  readOnly = false,
  onToggle,
}) => {
  const handleClick = (option: string) => {
    if (readOnly) return;
    if (!onToggle) return;
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
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          const baseClasses =
            'px-6 py-3 rounded-full text-base transition-all cursor-pointer select-none active:scale-95 duration-200';
          const selectedClasses =
            'bg-gold/10 border border-gold text-white font-medium shadow-md shadow-gold/5';
          const unselectedClasses =
            'bg-[#1C1C1E] border border-[#2C2C2E] text-[#EDEADE]/80 hover:border-[#3C3C3E]';
          return (
            <span
              key={opt}
              className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
              onClick={() => handleClick(opt)}
            >
              {opt}
            </span>
          );
        })}
      </div>
    </div>
  );
};
