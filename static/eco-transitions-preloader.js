/**
 * eco-transitions-preloader.js - Sistema de transiciones y preloader
 * 
 * Funcionalidades:
 - Animaciones de transicion entre paginas
 - Preloader personalizado
 - Efectos de carga
 - Transiciones suaves
 - Animaciones de entrada/salida
 */

class EcoTransitionsPreloader {
    constructor(options = {}) {
        this.options = {
            storageKey: options.storageKey || 'ecomarket_transitions',
            enablePreloader: options.enablePreloader !== false,
            enableTransitions: options.enableTransitions !== false,
            transitionType: options.transitionType || 'fade', // fade, slide, zoom, flip
            ...options
        };
        
        this.preloader = null;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        this.createPreloader();
        this.createTransitionStyles();
        this.setupEventListeners();
        this.hidePreloader();
    }
    
    createPreloader() {
        this.preloader = document.createElement('div');
        this.preloader.className = 'eco-preloader';
        this.preloader.innerHTML = `
            <div class="eco-preloader-content">
                <div class="eco-logo">
                    <i class="bi bi-flower1"></i>
                </div>
                <div class="eco-loader">
                    <div class="eco-loader-ring"></div>
                    <div class="eco-loader-ring"></div>
                    <div class="eco-loader-ring"></div>
                </div>
                <div class="eco-preloader-text">Cargando EcoMarket...</div>
            </div>
        `;
        
        document.body.appendChild(this.preloader);
    }
    
    createTransitionStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Preloader */
            .eco-preloader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, var(--verde, #2e7d32), var(--verde-claro, #4caf50));
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                transition: opacity 0.5s ease, visibility 0.5s ease;
            }
            
            .eco-preloader.hidden {
                opacity: 0;
                visibility: hidden;
            }
            
            .eco-preloader-content {
                text-align: center;
                color: white;
            }
            
            .eco-logo {
                font-size: 4rem;
                margin-bottom: 20px;
                animation: eco-logo-pulse 2s ease-in-out infinite;
            }
            
            @keyframes eco-logo-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .eco-loader {
                position: relative;
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
            }
            
            .eco-loader-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 4px solid transparent;
                border-top-color: white;
                border-radius: 50%;
                animation: eco-loader-spin 1.5s linear infinite;
            }
            
            .eco-loader-ring:nth-child(1) {
                animation-delay: 0s;
            }
            
            .eco-loader-ring:nth-child(2) {
                width: 70%;
                height: 70%;
                top: 15%;
                left: 15%;
                animation-delay: 0.15s;
            }
            
            .eco-loader-ring:nth-child(3) {
                width: 40%;
                height: 40%;
                top: 30%;
                left: 30%;
                animation-delay: 0.3s;
            }
            
            @keyframes eco-loader-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .eco-preloader-text {
                font-size: 1.2rem;
                font-weight: 600;
                animation: eco-text-pulse 1.5s ease-in-out infinite;
            }
            
            @keyframes eco-text-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* Transiciones */
            .eco-page-transition {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
            }
            
            .eco-transition-fade-enter {
                animation: eco-fade-in 0.5s ease forwards;
            }
            
            .eco-transition-fade-exit {
                animation: eco-fade-out 0.5s ease forwards;
            }
            
            @keyframes eco-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes eco-fade-out {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            .eco-transition-slide-enter {
                animation: eco-slide-in 0.5s ease forwards;
            }
            
            .eco-transition-slide-exit {
                animation: eco-slide-out 0.5s ease forwards;
            }
            
            @keyframes eco-slide-in {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            
            @keyframes eco-slide-out {
                from { transform: translateX(0); }
                to { transform: translateX(-100%); }
            }
            
            .eco-transition-zoom-enter {
                animation: eco-zoom-in 0.5s ease forwards;
            }
            
            .eco-transition-zoom-exit {
                animation: eco-zoom-out 0.5s ease forwards;
            }
            
            @keyframes eco-zoom-in {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            @keyframes eco-zoom-out {
                from { transform: scale(1); opacity: 1; }
                to { transform: scale(1.2); opacity: 0; }
            }
            
            .eco-transition-flip-enter {
                animation: eco-flip-in 0.6s ease forwards;
            }
            
            .eco-transition-flip-exit {
                animation: eco-flip-out 0.6s ease forwards;
            }
            
            @keyframes eco-flip-in {
                from { transform: rotateY(-90deg); opacity: 0; }
                to { transform: rotateY(0); opacity: 1; }
            }
            
            @keyframes eco-flip-out {
                from { transform: rotateY(0); opacity: 1; }
                to { transform: rotateY(90deg); opacity: 0; }
            }
            
            /* Prefers-reduced-motion */
            @media (prefers-reduced-motion: reduce) {
                .eco-preloader,
                .eco-logo,
                .eco-loader-ring,
                .eco-preloader-text,
                .eco-page-transition {
                    animation: none !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Interceptar navegación para transiciones
        document.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Solo aplicar transiciones a enlaces internos
                if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto')) {
                    e.preventDefault();
                    this.transitionTo(href);
                }
            });
        });
    }
    
    transitionTo(url) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Crear overlay de transición
        const overlay = document.createElement('div');
        overlay.className = 'eco-page-transition';
        overlay.classList.add(`eco-transition-${this.options.transitionType}-exit`);
        document.body.appendChild(overlay);
        
        // Esperar animación de salida
        setTimeout(() => {
            window.location.href = url;
        }, 500);
    }
    
    showPreloader() {
        if (this.preloader) {
            this.preloader.classList.remove('hidden');
        }
    }
    
    hidePreloader() {
        if (this.preloader) {
            setTimeout(() => {
                this.preloader.classList.add('hidden');
            }, 1500);
        }
    }
    
    setTransitionType(type) {
        this.options.transitionType = type;
    }
    
    destroy() {
        if (this.preloader) {
            this.preloader.remove();
        }
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const transitionsContainer = document.querySelector('[data-eco-transitions]');
    if (transitionsContainer && transitionsContainer.dataset.ecoTransitions !== 'false') {
        window.ecoTransitionsPreloader = new EcoTransitionsPreloader({
            ...transitionsContainer.dataset
        });
    } else {
        // Inicializar por defecto si no hay configuración
        window.ecoTransitionsPreloader = new EcoTransitionsPreloader();
    }
});