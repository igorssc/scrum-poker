// Service Worker para cache offline básico
const CACHE_NAME = 'scrum-poker-v1';
const OFFLINE_ASSETS = [
  '/',
  '/offline',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching offline assets');
        return cache.addAll(OFFLINE_ASSETS);
      })
      .catch(error => {
        console.error('SW: Failed to cache offline assets:', error);
      })
  );
  // Força ativação imediata
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Toma controle imediato de todas as páginas
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Só intercepta requests GET
  if (event.request.method !== 'GET') return;

  // Ignora requests de API, WebSocket e external resources
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.protocol === 'chrome-extension:' ||
    url.hostname !== self.location.hostname
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se está no cache, retorna
        if (response) {
          return response;
        }

        // Tenta buscar na rede
        return fetch(event.request)
          .then(response => {
            // Se não conseguiu buscar e é uma página, tenta servir a home
            if (!response || response.status !== 200) {
              if (event.request.headers.get('accept')?.includes('text/html')) {
                return caches.match('/');
              }
            }
            return response;
          })
          .catch(() => {
            // Se falhou e é uma request HTML, serve a home
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/');
            }
            // Para outros recursos, deixa falhar
            throw new Error('Network request failed and no cache available');
          });
      })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'MANIFEST_UPDATE') {
    // Limpa cache do manifest quando tema muda
    caches.open(CACHE_NAME).then(cache => {
      cache.delete('/api/manifest');
    });
  }
});