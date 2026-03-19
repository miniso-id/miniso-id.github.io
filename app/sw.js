const CACHE_NAME = 'mms-x-v2.0.1'; // Pastikan versi ini sama dengan di HTML
const OFFLINE_URL = './offline.html'; // Tentukan URL offline
const ASSETS_TO_CACHE = [
  './',
  './manifest.json',
  './offline.html', // Tambahkan ini
  './index.html',
  './price.html',
  './product.html',
  'https://miniso-id.github.io/app/user512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/@zxing/library@latest',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
];

// 1. Tahap Install - Menyimpan aset ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('MMS-X: Mengunduh aset ke cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // JANGAN panggil self.skipWaiting() di sini agar tidak auto-reload
});

// 2. Tahap Message - Menerima perintah dari tombol "UPDATE SEKARANG"
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 3. Tahap Activate - Menghapus cache versi lama
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
    }).then(() => self.clients.claim()) // Mengambil alih halaman seketika
  );
});

// 4. Tahap Fetch - Strategi pengambilan data
self.addEventListener('fetch', (event) => {
  // Pengecualian untuk Supabase: Selalu ambil dari internet (Network Only)
  // Agar data stok/harga tidak pernah basi
  if (event.request.url.includes('supabase.co')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Jika ada di cache, gunakan cache. Jika tidak, ambil dari internet.
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Update cache di background jika aset ditemukan
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
        // --- LOGIKA OFFLINE BARU DI SINI ---
        // Jika gagal koneksi (offline) dan yang diminta adalah halaman (navigasi)
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        return response; // Berikan cache yang ada (untuk gambar/js)
      });

      return response || fetchPromise;
    })
  );
});
