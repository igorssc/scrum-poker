// Service Worker Simples para Scrum Poker PWA
const VERSION = 'v13';
const CACHE_NAME = `scrum-poker-${VERSION}`;

console.log('SW: Simple Service Worker loading...');

// URLs essenciais para cache
const CACHE_URLS = [
  '/',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install - cache apenas essenciais
self.addEventListener('install', event => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching home page and assets');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('SW: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Installation failed:', error);
      })
  );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  console.log('SW: Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('scrum-poker-') && cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch - handle network requests
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip irrelevant requests
  if (
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/api/') ||
    url.protocol === 'chrome-extension:' ||
    url.hostname !== self.location.hostname
  ) {
    return;
  }

  // Handle HTML pages - estratégia simples
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      // Try network first
      fetch(event.request)
        .then(response => {
          // Se sucesso e é a home, cacheia
          if (response.ok && url.pathname === '/') {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          console.log('SW: Network failed, serving home for:', url.pathname);
          // Para QUALQUER página HTML quando offline, sempre serve a home
          return caches.match('/')
            .then(homeResponse => {
              if (homeResponse) {
                return homeResponse;
              }
              throw new Error('No cached home available');
            });
        })
    );
    return;
  }

  // Handle other resources (CSS, JS, images)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Try to fetch and cache
        return fetch(event.request).then(response => {
          if (response.ok) {
            // Clone the response before using it
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('SW: Service Worker script loaded');