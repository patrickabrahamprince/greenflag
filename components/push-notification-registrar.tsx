'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function PushNotificationRegistrar() {
  useEffect(() => {
    const register = async () => {
      // Only register if browser supports notifications
      if (!('Notification' in window)) return;

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      // Get Supabase user
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Register service worker and get push subscription
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });

          // Save subscription to database
          const subscriptionJson = subscription.toJSON();
          await (supabase as any)
            .from('profiles')
            .update({ push_token: JSON.stringify(subscriptionJson) })
            .eq('id', user.id);
        } catch (error) {
          console.error('Push registration failed:', error);
        }
      }
    };

    // Delay registration to avoid blocking page load
    const timer = setTimeout(register, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
