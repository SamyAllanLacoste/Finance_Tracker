/* Service worker — met l'application en cache pour un fonctionnement hors ligne.
   Les données financières ne passent jamais par ici : elles restent dans IndexedDB. */
const CACHE = 'comptes-v6';
const FICHIERS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Taux de change : le réseau d'abord, jamais de cache périmé servi en silence.
  if (url.hostname.endsWith('frankfurter.app')) return;

  // Coquille de l'application : le cache d'abord, rafraîchi en arrière-plan.
  e.respondWith(
    caches.match(e.request).then(hit => {
      const reseau = fetch(e.request).then(res => {
        if (res && res.status === 200 && url.origin === location.origin) {
          const copie = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copie));
        }
        return res;
      }).catch(() => hit);
      return hit || reseau;
    })
  );
});
