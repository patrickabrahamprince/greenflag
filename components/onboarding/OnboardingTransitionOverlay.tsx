'use client';

import { useOnboardingTransitionStore } from '@/lib/onboarding/useOnboardingNav';

// Mounted once in app/(auth)/layout.tsx so every onboarding screen's
// forward-navigation click (via useOnboardingNav) gets a shared crossfade
// without each page having to render its own overlay markup.
export function OnboardingTransitionOverlay() {
  const active = useOnboardingTransitionStore((s) => s.active);
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[70] bg-[#0B0614] pointer-events-none transition-opacity duration-200 ease-out"
      style={{ opacity: active ? 1 : 0 }}
    />
  );
}
