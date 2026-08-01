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
// keyboardWillShow again). A first attempt at this used a 120ms debounce
// with a CSS transition, and it was still visibly glitching -- 120ms
// wasn't long enough to bridge a real Next.js route transition (mount +
// autofocus routinely takes longer than that), so the button was
// dropping to full height and animating back on nearly every screen.
// Two changes here: a much more generous 500ms window, and no CSS
// transition at all -- if some edge case still causes a reset, an
// instant snap is far less noticeable than a 220ms animated slide, and
// removing the animation means there's nothing left to visibly "jiggle"
// even if the underlying height value gets reported more than once.
const HIDE_DEBOUNCE_MS = 500;

export function KeyboardInsetListener() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let lastHeight = 0;

    const setInset = (px: number) => {
      if (px === lastHeight) return;
      lastHeight = px;
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
