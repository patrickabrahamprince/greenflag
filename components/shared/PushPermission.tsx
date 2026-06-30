'use client';

import { Bell, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

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

export function PushPermission() {
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  async function handleEnable() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported on this browser');
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const keyRes = await fetch('/api/webpush/vapid-public-key');
      const { key } = await keyRes.json();
      if (!key) {
        toast.error('Push notifications are not configured');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });

      const subJson = subscription.toJSON();
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be signed in to enable notifications');
        return;
      }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth,
        }),
      });

      if (!res.ok) {
        toast.error('Failed to save subscription');
        return;
      }

      setSubscribed(true);
      toast.success('Push notifications enabled');
    } catch {
      toast.error('Something went wrong enabling notifications');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleEnable}
      disabled={loading || subscribed}
      className="flex items-center gap-2 rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
      {subscribed ? 'Notifications enabled' : 'Enable reminders'}
    </button>
  );
}
