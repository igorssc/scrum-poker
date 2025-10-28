// Service Worker para Scrum Poker PWA
const VERSION = 'v7';
const CACHE_NAME = `scrum-poker-${VERSION}`;
const OFFLINE_URL = '/';

console.log('SW: Service Worker loading...');

// URLs que devem ser cacheadas para funcionamento offline
const CACHE_URLS = [
  '/',
  '/board',
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
          console.log('SW: Network failed for HTML page:', url.pathname);
          
          // For app routes (SPA routes), always serve the app shell (home page)
          // This allows React Router to handle the routing client-side
          if (url.pathname.startsWith('/board') || 
              url.pathname.startsWith('/room/') || 
              url.pathname === '/') {
            
            console.log('SW: Serving app shell for SPA route:', url.pathname);
            return caches.match('/')
              .then(homeResponse => {
                if (homeResponse) {
                  return homeResponse;
                }
                throw new Error('No app shell available');
              });
          }
          
          // For other pages, try exact cache match first
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                console.log('SW: Serving exact cached page:', url.pathname);
                return cachedResponse;
              }
              throw new Error('No cached version available');
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