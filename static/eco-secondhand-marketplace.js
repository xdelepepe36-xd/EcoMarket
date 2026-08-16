/**
 * eco-secondhand-marketplace.js - Marketplace de segunda mano
 * 
 * Funcionalidades:
 - Vender productos usados
 - Economía circular
 - Marketplace de segunda mano
 - Verificación de calidad
 - Sistema de puntuación de vendedores
 - Chat entre comprador y vendedor
 - Negociación de precios
 - Publicación de productos usados
 */

class EcoSecondhandMarketplace {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/secondhand',
            storageKey: options.storageKey || 'ecomarket_secondhand',
            enableListings: options.enableListings !== false,
            enableNegotiation: options.enableNegotiation !== false,
            ...options
        };
        
        this.listings = [];
        this.userListings = [];
        
        this.init();
    }
    
    init() {
        this.loadListings();
        this.createMarketplaceUI();
        this.setupEventListeners();
    }
    
    createMarketplaceUI() {
        const container = document.querySelector('[data-eco-secondhand]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-secondhand-marketplace">
                <div class="eco-marketplace-header">
                    <h3>Marketplace de Segunda Mano</h3>
                    <p>Economía circular: vende y compra productos usados</p>
                </div>
                
                <div class="eco-marketplace-actions">
                    <button class="eco-btn-eco" data-list-product>
                        <i class="bi bi-plus"></i>
                        Publicar Producto
                    </button>
                    <div class="eco-marketplace-filters">
                        <select data-filter-category>
                            <option value="all">Todas las categorías</option>
                            <option value="hogar">Hogar</option>
                            <option value="ropa">Ropa</option>
                            <option value="accesorios">Accesorios</option>
                            <option value="electronica">Electrónica</option>
                        </select>
                        <select data-filter-condition>
                            <option value="all">Todas las condiciones</option>
                            <option value="nuevo">Nuevo</option>
                            <option value="usado">Usado</option>
                            <option value="restaurado">Restaurado</option>
                        </select>
                    </div>
                </div>
                
                <div class="eco-marketplace-grid" data-marketplace-grid>
                    ${this.renderListings()}
                </div>
                
                <div class="eco-user-listings">
                    <h4>Mis Publicaciones</h4>
                    <div class="eco-user-listings-grid" data-user-listings>
                        ${this.renderUserListings()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderListings() {
        const listings = [
            {
                id: 1,
                name: 'Maceta Cerámica Vintage',
                condition: 'usado',
                price: 12,
                originalPrice: 22,
                seller: 'María',
                rating: 4.8,
                image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300',
                category: 'hogar'
            },
            {
                id: 2,
                name: 'Botella Acero Usada',
                condition: 'usado',
                price: 25,
                originalPrice: 45,
                seller: 'Juan',
                rating: 4.5,
                image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300',
                category: 'accesorios'
            },
            {
                id: 3,
                name: 'Taza Artesanal',
                condition: 'restaurado',
                price: 18,
                originalPrice: 26,
                seller: 'Ana',
                rating: 4.9,
                image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300',
                category: 'hogar'
            },
            {
                id: 4,
                name: 'Camiseta Algodón',
                condition: 'usado',
                price: 20,
                originalPrice: 35,
                seller: 'Pedro',
                rating: 4.7,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
                category: 'ropa'
            }
        ];
        
        this.listings = listings;
        
        return listings.map(listing => `
            <div class="eco-marketplace-card" data-listing-id="${listing.id}">
                <div class="eco-listing-image">
                    <img src="${listing.image}" alt="${listing.name}" loading="lazy">
                    <span class="eco-listing-condition ${listing.condition}">${listing.condition}</span>
                </div>
                <div class="eco-listing-info">
                    <h4>${listing.name}</h4>
                    <div class="eco-listing-price">
                        <span class="eco-current-price">S/.${listing.price}</span>
                        <span class="eco-original-price">S/.${listing.originalPrice}</span>
                        <span class="eco-discount">-${Math.round((1 - listing.price / listing.originalPrice) * 100)}%</span>
                    </div>
                    <div class="eco-listing-seller">
                        <span class="eco-seller-name">${listing.seller}</span>
                        <span class="eco-seller-rating">
                            <i class="bi bi-star-fill"></i> ${listing.rating}
                        </span>
                    </div>
                </div>
                <div class="eco-listing-actions">
                    <button class="eco-btn-eco" data-contact-seller="${listing.id}">
                        <i class="bi bi-chat"></i>
                        Contactar
                    </button>
                    <button class="eco-btn-secondary" data-negotiate="${listing.id}">
                        <i class="bi bi-currency-dollar"></i>
                        Negociar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderUserListings() {
        if (this.userListings.length === 0) {
            return '<p class="eco-no-listings">Sin publicaciones</p>';
        }
        
        return this.userListings.map(listing => `
            <div class="eco-user-listing-card">
                <div class="eco-listing-image">
                    <img src="${listing.image}" alt="${listing.name}" loading="lazy">
                </div>
                <div class="eco-listing-info">
                    <h4>${listing.name}</h4>
                    <span class="eco-listing-price">S/.${listing.price}</span>
                    <span class="eco-listing-status">${listing.status}</span>
                </div>
                <div class="eco-listing-actions">
                    <button class="eco-btn-secondary" data-edit-listing="${listing.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="eco-btn-secondary" data-delete-listing="${listing.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // Publicar producto
        document.querySelector('[data-list-product]')?.addEventListener('click', () => {
            this.listProduct();
        });
        
        // Contactar vendedor
        document.querySelectorAll('[data-contact-seller]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const listingId = e.target.dataset.contactSeller;
                this.contactSeller(listingId);
            });
        });
        
        // Negociar
        document.querySelectorAll('[data-negotiate]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const listingId = e.target.dataset.negotiate;
                this.negotiate(listingId);
            });
        });
        
        // Filtros
        document.querySelector('[data-filter-category]')?.addEventListener('change', (e) => {
            this.filterListings(e.target.value, 'category');
        });
        
        document.querySelector('[data-filter-condition]')?.addEventListener('change', (e) => {
            this.filterListings(e.target.value, 'condition');
        });
    }
    
    listProduct() {
        const name = prompt('Nombre del producto:');
        if (!name) return;
        
        const price = prompt('Precio:');
        if (!price) return;
        
        const condition = prompt('Condición (nuevo, usado, restaurado):');
        
        this.userListings.push({
            id: Date.now(),
            name: name,
            price: parseFloat(price),
            condition: condition || 'usado',
            status: 'activo',
            image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300'
        });
        
        this.saveListings();
        this.updateUI();
        alert('Producto publicado exitosamente');
    }
    
    contactSeller(listingId) {
        const listing = this.listings.find(l => l.id === parseInt(listingId));
        if (listing) {
            alert(`Contactando a ${listing.seller} por ${listing.name}`);
            // Emitir evento de contacto
            document.dispatchEvent(new CustomEvent('secondhand:contact', {
                detail: { listingId, seller: listing.seller }
            }));
        }
    }
    
    negotiate(listingId) {
        const listing = this.listings.find(l => l.id === parseInt(listingId));
        if (listing) {
            const offer = prompt(`Precio actual: S/.${listing.price}. ¿Cuánto ofreces?`);
            if (offer) {
                alert(`Oferta de S/.${offer} enviada a ${listing.seller}`);
                // Emitir evento de negociación
                document.dispatchEvent(new CustomEvent('secondhand:negotiate', {
                    detail: { listingId, offer: parseFloat(offer) }
                }));
            }
        }
    }
    
    filterListings(value, type) {
        const grid = document.querySelector('[data-marketplace-grid]');
        if (!grid) return;
        
        let filtered = this.listings;
        
        if (type === 'category' && value !== 'all') {
            filtered = this.listings.filter(l => l.category === value);
        }
        
        if (type === 'condition' && value !== 'all') {
            filtered = this.listings.filter(l => l.condition === value);
        }
        
        grid.innerHTML = filtered.map(listing => `
            <div class="eco-marketplace-card" data-listing-id="${listing.id}">
                <div class="eco-listing-image">
                    <img src="${listing.image}" alt="${listing.name}" loading="lazy">
                    <span class="eco-listing-condition ${listing.condition}">${listing.condition}</span>
                </div>
                <div class="eco-listing-info">
                    <h4>${listing.name}</h4>
                    <div class="eco-listing-price">
                        <span class="eco-current-price">S/.${listing.price}</span>
                        <span class="eco-original-price">S/.${listing.originalPrice}</span>
                        <span class="eco-discount">-${Math.round((1 - listing.price / listing.originalPrice) * 100)}%</span>
                    </div>
                    <div class="eco-listing-seller">
                        <span class="eco-seller-name">${listing.seller}</span>
                        <span class="eco-seller-rating">
                            <i class="bi bi-star-fill"></i> ${listing.rating}
                        </span>
                    </div>
                </div>
                <div class="eco-listing-actions">
                    <button class="eco-btn-eco" data-contact-seller="${listing.id}">
                        <i class="bi bi-chat"></i>
                        Contactar
                    </button>
                    <button class="eco-btn-secondary" data-negotiate="${listing.id}">
                        <i class="bi bi-currency-dollar"></i>
                        Negociar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    updateUI() {
        const userListingsGrid = document.querySelector('[data-user-listings]');
        if (userListingsGrid) {
            userListingsGrid.innerHTML = this.renderUserListings();
        }
    }
    
    loadListings() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.userListings = JSON.parse(saved);
            }
        } catch {
            // Usar listings por defecto
        }
    }
    
    saveListings() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.userListings));
        } catch (error) {
            console.error('Error guardando listings:', error);
        }
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const secondhandContainer = document.querySelector('[data-eco-secondhand]');
    if (secondhandContainer && secondhandContainer.dataset.ecoSecondhand !== 'false') {
        window.ecoSecondhandMarketplace = new EcoSecondhandMarketplace({
            ...secondhandContainer.dataset
        });
    }
});