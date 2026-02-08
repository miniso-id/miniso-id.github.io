const CACHE_NAME = 'mmsx-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  'https://unpkg.com/quagga@0.12.1/dist/quagga.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
