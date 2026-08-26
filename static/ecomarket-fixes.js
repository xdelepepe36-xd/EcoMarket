/**
 * EcoMarket - Correcciones y Mejoras
 * Script para corregir errores críticos y mejorar funcionalidad
 */

const EcoFixes = {
    init() {
        this.fixConsoleErrors();
        this.fixMissingFunctions();
        this.fixModuleInitialization();
        this.addPolyfills();
        this.fixResponsiveIssues();
        this.fixPerformanceIssues();
    },

    // Corregir errores de consola
    fixConsoleErrors() {
        // Sobrescribir console.error en producción
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            const originalError = console.error;
            console.error = function(...args) {
                // Guardar errores en localStorage para debugging
                try {
                    const errors = JSON.parse(localStorage.getItem('ecomarket-errors') || '[]');
                    errors.push({
                        timestamp: new Date().toISOString(),
                        message: args.join(' ')
                    });
                    if (errors.length > 50) errors.shift();
                    localStorage.setItem('ecomarket-errors', JSON.stringify(errors));
                } catch (e) {}
                originalError.apply(console, args);
            };
        }
    },

    // Corregir funciones faltantes
    fixMissingFunctions() {
        // Función cambiarImagen (para detalle-producto.html)
        if (typeof window.cambiarImagen === 'undefined') {
            window.cambiarImagen = function(src, element) {
                const img = element.querySelector('.producto-img-real') || element.querySelector('img');
                if (img) {
                    img.src = src;
                }
            };
        }

        // Función cambiarTab (para detalle-producto.html)
        if (typeof window.cambiarTab === 'undefined') {
            window.cambiarTab = function(tabId) {
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.style.display = 'none';
                });
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                const targetTab = document.getElementById(tabId);
                if (targetTab) {
                    targetTab.style.display = 'block';
                }
                
                const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
                if (targetBtn) {
                    targetBtn.classList.add('active');
                }
            };
        }

        // Función compartir (para detalle-producto.html)
        if (typeof window.compartir === 'undefined') {
            window.compartir = function() {
                if (navigator.share) {
                    navigator.share({
                        title: document.title,
                        url: window.location.href
                    });
                } else {
                    // Fallback: copiar al portapapeles
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Enlace copiado al portapapeles');
                    });
                }
            };
        }

        // Función toggleFavorito (para detalle-producto.html)
        if (typeof window.toggleFavorito === 'undefined') {
            window.toggleFavorito = function(productId) {
                if (window.EcoFavorites) {
                    window.EcoFavorites.toggle(productId);
                }
            };
        }

        // Funciones de rating (para detalle-producto.html)
        if (typeof window.setRating === 'undefined') {
            window.setRating = function(rating) {
                const stars = document.querySelectorAll('.rating-star');
                stars.forEach((star, index) => {
                    if (index < rating) {
                        star.classList.add('active');
                    } else {
                        star.classList.remove('active');
                    }
                });
            };
        }

        if (typeof window.hoverStars === 'undefined') {
            window.hoverStars = function(rating) {
                const stars = document.querySelectorAll('.rating-star');
                stars.forEach((star, index) => {
                    if (index < rating) {
                        star.classList.add('hover');
                    } else {
                        star.classList.remove('hover');
                    }
                });
            };
        }

        if (typeof window.resetStars === 'undefined') {
            window.resetStars = function() {
                const stars = document.querySelectorAll('.rating-star');
                stars.forEach(star => {
                    star.classList.remove('hover');
                });
            };
        }

        // Función enviarResena (para detalle-producto.html)
        if (typeof window.enviarResena === 'undefined') {
            window.enviarResena = function() {
                alert('Función de reseñas en desarrollo');
            };
        }
    },

    // Corregir inicialización de módulos
    fixModuleInitialization() {
        // Escuchar cuando se carguen los módulos principales
        document.addEventListener('DOMContentLoaded', () => {
            // Esperar un momento para que los módulos se inicialicen
            setTimeout(() => {
                // Verificar qué módulos están disponibles
                const availableModules = Object.keys(window).filter(key => 
                    key.startsWith('Eco') && typeof window[key] === 'object'
                );
                
                console.log('Módulos EcoMarket disponibles:', availableModules);
                
                // Inicializar módulos que tengan método init
                availableModules.forEach(moduleName => {
                    const module = window[moduleName];
                    if (module && typeof module.init === 'function' && moduleName !== 'EcoMarket') {
                        try {
                            module.init();
                        } catch (e) {
                            console.warn(`Error inicializando ${moduleName}:`, e);
                        }
                    }
                });
            }, 100);
        });
    },

    // Agregar polyfills para navegadores antiguos
    addPolyfills() {
        // Polyfill para closest
        if (!Element.prototype.closest) {
            Element.prototype.closest = function(selector) {
                let el = this;
                while (el) {
                    if (el.matches && el.matches(selector)) return el;
                    el = el.parentElement;
                }
                return null;
            };
        }

        // Polyfill para matches
        if (!Element.prototype.matches) {
            Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                      Element.prototype.webkitMatchesSelector;
        }

        // Polyfill para requestAnimationFrame
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                return setTimeout(callback, 16);
            };
        }
    },

    // Corregir problemas responsive
    fixResponsiveIssues() {
        // Ajustar viewport meta tag si es necesario
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        }

        // Agregar manejo de orientación
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        });
    },

    // Corregir problemas de rendimiento
    fixPerformanceIssues() {
        // Lazy loading de imágenes
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Prevenir scroll jank
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
};

// Inicializar correcciones
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoFixes.init());
} else {
    EcoFixes.init();
}

// Exponer globalmente
window.EcoFixes = EcoFixes;
