'use client';

import { Bell, Check, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
// This replaces two previous, conflicting paths: an auto-firing web
// registrar that cold-prompted for permission on every session (burning
// the one-shot browser dialog with no context, and passing the VAPID key
// as the wrong type to pushManager.subscribe), and this component's own
// earlier version, which existed but was never actually mounted anywhere.
//
// Reflects the real current OS/browser permission state on mount rather
// than a local boolean that resets on every remount, so this doesn't offer
// to "enable" what's already enabled.
export function PushPermission() {
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

  const handleEnable = useCallback(async () => {
    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        await requestNativePermission();
        const status = await PushNotifications.checkPermissions();
        if (status.receive === 'granted') {
          setEnabled(true);
          toast.success('Push notifications enabled');
        } else {
          toast.error('Notification permission denied');
        }
      } else {
        await subscribeWebPush();
        setEnabled(true);
        toast.success('Push notifications enabled');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong enabling notifications');
    } finally {
      setLoading(false);
    }
  }, [requestNativePermission]);

  if (!checked) return null;

  return (
    <button
      onClick={handleEnable}
      disabled={loading || enabled}
      className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : enabled ? (
        <Check className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {enabled ? 'Notifications enabled' : 'Enable notifications'}
    </button>
  );
}
