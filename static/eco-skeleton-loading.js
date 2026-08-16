/**
 * eco-skeleton-loading.js - Sistema de skeleton loading para EcoMarket
 * 
 * Funcionalidades:
 - Skeleton screens para productos, perfil, carrito, etc.
 - Animaciones de carga suaves
 - Soporte para diferentes patrones de skeleton
 - Integración con componentes existentes
 - Theme-aware (se adapta al tema actual)
 - Accesible con aria-busy
 */

class EcoSkeletonLoading {
    constructor(options = {}) {
        this.options = {
            duration: options.duration || 2000,
            shimmer: options.shimmer !== false,
            animationType: options.animationType || 'shimmer', // shimmer, pulse, fade
            theme: options.theme || 'default',
            ...options
        };
        
        this.skeletons = new Map();
        this.init();
    }
    
    init() {
        this.setupGlobalSkeleton();
        this.createSkeletonStyles();
    }
    
    createSkeletonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .eco-skeleton {
                background: var(--gris-claro, #f5f5f5);
                border-radius: 4px;
                position: relative;
                overflow: hidden;
            }
            
            .eco-skeleton.shimmer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    90deg,
                    var(--gris-claro, #f5f5f5) 0%,
                    var(--gris-medio, #e0e0e0) 50%,
                    var(--gris-claro, #f5f5f5) 100%
                );
                background-size: 200% 100%;
                animation: eco-shimmer 1.5s infinite;
            }
            
            .eco-skeleton.pulse {
                animation: eco-pulse 1.5s ease-in-out infinite;
            }
            
            .eco-skeleton.fade {
                animation: eco-fade 1.5s ease-in-out infinite;
            }
            
            @keyframes eco-shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            @keyframes eco-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            @keyframes eco-fade {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.7; }
            }
            
            /* Skeleton de producto */
            .eco-skeleton-product {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 16px;
                border-radius: 8px;
            }
            
            .eco-skeleton-product-image {
                width: 100%;
                aspect-ratio: 4/3;
                border-radius: 8px;
            }
            
            .eco-skeleton-product-title {
                height: 24px;
                width: 80%;
                border-radius: 4px;
            }
            
            .eco-skeleton-product-price {
                height: 20px;
                width: 40%;
                border-radius: 4px;
            }
            
            .eco-skeleton-product-meta {
                height: 16px;
                width: 60%;
                border-radius: 4px;
            }
            
            /* Skeleton de lista */
            .eco-skeleton-list {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .eco-skeleton-list-item {
                display: flex;
                gap: 16px;
                padding: 12px;
                border-radius: 8px;
            }
            
            .eco-skeleton-list-image {
                width: 80px;
                height: 80px;
                border-radius: 8px;
                flex-shrink: 0;
            }
            
            .eco-skeleton-list-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .eco-skeleton-list-title {
                height: 20px;
                width: 70%;
                border-radius: 4px;
            }
            
            .eco-skeleton-list-desc {
                height: 16px;
                width: 90%;
                border-radius: 4px;
            }
            
            /* Skeleton de perfil */
            .eco-skeleton-profile {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 20px;
            }
            
            .eco-skeleton-avatar {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                margin: 0 auto;
            }
            
            .eco-skeleton-name {
                height: 24px;
                width: 50%;
                margin: 0 auto;
                border-radius: 4px;
            }
            
            .eco-skeleton-stats {
                display: flex;
                justify-content: center;
                gap: 24px;
            }
            
            .eco-skeleton-stat {
                height: 40px;
                width: 80px;
                border-radius: 8px;
            }
            
            /* Skeleton de carrito */
            .eco-skeleton-cart {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .eco-skeleton-cart-item {
                display: flex;
                gap: 16px;
                padding: 16px;
                border-radius: 8px;
            }
            
            .eco-skeleton-cart-summary {
                height: 200px;
                border-radius: 8px;
                padding: 20px;
            }
            
            /* Skeleton de texto */
            .eco-skeleton-text {
                height: 16px;
                border-radius: 4px;
            }
            
            .eco-skeleton-text-lg {
                height: 24px;
                border-radius: 4px;
            }
            
            .eco-skeleton-text-sm {
                height: 12px;
                border-radius: 4px;
            }
            
            /* Skeleton de botón */
            .eco-skeleton-button {
                height: 44px;
                border-radius: 8px;
                width: 100%;
            }
            
            /* Skeleton de imagen */
            .eco-skeleton-image {
                width: 100%;
                height: 200px;
                border-radius: 8px;
            }
            
            /* Skeleton de tarjeta */
            .eco-skeleton-card {
                padding: 20px;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .eco-skeleton-list-item {
                    flex-direction: column;
                }
                
                .eco-skeleton-list-image {
                    width: 100%;
                    height: 120px;
                }
            }
            
            /* Modo oscuro */
            @media (prefers-color-scheme: dark) {
                .eco-skeleton {
                    background: var(--gris-oscuro, #2a2a2a);
                }
                
                .eco-skeleton.shimmer::before {
                    background: linear-gradient(
                        90deg,
                        var(--gris-oscuro, #2a2a2a) 0%,
                        var(--gris-medio, #404040) 50%,
                        var(--gris-oscuro, #2a2a2a) 100%
                    );
                }
            }
            
            /* Prefers-reduced-motion */
            @media (prefers-reduced-motion: reduce) {
                .eco-skeleton.shimmer::before,
                .eco-skeleton.pulse,
                .eco-skeleton.fade {
                    animation: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupGlobalSkeleton() {
        // Skeleton automático para elementos con data-skeleton
        const skeletonElements = document.querySelectorAll('[data-skeleton]');
        skeletonElements.forEach(element => {
            this.showSkeleton(element);
        });
    }
    
    showSkeleton(element, type = 'default') {
        const skeleton = this.createSkeleton(type);
        skeleton.setAttribute('aria-busy', 'true');
        skeleton.setAttribute('role', 'status');
        skeleton.setAttribute('aria-label', 'Cargando...');
        
        element.style.display = 'none';
        element.parentNode.insertBefore(skeleton, element);
        
        this.skeletons.set(element, skeleton);
        
        return skeleton;
    }
    
    hideSkeleton(element) {
        const skeleton = this.skeletons.get(element);
        if (skeleton) {
            skeleton.remove();
            element.style.display = '';
            this.skeletons.delete(element);
        }
    }
    
    createSkeleton(type) {
        const skeleton = document.createElement('div');
        skeleton.className = `eco-skeleton ${this.options.animationType}`;
        
        switch (type) {
            case 'product':
                skeleton.innerHTML = `
                    <div class="eco-skeleton-product">
                        <div class="eco-skeleton eco-skeleton-product-image"></div>
                        <div class="eco-skeleton eco-skeleton-product-title"></div>
                        <div class="eco-skeleton eco-skeleton-product-price"></div>
                        <div class="eco-skeleton eco-skeleton-product-meta"></div>
                    </div>
                `;
                break;
                
            case 'list':
                skeleton.innerHTML = `
                    <div class="eco-skeleton-list">
                        ${Array(5).fill().map(() => `
                            <div class="eco-skeleton-list-item">
                                <div class="eco-skeleton eco-skeleton-list-image"></div>
                                <div class="eco-skeleton-list-content">
                                    <div class="eco-skeleton eco-skeleton-list-title"></div>
                                    <div class="eco-skeleton eco-skeleton-list-desc"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'profile':
                skeleton.innerHTML = `
                    <div class="eco-skeleton-profile">
                        <div class="eco-skeleton eco-skeleton-avatar"></div>
                        <div class="eco-skeleton eco-skeleton-name"></div>
                        <div class="eco-skeleton-stats">
                            <div class="eco-skeleton eco-skeleton-stat"></div>
                            <div class="eco-skeleton eco-skeleton-stat"></div>
                            <div class="eco-skeleton eco-skeleton-stat"></div>
                        </div>
                    </div>
                `;
                break;
                
            case 'cart':
                skeleton.innerHTML = `
                    <div class="eco-skeleton-cart">
                        ${Array(3).fill().map(() => `
                            <div class="eco-skeleton-cart-item">
                                <div class="eco-skeleton eco-skeleton-list-image"></div>
                                <div class="eco-skeleton-list-content">
                                    <div class="eco-skeleton eco-skeleton-list-title"></div>
                                    <div class="eco-skeleton eco-skeleton-list-desc"></div>
                                </div>
                            </div>
                        `).join('')}
                        <div class="eco-skeleton eco-skeleton-cart-summary"></div>
                    </div>
                `;
                break;
                
            case 'card':
                skeleton.innerHTML = `
                    <div class="eco-skeleton-card">
                        <div class="eco-skeleton eco-skeleton-text-lg"></div>
                        <div class="eco-skeleton eco-skeleton-text"></div>
                        <div class="eco-skeleton eco-skeleton-text"></div>
                        <div class="eco-skeleton eco-skeleton-button"></div>
                    </div>
                `;
                break;
                
            case 'text':
                skeleton.className += ' eco-skeleton-text';
                break;
                
            case 'text-lg':
                skeleton.className += ' eco-skeleton-text-lg';
                break;
                
            case 'text-sm':
                skeleton.className += ' eco-skeleton-text-sm';
                break;
                
            case 'button':
                skeleton.className += ' eco-skeleton-button';
                break;
                
            case 'image':
                skeleton.className += ' eco-skeleton-image';
                break;
                
            default:
                skeleton.className += ' eco-skeleton-text';
        }
        
        return skeleton;
    }
    
    async withSkeleton(element, type, callback) {
        this.showSkeleton(element, type);
        
        try {
            const result = await callback();
            this.hideSkeleton(element);
            return result;
        } catch (error) {
            this.hideSkeleton(element);
            throw error;
        }
    }
    
    destroy() {
        this.skeletons.forEach((skeleton, element) => {
            skeleton.remove();
            element.style.display = '';
        });
        this.skeletons.clear();
    }
}

// Helper functions globales
window.ecoSkeleton = {
    show: (element, type) => {
        const skeleton = new EcoSkeletonLoading();
        return skeleton.showSkeleton(element, type);
    },
    
    hide: (element) => {
        const skeleton = new EcoSkeletonLoading();
        return skeleton.hideSkeleton(element);
    },
    
    with: (element, type, callback) => {
        const skeleton = new EcoSkeletonLoading();
        return skeleton.withSkeleton(element, type, callback);
    }
};

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    window.ecoSkeletonLoader = new EcoSkeletonLoading();
});