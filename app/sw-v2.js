// sw-v2.js — Auto‑update, tanpa caching
self.addEventListener('install', () => {
  self.skipWaiting(); // Langsung aktif, tidak menunggu
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      // Hapus SEMUA cache yang ada
      return Promise.all(cacheNames.map(name => caches.delete(name)));
    }).then(() => self.clients.claim()) // Ambil alih halaman
  );
});

// Tidak ada fetch listener = semua request langsung ke jaringan
