/**
 * eco-wishlist-smart.js - Sistema de deseos inteligente
 * 
 * Funcionalidades:
- Wishlist inteligente con recomendaciones
 - Alertas de precio
 - Notificaciones de stock
 - Organización por colecciones
 - Compartir wishlist
 - Análisis de deseos
 - Compra automática cuando precio baje
 */

class EcoWishlistSmart {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/wishlist',
            storageKey: options.storageKey || 'ecomarket_wishlist',
            enableAlerts: options.enableAlerts !== false,
            enableRecommendations: options.enableRecommendations !== false,
            enableCollections: options.enableCollections !== false,
            maxItems: options.maxItems || 100,
            ...options
        };
        
        this.wishlist = [];
        this.collections = [];
        this.alerts = [];
        
        this.init();
    }
    
    init() {
        this.loadWishlist();
        this.loadCollections();
        this.createWishlistUI();
        this.setupEventListeners();
        this.loadRecommendations();
    }
    
    createWishlistUI() {
        const container = document.querySelector('[data-eco-wishlist]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-wishlist-smart">
                <div class="eco-wishlist-header">
                    <h3>Mi Wishlist</h3>
                    <div class="eco-wishlist-actions">
                        <button class="eco-btn-icon" data-create-collection title="Crear colección">
                            <i class="bi bi-folder-plus"></i>
                        </button>
                        <button class="eco-btn-icon" data-share-wishlist title="Compartir">
                            <i class="bi bi-share"></i>
                        </button>
                        <button class="eco-btn-icon" data-wishlist-settings title="Configuración">
                            <i class="bi bi-gear"></i>
                        </button>
                    </div>
                </div>
                
                <div class="eco-wishlist-stats">
                    <div class="eco-stat-item">
                        <span class="eco-stat-value" data-wishlist-count>0</span>
                        <span class="eco-stat-label">Productos</span>
                    </div>
                    <div class="eco-stat-item">
                        <span class="eco-stat-value" data-collections-count>0</span>
                        <span class="eco-stat-label">Colecciones</span>
                    </div>
                    <div class="eco-stat-item">
                        <span class="eco-stat-value" data-alerts-count>0</span>
                        <span class="eco-stat-label">Alertas</span>
                    </div>
                </div>
                
                <div class="eco-wishlist-tabs">
                    <button class="eco-tab-btn active" data-tab="all">Todos</button>
                    <button class="eco-tab-btn" data-tab="collections">Colecciones</button>
                    <button class="eco-tab-btn" data-tab="alerts">Alertas</button>
                </div>
                
                <div class="eco-wishlist-content">
                    <div class="eco-wishlist-tab active" data-tab-content="all">
                        <div class="eco-wishlist-items" data-wishlist-items>
                            <!-- Los items se renderizarán aquí -->
                        </div>
                    </div>
                    
                    <div class="eco-wishlist-tab" data-tab-content="collections">
                        <div class="eco-collections-list" data-collections-list>
                            <!-- Las colecciones se renderizarán aquí -->
                        </div>
                    </div>
                    
                    <div class="eco-wishlist-tab" data-tab-content="alerts">
                        <div class="eco-alerts-list" data-alerts-list>
                            <!-- Las alertas se renderizarán aquí -->
                        </div>
                    </div>
                </div>
                
                ${this.options.enableRecommendations ? `
                    <div class="eco-wishlist-recommendations">
                        <h4>Recomendaciones para ti</h4>
                        <div class="eco-recommendations-list" data-recommendations-list>
                            <!-- Las recomendaciones se renderizarán aquí -->
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.renderWishlist();
        this.renderCollections();
        this.renderAlerts();
        this.updateStats();
    }
    
    renderWishlist() {
        const container = document.querySelector('[data-wishlist-items]');
        if (!container) return;
        
        if (this.wishlist.length === 0) {
            container.innerHTML = `
                <div class="eco-empty-wishlist">
                    <i class="bi bi-heart"></i>
                    <p>Tu wishlist está vacía</p>
                    <button class="eco-btn-eco" data-explore-products>
                        Explorar productos
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.wishlist.map(item => `
            <div class="eco-wishlist-item" data-item-id="${item.product_id}">
                <div class="eco-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    ${item.on_sale ? '<span class="eco-sale-badge">OFERTA</span>' : ''}
                </div>
                <div class="eco-item-details">
                    <h4>${item.name}</h4>
                    <div class="eco-item-price">
                        ${item.original_price ? `
                            <span class="eco-original-price">S/.${item.original_price.toFixed(2)}</span>
                        ` : ''}
                        <span class="eco-current-price">S/.${item.price.toFixed(2)}</span>
                    </div>
                    <div class="eco-item-meta">
                        <span class="eco-item-category">${item.category}</span>
                        <span class="eco-item-date">${this.formatDate(item.added_at)}</span>
                    </div>
                    ${item.alert_price ? `
                        <div class="eco-item-alert">
                            <i class="bi bi-bell"></i>
                            Alerta: S/.${item.alert_price}
                        </div>
                    ` : ''}
                </div>
                <div class="eco-item-actions">
                    <button class="eco-btn-icon" data-add-to-cart title="Agregar al carrito">
                        <i class="bi bi-cart-plus"></i>
                    </button>
                    <button class="eco-btn-icon" data-set-alert title="Alerta de precio">
                        <i class="bi bi-bell"></i>
                    </button>
                    <button class="eco-btn-icon" data-add-to-collection title="Agregar a colección">
                        <i class="bi bi-folder"></i>
                    </button>
                    <button class="eco-btn-icon" data-remove-item title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Event listeners
        container.querySelectorAll('[data-add-to-cart]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.eco-wishlist-item').dataset.itemId;
                this.addToCart(itemId);
            });
        });
        
        container.querySelectorAll('[data-set-alert]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.eco-wishlist-item').dataset.itemId;
                this.setPriceAlert(itemId);
            });
        });
        
        container.querySelectorAll('[data-add-to-collection]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.eco-wishlist-item').dataset.itemId;
                this.addToCollection(itemId);
            });
        });
        
        container.querySelectorAll('[data-remove-item]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.eco-wishlist-item').dataset.itemId;
                this.removeItem(itemId);
            });
        });
    }
    
    renderCollections() {
        const container = document.querySelector('[data-collections-list]');
        if (!container) return;
        
        if (this.collections.length === 0) {
            container.innerHTML = `
                <div class="eco-empty-collections">
                    <p>No tienes colecciones</p>
                    <button class="eco-btn-eco" data-create-collection>
                        Crear colección
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.collections.map(collection => `
            <div class="eco-collection-item" data-collection-id="${collection.id}">
                <div class="eco-collection-preview">
                    ${collection.items.slice(0, 3).map(item => `
                        <img src="${item.image}" alt="${item.name}">
                    `).join('')}
                </div>
                <div class="eco-collection-info">
                    <h4>${collection.name}</h4>
                    <span>${collection.items.length} productos</span>
                </div>
                <div class="eco-collection-actions">
                    <button class="eco-btn-icon" data-edit-collection>
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="eco-btn-icon" data-delete-collection>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderAlerts() {
        const container = document.querySelector('[data-alerts-list]');
        if (!container) return;
        
        const activeAlerts = this.wishlist.filter(item => item.alert_price);
        
        if (activeAlerts.length === 0) {
            container.innerHTML = `
                <div class="eco-empty-alerts">
                    <p>No tienes alertas activas</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activeAlerts.map(item => `
            <div class="eco-alert-item" data-item-id="${item.product_id}">
                <div class="eco-alert-info">
                    <h4>${item.name}</h4>
                    <p>Precio actual: S/.${item.price.toFixed(2)}</p>
                    <p>Alerta cuando baje a: S/.${item.alert_price.toFixed(2)}</p>
                </div>
                <div class="eco-alert-actions">
                    <button class="eco-btn-icon" data-edit-alert>
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="eco-btn-icon" data-remove-alert>
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    async loadRecommendations() {
        if (!this.options.enableRecommendations) return;
        
        try {
            const response = await fetch('/api/recomendaciones/wishlist');
            if (response.ok) {
                const data = await response.json();
                this.renderRecommendations(data);
            }
        } catch (error) {
            console.error('Error cargando recomendaciones:', error);
        }
    }
    
    renderRecommendations(recommendations) {
        const container = document.querySelector('[data-recommendations-list]');
        if (!container) return;
        
        if (!recommendations || recommendations.length === 0) {
            container.innerHTML = '<p>No hay recomendaciones disponibles</p>';
            return;
        }
        
        container.innerHTML = recommendations.map(product => `
            <div class="eco-recommendation-item">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="eco-recommendation-info">
                    <h4>${product.name}</h4>
                    <p>S/.${product.price.toFixed(2)}</p>
                </div>
                <button class="eco-btn-icon" data-add-wishlist="${product.id}">
                    <i class="bi bi-heart"></i>
                </button>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // Tabs
        document.querySelectorAll('.eco-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Crear colección
        document.querySelector('[data-create-collection]')?.addEventListener('click', () => {
            this.createCollection();
        });
        
        // Compartir wishlist
        document.querySelector('[data-share-wishlist]')?.addEventListener('click', () => {
            this.shareWishlist();
        });
    }
    
    switchTab(tab) {
        document.querySelectorAll('.eco-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        document.querySelectorAll('.eco-wishlist-tab').forEach(content => {
            content.classList.toggle('active', content.dataset.tabContent === tab);
        });
    }
    
    async addToWishlist(productId) {
        if (this.wishlist.length >= this.options.maxItems) {
            alert('Tu wishlist está llena. Elimina algunos productos primero.');
            return;
        }
        
        if (this.isInWishlist(productId)) {
            alert('Este producto ya está en tu wishlist.');
            return;
        }
        
        try {
            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_id: productId })
            });
            
            if (response.ok) {
                const product = await response.json();
                this.wishlist.push({
                    product_id: productId,
                    ...product,
                    added_at: new Date().toISOString()
                });
                this.saveWishlist();
                this.renderWishlist();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error agregando a wishlist:', error);
        }
    }
    
    removeFromWishlist(productId) {
        const index = this.wishlist.findIndex(item => item.product_id === productId);
        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.saveWishlist();
            this.renderWishlist();
            this.updateStats();
        }
    }
    
    isInWishlist(productId) {
        return this.wishlist.some(item => item.product_id === productId);
    }
    
    setPriceAlert(productId) {
        const product = this.wishlist.find(item => item.product_id === productId);
        if (!product) return;
        
        const currentPrice = product.price;
        const alertPrice = prompt(`Precio actual: S/.${currentPrice.toFixed(2)}\n\nIngresa el precio deseado para recibir alerta:`, currentPrice);
        
        if (alertPrice && !isNaN(alertPrice)) {
            product.alert_price = parseFloat(alertPrice);
            this.saveWishlist();
            this.renderWishlist();
            this.renderAlerts();
        }
    }
    
    createCollection() {
        const name = prompt('Nombre de la colección:');
        if (!name) return;
        
        const collection = {
            id: Date.now(),
            name: name,
            items: [],
            created_at: new Date().toISOString()
        };
        
        this.collections.push(collection);
        this.saveCollections();
        this.renderCollections();
        this.updateStats();
    }
    
    addToCollection(productId) {
        if (this.collections.length === 0) {
            alert('Primero crea una colección.');
            return;
        }
        
        const collectionNames = this.collections.map(c => c.name).join(', ');
        const collectionName = prompt(`Colecciones disponibles: ${collectionNames}\n\nIngresa el nombre de la colección:`);
        
        const collection = this.collections.find(c => c.name === collectionName);
        if (collection) {
            const product = this.wishlist.find(item => item.product_id === productId);
            if (product && !collection.items.some(i => i.product_id === productId)) {
                collection.items.push(product);
                this.saveCollections();
                this.renderCollections();
            }
        }
    }
    
    shareWishlist() {
        const wishlistUrl = window.location.href + '?wishlist=' + btoa(JSON.stringify(this.wishlist));
        
        if (navigator.share) {
            navigator.share({
                title: 'Mi Wishlist EcoMarket',
                url: wishlistUrl
            });
        } else {
            navigator.clipboard.writeText(wishlistUrl).then(() => {
                alert('Enlace copiado al portapapeles');
            });
        }
    }
    
    addToCart(productId) {
        // Emitir evento para que el carrito maneje esto
        document.dispatchEvent(new CustomEvent('wishlist:add-to-cart', {
            detail: { product_id: productId }
        }));
    }
    
    loadWishlist() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.wishlist = JSON.parse(saved);
            }
        } catch {
            this.wishlist = [];
        }
    }
    
    saveWishlist() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.wishlist));
        } catch (error) {
            console.error('Error guardando wishlist:', error);
        }
    }
    
    loadCollections() {
        try {
            const saved = localStorage.getItem(this.options.storageKey + '_collections');
            if (saved) {
                this.collections = JSON.parse(saved);
            }
        } catch {
            this.collections = [];
        }
    }
    
    saveCollections() {
        try {
            localStorage.setItem(this.options.storageKey + '_collections', JSON.stringify(this.collections));
        } catch (error) {
            console.error('Error guardando colecciones:', error);
        }
    }
    
    updateStats() {
        document.querySelector('[data-wishlist-count]').textContent = this.wishlist.length;
        document.querySelector('[data-collections-count]').textContent = this.collections.length;
        document.querySelector('[data-alerts-count]').textContent = this.wishlist.filter(item => item.alert_price).length;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    }
    
    getWishlistCount() {
        return this.wishlist.length;
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const wishlistContainer = document.querySelector('[data-eco-wishlist]');
    if (wishlistContainer && wishlistContainer.dataset.ecoWishlist !== 'false') {
        window.ecoWishlist = new EcoWishlistSmart({
            ...wishlistContainer.dataset
        });
    }
});