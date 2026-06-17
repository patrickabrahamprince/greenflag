"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";

interface Props {
  title: string;
  tags: string[];
  selected: string[];
  max: number;
  onChange: (val: string[]) => void;
}

function shuffle(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BubbleSelector({ title, tags, selected, max, onChange }: Props) {
  const shuffled = useMemo(() => shuffle(tags), [tags]);

  function toggle(tag: string) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else if (selected.length < max) {
      onChange([...selected, tag]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-[#F5F5F5] font-medium">{title}</h3>
        <span className="text-xs text-[#F5F5F5]/50">
          Selected: {selected.length}/{max}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {shuffled.map((tag) => {
          const isSelected = selected.includes(tag);
          const isDisabled = !isSelected && selected.length >= max;
          return (
            <motion.button
              key={tag}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(tag)}
              disabled={isDisabled}
              className={`min-h-[44px] rounded-full px-4 py-2 text-sm border transition-all ${
                isSelected
                  ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "border-[#262626] bg-transparent text-[#F5F5F5]"
              } ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:border-[#D4AF37]/50"}`}
            >
              {tag}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
