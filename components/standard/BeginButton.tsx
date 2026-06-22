'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Loader2 } from 'lucide-react';
import { ConfirmModal } from '@/components/shared/confirm-modal';

interface BeginButtonProps {
  womanId: string;
  coinBalance: number;
  onStarted: (connectionId: string) => void;
}

export function BeginButton({ womanId, coinBalance, onStarted }: BeginButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [starting, setStarting] = useState(false);
  const canBegin = coinBalance >= 100;

  const handleConfirm = async () => {
    setStarting(true);
    try {
      const res = await fetch('/api/connections/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ woman_id: womanId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'insufficient_funds') {
          router.push('/coins');
          return;
        }
        return;
      }
      onStarted(data.connectionId);
    } catch {
      // silent
    } finally {
      setStarting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => (canBegin ? setShowConfirm(true) : router.push('/coins'))}
        disabled={starting}
        className="w-full h-14 rounded-xl bg-[#D4AF37] text-black text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {starting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : canBegin ? (
          <>
            <Coins className="w-5 h-5" />
            Begin — 100 coins
          </>
        ) : (
          <>
            <Coins className="w-5 h-5" />
            Buy Coins
          </>
        )}
      </button>

      <ConfirmModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Begin this Standard?"
        description="100 coins will be deducted. No refunds."
        confirmText={starting ? 'Starting...' : 'Begin'}
        onConfirm={handleConfirm}
      />
    </>
  );
}
