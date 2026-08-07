'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { PermissionPrimer } from './PermissionPrimer';
import { useUserStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useEnableNotifications } from '@/lib/hooks/useEnableNotifications';

// Shown exactly once, automatically, the first time someone lands on a
// real post-onboarding screen -- previously the only way to ever see the
// "enable notifications" prompt was to already know it existed and go
// dig it out of Settings, so almost nobody would have. Gated on the
// current route (not just onboarding_completed, which flips true mid-
// flow right after the photos step -- see
// app/(auth)/onboard/profile/photos/page.tsx) so it can't pop up while
// someone's still partway through onboarding.
export function NotificationPermissionPrimer() {
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const { enable } = useEnableNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  const onOnboardingOrAuthRoute = pathname?.startsWith('/onboard') || pathname === '/login';
  const shouldShow = !!user && !!user.onboarding_completed && !user.push_primer_shown && !onOnboardingOrAuthRoute && !dismissed;

  const markShown = async (currentUser: NonNullable<typeof user>) => {
    setUser({ ...currentUser, push_primer_shown: true });
    const supabase = createClient();
    await supabase.from('profiles').update({ push_primer_shown: true }).eq('id', currentUser.id);
  };

  const handleConfirm = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const granted = await enable();
      toast[granted ? 'success' : 'error'](granted ? 'Notifications enabled' : 'Notification permission denied');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong enabling notifications');
    } finally {
      setBusy(false);
      setDismissed(true);
      markShown(user);
    }
  };

  const handleSkip = () => {
    if (!user) return;
    setDismissed(true);
    markShown(user);
  };

  return (
    <PermissionPrimer
      open={shouldShow}
      icon={<Bell className="w-6 h-6 text-gold" />}
      title="Never miss a moment"
      description="Get notified the instant someone meets your Standard, a match is approved, or a new message comes in."
      confirmLabel={busy ? 'Enabling...' : 'Enable Notifications'}
      skipLabel="Not Now"
      onConfirm={handleConfirm}
      onSkip={handleSkip}
    />
  );
}
