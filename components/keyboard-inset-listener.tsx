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
// keyboardWillShow again). 500ms is generous enough to bridge a real
// Next.js route transition (mount + autofocus).
//
// The show side ignores repeat events while the keyboard is already up.
// iOS re-fires keyboardWillShow with a slightly different keyboardHeight
// whenever the QuickType predictive-text bar appears/disappears above the
// keys -- which happens continuously while actively typing, as
// suggestions come and go on every keystroke. Reacting to every one of
// those made the CTA visibly bob up and down while the user was mid-word,
// not just on screen transitions. The fix is to only trust the height
// from the first show event after a hide, and ignore every subsequent
// show event until the keyboard actually closes.
const HIDE_DEBOUNCE_MS = 500;

export function KeyboardInsetListener() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let isShown = false;

    const setInset = (px: number) => {
      document.documentElement.style.setProperty('--kb-inset', `${px}px`);
    };

    const showHandle = Keyboard.addListener('keyboardWillShow', (info) => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      if (isShown) return;
      isShown = true;
      setInset(info.keyboardHeight);
    });
    const hideHandle = Keyboard.addListener('keyboardWillHide', () => {
      isShown = false;
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
