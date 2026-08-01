'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

// Drives a single global --kb-inset CSS variable from the real native
// keyboard show/hide events (Keyboard resize mode is 'none' -- see
// capacitor.config.ts for why letting Capacitor's own resize modes handle
// this wasn't reliable). One override rule on .min-h-dvh in globals.css
// picks this up everywhere, so there's nothing to wire up per-page.
//
// The hide side is debounced on purpose: tapping Continue between two
// onboarding questions blurs the old input (firing keyboardWillHide)
// right before the next screen's input autofocuses (firing
// keyboardWillShow again) -- without the delay, the Continue button
// visibly dropped to the bottom edge and snapped back up on literally
// every question transition. Waiting a beat to see whether a new
// keyboardWillShow cancels the pending hide turns that into nothing
// happening at all, which is what it should look like.
const HIDE_DEBOUNCE_MS = 120;

export function KeyboardInsetListener() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const setInset = (px: number) => {
      document.documentElement.style.setProperty('--kb-inset', `${px}px`);
    };

    const showHandle = Keyboard.addListener('keyboardWillShow', (info) => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      setInset(info.keyboardHeight);
    });
    const hideHandle = Keyboard.addListener('keyboardWillHide', () => {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setInset(0);
        hideTimer = null;
      }, HIDE_DEBOUNCE_MS);
    });

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      showHandle.then((h) => h.remove());
      hideHandle.then((h) => h.remove());
    };
  }, []);

  return null;
}
