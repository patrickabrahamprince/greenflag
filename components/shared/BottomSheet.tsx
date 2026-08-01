'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Generic dark bottom sheet: drag handle + close button + scrollable body,
// sliding up over a dimmed backdrop. This one component covers every
// "sheet slides up from bottom" moment across the app (login options,
// legal gate, permission primers, feature intros, confirmations) rather
// than each screen rolling its own modal chrome.
export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-app bg-[#140B22] rounded-t-3xl pb-safe-bottom max-h-[90dvh] overflow-y-auto animate-sheet-up">
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3" />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-ink/70 hover:text-ink transition-colors"
        >
          <X size={18} />
        </button>
        <div className="px-6 pt-6">{children}</div>
      </div>
    </div>
  );
}
