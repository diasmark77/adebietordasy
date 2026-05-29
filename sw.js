const CACHE = 'adebiet-v3';
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
    .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // ← БАР беттерді жаңарту
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    // Алдымен желіден алады, қатеде кэштен береді
    fetch(e.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
