const CACHE_NAME = 'waiter-pwa-v10';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './dishes-data.js',
  './bar_drinks-data.js',
  './dishes.json',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Force update all assets
      return cache.addAll(ASSETS.map(asset => `${asset}?v=${Date.now()}`));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Handle navigation requests (for PWA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Always fetch fresh from network for HTML, CSS, and JS files
  if (request.url.includes('.html') || request.url.includes('.css') || request.url.includes('.js')) {
    event.respondWith(
      fetch(request).then((resp) => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, respClone)).catch(() => {});
        return resp;
      }).catch(() => {
        // Fallback to cache if network fails
        return caches.match(request);
      })
    );
    return;
  }

  // Always fetch dishes.json fresh from network
  if (request.url.includes('dishes.json')) {
    event.respondWith(
      fetch(request).then((resp) => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, respClone)).catch(() => {});
        return resp;
      }).catch(() => {
        // Fallback for dishes.json
        return new Response('{"dishes":[]}', {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Cache first for other assets
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, respClone)).catch(() => {});
        return resp;
      }).catch(() => {
        // Fallback for other JSON files
        if (request.url.endsWith('.json')) {
          return new Response('{"dishes":[]}', {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return cached;
      });
    })
  );
});


