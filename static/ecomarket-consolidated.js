/**
 * EcoMarket - JavaScript Consolidado y Optimizado
 * Versión consolidada para mejor rendimiento
 * Combina funcionalidades principales optimizadas
 */

// ════════════════════════════════════════════════════════════
// UTILIDADES GLOBALES
// ════════════════════════════════════════════════════════════

const EcoMarket = {
    version: 'CONSOLIDATED-1.0',
    
    config: {
        apiBase: '/api',
        currency: 'S/',
        itemsPerPage: 12
    },
    
    state: {
        theme: localStorage.getItem('ecomarket-theme') || 'light',
        lang: localStorage.getItem('ecomarket-lang') || 'es',
        user: null
    },
    
    themes: ['light', 'dark', 'sepia', 'nature', 'ocean', 'midnight', 'rose', 'high-contrast'],
    
    init() {
        this.initTheme();
        this.initLang();
        this.initSplashScreen();
        this.initNavbar();
        this.initStorage();
        this.initPerformance();
        this.initServiceWorker();
    },
    
    // Sistema de Temas
    initTheme() {
        const themeToggle = document.querySelector('[data-theme-switcher]');
        
        if (!themeToggle) {
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'theme-toggle';
                toggleBtn.setAttribute('data-theme-switcher', '');
                toggleBtn.setAttribute('aria-label', 'Cambiar tema');
                toggleBtn.innerHTML = this.getThemeIcon(this.state.theme);
                headerActions.insertBefore(toggleBtn, headerActions.firstChild);
                toggleBtn.addEventListener('click', () => this.toggleTheme());
            }
        } else {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        document.documentElement.setAttribute('data-theme', this.state.theme);
    },
    
    toggleTheme() {
        const currentIndex = this.themes.indexOf(this.state.theme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.state.theme = this.themes[nextIndex];
        document.documentElement.setAttribute('data-theme', this.state.theme);
        localStorage.setItem('ecomarket-theme', this.state.theme);
        
        const toggleBtn = document.querySelector('[data-theme-switcher]');
        if (toggleBtn) {
            toggleBtn.innerHTML = this.getThemeIcon(this.state.theme);
        }
    },
    
    getThemeIcon(theme) {
        const icons = {
            'light': '<i class="bi bi-sun"></i>',
            'dark': '<i class="bi bi-moon"></i>',
            'sepia': '<i class="bi bi-book"></i>',
            'nature': '<i class="bi bi-tree"></i>',
            'ocean': '<i class="bi bi-water"></i>',
            'midnight': '<i class="bi bi-stars"></i>',
            'rose': '<i class="bi bi-heart"></i>',
            'high-contrast': '<i class="bi bi-eye"></i>'
        };
        return icons[theme] || '<i class="bi bi-palette"></i>';
    },
    
    // Sistema de Idiomas
    initLang() {
        const langBtns = document.querySelectorAll('[data-eco-lang-btn]');
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLang(lang);
            });
        });
        
        this.setLang(this.state.lang, false);
    },
    
    setLang(lang, save = true) {
        this.state.lang = lang;
        if (save) {
            localStorage.setItem('ecomarket-lang', lang);
        }
        
        document.querySelectorAll('[data-eco-lang-btn]').forEach(btn => {
            btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
        });
    },
    
    // Splash Screen
    initSplashScreen() {
        const splashScreen = document.getElementById('splashScreen');
        if (splashScreen) {
            setTimeout(() => {
                splashScreen.classList.add('hidden');
                setTimeout(() => {
                    splashScreen.remove();
                }, 500);
            }, 1500);
        }
    },
    
    // Service Worker Registration
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/static/sw.js')
                    .then((registration) => {
                        console.log('SW registered:', registration.scope);
                        
                        // Verificar actualizaciones
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // Nuevo SW disponible
                                    if (window.EcoToast) {
                                        EcoToast.show('Actualización disponible', 'Recarga la página para actualizar', 'info', 10000);
                                    }
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        console.log('SW registration failed:', error);
                    });
            });
        }
    },
    
    // Navbar Mobile
    initNavbar() {
        const navToggle = document.getElementById('navToggle');
        const navbar = document.querySelector('.navbar');
        
        if (navToggle && navbar) {
            navToggle.addEventListener('click', () => {
                navbar.classList.toggle('active');
            });
            
            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!navbar.contains(e.target) && !navToggle.contains(e.target)) {
                    navbar.classList.remove('active');
                }
            });
        }
    },
    
    // Storage seguro
    initStorage() {
        window.EcoStorage = {
            get: (key, defaultValue = null) => {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : defaultValue;
                } catch (e) {
                    console.warn(`Error leyendo ${key}:`, e);
                    return defaultValue;
                }
            },
            set: (key, value) => {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    console.warn(`Error guardando ${key}:`, e);
                    return false;
                }
            },
            remove: (key) => {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    console.warn(`Error eliminando ${key}:`, e);
                    return false;
                }
            }
        };
    },
    
    // Optimizaciones de rendimiento
    initPerformance() {
        // Lazy loading de imágenes
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                        }
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
        
        // Debounce y throttle
        window.debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };
        
        window.throttle = (func, limit) => {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        };
        
        // Optimizar scroll
        window.addEventListener('scroll', throttle(() => {
            // Scroll handling optimizado
        }, 100), { passive: true });
        
        // Detectar preferencia de reducción de movimiento
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transicion-rapida', '0s');
            document.documentElement.style.setProperty('--transicion-normal', '0s');
            document.documentElement.style.setProperty('--transicion-lenta', '0s');
        }
    }
};

// ════════════════════════════════════════════════════════════
// SISTEMA DE FAVORITOS
// ════════════════════════════════════════════════════════════

const EcoFavorites = {
    favoritos: [],
    
    init() {
        this.cargarFavoritos();
        this.actualizarContador();
    },
    
    cargarFavoritos() {
        this.favoritos = EcoStorage.get('ecomarket-favoritos', []);
    },
    
    guardarFavoritos() {
        EcoStorage.set('ecomarket-favoritos', this.favoritos);
        this.actualizarContador();
    },
    
    toggle(productId) {
        const index = this.favoritos.indexOf(productId);
        if (index > -1) {
            this.favoritos.splice(index, 1);
        } else {
            this.favoritos.push(productId);
        }
        this.guardarFavoritos();
        return this.esFavorito(productId);
    },
    
    esFavorito(productId) {
        return this.favoritos.includes(productId);
    },
    
    actualizarContador() {
        const contador = document.getElementById('favoritesCount');
        if (contador) {
            contador.textContent = this.favoritos.length;
        }
    }
};

// ════════════════════════════════════════════════════════════
// SISTEMA DE CARRITO
// ════════════════════════════════════════════════════════════

const EcoCart = {
    items: [],
    
    init() {
        this.cargarCarrito();
        this.actualizarContador();
    },
    
    cargarCarrito() {
        this.items = EcoStorage.get('ecomarket-carrito', []);
    },
    
    guardarCarrito() {
        EcoStorage.set('ecomarket-carrito', this.items);
        this.actualizarContador();
    },
    
    agregar(producto, cantidad = 1) {
        const existente = this.items.find(item => item.id === producto.id);
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            this.items.push({ ...producto, cantidad });
        }
        this.guardarCarrito();
    },
    
    eliminar(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.guardarCarrito();
    },
    
    actualizarCantidad(productId, cantidad) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.cantidad = cantidad;
            if (item.cantidad <= 0) {
                this.eliminar(productId);
            } else {
                this.guardarCarrito();
            }
        }
    },
    
    obtenerTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    },
    
    actualizarContador() {
        const contador = document.getElementById('cartCount');
        if (contador) {
            const totalItems = this.items.reduce((sum, item) => sum + item.cantidad, 0);
            contador.textContent = totalItems;
            contador.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    },
    
    limpiar() {
        this.items = [];
        this.guardarCarrito();
    }
};

// ════════════════════════════════════════════════════════════
// SISTEMA DE TOASTS
// ════════════════════════════════════════════════════════════

const EcoToast = {
    container: null,
    
    init() {
        this.crearContainer();
    },
    
    crearContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(this.container);
        }
    },
    
    show(titulo, mensaje, tipo = 'info', duracion = 3000) {
        this.crearContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.style.cssText = `
            background: var(--surface);
            border-left: 4px solid var(--${tipo === 'error' ? 'rojo' : tipo === 'success' ? 'verde' : 'azul'});
            padding: 16px;
            border-radius: 8px;
            box-shadow: var(--sombra);
            min-width: 300px;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        
        const iconos = {
            success: 'bi-check-circle',
            error: 'bi-x-circle',
            warning: 'bi-exclamation-triangle',
            info: 'bi-info-circle'
        };
        
        toast.innerHTML = `
            <i class="bi ${iconos[tipo]}"></i>
            <div>
                <strong>${titulo}</strong>
                <p>${mensaje}</p>
            </div>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duracion);
    }
};

// ════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ════════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        EcoMarket.init();
        EcoFavorites.init();
        EcoCart.init();
        EcoToast.init();
    });
} else {
    EcoMarket.init();
    EcoFavorites.init();
    EcoCart.init();
    EcoToast.init();
}

// Exponer globalmente
window.EcoMarket = EcoMarket;
window.EcoFavorites = EcoFavorites;
window.EcoCart = EcoCart;
window.EcoToast = EcoToast;