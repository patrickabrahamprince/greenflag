'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// Registers the PWA service worker for real website visitors only. Inside
// the native app, this instead actively unregisters and clears any
// service worker + cache that may already be sitting there from before
// next-pwa's auto-registration was turned off -- a device that already
// installed the app and browsed around has one, and it needs to be torn
// down explicitly, not just stopped from being created again.
export function PwaRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (Capacitor.isNativePlatform()) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  }, []);

  return null;
}
