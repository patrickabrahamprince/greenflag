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
// An on-device debug overlay (components/kb-debug-overlay.tsx) proved the
// CTA was never actually moving while someone was typing -- it only ever
// dropped after tapping away from a field to dismiss the keyboard. The
// real bug was the fixed 500ms wait before committing that close: it was
// sized to survive a real Next.js route transition (blur old field ->
// mount new screen -> autofocus new field), but it made the far more
// common case -- just tapping away on the same screen -- feel like the
// button drops on its own, half a second after you've already moved on,
// disconnected from the keyboard's own ~250-300ms close animation.
//
// Fix: poll document.activeElement every 50ms instead of waiting a flat
// 500ms. A real dismiss (nothing refocuses) commits after two clear
// checks in a row (~100ms) -- fast enough to track the keyboard's own
// animation. A route transition still gets up to 500ms of retries before
// giving up, so it's protected exactly like before; it just no longer
// makes every ordinary tap-away feel delayed.
const HIDE_POLL_MS = 50;
const HIDE_CONFIRM_MS = 100;
const HIDE_MAX_WAIT_MS = 500;

function isTextField(el: Element | null): boolean {
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable);
}

// TEMPORARY: broadcasts every raw native event and every actual DOM write
// so KbDebugOverlay can show ground truth on-device, instead of guessing
// again at what iOS is actually reporting while someone types. Remove
// this + the overlay once the real cause is confirmed.
function debugLog(line: string) {
  window.dispatchEvent(new CustomEvent('kb-debug', { detail: line }));
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
      debugLog(`RAW show ${info.keyboardHeight}px (isShown=${isShown})`);
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      if (isShown) return;
      isShown = true;
      setInset(info.keyboardHeight);
      debugLog(`APPLIED ${info.keyboardHeight}px`);
    });
    const hideHandle = Keyboard.addListener('keyboardWillHide', () => {
      debugLog(`RAW hide (activeElement=${document.activeElement?.tagName})`);
      if (hideTimer) clearTimeout(hideTimer);

      const startedAt = Date.now();
      let clearSince: number | null = null;

      const poll = () => {
        const now = Date.now();
        if (isTextField(document.activeElement)) {
          clearSince = null;
        } else if (clearSince === null) {
          clearSince = now;
        }

        const confirmedClear = clearSince !== null && now - clearSince >= HIDE_CONFIRM_MS;
        const timedOut = now - startedAt >= HIDE_MAX_WAIT_MS;

        if (confirmedClear || timedOut) {
          hideTimer = null;
          isShown = false;
          setInset(0);
          debugLog(`APPLIED 0px (${confirmedClear ? 'confirmed clear' : 'max wait'})`);
          return;
        }
        hideTimer = setTimeout(poll, HIDE_POLL_MS);
      };

      hideTimer = setTimeout(poll, HIDE_POLL_MS);
    });

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      showHandle.then((h) => h.remove());
      hideHandle.then((h) => h.remove());
    };
  }, []);

  return null;
}
