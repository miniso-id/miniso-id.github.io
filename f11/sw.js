// sw.js
const CACHE_NAME = 'mms-x-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
});

// Fetch event (Penting agar terdeteksi PWA)
self.addEventListener('fetch', (event) => {
  // Biarkan request lewat ke network
  event.respondWith(fetch(event.request));
});
