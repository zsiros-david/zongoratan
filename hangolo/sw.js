// Zongorahangoló – net nélküli működés (csak a /hangolo/ mappára)
const CACHE = 'zongorahangolo-1';
const FILES = ['./', './index.html', './manifest.webmanifest', '../icon-180.png', '../icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('zongorahangolo-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// előbb a hálózat (mindig a legfrissebb), net nélkül a mentett példány
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html')))
  );
});
