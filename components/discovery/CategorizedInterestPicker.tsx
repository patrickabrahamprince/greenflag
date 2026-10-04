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
  /** Omit for unlimited selection -- no pill ever locks. */
  max?: number;
  onToggle: (value: string) => void;
  dataTestIdPrefix?: string;
}

const COLLAPSED_COUNT = 8;

// Curated Marriott Bonvoy style category pills
const CATEGORY_STYLES: Record<string, { unselected: string; selected: string }> = {
  default: {
    unselected: 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-400 hover:bg-stone-100',
    selected: 'bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-sm',
  },
  'Travel & Trips': {
    unselected: 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-400 hover:bg-stone-100',
    selected: 'bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-sm',
  },
  'Outdoors & Trekking': {
    unselected: 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-400 hover:bg-stone-100',
    selected: 'bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-sm',
  },
  'Food & Cafes': {
    unselected: 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-400 hover:bg-stone-100',
    selected: 'bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-sm',
  },
  'Nightlife & Social': {
    unselected: 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-400 hover:bg-stone-100',
    selected: 'bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-sm',
  },
  'Wellness & Lifestyle': {
    unselected: 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-400 hover:bg-stone-100',
    selected: 'bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-sm',
  },
};

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
    <div className="my-2">
      <div className="flex items-baseline justify-between mb-1.5">
        <h2 className="font-display text-lg font-bold text-stone-900">{title}</h2>
        <span className="text-xs font-bold text-stone-900 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
          {max ? `${selected.length}/${max}` : `${selected.length} selected`}
        </span>
      </div>
      {description && <p className="text-xs font-medium text-stone-500 mb-4">{description}</p>}

      <div className="space-y-4">
        {categories.map(({ category, items }) => {
          const isExpanded = expanded.has(category);
          const visible = isExpanded ? items : items.slice(0, COLLAPSED_COUNT);
          const hasMore = items.length > COLLAPSED_COUNT;
          const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;

          return (
            <div key={category} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {category}
                </h3>
                <span className="text-[11px] font-semibold text-stone-400">
                  {items.filter((i) => selected.includes(i)).length > 0 &&
                    `${items.filter((i) => selected.includes(i)).length} active`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {visible.map((item) => {
                  const isSelected = selected.includes(item);
                  const locked = !isSelected && !!max && selected.length >= max;
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
                        'px-3.5 py-2 rounded-full text-xs font-medium border transition-all duration-150 transform active:scale-95 cursor-pointer',
                        isSelected
                          ? `${style.selected} font-bold scale-[1.02]`
                          : locked
                          ? 'bg-stone-100/80 border-stone-200 text-stone-400 cursor-not-allowed opacity-50'
                          : `${style.unselected}`
                      )}
                    >
                      {isSelected ? `✓ ${item}` : item}
                    </button>
                  );
                })}
              </div>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-stone-100 text-xs font-bold text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {isExpanded ? 'Show less' : `Show all ${items.length} options`}
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
