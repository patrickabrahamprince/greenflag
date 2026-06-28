// /lib/webpush.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Base64 helper for VAPID key conversion
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUser(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Web push is not supported in this environment.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Retrieve public VAPID key from environment variables
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set');
      return null;
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // Save the subscription to Supabase push_subscriptions table
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        subscription: subscription.toJSON(),
      }, {
        onConflict: 'user_id'
      });
      if (error) console.error('Error saving push subscription to DB:', error);
    }

    // Also register at route handler API for redundancy/robustness
    await fetch('/api/webpush/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (err) {
    console.error('Failed to subscribe user to push:', err);
    return null;
  }
}

export async function sendWebPush(subscription: any, payload: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    throw new Error('sendWebPush can only be called on the server side.');
  }

  try {
    // Dynamic import to prevent bundler errors on the client side
    const webpush = require('web-push');

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    const privateKey = process.env.VAPID_PRIVATE_KEY || '';

    if (!publicKey || !privateKey) {
      console.error('VAPID keys not configured in server environment.');
      return false;
    }

    webpush.setVapidDetails(
      'mailto:support@greenflag.app',
      publicKey,
      privateKey
    );

    await webpush.sendNotification(subscription, payload);
    return true;
  } catch (err) {
    console.error('Error sending web push notification:', err);
    return false;
  }
}
