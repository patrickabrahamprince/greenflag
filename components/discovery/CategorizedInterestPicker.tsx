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

// Curated playful color palette mapping for category pills
const CATEGORY_STYLES: Record<string, { unselected: string; selected: string }> = {
  default: {
    unselected: 'bg-white/90 border-stone-200/90 text-[#382A21] hover:border-emerald-500 shadow-2xs',
    selected: 'bg-[#1D3B2A] text-white border-[#1D3B2A] shadow-md shadow-emerald-950/15 ring-2 ring-emerald-600/20',
  },
  'Travel & Trips': {
    unselected: 'bg-cyan-50/70 border-cyan-200/80 text-cyan-950 hover:border-cyan-500 shadow-2xs',
    selected: 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/25 ring-2 ring-cyan-400/30',
  },
  'Outdoors & Trekking': {
    unselected: 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950 hover:border-emerald-500 shadow-2xs',
    selected: 'bg-[#1D3B2A] text-white border-[#1D3B2A] shadow-md shadow-emerald-900/25 ring-2 ring-emerald-500/30',
  },
  'Food & Cafes': {
    unselected: 'bg-orange-50/70 border-orange-200/80 text-orange-950 hover:border-orange-500 shadow-2xs',
    selected: 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-500/25 ring-2 ring-orange-300/30',
  },
  'Nightlife & Social': {
    unselected: 'bg-purple-50/70 border-purple-200/80 text-purple-950 hover:border-purple-500 shadow-2xs',
    selected: 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/25 ring-2 ring-purple-400/30',
  },
  'Wellness & Lifestyle': {
    unselected: 'bg-amber-50/70 border-amber-200/80 text-amber-950 hover:border-amber-500 shadow-2xs',
    selected: 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/30',
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
        <h2 className="font-display text-lg font-bold text-[#382A21]">{title}</h2>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full shadow-2xs">
          {max ? `${selected.length}/${max}` : `${selected.length} selected`}
        </span>
      </div>
      {description && <p className="text-xs font-medium text-stone-500 mb-4">{description}</p>}

      <div className="space-y-6">
        {categories.map(({ category, items }) => {
          const isExpanded = expanded.has(category);
          const visible = isExpanded ? items : items.slice(0, COLLAPSED_COUNT);
          const hasMore = items.length > COLLAPSED_COUNT;
          const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;

          return (
            <div key={category} className="bg-white/80 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#382A21]/70">
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
                  className="w-full flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-stone-100 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
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
