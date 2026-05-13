const CACHE = 'adebiet-v2';
const FILES = [
  '/adebietordasy/',
  '/adebietordasy/index.html',
  '/adebietordasy/manifest.json',
  '/adebietordasy/images/icon-192.png',
  '/adebietordasy/images/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
    .then(() => self.skipWaiting()) // ← дереу активтеу
  );
});

self.addEventListener('activate', e => {
  // Ескі кэшті тазалау
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});