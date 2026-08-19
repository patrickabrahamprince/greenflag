'use client';

import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

async function registerForPush(): Promise<void> {
  const registrationListener = await PushNotifications.addListener('registration', (token) => {
    fetch('/api/push/register-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value, platform: 'ios' }),
    }).catch((err) => console.error('Failed to register device token:', err));
  });

  const errorListener = await PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration error:', err);
  });

  await PushNotifications.register();

  // Listeners intentionally outlive this call -- there's no natural
  // "unmount" moment for a device-token registration, unlike a
  // component-scoped effect.
  void registrationListener;
  void errorListener;
}

// Native push (APNs) registration -- only runs inside the iOS app. Web
// keeps using its own separate Web Push (VAPID) flow. The device token
// this captures can't actually be delivered anything until an APNs auth
// key exists (Apple Developer account); until then registration + token
// storage still work harmlessly, they just have nothing to send to yet.
//
// This never calls the native permission dialog cold. On first run for a
// given user it only reports needsPrimer=true so the caller can show a
// benefit-framed primer first; the actual OS prompt only fires from
// requestPermission(), after the person has tapped something themselves.
export function useNativePush(userId: string | null | undefined) {
  const [needsPrimer, setNeedsPrimer] = useState(false);

  useEffect(() => {
    // iOS only -- see the comment above. Android has no Firebase project
    // configured yet, so PushNotifications.register() would throw an
    // uncaught IllegalStateException ("Default FirebaseApp is not
    // initialized") on the native side and crash the whole app.
    if (!userId || Capacitor.getPlatform() !== 'ios') return;

    let cancelled = false;

    PushNotifications.checkPermissions().then(async (permStatus) => {
      if (cancelled) return;
      if (permStatus.receive === 'granted') {
        await registerForPush();
      } else if (permStatus.receive === 'prompt' || permStatus.receive === 'prompt-with-rationale') {
        setNeedsPrimer(true);
      }
      // 'denied' -- leave it alone; iOS won't re-prompt anyway, and
      // nagging someone who already said no is its own bad pattern.
    }).catch((err) => console.error('Push permission check failed:', err));

    return () => { cancelled = true; };
  }, [userId]);

  const requestPermission = useCallback(async () => {
    setNeedsPrimer(false);
    try {
      const requested = await PushNotifications.requestPermissions();
      if (requested.receive === 'granted') {
        await registerForPush();
      }
    } catch (err) {
      console.error('Push notification setup failed:', err);
    }
  }, []);

  return { needsPrimer, requestPermission, dismissPrimer: () => setNeedsPrimer(false) };
}
