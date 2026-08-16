/**
 * eco-micro-interactions.js - Sistema de micro-interacciones y animaciones
 * 
 * Funcionalidades:
 - Animaciones suaves para botones y cards
 - Hover effects mejorados
 - Transiciones fluidas
 - Loading states animados
 - Success/error animations
 - Ripple effects
 - Scale y transform animations
 - Micro-interacciones táctiles
 */

class EcoMicroInteractions {
    constructor(options = {}) {
        this.options = {
            enableRipple: options.enableRipple !== false,
            enableHoverEffects: options.enableHoverEffects !== false,
            enableClickAnimations: options.enableClickAnimations !== false,
            enableLoadingStates: options.enableLoadingStates !== false,
            animationDuration: options.animationDuration || 300,
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.createStyles();
        this.setupRippleEffects();
        this.setupHoverEffects();
        this.setupClickAnimations();
        this.setupLoadingStates();
        this.setupScrollAnimations();
        this.setupCardAnimations();
    }
    
    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Ripple effect */
            .eco-ripple {
                position: relative;
                overflow: hidden;
            }
            
            .eco-ripple::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                pointer-events: none;
                background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%);
                background-repeat: no-repeat;
                background-position: 50%;
                transform: scale(10, 10);
                opacity: 0;
                transition: transform 0.5s, opacity 1s;
            }
            
            .eco-ripple:active::after {
                transform: scale(0, 0);
                opacity: 0.3;
                transition: 0s;
            }
            
            /* Hover effects */
            .eco-hover-lift {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .eco-hover-lift:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
            }
            
            .eco-hover-scale {
                transition: transform 0.3s ease;
            }
            
            .eco-hover-scale:hover {
                transform: scale(1.05);
            }
            
            .eco-hover-glow {
                transition: box-shadow 0.3s ease;
            }
            
            .eco-hover-glow:hover {
                box-shadow: 0 0 20px rgba(46, 125, 50, 0.4);
            }
            
            .eco-hover-brightness {
                transition: filter 0.3s ease;
            }
            
            .eco-hover-brightness:hover {
                filter: brightness(1.1);
            }
            
            /* Click animations */
            .eco-click-bounce:active {
                animation: eco-bounce 0.3s ease;
            }
            
            @keyframes eco-bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(0.95); }
            }
            
            .eco-click-shrink:active {
                animation: eco-shrink 0.2s ease;
            }
            
            @keyframes eco-shrink {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(0.9); }
            }
            
            /* Loading states */
            .eco-loading-pulse {
                animation: eco-pulse 1.5s ease-in-out infinite;
            }
            
            @keyframes eco-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .eco-loading-spin {
                animation: eco-spin 1s linear infinite;
            }
            
            @keyframes eco-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .eco-loading-dots::after {
                content: '';
                animation: eco-dots 1.5s steps(4, end) infinite;
            }
            
            @keyframes eco-dots {
                0%, 20% { content: ''; }
                40% { content: '.'; }
                60% { content: '..'; }
                80%, 100% { content: '...'; }
            }
            
            /* Success/Error animations */
            .eco-success-animation {
                animation: eco-success 0.5s ease;
            }
            
            @keyframes eco-success {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .eco-error-animation {
                animation: eco-error 0.5s ease;
            }
            
            @keyframes eco-error {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
            
            /* Card animations */
            .eco-card-enter {
                animation: eco-card-enter 0.5s ease forwards;
            }
            
            @keyframes eco-card-enter {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .eco-card-exit {
                animation: eco-card-exit 0.3s ease forwards;
            }
            
            @keyframes eco-card-exit {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.9);
                }
            }
            
            /* Scroll animations */
            .eco-scroll-fade {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .eco-scroll-fade.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .eco-scroll-slide-left {
                opacity: 0;
                transform: translateX(-30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .eco-scroll-slide-left.visible {
                opacity: 1;
                transform: translateX(0);
            }
            
            .eco-scroll-slide-right {
                opacity: 0;
                transform: translateX(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .eco-scroll-slide-right.visible {
                opacity: 1;
                transform: translateX(0);
            }
            
            .eco-scroll-zoom {
                opacity: 0;
                transform: scale(0.8);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .eco-scroll-zoom.visible {
                opacity: 1;
                transform: scale(1);
            }
            
            /* Button micro-interactions */
            .eco-btn-hover {
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .eco-btn-hover::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
            }
            
            .eco-btn-hover:hover::before {
                width: 300px;
                height: 300px;
            }
            
            /* Heart animation for favorites */
            .eco-heart-animation {
                animation: eco-heart 0.3s ease;
            }
            
            @keyframes eco-heart {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
            
            /* Cart shake animation */
            .eco-cart-shake {
                animation: eco-cart-shake 0.5s ease;
            }
            
            @keyframes eco-cart-shake {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-10deg); }
                75% { transform: rotate(10deg); }
            }
            
            /* Notification slide */
            .eco-notification-slide {
                animation: eco-notification-slide 0.5s ease;
            }
            
            @keyframes eco-notification-slide {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            /* Tooltip animations */
            .eco-tooltip-enter {
                animation: eco-tooltip-enter 0.2s ease;
            }
            
            @keyframes eco-tooltip-enter {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Image lazy load animation */
            .eco-image-load {
                animation: eco-image-load 0.5s ease;
            }
            
            @keyframes eco-image-load {
                from {
                    opacity: 0;
                    transform: scale(1.1);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            /* Progress bar animation */
            .eco-progress-animated {
                background: linear-gradient(
                    90deg,
                    var(--verde, #2e7d32) 0%,
                    var(--verde-claro, #4caf50) 50%,
                    var(--verde, #2e7d32) 100%
                );
                background-size: 200% 100%;
                animation: eco-progress 1s linear infinite;
            }
            
            @keyframes eco-progress {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            /* Stagger animation for lists */
            .eco-stagger-item {
                opacity: 0;
                animation: eco-stagger 0.5s ease forwards;
            }
            
            @keyframes eco-stagger {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Prefers-reduced-motion */
            @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupRippleEffects() {
        if (!this.options.enableRipple) return;
        
        document.querySelectorAll('button, .btn, [data-ripple]').forEach(element => {
            element.classList.add('eco-ripple');
        });
    }
    
    setupHoverEffects() {
        if (!this.options.enableHoverEffects) return;
        
        // Cards
        document.querySelectorAll('.card, .product-card, [data-hover-lift]').forEach(card => {
            card.classList.add('eco-hover-lift');
        });
        
        // Images
        document.querySelectorAll('img, [data-hover-scale]').forEach(img => {
            img.classList.add('eco-hover-scale');
        });
        
        // Buttons with glow
        document.querySelectorAll('.btn-primary, [data-hover-glow]').forEach(btn => {
            btn.classList.add('eco-hover-glow');
        });
    }
    
    setupClickAnimations() {
        if (!this.options.enableClickAnimations) return;
        
        document.querySelectorAll('button, .btn, [data-click-bounce]').forEach(btn => {
            btn.classList.add('eco-click-bounce');
        });
        
        document.querySelectorAll('a, [data-click-shrink]').forEach(link => {
            link.classList.add('eco-click-shrink');
        });
    }
    
    setupLoadingStates() {
        if (!this.options.enableLoadingStates) return;
        
        // Agregar función de loading a botones
        document.querySelectorAll('button, .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('eco-loading')) return;
                
                btn.classList.add('eco-loading', 'eco-loading-pulse');
                btn.disabled = true;
                
                // Simular loading (en producción, esto sería controlado por el estado real)
                setTimeout(() => {
                    btn.classList.remove('eco-loading', 'eco-loading-pulse');
                    btn.disabled = false;
                }, 2000);
            });
        });
    }
    
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Animar elementos con scroll
        document.querySelectorAll('[data-scroll-animate]').forEach(element => {
            const animationType = element.dataset.scrollAnimate || 'fade';
            element.classList.add(`eco-scroll-${animationType}`);
            observer.observe(element);
        });
    }
    
    setupCardAnimations() {
        // Animación de entrada para cards
        document.querySelectorAll('.card, .product-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('eco-card-enter');
        });
    }
    
    // Métodos públicos para animaciones específicas
    animateSuccess(element) {
        element.classList.add('eco-success-animation');
        setTimeout(() => {
            element.classList.remove('eco-success-animation');
        }, 500);
    }
    
    animateError(element) {
        element.classList.add('eco-error-animation');
        setTimeout(() => {
            element.classList.remove('eco-error-animation');
        }, 500);
    }
    
    animateHeart(element) {
        element.classList.add('eco-heart-animation');
        setTimeout(() => {
            element.classList.remove('eco-heart-animation');
        }, 300);
    }
    
    animateCart(element) {
        element.classList.add('eco-cart-shake');
        setTimeout(() => {
            element.classList.remove('eco-cart-shake');
        }, 500);
    }
    
    staggerAnimate(elements, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('eco-stagger-item');
                element.style.animationDelay = '0s';
            }, index * delay);
        });
    }
    
    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('eco-loading', 'eco-loading-pulse');
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<i class="bi bi-spinner eco-loading-spin"></i>';
        } else {
            button.classList.remove('eco-loading', 'eco-loading-pulse');
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'Botón';
        }
    }
    
    destroy() {
        // Limpiar estilos
        const styles = document.querySelectorAll('style[data-eco-micro]');
        styles.forEach(style => style.remove());
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    window.ecoMicroInteractions = new EcoMicroInteractions();
});

// Helper functions globales
window.ecoAnimate = {
    success: (element) => {
        if (window.ecoMicroInteractions) {
            window.ecoMicroInteractions.animateSuccess(element);
        }
    },
    
    error: (element) => {
        if (window.ecoMicroInteractions) {
            window.ecoMicroInteractions.animateError(element);
        }
    },
    
    heart: (element) => {
        if (window.ecoMicroInteractions) {
            window.ecoMicroInteractions.animateHeart(element);
        }
    },
    
    cart: (element) => {
        if (window.ecoMicroInteractions) {
            window.ecoMicroInteractions.animateCart(element);
        }
    },
    
    stagger: (elements, delay) => {
        if (window.ecoMicroInteractions) {
            window.ecoMicroInteractions.staggerAnimate(elements, delay);
        }
    },
    
    buttonLoading: (button, loading) => {
        if (window.ecoMicroInteractions) {
            window.ecoMicroInteractions.setButtonLoading(button, loading);
        }
    }
};