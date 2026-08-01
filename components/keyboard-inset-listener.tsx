'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

// Drives a single global --kb-inset CSS variable from the real native
// keyboard show events (Keyboard resize mode is 'none' -- see
// capacitor.config.ts for why letting Capacitor's own resize modes handle
// this wasn't reliable). One override rule on .min-h-dvh in globals.css
// picks this up everywhere, so there's nothing to wire up per-page.
//
// Confirmed on-device: the CTA never moved while someone was typing --
// only when the keyboard actually closed. Several rounds of fixing found
// it snappier each time, but the button repositioning at all when the
// keyboard closes -- even instantly, with no animation -- was itself the
// complaint. So this no longer reacts to keyboardWillHide at all: once a
// field is focused and the CTA rises above the keyboard, it stays there
// for the rest of that screen. The inset only resets back to 0 when the
// route actually changes (a real navigation to a different screen),
// which is a completely different, unambiguous signal that has nothing
// to do with how iOS happens to sequence keyboard show/hide events.
export function KeyboardInsetListener() {
  const pathname = usePathname();
  const isShownRef = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    document.documentElement.style.setProperty('--kb-inset', '0px');
    isShownRef.current = false;
  }, [pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const showHandle = Keyboard.addListener('keyboardWillShow', (info) => {
      if (isShownRef.current) return;
      isShownRef.current = true;
      document.documentElement.style.setProperty('--kb-inset', `${info.keyboardHeight}px`);
    });

    return () => {
      showHandle.then((h) => h.remove());
    };
  }, []);

  return null;
}
