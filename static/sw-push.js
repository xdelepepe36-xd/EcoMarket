// Service Worker para Notificaciones Push - EcoMarket
const CACHE_NAME = 'ecomarket-push-v1';
const STATIC_CACHE = 'ecomarket-static-v1';

// Archivos estáticos para cachear
const STATIC_FILES = [
    '/',
    '/static/ecomarket-consolidated.css',
    '/static/ecomarket-dark-mode.css',
    '/static/ecomarket-consolidated.js',
    '/static/ecomarket-dark-mode.js',
    '/static/accessibility.css'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('📱 Service Worker instalado');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Caché abierto');
                return cache.addAll(STATIC_FILES);
            })
            .catch((error) => {
                console.error('❌ Error cachéando archivos:', error);
            })
    );
    
    self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker activado');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
                        console.log('🗑️ Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
    console.log('📨 Notificación push recibida');
    
    let notificationData = {
        title: 'EcoMarket',
        body: 'Tienes una nueva notificación',
        icon: '/static/assets/icon-192.png',
        badge: '/static/assets/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/'
        }
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data
            };
        } catch (e) {
            console.error('Error parseando datos push:', e);
        }
    }
    
    const options = {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        vibrate: notificationData.vibrate,
        data: notificationData.data,
        actions: [
            {
                action: 'view',
                title: 'Ver',
                icon: '/static/assets/view-icon.png'
            },
            {
                action: 'dismiss',
                title: 'Cerrar',
                icon: '/static/assets/close-icon.png'
            }
        ],
        requireInteraction: true,
        tag: 'ecomarket-notification'
    };
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
    );
});

// Manejo de clic en notificación
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Notificación clickeada:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view' || event.action === 'dismiss') {
        const urlToOpen = event.notification.data.url || '/';
        
        event.waitUntil(
            clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then((clientList) => {
                // Si ya hay una ventana abierta, enfocarla
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no, abrir una nueva ventana
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
        );
    }
});

// Manejo de sincronización en background
self.addEventListener('sync', (event) => {
    console.log('🔄 Evento de sincronización:', event.tag);
    
    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    } else if (event.tag === 'sync-cart') {
        event.waitUntil(syncCart());
    }
});

// Sincronizar favoritos
function syncFavorites() {
    return fetch('/api/sync/favorites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Sync failed');
        return response.json();
    })
    .then(data => {
        console.log('✅ Favoritos sincronizados:', data);
        return data;
    })
    .catch(error => {
        console.error('❌ Error sincronizando favoritos:', error);
    });
}

// Sincronizar carrito
function syncCart() {
    return fetch('/api/sync/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Sync failed');
        return response.json();
    })
    .then(data => {
        console.log('✅ Carrito sincronizado:', data);
        return data;
    })
    .catch(error => {
        console.error('❌ Error sincronizando carrito:', error);
    });
}

// Estrategia de caché: Network First con fallback
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Para solicitudes API, siempre ir a la red
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // Fallback para cuando no hay conexión
                    return new Response(JSON.stringify({
                        error: 'offline',
                        message: 'No hay conexión a internet'
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }
    
    // Para archivos estáticos, usar caché primero
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request).then((networkResponse) => {
                    // Cachear respuestas exitosas
                    if (networkResponse.ok) {
                        const responseClone = networkResponse.clone();
                        caches.open(STATIC_CACHE).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                // Fallback para cuando no hay conexión
                if (event.request.destination === 'document') {
                    return caches.match('/offline.html');
                }
            })
    );
});

// Manejo de mensajes desde el cliente
self.addEventListener('message', (event) => {
    console.log('📩 Mensaje recibido del cliente:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_TTL') {
        // Implementar TTL para caché si es necesario
        console.log('⏰ TTL de caché:', event.data.ttl);
    }
});

// Manejo de errores
self.addEventListener('error', (event) => {
    console.error('❌ Error en Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
});

console.log('🚀 Service Worker de EcoMarket cargado');