import { cn } from '@/lib/utils';

interface InterestTagGridProps {
  title: string;
  description: string;
  options: readonly string[];
  selected: string[];
  max: number;
  onToggle: (item: string) => void;
  dataTestIdPrefix?: string;
}

export function InterestTagGrid({
  title,
  description,
  options,
  selected,
  max,
  onToggle,
  dataTestIdPrefix,
}: InterestTagGridProps) {
  return (
    <div>
      <h2 className="font-display text-xl text-ink mb-1">{title}</h2>
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
              data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' && dataTestIdPrefix ? `${dataTestIdPrefix}-${item}` : undefined}
              className={cn(
                'px-4 py-2 rounded-full text-sm transition-all duration-300 active:scale-95',
                isSelected
                  ? 'border border-[#C026D3] bg-[#C026D3]/10 text-ink'
                  : locked
                  ? 'border border-[#2A2A2A] bg-transparent text-muted/30 cursor-not-allowed'
                  : 'border border-[#2A2A2A] bg-transparent text-muted hover:text-ink'
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
