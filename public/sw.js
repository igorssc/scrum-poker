// Service Worker para Scrum Poker PWA
const VERSION = 'v12';
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

// Rotas que devem funcionar como SPA offline
const SPA_ROUTES = ['/board', '/room'];

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
        console.log('SW: Essential resources cached, now trying to cache SPA routes');
        // Tenta fazer cache das rotas SPA em background
        return caches.open(CACHE_NAME).then(cache => {
          // Tenta cachear /board fazendo uma requisição
          return fetch('/board')
            .then(response => {
              if (response.ok) {
                cache.put('/board', response.clone());
                console.log('SW: /board cached successfully');
              }
            })
            .catch(() => {
              console.log('SW: Could not pre-cache /board, will use app shell strategy');
            });
        });
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
    // Verifica se é uma rota SPA
    const isSPARoute = SPA_ROUTES.some(route => url.pathname === route || url.pathname.startsWith(route + '/'));
    
    if (url.pathname === '/' || url.pathname === '/index.html' || isSPARoute) {
      console.log('SW: Handling SPA route:', url.pathname);
      
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
            console.log('SW: Network failed for:', url.pathname);
            
            // Para rotas SPA, sempre serve o app shell (home page)
            // Isso permite que o React Router funcione client-side
            console.log('SW: Serving app shell for SPA route');
            return caches.match('/')
              .then(homeResponse => {
                if (homeResponse) {
                  return homeResponse;
                }
                throw new Error('No app shell available');
              });
          })
      );
      return;
    }
    
    // Para outras rotas, não intercepta
    console.log('SW: NOT intercepting route:', url.pathname);
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
  
  if (event.data?.type === 'CACHE_CURRENT_PAGE') {
    const { url, pathname } = event.data;
    console.log('SW: Caching SPA page:', pathname);
    
    // Cacheia a página atual
    caches.open(CACHE_NAME).then(cache => {
      return fetch(url).then(response => {
        if (response.ok) {
          cache.put(url, response.clone());
          console.log('SW: Successfully cached:', pathname);
        }
      }).catch(() => {
        console.log('SW: Failed to cache:', pathname);
      });
    });
  }
});

console.log('SW: Service Worker script loaded');