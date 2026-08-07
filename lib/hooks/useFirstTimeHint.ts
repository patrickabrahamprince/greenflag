'use client';

import { useEffect, useState } from 'react';

// Same localStorage-flag pattern already established for the mic-priming
// screen (MIC_PRIMED_KEY in SubmitSheet.tsx) -- shows once per device per
// key, never again, no backend round trip needed for something this low-
// stakes. Used for one-time instructional hints on non-obvious gestures
// (swipe up on Discover, swipe to pin/delete on Notifications, etc).
export function useFirstTimeHint(key: string) {
  const storageKey = `gf_hint_${key}`;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(storageKey)) setShow(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const dismiss = () => {
    if (typeof window !== 'undefined') localStorage.setItem(storageKey, '1');
    setShow(false);
  };

  return { show, dismiss };
}
