'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

// Drives a single global --kb-inset CSS variable from the real native
// keyboard show/hide events (Keyboard resize mode is 'none' -- see
// capacitor.config.ts for why letting Capacitor's own resize modes handle
// this wasn't reliable). Every screen picks this up through one rule in
// globals.css (body padding-bottom), so there's nothing to wire up
// per-page: a bottom-pinned Continue button already sits inside the
// body's flow and gets pushed up automatically when the variable changes.
export function KeyboardInsetListener() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setInset = (px: number) => {
      document.documentElement.style.setProperty('--kb-inset', `${px}px`);
    };

    const showHandle = Keyboard.addListener('keyboardWillShow', (info) => {
      setInset(info.keyboardHeight);
    });
    const hideHandle = Keyboard.addListener('keyboardWillHide', () => {
      setInset(0);
    });

    return () => {
      showHandle.then((h) => h.remove());
      hideHandle.then((h) => h.remove());
    };
  }, []);

  return null;
}
