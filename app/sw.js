const CACHE_NAME = 'mms-x-v1.0.5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './price.html',
  './so.html',
  './product.html',
  './manifest.json',
  'https://miniso-id.github.io/app/user512.png', // Tambahkan logo agar offline-ready
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/quagga@0.12.1/dist/quagga.min.js'
];

// 1. Install - Caching Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Memaksa SW yang baru untuk langsung mengambil kendali tanpa menunggu user menutup tab
  self.skipWaiting(); 
});

// 2. Activate - Pembersihan Cache Lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('MMS-X: Menghapus Cache Usang:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Langsung mengontrol halaman yang sedang terbuka
  );
});

// 3. Strategi Fetch: Stale-While-Revalidate (Opsi Terbaik untuk Aplikasi Dinamis)
// Artinya: Ambil dari cache supaya cepat, tapi tetap cek internet di background untuk update cache.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Jangan simpan response dari Supabase ke cache (karena data database harus selalu fresh)
          if (event.request.url.includes('supabase.co')) {
              return networkResponse;
          }
          
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
            // Jika benar-benar offline dan tidak ada di cache
            return response;
        });
        
        return response || fetchPromise;
      });
    })
  );
});
