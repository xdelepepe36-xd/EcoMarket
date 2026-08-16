/**
 * Service Worker Avanzado para EcoMarket PWA
 * 
 * Funcionalidades:
 * - Caché inteligente con estrategias diferentes por tipo de contenido
 * - Background sync para acciones offline
 * - Push notifications
 * - Actualización automática de contenido
 * - Precaching de recursos críticos
 * - Network-first para datos, cache-first para assets
 * - Manejo de errores gracefully
 * - Estrategias de caché configurables
 */

const CACHE_NAME = 'ecomarket-v4.0';
const RUNTIME_CACHE = 'ecomarket-runtime-v4.0';

// Recursos para precaching
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/productos.html',
    '/login.html',
    '/registro.html',
    '/static/eco-styles.css',
    '/static/eco-ui.css',
    '/static/eco-gallery.css',
    '/static/eco-coupons.css',
    '/static/eco-banners.css',
    '/static/eco-theme.js',
    '/static/eco-gallery.js',
    '/static/eco-coupons.js',
    '/static/eco-banners.js',
    '/static/eco-cache.js',
    '/static/assets/hero-eco.svg',
    '/static/assets/product-placeholder.svg',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'
];

// Estrategias de caché por tipo de contenido
const CACHE_STRATEGIES = {
    // HTML: Network First con fallback a caché
    html: {
        strategy: 'networkFirst',
        cacheName: CACHE_NAME + '-html',
        maxEntries: 10,
        maxAgeSeconds: 86400 // 1 día
    },
    
    // CSS/JS: Cache First con actualización en background
    static: {
        strategy: 'cacheFirst',
        cacheName: CACHE_NAME + '-static',
        maxEntries: 50,
        maxAgeSeconds: 604800 // 7 días
    },
    
    // Imágenes: Cache First con Stale While Revalidate
    images: {
        strategy: 'staleWhileRevalidate',
        cacheName: CACHE_NAME + '-images',
        maxEntries: 100,
        maxAgeSeconds: 2592000 // 30 días
    },
    
    // API: Network First con fallback a caché corta
    api: {
        strategy: 'networkFirst',
        cacheName: RUNTIME_CACHE + '-api',
        maxEntries: 20,
        maxAgeSeconds: 300 // 5 minutos
    },
    
    // Otros: Network First
    default: {
        strategy: 'networkFirst',
        cacheName: RUNTIME_CACHE + '-default',
        maxEntries: 30,
        maxAgeSeconds: 3600 // 1 hora
    }
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Precacheando recursos...');
            return cache.addAll(PRECACHE_URLS.map(url => new Request(url, {cache: 'reload'})));
        }).then(() => {
            console.log('[SW] Instalación completada');
            return self.skipWaiting();
        }).catch((error) => {
            console.error('[SW] Error durante instalación:', error);
        })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== RUNTIME_CACHE &&
                        !cacheName.startsWith(CACHE_NAME + '-') &&
                        !cacheName.startsWith(RUNTIME_CACHE + '-')) {
                        console.log('[SW] Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Activación completada');
            return self.clients.claim();
        })
    );
});

// Manejo de fetch requests
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Ignorar requests que no son GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Ignorar requests a otros dominios (excepto CDN permitidos)
    if (url.origin !== self.location.origin && 
        !url.hostname.includes('cdn.jsdelivr.net') &&
        !url.hostname.includes('images.unsplash.com')) {
        return;
    }
    
    // Determinar estrategia de caché basada en el tipo de contenido
    const strategy = determineCacheStrategy(request, url);
    
    event.respondWith(handleRequest(request, strategy));
});

function determineCacheStrategy(request, url) {
    // HTML
    if (request.headers.get('accept')?.includes('text/html')) {
        return CACHE_STRATEGIES.html;
    }
    
    // CSS/JS
    if (url.pathname.match(/\.(css|js)$/)) {
        return CACHE_STRATEGIES.static;
    }
    
    // Imágenes
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
        return CACHE_STRATEGIES.images;
    }
    
    // API
    if (url.pathname.startsWith('/api/')) {
        return CACHE_STRATEGIES.api;
    }
    
    // Default
    return CACHE_STRATEGIES.default;
}

async function handleRequest(request, strategy) {
    try {
        switch (strategy.strategy) {
            case 'networkFirst':
                return await networkFirst(request, strategy);
            case 'cacheFirst':
                return await cacheFirst(request, strategy);
            case 'staleWhileRevalidate':
                return await staleWhileRevalidate(request, strategy);
            case 'networkOnly':
                return await networkOnly(request);
            case 'cacheOnly':
                return await cacheOnly(request, strategy);
            default:
                return await networkFirst(request, strategy);
        }
    } catch (error) {
        console.error('[SW] Error manejando request:', error);
        return await handleNetworkError(request, strategy);
    }
}

// Estrategia Network First
async function networkFirst(request, strategy) {
    const cache = await caches.open(strategy.cacheName);
    
    try {
        const networkResponse = await fetch(request);
        
        // Clonar respuesta para caché
        if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            await cache.put(request, responseToCache);
        }
        
        return networkResponse;
    } catch (error) {
        // Fallback a caché
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            console.log('[SW] Usando caché como fallback para:', request.url);
            return cachedResponse;
        }
        
        // Último recurso: respuesta offline
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

// Estrategia Cache First
async function cacheFirst(request, strategy) {
    const cache = await caches.open(strategy.cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Actualizar en background
        fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
        });
        
        return cachedResponse;
    }
    
    // Si no está en caché, buscar en red
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request, strategy) {
    const cache = await caches.open(strategy.cacheName);
    const cachedResponse = await cache.match(request);
    
    // Siempre buscar en red para actualizar
    const networkPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    });
    
    // Retornar caché inmediatamente si existe
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Si no hay caché, esperar a la red
    return networkPromise;
}

// Estrategia Network Only
async function networkOnly(request) {
    return fetch(request);
}

// Estrategia Cache Only
async function cacheOnly(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    return new Response('Not in cache', {
        status: 404,
        statusText: 'Not Found'
    });
}

// Manejo de errores de red
async function handleNetworkError(request, strategy) {
    const cache = await caches.open(strategy.cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Para páginas HTML, retornar página offline
    if (request.headers.get('accept')?.includes('text/html')) {
        return caches.match('/offline.html').then(offlineResponse => {
            return offlineResponse || new Response('Offline', { status: 503 });
        });
    }
    
    return new Response('Network Error', { status: 503 });
}

// Background Sync
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-cart') {
        event.waitUntil(syncCart());
    } else if (event.tag === 'sync-reviews') {
        event.waitUntil(syncReviews());
    }
});

async function syncCart() {
    try {
        // Obtener carrito offline de IndexedDB
        const offlineCart = await getOfflineCart();
        
        if (offlineCart && offlineCart.items.length > 0) {
            // Sincronizar con servidor
            const response = await fetch('/api/cart/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(offlineCart)
            });
            
            if (response.ok) {
                await clearOfflineCart();
                console.log('[SW] Carrito sincronizado exitosamente');
            }
        }
    } catch (error) {
        console.error('[SW] Error sincronizando carrito:', error);
    }
}

async function syncReviews() {
    try {
        const offlineReviews = await getOfflineReviews();
        
        for (const review of offlineReviews) {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(review)
            });
            
            if (response.ok) {
                await removeOfflineReview(review.id);
            }
        }
        
        console.log('[SW] Reviews sincronizadas exitosamente');
    } catch (error) {
        console.error('[SW] Error sincronizando reviews:', error);
    }
}

// Push Notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification recibida');
    
    let data = {
        title: 'EcoMarket',
        body: 'Tienes una nueva notificación',
        icon: '/static/assets/icon-gift.svg',
        badge: '/static/assets/icon-gift.svg'
    };
    
    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (error) {
            console.error('[SW] Error parseando push data:', error);
        }
    }
    
    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        },
        requireInteraction: data.urgent || false
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Manejo de clic en notificación
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notificación clickeada');
    
    event.notification.close();
    
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Si ya hay una ventana abierta, enfocarla
            for (const client of clientList) {
                if (client.url === self.location.origin + url && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Si no, abrir una nueva ventana
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// IndexedDB helpers para datos offline
async function getOfflineCart() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ecomarket-offline', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['cart'], 'readonly');
            const store = transaction.objectStore('cart');
            const getRequest = store.get('cart');
            
            getRequest.onerror = () => reject(getRequest.error);
            getRequest.onsuccess = () => resolve(getRequest.result);
        };
    });
}

async function clearOfflineCart() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ecomarket-offline', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['cart'], 'readwrite');
            const store = transaction.objectStore('cart');
            const deleteRequest = store.delete('cart');
            
            deleteRequest.onerror = () => reject(deleteRequest.error);
            deleteRequest.onsuccess = () => resolve();
        };
    });
}

// Limpieza periódica de caché
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAN_CACHE') {
        event.waitUntil(cleanOldCache());
    }
});

async function cleanOldCache() {
    const cacheNames = await caches.keys();
    const now = Date.now();
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const dateHeader = response.headers.get('date');
                if (dateHeader) {
                    const cacheDate = new Date(dateHeader).getTime();
                    const age = now - cacheDate;
                    
                    // Eliminar entradas mayores a 30 días
                    if (age > 2592000000) {
                        await cache.delete(request);
                    }
                }
            }
        }
    }
    
    console.log('[SW] Limpieza de caché completada');
}

// Función para prefetching
async function prefetchUrls(urls) {
    const cache = await caches.open(RUNTIME_CACHE + '-prefetch');
    
    const promises = urls.map(url => {
        return fetch(url).then(response => {
            if (response.ok) {
                return cache.put(url, response.clone());
            }
        });
    });
    
    return Promise.allSettled(promises);
}

// Mensajes desde el cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PREFETCH') {
        event.waitUntil(prefetchUrls(event.data.urls));
    }
    
    if (event.data && event.data.type === 'CLEAR_SPECIFIC_CACHE') {
        event.waitUntil(
            caches.delete(event.data.cacheName).then(deleted => {
                console.log('[SW] Caché eliminada:', event.data.cacheName, deleted);
            })
        );
    }
});

console.log('[SW] Service Worker avanzado cargado');