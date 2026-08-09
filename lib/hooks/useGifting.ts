'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCoinStore } from '@/lib/store';
import { hapticDecision, hapticSuccess } from '@/lib/haptics';

// Extracted out of app/discover/page.tsx alongside useNudge/usePhotoUnlock
// -- behavior unchanged, purely a move.
export function useGifting(onInsufficientCoins: (message: string) => void) {
  const [giftPickerProfileId, setGiftPickerProfileId] = useState<string | null>(null);
  const [sendingGiftType, setSendingGiftType] = useState<string | null>(null);
  const deductCoins = useCoinStore((s) => s.deduct);

  async function handleSendGift(profileId: string, giftTypeId: string) {
    if (sendingGiftType) return;
    hapticDecision();
    setSendingGiftType(giftTypeId);
    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: profileId, giftType: giftTypeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGiftPickerProfileId(null);
        if (data.error === 'INSUFFICIENT_COINS') {
          onInsufficientCoins('You need more coins to send this gift. Top up to keep going.');
        } else {
          toast.error(data.error || 'Failed to send gift');
        }
        return;
      }
      deductCoins(data.cost);
      hapticSuccess();
      setGiftPickerProfileId(null);
      toast.success('Gift sent!');
    } catch {
      toast.error('Failed to send gift');
    } finally {
      setSendingGiftType(null);
    }
  }

  return {
    giftPickerProfileId,
    sendingGiftType,
    openGiftPicker: setGiftPickerProfileId,
    closeGiftPicker: () => setGiftPickerProfileId(null),
    handleSendGift,
  };
}
