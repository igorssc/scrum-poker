// Service Worker para Scrum Poker PWA
const VERSION = 'v11';
const CACHE_NAME = `scrum-poker-${VERSION}`;
const OFFLINE_URL = '/';

console.log('SW: Service Worker loading...');

// URLs que devem ser cacheadas para funcionamento offline
const CACHE_URLS = [
  '/',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install - cache essential resources
self.addEventListener('install', event => {
  console.log('SW: Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching essential resources');
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

  // Handle HTML pages
  if (event.request.headers.get('accept')?.includes('text/html')) {
    // Apenas intercepta a home page ('/') 
    if (url.pathname === '/' || url.pathname === '/index.html') {
      console.log('SW: Handling home page request');
      
      event.respondWith(
        // Try network first
        fetch(event.request)
          .then(response => {
            // If successful, cache it
            if (response.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response.clone());
              });
            }
            return response;
          })
          .catch(() => {
            console.log('SW: Network failed, serving cached home');
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
    
    // Para TODAS as outras rotas (/board, /room/*, etc), NÃO intercepta
    // Deixa o Next.js lidar com tudo - inclusive mostrar erro offline se necessário
    console.log('SW: NOT intercepting route, letting Next.js handle:', url.pathname);
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
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
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