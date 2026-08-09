'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCoinStore } from '@/lib/store';
import { hapticDecision } from '@/lib/haptics';

// Extracted out of app/discover/page.tsx, which had grown to mix 5
// largely independent paid-action flows (pagination, likes, photo
// unlock, nudge, gifting) in one component. Behavior is unchanged --
// this is purely a move, not a rewrite.
export function useNudge(onInsufficientCoins: (message: string) => void) {
  const [nudgingId, setNudgingId] = useState<string | null>(null);
  const [nudgeDialog, setNudgeDialog] = useState<{ visible: boolean; charged: boolean; cost: number } | null>(null);
  const [nudgeConfirm, setNudgeConfirm] = useState<{ profileId: string; cost: number } | null>(null);
  const deductCoins = useCoinStore((s) => s.deduct);

  function showNudgeSentDialog(charged: boolean, cost: number) {
    setNudgeDialog({ visible: true, charged, cost });
    setTimeout(() => setNudgeDialog((prev) => (prev ? { ...prev, visible: false } : null)), 1400);
    setTimeout(() => setNudgeDialog(null), 1900);
  }

  async function sendNudge(profileId: string, confirm: boolean) {
    const res = await fetch(`/api/nudge/${profileId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === 'INSUFFICIENT_COINS') {
        onInsufficientCoins('You need more coins to nudge again. Top up to keep going.');
      } else {
        toast.error(data.error || 'Failed to send nudge');
      }
      return;
    }
    if (data.needsConfirm) {
      setNudgeConfirm({ profileId, cost: data.cost });
      return;
    }
    if (data.charged && data.cost) {
      deductCoins(data.cost);
    }
    showNudgeSentDialog(!!data.charged, data.cost || 0);
  }

  async function handleNudge(profileId: string) {
    if (nudgingId) return;
    hapticDecision();
    setNudgingId(profileId);
    try {
      await sendNudge(profileId, false);
    } catch {
      toast.error('Failed to send nudge');
    } finally {
      setNudgingId(null);
    }
  }

  async function handleConfirmNudge() {
    if (!nudgeConfirm) return;
    const { profileId } = nudgeConfirm;
    setNudgingId(profileId);
    try {
      await sendNudge(profileId, true);
    } catch {
      toast.error('Failed to send nudge');
    } finally {
      setNudgingId(null);
      setNudgeConfirm(null);
    }
  }

  return {
    nudgingId,
    nudgeDialog,
    nudgeConfirm,
    handleNudge,
    handleConfirmNudge,
    cancelNudgeConfirm: () => setNudgeConfirm(null),
  };
}
