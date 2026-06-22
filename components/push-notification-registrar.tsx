'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function PushNotificationRegistrar() {
  useEffect(() => {
    const register = async () => {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        const sub = subscription.toJSON();
        if (sub.endpoint && sub.keys) {
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: sub.endpoint,
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            }),
          });
        }
      } catch (error) {
        console.error('Push registration failed:', error);
      }
    };

    const timer = setTimeout(register, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
