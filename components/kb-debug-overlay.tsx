'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

// TEMPORARY diagnostic overlay -- shows exactly what the native keyboard
// plugin is reporting and what we're actually applying, live, on-device.
// Four rounds of fixing keyboard-inset-listener.tsx based on theories
// about what iOS *should* be doing didn't stop the CTA jitter, so this
// replaces the next theory with a ground-truth readout instead. Remove
// this file + its mount in providers.tsx once the real cause is found.
export function KbDebugOverlay() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      const stamp = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
      setLines((prev) => [`${stamp} ${detail}`, ...prev].slice(0, 8));
    };
    window.addEventListener('kb-debug', handler);
    return () => window.removeEventListener('kb-debug', handler);
  }, []);

  if (!Capacitor.isNativePlatform()) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top, 0px)',
        left: 0,
        right: 0,
        zIndex: 999999,
        background: 'rgba(0,0,0,0.85)',
        color: '#39FF14',
        fontFamily: 'monospace',
        fontSize: '9px',
        lineHeight: 1.4,
        padding: '4px 6px',
        pointerEvents: 'none',
        maxHeight: '110px',
        overflow: 'hidden',
      }}
    >
      {lines.length === 0 ? 'kb-debug: waiting for a keyboard event...' : lines.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
}
