'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useEnableNotifications } from '@/lib/hooks/useEnableNotifications';

// Fires the real native/browser permission dialog directly, exactly once,
// the first time someone lands on a real post-onboarding screen -- no
// custom in-app screen first. Gated on the current route (not just
// onboarding_completed, which flips true mid-flow right after the photos
// step -- see app/(auth)/onboard/profile/photos/page.tsx) so it can't
// fire while someone's still partway through onboarding.
export function NotificationPermissionPrimer() {
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const { enable } = useEnableNotifications();
  const firedRef = useRef(false);

  const onOnboardingOrAuthRoute = pathname?.startsWith('/onboard') || pathname === '/login';
  const shouldFire = !!user && !!user.onboarding_completed && !user.push_primer_shown && !onOnboardingOrAuthRoute;

  useEffect(() => {
    if (!shouldFire || firedRef.current || !user) return;
    firedRef.current = true;

    const run = async () => {
      try {
        await enable();
      } catch {
        // Denied or unsupported -- nothing to do, just don't ask again.
      }
      setUser({ ...user, push_primer_shown: true });
      const supabase = createClient();
      await supabase.from('profiles').update({ push_primer_shown: true }).eq('id', user.id);
    };
    run();
  }, [shouldFire, user, enable, setUser]);

  return null;
}
