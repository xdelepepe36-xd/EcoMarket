/**
 * EcoMarket - Analytics y Tracking
 * Sistema de análisis de usuario y eventos
 */

class EcoMarketAnalytics {
    constructor(options = {}) {
        this.options = {
            trackPageViews: true,
            trackClicks: true,
            trackScroll: true,
            debug: false,
            ...options
        };
        
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.init();
    }

    /**
     * Inicializa el sistema de analytics
     */
    init() {
        if (this.options.trackPageViews) {
            this.trackPageView();
        }
        
        if (this.options.trackClicks) {
            this.setupClickTracking();
        }
        
        if (this.options.trackScroll) {
            this.setupScrollTracking();
        }
        
        this.setupEventListeners();
    }

    /**
     * Genera ID de sesión único
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Registra evento de página vista
     */
    trackPageView() {
        const eventData = {
            type: 'pageview',
            sessionId: this.sessionId,
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            deviceType: this.getDeviceType(),
            viewport: this.getViewportSize()
        };
        
        this.recordEvent(eventData);
    }

    /**
     * Configura tracking de clicks
     */
    setupClickTracking() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            const eventData = {
                type: 'click',
                sessionId: this.sessionId,
                element: this.getElementInfo(target),
                position: { x: e.clientX, y: e.clientY },
                path: window.location.pathname,
                timestamp: Date.now()
            };
            
            this.recordEvent(eventData);
        }, true);
    }

    /**
     * Configura tracking de scroll
     */
    setupScrollTracking() {
        let maxScroll = 0;
        let scrollMilestones = [25, 50, 75, 90, 100];
        let reachedMilestones = new Set();

        window.addEventListener('scroll', throttle(() => {
            const scrollPercent = this.getScrollPercentage();
            maxScroll = Math.max(maxScroll, scrollPercent);

            scrollMilestones.forEach(milestone => {
                if (scrollPercent >= milestone && !reachedMilestones.has(milestone)) {
                    reachedMilestones.add(milestone);
                    this.recordEvent({
                        type: 'scroll_milestone',
                        sessionId: this.sessionId,
                        milestone: milestone,
                        path: window.location.pathname,
                        timestamp: Date.now()
                    });
                }
            });
        }, 200));

        // Registrar scroll depth al salir de la página
        window.addEventListener('beforeunload', () => {
            this.recordEvent({
                type: 'scroll_depth',
                sessionId: this.sessionId,
                maxScroll: maxScroll,
                path: window.location.pathname,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Configura listeners de eventos personalizados
     */
    setupEventListeners() {
        // Trackear cuando se añade al carrito
        document.addEventListener('cart:add', (e) => {
            this.recordEvent({
                type: 'cart_add',
                sessionId: this.sessionId,
                productId: e.detail.productId,
                productName: e.detail.productName,
                price: e.detail.price,
                path: window.location.pathname,
                timestamp: Date.now()
            });
        });

        // Trackear cuando se elimina del carrito
        document.addEventListener('cart:remove', (e) => {
            this.recordEvent({
                type: 'cart_remove',
                sessionId: this.sessionId,
                productId: e.detail.productId,
                path: window.location.pathname,
                timestamp: Date.now()
            });
        });

        // Trackeer cuando se añade a favoritos
        document.addEventListener('favorite:add', (e) => {
            this.recordEvent({
                type: 'favorite_add',
                sessionId: this.sessionId,
                productId: e.detail.productId,
                productName: e.detail.productName,
                path: window.location.pathname,
                timestamp: Date.now()
            });
        });

        // Trackear búsqueda
        document.addEventListener('search:perform', (e) => {
            this.recordEvent({
                type: 'search',
                sessionId: this.sessionId,
                query: e.detail.query,
                resultsCount: e.detail.resultsCount,
                path: window.location.pathname,
                timestamp: Date.now()
            });
        });

        // Trackear checkout iniciado
        document.addEventListener('checkout:start', (e) => {
            this.recordEvent({
                type: 'checkout_start',
                sessionId: this.sessionId,
                cartValue: e.detail.cartValue,
                itemCount: e.detail.itemCount,
                path: window.location.pathname,
                timestamp: Date.now()
            });
        });

        // Trackeer checkout completado
        document.addEventListener('checkout:complete', (e) => {
            this.recordEvent({
                type: 'checkout_complete',
                sessionId: this.sessionId,
                orderId: e.detail.orderId,
                total: e.detail.total,
                itemCount: e.detail.itemCount,
                paymentMethod: e.detail.paymentMethod,
                path: window.location.pathname,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Registra un evento
     */
    recordEvent(eventData) {
        this.events.push(eventData);
        
        if (this.options.debug) {
            console.log('[Analytics]', eventData);
        }

        // Enviar al servidor si hay conexión
        this.sendToServer(eventData);
    }

    /**
     * Envía evento al servidor
     */
    async sendToServer(eventData) {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
        } catch (error) {
            if (this.options.debug) {
                console.error('[Analytics] Error sending event:', error);
            }
            // Guardar en localStorage para enviar después
            this.saveOfflineEvent(eventData);
        }
    }

    /**
     * Guarda evento offline
     */
    saveOfflineEvent(eventData) {
        const offlineEvents = JSON.parse(localStorage.getItem('offline_analytics_events') || '[]');
        offlineEvents.push(eventData);
        localStorage.setItem('offline_analytics_events', JSON.stringify(offlineEvents));
    }

    /**
     * Obtiene información del elemento
     */
    getElementInfo(element) {
        return {
            tag: element.tagName.toLowerCase(),
            id: element.id || null,
            classes: element.className || null,
            text: element.textContent?.substring(0, 50) || null,
            href: element.href || null,
            dataAttributes: this.getDataAttributes(element)
        };
    }

    /**
     * Obtiene atributos data- del elemento
     */
    getDataAttributes(element) {
        const dataAttrs = {};
        for (let attr of element.attributes) {
            if (attr.name.startsWith('data-')) {
                dataAttrs[attr.name] = attr.value;
            }
        }
        return dataAttrs;
    }

    /**
     * Obtiene porcentaje de scroll
     */
    getScrollPercentage() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return Math.round((scrollTop / docHeight) * 100);
    }

    /**
     * Obtiene tamaño del viewport
     */
    getViewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    /**
     * Obtiene tipo de dispositivo
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 576) return 'mobile';
        if (width < 768) return 'mobile-landscape';
        if (width < 992) return 'tablet';
        if (width < 1200) return 'desktop';
        return 'desktop-large';
    }

    /**
     * Registra evento personalizado
     */
    trackCustomEvent(eventName, data = {}) {
        this.recordEvent({
            type: 'custom',
            eventName: eventName,
            data: data,
            sessionId: this.sessionId,
            path: window.location.pathname,
            timestamp: Date.now()
        });
    }

    /**
     * Registra error
     */
    trackError(error, context = {}) {
        this.recordEvent({
            type: 'error',
            sessionId: this.sessionId,
            message: error.message,
            stack: error.stack,
            context: context,
            path: window.location.pathname,
            timestamp: Date.now()
        });
    }

    /**
     * Registra performance
     */
    trackPerformance() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                this.recordEvent({
                    type: 'performance',
                    sessionId: this.sessionId,
                    metrics: {
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                        firstPaint: perfData.responseStart - perfData.requestStart,
                        totalLoadTime: perfData.loadEventEnd - perfData.fetchStart
                    },
                    path: window.location.pathname,
                    timestamp: Date.now()
                });
            }
        }
    }

    /**
     * Obtiene eventos del sessionId actual
     */
    getSessionEvents() {
        return this.events.filter(event => event.sessionId === this.sessionId);
    }

    /**
     * Limpia eventos locales
     */
    clearEvents() {
        this.events = [];
    }

    /**
     * Exporta eventos
     */
    exportEvents() {
        return JSON.stringify(this.events, null, 2);
    }
}

// Función helper para throttle
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

// Inicializar analytics globalmente
const analytics = new EcoMarketAnalytics({
    debug: false, // Cambiar a true para desarrollo
    trackPageViews: true,
    trackClicks: true,
    trackScroll: true
});

// Trackear performance cuando la página carga completamente
window.addEventListener('load', () => {
    setTimeout(() => analytics.trackPerformance(), 100);
});

// Trackear errores globales
window.addEventListener('error', (event) => {
    analytics.trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EcoMarketAnalytics, analytics };
}