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
// Two things had to be true at once to actually stop the CTA from
// bobbing while someone was mid-keystroke, and an earlier version of
// this file only had the first one:
//
// 1. Ignore repeat keyboardWillShow events while the keyboard is already
//    up (iOS re-fires it with a slightly different keyboardHeight
//    whenever the QuickType suggestion bar changes, which happens on
//    basically every keystroke).
// 2. That guard is worthless if keyboardWillHide clears it immediately --
//    a stray hide (same QuickType-bar churn can also produce a brief
//    hide/show pair, not just a show with a new height) reset the "am I
//    already shown" flag straight away, so the very next show slipped
//    past the guard and re-applied the inset anyway. The flag now only
//    flips back to false once the debounced close actually commits.
//
// As a second line of defense, the debounced close also checks
// document.activeElement right before committing: if a text field is
// still focused at that point, the hide that started the timer wasn't a
// real dismissal (focus never moves during typing), so the close is
// skipped entirely and nothing is touched.
const HIDE_DEBOUNCE_MS = 500;

function isTextField(el: Element | null): boolean {
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable);
}

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
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        hideTimer = null;
        if (isTextField(document.activeElement)) return;
        isShown = false;
        setInset(0);
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
