const CACHE_NAME = 'mms-x-v1.0.8';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './price.html',
  './so.html',
  './product.html',
  './manifest.json',
  'https://miniso-id.github.io/app/user512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/quagga@0.12.1/dist/quagga.min.js'
];

// sw.js

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  // JANGAN panggil self.skipWaiting() di sini! 
  // Biarkan dia statusnya 'waiting' sampai user klik tombol.
});

// Listener untuk menerima perintah klik dari tombol Update
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ... sisanya (fetch listener) tetap sama ...


// Mendengarkan perintah skipWaiting dari UI
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (event.request.url.includes('supabase.co')) return networkResponse;
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => response);
        return response || fetchPromise;
      });
    })
  );
});
