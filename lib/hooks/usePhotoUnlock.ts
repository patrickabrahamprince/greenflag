'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCoinStore } from '@/lib/store';

// Extracted out of app/discover/page.tsx alongside useNudge/useGifting --
// behavior unchanged, purely a move.
export function usePhotoUnlock(onInsufficientCoins: (message: string) => void) {
  const [photoUnlockConfirm, setPhotoUnlockConfirm] = useState<string | null>(null);
  const [unlockingPhotoId, setUnlockingPhotoId] = useState<string | null>(null);
  const [unlockedPhotoIds, setUnlockedPhotoIds] = useState<Set<string>>(new Set());
  const deductCoins = useCoinStore((s) => s.deduct);

  async function handlePhotoUnlock(profileId: string) {
    setUnlockingPhotoId(profileId);
    try {
      const res = await fetch(`/api/photo-unlock/${profileId}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'INSUFFICIENT_COINS') {
          onInsufficientCoins('You need more coins to unlock her photos. Top up to keep going.');
        } else {
          toast.error(data.error || 'Failed to unlock photos');
        }
        return;
      }
      if (!data.alreadyUnlocked && data.cost) {
        deductCoins(data.cost);
      }
      setUnlockedPhotoIds((prev) => new Set(prev).add(profileId));
    } catch {
      toast.error('Failed to unlock photos');
    } finally {
      setUnlockingPhotoId(null);
    }
  }

  return {
    photoUnlockConfirm,
    unlockingPhotoId,
    unlockedPhotoIds,
    openPhotoUnlockConfirm: setPhotoUnlockConfirm,
    closePhotoUnlockConfirm: () => setPhotoUnlockConfirm(null),
    handlePhotoUnlock,
  };
}
