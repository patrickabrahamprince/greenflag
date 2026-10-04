'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  theme?: 'light' | 'dark';
}

// Bottom sheet: drag handle + close button + scrollable body,
// sliding up over a dimmed backdrop. Supports light (clean white) and dark themes.
export function BottomSheet({ open, onClose, children, className = '', theme = 'light' }: BottomSheetProps) {
  if (!open) return null;

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div
        className={`relative w-full max-w-app ${
          isLight ? 'bg-white text-[#1C1C1E]' : 'bg-[#18181B] text-white'
        } rounded-t-3xl pb-safe-bottom max-h-[90dvh] overflow-y-auto scrollbar-hide shadow-2xl border-t ${
          isLight ? 'border-stone-200/80' : 'border-white/10'
        } animate-sheet-up ${className}`}
      >
        <div className={`w-10 h-1.5 rounded-full ${isLight ? 'bg-stone-300' : 'bg-white/20'} mx-auto mt-3`} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-4 w-8 h-8 rounded-full ${
            isLight ? 'bg-stone-100 hover:bg-stone-200 text-stone-600' : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
          } flex items-center justify-center active:scale-90 transition-all`}
        >
          <X size={18} />
        </button>
        <div className="px-6 pt-4 pb-6">{children}</div>
      </div>
    </div>
  );
}

