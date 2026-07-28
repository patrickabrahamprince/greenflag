'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

// Native push (APNs) registration -- only runs inside the iOS app. Web
// keeps using its own separate Web Push (VAPID) flow. The device token
// this captures can't actually be delivered anything until an APNs auth
// key exists (Apple Developer account); until then registration + token
// storage still work harmlessly, they just have nothing to send to yet.
export function useNativePush(userId: string | null | undefined) {
  useEffect(() => {
    if (!userId || !Capacitor.isNativePlatform()) return;

    let registrationListener: { remove: () => void } | undefined;
    let errorListener: { remove: () => void } | undefined;

    const setup = async () => {
      const permStatus = await PushNotifications.checkPermissions();
      let granted = permStatus.receive === 'granted';
      if (permStatus.receive === 'prompt' || permStatus.receive === 'prompt-with-rationale') {
        const requested = await PushNotifications.requestPermissions();
        granted = requested.receive === 'granted';
      }
      if (!granted) return;

      registrationListener = await PushNotifications.addListener('registration', (token) => {
        fetch('/api/push/register-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.value, platform: 'ios' }),
        }).catch((err) => console.error('Failed to register device token:', err));
      });

      errorListener = await PushNotifications.addListener('registrationError', (err) => {
        console.error('Push registration error:', err);
      });

      await PushNotifications.register();
    };

    setup().catch((err) => console.error('Push notification setup failed:', err));

    return () => {
      registrationListener?.remove();
      errorListener?.remove();
    };
  }, [userId]);
}
