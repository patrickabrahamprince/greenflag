'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useOnboardingTransitionStore } from '@/lib/onboarding/useOnboardingNav';

// A stuck-black-screen failsafe -- if navigation somehow never actually
// changes the route (a thrown error, a blocked redirect), this clears the
// overlay anyway rather than leaving the screen black forever.
const FAILSAFE_MS = 2500;

// Mounted once in app/(auth)/layout.tsx so every onboarding screen's
// forward-navigation click (via useOnboardingNav) gets a shared crossfade
// without each page having to render its own overlay markup.
export function OnboardingTransitionOverlay() {
  const active = useOnboardingTransitionStore((s) => s.active);
  const deactivate = useOnboardingTransitionStore((s) => s.deactivate);
  const pathname = usePathname();
  const mounted = useRef(false);

  // Ties the fade-back-out to the route actually having changed, instead
  // of a guessed delay -- see useOnboardingNav.ts for why a fixed timeout
  // here raced real navigation and flashed the old screen back into view.
  useEffect(() => {
    if (mounted.current) deactivate();
    mounted.current = true;
  }, [pathname, deactivate]);

  useEffect(() => {
    if (!active) return;
    const id = setTimeout(deactivate, FAILSAFE_MS);
    return () => clearTimeout(id);
  }, [active, deactivate]);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[70] bg-[#0B0614] pointer-events-none transition-opacity duration-200 ease-out flex items-center justify-center"
      style={{ opacity: active ? 1 : 0 }}
    >
      {/* A plain color fade read as "a blur screen" flashing between
          pages -- a small centered logo gives the pause something to
          look at instead of a blank flat color. */}
      <img
        src="/logo.png"
        alt=""
        className="w-16 h-16 transition-transform duration-200 ease-out"
        style={{ transform: active ? 'scale(1)' : 'scale(0.85)' }}
      />
    </div>
  );
}
