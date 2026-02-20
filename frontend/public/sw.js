// Minimal service worker stub for PWA installability.
// TODO: Add caching strategy if time permits.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
