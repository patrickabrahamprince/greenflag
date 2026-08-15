'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useOnboardingStore } from '@/lib/store';
import { LoadingLogo } from '@/components/shared/LoadingLogo';

// A WKWebView reload mid-onboarding (memory pressure from the full-res
// background photo nearly every onboarding screen preloads, or the OAuth
// redirect round trip) recreates the whole JS context from scratch.
// Zustand's persist middleware then rehydrates name/age/city/etc. from
// localStorage asynchronously -- there's a real window where a
// freshly-mounted onboarding page's own redirect guard
// (`if (!name) router.replace(...)`, repeated across ~10 pages) runs
// against the *default* empty state before that rehydration finishes,
// bouncing someone with real, already-saved answers back to an earlier
// step. That looked exactly like "onboarding gets stuck in a loop."
// Gating every /onboard route on hasHydrated() closes that race at one
// point instead of touching each page's guard individually.
export function OnboardingHydrationGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Starts false unconditionally -- the store's `.persist` API must only
  // ever be touched inside an effect (never during the initial render,
  // which also runs server-side during prerender/SSR where this API
  // isn't available) to avoid crashing static generation.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useOnboardingStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useOnboardingStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  if (!hydrated && pathname?.startsWith('/onboard')) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-base">
        <LoadingLogo />
      </div>
    );
  }

  return <>{children}</>;
}
