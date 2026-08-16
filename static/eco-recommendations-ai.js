/**
 * eco-recommendations-ai.js - Sistema de recomendaciones con IA
 * 
 * Funcionalidades:
 - Recomendaciones personalizadas basadas en comportamiento
 - Análisis de historial de compras
 - Colaborative filtering
 - Content-based filtering
 - "Porque te gustó esto"
 - Productos similares
 - Tendencias personalizadas
 */

class EcoRecommendationsAI {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/recomendaciones',
            storageKey: options.storageKey || 'ecomarket_recommendations',
            enableBehaviorTracking: options.enableBehaviorTracking !== false,
            maxRecommendations: options.maxRecommendations || 10,
            ...options
        };
        
        this.userBehavior = {
            views: [],
            purchases: [],
            favorites: [],
            searches: [],
            categories: []
        };
        
        this.recommendations = [];
        
        this.init();
    }
    
    init() {
        this.loadUserBehavior();
        this.setupBehaviorTracking();
        this.loadRecommendations();
    }
    
    setupBehaviorTracking() {
        if (!this.options.enableBehaviorTracking) return;
        
        // Track vistas de productos
        document.addEventListener('ecommerce:product:view', (e) => {
            this.trackView(e.detail.product_id);
        });
        
        // Track compras
        document.addEventListener('ecommerce:purchase', (e) => {
            this.trackPurchase(e.detail.product_id);
        });
        
        // Track favoritos
        document.addEventListener('ecommerce:favorite', (e) => {
            this.trackFavorite(e.detail.product_id);
        });
        
        // Track búsquedas
        document.addEventListener('ecommerce:search', (e) => {
            this.trackSearch(e.detail.query);
        });
    }
    
    trackView(productId) {
        this.userBehavior.views.push({
            product_id: productId,
            timestamp: new Date().toISOString()
        });
        
        this.saveUserBehavior();
    }
    
    trackPurchase(productId) {
        this.userBehavior.purchases.push({
            product_id: productId,
            timestamp: new Date().toISOString()
        });
        
        this.saveUserBehavior();
        this.refreshRecommendations();
    }
    
    trackFavorite(productId) {
        this.userBehavior.favorites.push({
            product_id: productId,
            timestamp: new Date().toISOString()
        });
        
        this.saveUserBehavior();
        this.refreshRecommendations();
    }
    
    trackSearch(query) {
        this.userBehavior.searches.push({
            query: query,
            timestamp: new Date().toISOString()
        });
        
        this.saveUserBehavior();
    }
    
    async loadRecommendations() {
        try {
            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    behavior: this.userBehavior
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.recommendations = data.recommendations || [];
                this.renderRecommendations();
            }
        } catch (error) {
            console.error('Error cargando recomendaciones:', error);
            // Fallback a recomendaciones locales
            this.generateLocalRecommendations();
        }
    }
    
    generateLocalRecommendations() {
        // Generar recomendaciones basadas en comportamiento local
        const viewedProducts = this.userBehavior.views.map(v => v.product_id);
        const favoriteProducts = this.userBehavior.favorites.map(f => f.product_id);
        const purchasedProducts = this.userBehavior.purchases.map(p => p.product_id);
        
        // Productos más vistos
        const viewCounts = {};
        viewedProducts.forEach(id => {
            viewCounts[id] = (viewCounts[id] || 0) + 1;
        });
        
        const sortedByViews = Object.entries(viewCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id]) => id);
        
        this.recommendations = sortedByViews;
        this.renderRecommendations();
    }
    
    async refreshRecommendations() {
        await this.loadRecommendations();
    }
    
    renderRecommendations() {
        const container = document.querySelector('[data-recommendations-ai]');
        if (!container) return;
        
        if (this.recommendations.length === 0) {
            container.innerHTML = `
                <div class="eco-no-recommendations">
                    <i class="bi bi-stars"></i>
                    <p>Explora productos para obtener recomendaciones personalizadas</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="eco-recommendations-ai">
                <h4>Recomendado para ti</h4>
                <div class="eco-recommendations-grid">
                    ${this.recommendations.slice(0, this.options.maxRecommendations).map(product => `
                        <div class="eco-recommendation-card">
                            <img src="${product.image}" alt="${product.name}" loading="lazy">
                            <div class="eco-recommendation-info">
                                <h5>${product.name}</h5>
                                <p class="eco-recommendation-price">S/.${product.price.toFixed(2)}</p>
                                <span class="eco-recommendation-reason">${product.reason || 'Basado en tu historial'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    getSimilarProducts(productId) {
        // Encontrar productos similares basados en categoría y precio
        // Esto se implementaría en el backend con un algoritmo real
        return [];
    }
    
    getBecauseYouLiked(productId) {
        // "Porque te gustó esto" - collaborative filtering
        // Se implementaría en el backend
        return [];
    }
    
    getTrendingProducts() {
        // Productos tendencias personalizadas
        return [];
    }
    
    loadUserBehavior() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.userBehavior = JSON.parse(saved);
            }
        } catch {
            // Usar comportamiento por defecto
        }
    }
    
    saveUserBehavior() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.userBehavior));
        } catch (error) {
            console.error('Error guardando comportamiento:', error);
        }
    }
    
    getUserBehavior() {
        return this.userBehavior;
    }
    
    getRecommendations() {
        return this.recommendations;
    }
    
    destroy() {
        // Limpiar event listeners
        document.removeEventListener('ecommerce:product:view', (e) => this.trackView(e.detail.product_id));
        document.removeEventListener('ecommerce:purchase', (e) => this.trackPurchase(e.detail.product_id));
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const recommendationsContainer = document.querySelector('[data-recommendations-ai]');
    if (recommendationsContainer && recommendationsContainer.dataset.recommendationsAi !== 'false') {
        window.ecoRecommendationsAI = new EcoRecommendationsAI({
            ...recommendationsContainer.dataset
        });
    }
});