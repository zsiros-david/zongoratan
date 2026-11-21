// Zongoratanár – net nélküli működés. Verzió: 2d11c17ec4
const CACHE = 'zongoratanar-2d11c17ec4-h2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('zongoratanar-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// előbb a hálózat (mindig a legfrissebb változat), net nélkül – vagy ha 4 mp alatt nem jön válasz – a mentett példány
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/hangolo/')) return; // a hangolónak saját offline kezelése van
  e.respondWith(caches.open(CACHE).then(c => {
    const cached = () => c.match(e.request, { ignoreSearch: true }).then(hit => hit || c.match('./index.html'));
    const net = fetch(e.request, { cache: 'no-cache' }).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; });
    const slow = new Promise(res => setTimeout(res, 4000)).then(cached);
    return Promise.race([net.catch(cached), slow.then(hit => hit || net)]);
  }));
});
