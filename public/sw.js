// Kill-switch service worker. next-pwa was disabled in next.config.js
// (see the comment there), which meant this file stopped being
// regenerated per deploy but was still being served as a static asset --
// any client that had it registered kept intercepting fetches with an
// increasingly stale precache manifest (old chunk hashes) on every
// subsequent app launch, regardless of what actually shipped to
// production. This replaces it: unregister immediately, clear every
// cache this origin ever wrote, and stop existing.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => client.navigate(client.url));
    })()
  );
});
