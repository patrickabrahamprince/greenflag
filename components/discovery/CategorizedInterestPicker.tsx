'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hapticTap } from '@/lib/haptics';
import type { InterestCategory } from '@/lib/constants/interestCategories';

interface CategorizedInterestPickerProps {
  title: string;
  description?: string;
  categories: InterestCategory[];
  selected: string[];
  max: number;
  onToggle: (value: string) => void;
  dataTestIdPrefix?: string;
}

// How many pills a category shows before "Show more" -- matches the
// reference taxonomy's own collapse point (two rows on a phone-width
// screen), not an arbitrary number.
const COLLAPSED_COUNT = 7;

export function CategorizedInterestPicker({
  title,
  description,
  categories,
  selected,
  max,
  onToggle,
  dataTestIdPrefix,
}: CategorizedInterestPickerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    hapticTap();
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const handlePillClick = (item: string, locked: boolean) => {
    if (locked) return;
    hapticTap();
    onToggle(item);
  };

  return (
    <div className="my-4">
      <div className="flex items-baseline justify-between mb-1.5">
        <h2 className="font-display text-base text-ink">{title}</h2>
        <span className="text-xs font-semibold text-gold">{selected.length}/{max}</span>
      </div>
      {description && <p className="text-xs text-ink/50 mb-2.5">{description}</p>}

      <div className="space-y-5">
        {categories.map(({ category, items }) => {
          const isExpanded = expanded.has(category);
          const visible = isExpanded ? items : items.slice(0, COLLAPSED_COUNT);
          const hasMore = items.length > COLLAPSED_COUNT;

          return (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-2">
                {category}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {visible.map((item) => {
                  const isSelected = selected.includes(item);
                  const locked = !isSelected && selected.length >= max;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handlePillClick(item, locked)}
                      data-testid={
                        process.env.NEXT_PUBLIC_E2E_TESTING === 'true' && dataTestIdPrefix
                          ? `${dataTestIdPrefix}-${item.replace(/\s+/g, '-').toLowerCase()}`
                          : undefined
                      }
                      className={cn(
                        'px-3 py-1.5 rounded-pill text-xs font-medium transition-all active:scale-90',
                        isSelected
                          ? 'bg-gold text-ink'
                          : locked
                          ? 'bg-transparent border border-lavender/15 text-ink/30 cursor-not-allowed'
                          : 'bg-transparent border border-lavender/40 text-ink hover:border-lavender/70'
                      )}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-3 mt-3 text-xs font-semibold text-ink/50 hover:text-ink/80 transition-colors"
                >
                  <span className="flex-1 h-px bg-white/10" />
                  {isExpanded ? 'Show less' : 'Show more'}
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span className="flex-1 h-px bg-white/10" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
