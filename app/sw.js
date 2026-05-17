const CACHE_NAME = 'mms-x-v3.1.0.20'; // Pastikan versi ini sama dengan di HTML
const OFFLINE_URL = './offline.html';
const ASSETS_TO_CACHE = [
  './',
  './manifest.json',
  './offline.html',
  './index.html',
  './price.html',
  './product.html',
  './so.html',
  'https://miniso-id.github.io/app/user512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/@zxing/library@latest'
];

// ----- INSTALL: langsung aktif tanpa menunggu -----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('MMS-X: Mengunduh aset ke cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Kunci: panggil skipWaiting() agar worker baru segera mengaktifkan diri
  self.skipWaiting();
});

// ----- ACTIVATE: hapus cache lama, klaim klien, lalu reload semua halaman -----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('MMS-X: Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => {
      // Ambil alih kendali halaman yang sedang terbuka
      return self.clients.claim();
    })
    .then(() => {
      // Reload semua tab/window untuk memastikan HTML terbaru
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          // Navigasi ulang ke URL yang sama (memuat halaman baru)
          client.navigate(client.url);
        });
      });
    })
  );
});

// ----- FETCH: cache-first, kecuali untuk Supabase (network only) -----
self.addEventListener('fetch', (event) => {
  // Supabase tidak boleh di-cache
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Update cache dengan respons terbaru
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline: untuk navigasi halaman, tampilkan offline.html
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        // Untuk aset lain, kembalikan dari cache jika ada
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
