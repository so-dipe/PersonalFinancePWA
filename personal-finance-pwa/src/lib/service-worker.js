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

  if (url.origin !== self.location.origin) return;



  event.respondWith((async () => {

    const cache = await caches.open(CACHE_NAME);



    // Try cache first

    const cachedResponse = await cache.match(event.request);

    if (cachedResponse) return cachedResponse;



    try {

      const networkResponse = await fetch(event.request);

      if (networkResponse && networkResponse.ok) {

        cache.put(event.request, networkResponse.clone());

      }

      return networkResponse;

    } catch (err) {

      // SPA fallback for offline navigation

      if (event.request.mode === 'navigate') {

        const fallback = await cache.match('/');

        if (fallback) return fallback;

      }

      throw err;

    }

  })());

});