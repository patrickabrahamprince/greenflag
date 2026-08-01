'use client';

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Reserved for real decision moments -- a like/match, a coin spend, a
// destructive confirm -- not taps or scrolls. Firing on everything turns
// haptics into noise instead of feedback. No-ops in the browser (Haptics
// throws on web without a real device API), so these are safe to call
// unconditionally from shared code.

export function hapticTap(): void {
  if (!Capacitor.isNativePlatform()) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

export function hapticDecision(): void {
  if (!Capacitor.isNativePlatform()) return;
  Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
}

export function hapticSuccess(): void {
  if (!Capacitor.isNativePlatform()) return;
  Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}

export function hapticWarning(): void {
  if (!Capacitor.isNativePlatform()) return;
  Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
}
