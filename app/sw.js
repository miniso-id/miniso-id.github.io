const CACHE_NAME = 'mms-x-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html', // Ganti dengan nama file HTML utama Anda jika berbeda
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/quagga@0.12.1/dist/quagga.min.js',
  'https://miniso-id.github.io/app/user512.png'
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
