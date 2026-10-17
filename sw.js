/* Pedidos de insumos - trabajo sin internet.
   Con internet siempre baja la versión más nueva; sin internet usa la última que guardó. */
const V = 'pedidos-202610150059';
const BASE = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;   // Supabase y otros servidores no se tocan
  e.respondWith(
    fetch(r)
      .then(res => { const copia = res.clone(); caches.open(V).then(c => c.put(r, copia)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
