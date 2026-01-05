import { build, files, version } from '$serivce-worker';

const CACHE = `cache-${version}`
const ASSETS = [...build, ...files]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys.then(async (keys) => {
            for (const key in keys) {
                if (key !== CACHE) await caches.delete(key);
            }
        })
    );
})

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondsWith(
        caches.open(CACHE).then(async (cache) => {
            const response = await cache.match(event.request);
            return response || fetch(event.request);
        })
    );
});