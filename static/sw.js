/**
 * EcoMarket Service Worker v2.0
 * Estrategia: Cache First para estáticos, Network First para dinámicos
 */
const CACHE_NAME = 'ecomarket-v2';
const STATIC_CACHE = 'ecomarket-static-v2';
const ASSETS_CACHE = 'ecomarket-assets-v2';

const urlsToCache = [
  '/',
  '/static/eco-market.css',
  '/static/main.js',
  '/static/eco-auth.js',
  '/static/eco-cart.js',
  '/static/eco-theme.js',
  '/static/eco-toast.js',
  '/static/eco-favorites.js',
  '/static/eco-search.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap'
];

// Instalación: cachear recursos estáticos
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => 
      cache.addAll(urlsToCache).catch(err => {
        console.warn('SW: Algunos recursos no se pudieron cachear', err);
      })
    )
  );
});

// Activación: limpiar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== ASSETS_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de fetch: Cache First para estáticos, Network First para API
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // HTML pages: Network First
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets: Cache First
  if (url.pathname.startsWith('/static/') || 
      url.origin === 'https://cdn.jsdelivr.net' || 
      url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Imágenes de Unsplash: Cache First
  if (url.origin === 'https://images.unsplash.com') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: Network First
  event.respondWith(networkFirst(request));
});

// Cache First: buscar en caché, si no hay, ir a red
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(ASSETS_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Network First: intentar red, si falla, usar caché
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Si es una navegación, mostrar página offline
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    return new Response('Offline', { status: 503 });
  }
}