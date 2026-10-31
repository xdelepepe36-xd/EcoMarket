/*
   EcoMarket Performance Optimizer
   Optimizaciones de rendimiento sin sobrecarga
   Author: EcoMarket Team
   Version: 4.0
*/

// ─────────────────────────────────────────────────────────────
// LAZY LOADING PARA IMÁGENES
// ─────────────────────────────────────────────────────────────

class LazyLoader {
    constructor() {
        this.init();
    }

    init() {
        // Lazy loading nativo con Intersection Observer
        if ('IntersectionObserver' in window) {
            this.setupNativeLazyLoading();
        } else {
            this.setupFallbackLazyLoading();
        }
    }

    setupNativeLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    setupFallbackLazyLoading() {
        // Fallback para navegadores antiguos
        window.addEventListener('scroll', this.throttle(() => {
            document.querySelectorAll('img[data-src]').forEach(img => {
                if (this.isInViewport(img)) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }, 200));
    }

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// ─────────────────────────────────────────────────────────────
// PREFETCH DE RECURSOS CRÍTICOS
// ─────────────────────────────────────────────────────────────

class ResourcePrefetcher {
    constructor() {
        this.init();
    }

    init() {
        this.prefetchCriticalResources();
        this.prefetchNextPages();
    }

    prefetchCriticalResources() {
        // Prefetch recursos críticos en idle
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.prefetchCSS();
                this.prefetchJS();
            });
        }
    }

    prefetchCSS() {
        const criticalCSS = [
            '/static/ecomarket-consolidated.css',
            '/static/ecomarket-themes-enhanced.css'
        ];

        criticalCSS.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            link.as = 'style';
            document.head.appendChild(link);
        });
    }

    prefetchJS() {
        const criticalJS = [
            '/static/ecomarket-consolidated.js',
            '/static/ecomarket-security-enhanced.js'
        ];

        criticalJS.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            link.as = 'script';
            document.head.appendChild(link);
        });
    }

    prefetchNextPages() {
        // Prefetch páginas probables
        const probablePages = [
            '/productos',
            '/favoritos',
            '/carrito'
        ];

        probablePages.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    }
}

// ─────────────────────────────────────────────────────────────
// OPTIMIZACIÓN DE ANIMACIONES
// ─────────────────────────────────────────────────────────────

class AnimationOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.reduceMotionOnLowEnd();
        this.optimizeAnimations();
    }

    reduceMotionOnLowEnd() {
        // Detectar dispositivos de bajo rendimiento
        const isLowEnd = this.isLowEndDevice();
        
        if (isLowEnd) {
            document.documentElement.setAttribute('data-performance', 'low');
            document.body.classList.add('reduced-motion');
        }
    }

    isLowEndDevice() {
        // Detectar dispositivos de bajo rendimiento
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            // Conexión lenta (< 2Mbps)
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                return true;
            }
            // Data saver activado
            if (connection.saveData) {
                return true;
            }
        }
        
        // Menos de 4 CPU cores
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            return true;
        }
        
        // Menos de 2GB RAM (estimado)
        if (navigator.deviceMemory && navigator.deviceMemory < 2) {
            return true;
        }
        
        return false;
    }

    optimizeAnimations() {
        // Usar requestAnimationFrame para animaciones
        window.addEventListener('scroll', this.throttle(() => {
            // Animaciones en scroll
        }, 16)); // ~60fps
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// ─────────────────────────────────────────────────────────────
// OPTIMIZACIÓN DE EVENT LISTENERS
// ─────────────────────────────────────────────────────────────

class EventOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.debounceResize();
        this.passiveScroll();
    }

    debounceResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Manejar resize después de que termina
                window.dispatchEvent(new CustomEvent('resized'));
            }, 250);
        });
    }

    passiveScroll() {
        // Hacer scroll listeners pasivos para mejor performance
        window.addEventListener('scroll', () => {
            // Scroll handler
        }, { passive: true });
    }
}

// ─────────────────────────────────────────────────────────────
// OPTIMIZACIÓN DE DOM
// ─────────────────────────────────────────────────────────────

class DOMOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.minimizeReflows();
        this.batchDOMUpdates();
    }

    minimizeReflows() {
        // Leer propiedades de layout en batch
        const readLayout = () => {
            // Leer todas las propiedades de layout necesarias
            const scrollTop = window.pageYOffset;
            const scrollLeft = window.pageXOffset;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            return { scrollTop, scrollLeft, viewportWidth, viewportHeight };
        };
    }

    batchDOMUpdates() {
        // Usar requestAnimationFrame para batch updates
        const updateDOM = (callback) => {
            requestAnimationFrame(() => {
                callback();
            });
        };
    }
}

// ─────────────────────────────────────────────────────────────
// MONITORING DE PERFORMANCE
// ─────────────────────────────────────────────────────────────

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.measureFCP();
        this.measureLCP();
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            
            this.metrics.pageLoadTime = pageLoadTime;
            this.metrics.domReadyTime = domReadyTime;
            
            console.log('Page Load Time:', pageLoadTime + 'ms');
            console.log('DOM Ready Time:', domReadyTime + 'ms');
        });
    }

    measureFCP() {
        // First Contentful Paint
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fcp = entries[0];
                this.metrics.fcp = fcp.startTime;
                console.log('FCP:', fcp.startTime + 'ms');
            });
            observer.observe({ entryTypes: ['paint'] });
        }
    }

    measureLCP() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lcp = entries[entries.length - 1];
                this.metrics.lcp = lcp.startTime;
                console.log('LCP:', lcp.startTime + 'ms');
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    getMetrics() {
        return this.metrics;
    }
}

// ─────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si no es dispositivo de muy bajo rendimiento
    const isVeryLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 2;
    
    if (!isVeryLowEnd) {
        new LazyLoader();
        new ResourcePrefetcher();
        new AnimationOptimizer();
        new EventOptimizer();
        new DOMOptimizer();
        
        // Solo en desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            new PerformanceMonitor();
        }
    }
});