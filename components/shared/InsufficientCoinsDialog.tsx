'use client';

import { useRouter } from 'next/navigation';
import { Coins } from 'lucide-react';
import { hapticTap } from '@/lib/haptics';

interface InsufficientCoinsDialogProps {
  message: string;
  onDismiss: () => void;
}

// Was duplicated near-verbatim in app/discover/page.tsx (once for "Meet
// Her Standard", once for gifts) with only the body copy differing --
// consolidated into one component parameterized on message, now also
// reused wherever else INSUFFICIENT_COINS needs the same treatment
// (photo unlock, nudge, reveal-submission, reveal-special).
export function InsufficientCoinsDialog({ message, onDismiss }: InsufficientCoinsDialogProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm bg-base rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Coins className="w-6 h-6 text-gold" />
        </div>
        <h4 className="font-display text-2xl text-ink mb-2">Not Enough Coins</h4>
        <p className="text-ink/60 text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-4">
          <button onClick={onDismiss} className="btn-secondary flex-1 whitespace-nowrap">
            Not Now
          </button>
          <button
            onClick={() => { hapticTap(); onDismiss(); router.push('/coins'); }}
            className="btn-primary flex-1 whitespace-nowrap"
          >
            Buy Coins
          </button>
        </div>
      </div>
    </div>
  );
}
