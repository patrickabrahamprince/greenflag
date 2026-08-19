'use client';

import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { useUserStore } from '@/lib/store';
import { useNativePush } from '@/lib/hooks/useNativePush';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

async function subscribeWebPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported on this browser');
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission denied');

  const registration = await navigator.serviceWorker.ready;
  const keyRes = await fetch('/api/webpush/vapid-public-key');
  const { key } = await keyRes.json();
  if (!key) throw new Error('Push notifications are not configured');

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
  });

  const subJson = subscription.toJSON();
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: subJson.endpoint,
      p256dh: subJson.keys?.p256dh,
      auth: subJson.keys?.auth,
    }),
  });
  if (!res.ok) throw new Error('Failed to save subscription');
}

// Single entry point for enabling notifications on both platforms -- native
// (APNs, via useNativePush) and web (VAPID push, subscribed directly here).
// Shared by the Settings button (PushPermission) and the one-time primer
// shown right after onboarding (NotificationPermissionPrimer) so there's
// exactly one place this logic lives.
//
// Reflects the real current OS/browser permission state on mount rather
// than a local boolean that resets on every remount, so this doesn't offer
// to "enable" what's already enabled.
export function useEnableNotifications() {
  const user = useUserStore((s) => s.user);
  const { requestPermission: requestNativePermission } = useNativePush(user?.id);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (Capacitor.isNativePlatform()) {
        const status = await PushNotifications.checkPermissions().catch(() => null);
        if (!cancelled) setEnabled(status?.receive === 'granted');
      } else if (typeof Notification !== 'undefined') {
        if (!cancelled) setEnabled(Notification.permission === 'granted');
      }
      if (!cancelled) setChecked(true);
    };
    check();
    return () => { cancelled = true; };
  }, []);

  const enable = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      // iOS only -- requestNativePermission ultimately calls
      // PushNotifications.register(), which throws an uncaught native
      // exception on Android since no Firebase project is configured
      // there yet (see useNativePush.ts). Android falls through to the
      // web VAPID path below instead, same as a browser.
      if (Capacitor.getPlatform() === 'ios') {
        await requestNativePermission();
        const status = await PushNotifications.checkPermissions();
        if (status.receive === 'granted') {
          setEnabled(true);
          return true;
        }
        return false;
      }
      await subscribeWebPush();
      setEnabled(true);
      return true;
    } finally {
      setLoading(false);
    }
  }, [requestNativePermission]);

  return { enabled, checked, loading, enable };
}
