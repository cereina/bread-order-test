// Network-first navigations so auth state is always fresh.
// Bump CACHE_NAME to invalidate old cached HTML.
const CACHE_NAME = 'bread-order-app-cache-v4';

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // HTML navigations: prefer network, fallback to cached index if offline
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  // For assets, do a simple cache-first (customize as needed)
  event.respondWith(
    caches.match(req).then(resp => resp || fetch(req))
  );
});
