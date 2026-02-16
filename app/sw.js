const CACHE_NAME = 'mms-x-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './price.html',
  './so.html',
  './product.html', // Tambahkan semua nama file HTML Anda di sini
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/quagga@0.12.1/dist/quagga.min.js'
];

// 1. Install Service Worker & Cache Aset
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('MMS-X: Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activate & Hapus Cache Lama jika ada update versi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('MMS-X: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Strategi Fetch: Cache First, lalu Network (Supaya cepat)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Jika ada di cache, gunakan cache. Jika tidak, ambil dari internet.
      return response || fetch(event.request);
    })
  );
});
