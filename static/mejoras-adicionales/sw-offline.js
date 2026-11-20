/**
 * EcoMarket - Service Worker para Modo Offline Completo
 * Caché de páginas y sincronización al reconectar
 */

const CACHE_NAME = 'ecomarket-v3.2';
const URLS_TO_CACHE = [
    '/static/ecomarket-final.css',
    '/static/ecomarket-final.js',
    '/static/accessibility.css',
    '/static/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Abriendo caché');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptación de solicitudes
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Nunca cachear: navegaciones HTML, API, ni métodos no-GET
    // (las páginas pueden contener datos de sesión del usuario)
    const isNavigate = event.request.mode === 'navigate';
    const isApi = url.pathname.startsWith('/api/');
    const isNonGet = event.request.method !== 'GET';
    if (isNavigate || isApi || isNonGet) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Solo cachear assets estáticos (js/css/img/fuentes)
    const isStaticAsset = /\.(js|css|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|json|webmanifest)$/.test(url.pathname);
    if (!isStaticAsset) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si está en caché, retornar
                if (response) {
                    return response;
                }

                // Si no, hacer fetch y cachear
                return fetch(event.request).then((response) => {
                    // No cachear respuestas que no son válidas
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clonar la respuesta
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-carrito') {
        event.waitUntil(syncCarrito());
    }
    if (event.tag === 'sync-favoritos') {
        event.waitUntil(syncFavoritos());
    }
});

// Función para sincronizar carrito
async function syncCarrito() {
    const carritoOffline = await getOfflineData('carrito');
    if (carritoOffline) {
        // Enviar al servidor
        try {
            await fetch('/api/carrito/sync', {
                method: 'POST',
                body: JSON.stringify(carritoOffline),
                headers: { 'Content-Type': 'application/json' }
            });
            await clearOfflineData('carrito');
        } catch (error) {
            console.error('Error sincronizando carrito:', error);
        }
    }
}

// Función para sincronizar favoritos
async function syncFavoritos() {
    const favoritosOffline = await getOfflineData('favoritos');
    if (favoritosOffline) {
        try {
            await fetch('/api/favoritos/sync', {
                method: 'POST',
                body: JSON.stringify(favoritosOffline),
                headers: { 'Content-Type': 'application/json' }
            });
            await clearOfflineData('favoritos');
        } catch (error) {
            console.error('Error sincronizando favoritos:', error);
        }
    }
}

// Helpers para IndexedDB
async function getOfflineData(key) {
    // Implementación de IndexedDB
    return null;
}

async function clearOfflineData(key) {
    // Implementación de IndexedDB
}

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación de EcoMarket',
        icon: '/static/assets/icon-192.png',
        badge: '/static/assets/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('EcoMarket', options)
    );
});

// Manejo de clic en notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});
