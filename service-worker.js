/*
 * Simple service worker to cache application assets for offline usage.
 *
 * The service worker caches a small set of static files. When a resource
 * request is intercepted it will try to serve the cached version first.
 */

// Bump the cache name whenever the list of assets changes to ensure that
// users receive the latest files. The version suffix can be any string –
// incrementing the number is a simple approach. When the service worker
// activates, it will delete caches that don't match this name.
const CACHE_NAME = 'bread-order-app-cache-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  // Cache the multi-user client script so it works offline
  '/app_server.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event: cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event: clean up old caches if necessary
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch {
        const cache = await caches.open(CACHE_NAME);
        const fallback = await cache.match('/index.html');
        return fallback || Response.error();
      }
    })());
    return;
  }
  event.respondWith(caches.match(req).then(resp => resp || fetch(req)));
});