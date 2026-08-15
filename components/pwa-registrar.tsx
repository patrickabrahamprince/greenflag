'use client';

import { useEffect } from 'react';

// PWA/service-worker caching is off entirely now -- next-pwa was disabled
// in next.config.js after it stopped being regenerated per deploy but
// kept being served as a static file, so any client that had it
// registered was serving an increasingly stale precache (old chunk
// hashes) indefinitely, regardless of what actually shipped to
// production. This unregisters and clears caches for every client, web
// or native, rather than only the native branch this used to special-case
// -- public/sw.js is now itself a self-unregistering kill-switch, but a
// device that registered the old real service worker needs this active
// cleanup too since it won't necessarily fetch the new sw.js on its own.
export function PwaRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  }, []);

  return null;
}
