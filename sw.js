// ABM Keşif ve Metraj - çevrimdışı çalışma
// Uygulama dosyaları: önce internetten (güncel sürüm), internet yoksa önbellekten.
// Yazı tipleri: önbellekten, arkada güncellenir.
const SURUM = 'abm-kesif-v11-1';
const KABUK = ['./', 'index.html', 'manifest.webmanifest', 'ikon-192.png', 'ikon-512.png', 'ikon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(KABUK)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(l => Promise.all(l.filter(k => k !== SURUM).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(fetch(r, { cache: 'no-cache' }).then(y => {
      if (y.ok) { const k = y.clone(); caches.open(SURUM).then(c => c.put(r, k)); }
      return y;
    }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
    return;
  }
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(SURUM).then(c => c.match(r).then(m => {
      const ag = fetch(r).then(y => { if (y.ok || y.type === 'opaque') c.put(r, y.clone()); return y; }).catch(() => m);
      return m || ag;
    })));
  }
});
