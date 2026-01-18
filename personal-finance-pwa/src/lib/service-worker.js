import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = ['/', ...build, ...files];

//INSTALL
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

//ACTIVATE
self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            for (const key of keys) {
                if (key !== CACHE) {
                    await caches.delete(key);
                }
            }
            self.clients.claim();
        })()
    );
});

//FETCH
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) return;

    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE);

            // Try exact match first
            const cached = await cache.match(event.request);
            if (cached) return cached;

            try {
                const response = await fetch(event.request);

                if (response.ok) {
                    cache.put(event.request, response.clone());
                }

                return response;
            } catch {
                // 🔑 OFFLINE FALLBACK FOR SPA ROUTES
                if (event.request.mode === 'navigate') {
                    return cache.match('/');
                }

                throw new Error('Offline and no cache');
            }
        })()
    );
});
