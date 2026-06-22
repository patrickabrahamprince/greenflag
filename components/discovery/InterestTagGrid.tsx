import { cn } from '@/lib/utils';

interface InterestTagGridProps {
  title: string;
  description: string;
  options: readonly string[];
  selected: string[];
  max: number;
  onToggle: (item: string) => void;
}

export function InterestTagGrid({
  title,
  description,
  options,
  selected,
  max,
  onToggle,
}: InterestTagGridProps) {
  return (
    <div>
      <h2 className="text-xl font-display text-white mb-1">{title}</h2>
      <p className="text-sm text-muted mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const isSelected = selected.includes(item);
          const locked = selected.length >= max && !isSelected;
          return (
            <button
              key={item}
              type="button"
              onClick={() => !locked && onToggle(item)}
              className={cn(
                'px-4 py-2 rounded-full text-sm transition-all duration-300 active:scale-95',
                isSelected
                  ? 'border border-[#D4AF37] bg-[#D4AF37]/10 text-[#EDEADE]'
                  : locked
                  ? 'border border-white/5 bg-transparent text-muted/30 cursor-not-allowed'
                  : 'border border-white/10 bg-transparent text-muted hover:text-white'
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted mt-2">{selected.length}/{max} selected</p>
    </div>
  );
}
