import { build, files, version } from '$service-worker';

const CACHE_NAME = `kobo-cache-${version}`;
const ASSETS = ['/', ...build, ...files];

// INSTALL
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      for (const key of keys) {
        if (key !== CACHE_NAME) await caches.delete(key);
      }
      self.clients.claim();
    })()
  );
});

// FETCH
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // 1. NAVIGATION STRATEGY (The Refresh Fix)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/').then((response) => {
        // Return index.html from cache immediately, even if online
        return response || fetch(event.request);
      })
    );
    return;
  }

  // 2. ASSET STRATEGY (JS, CSS, Images)
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      
      if (cachedResponse) return cachedResponse;

      try {
        const networkResponse = await fetch(event.request);
        // Only cache valid responses
        if (networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // Fallback is already handled by the navigate block above
        return new Response('Offline and asset not cached', { status: 408 });
      }
    })()
  );
});
