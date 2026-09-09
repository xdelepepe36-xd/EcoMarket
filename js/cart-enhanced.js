/**
 * EcoMarket - Carrito de Compras Mejorado
 * Sistema avanzado de carrito con persistencia y sincronización
 */

class EnhancedCart {
    constructor(options = {}) {
        this.options = {
            storageKey: 'ecomarket_cart_enhanced',
            apiEndpoint: '/api/cart',
            syncInterval: 30000, // 30 segundos
            maxItems: 50,
            ...options
        };
        
        this.items = [];
        this.syncTimer = null;
        this.isSyncing = false;
        
        this.init();
    }

    /**
     * Inicializa el carrito
     */
    init() {
        this.loadFromStorage();
        this.startSync();
        this.setupEventListeners();
    }

    /**
     * Configura listeners de eventos
     */
    setupEventListeners() {
        // Escuchar cambios en el carrito
        window.addEventListener('storage', (e) => {
            if (e.key === this.options.storageKey) {
                this.loadFromStorage();
                this.updateUI();
            }
        });

        // Escutar eventos de página visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncWithServer();
            }
        });
    }

    /**
     * Carga carrito desde localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.options.storageKey);
            if (stored) {
                this.items = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.items = [];
        }
    }

    /**
     * Guarda carrito en localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    /**
     * Inicia sincronización periódica
     */
    startSync() {
        this.stopSync();
        this.syncTimer = setInterval(() => {
            this.syncWithServer();
        }, this.options.syncInterval);
    }

    /**
     * Detiene sincronización
     */
    stopSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }

    /**
     * Sincroniza con el servidor
     */
    async syncWithServer() {
        if (this.isSyncing) return;
        
        this.isSyncing = true;
        
        try {
            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: this.items,
                    action: 'sync'
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.items) {
                    this.items = data.items;
                    this.saveToStorage();
                    this.updateUI();
                }
            }
        } catch (error) {
            console.error('Error syncing cart:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Añade item al carrito
     */
    async addItem(product, quantity = 1, variant = null) {
        // Verificar límite de items
        if (this.items.length >= this.options.maxItems) {
            throw new Error('Carrito lleno');
        }

        // Verificar si el producto ya existe
        const existingItem = this.findItem(product.id, variant);
        
        if (existingItem) {
            existingItem.quantity += quantity;
            
            // Verificar stock
            if (existingItem.quantity > product.stock) {
                existingItem.quantity = product.stock;
                throw new Error('Stock insuficiente');
            }
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice || product.price,
                image: product.image,
                category: product.category,
                quantity: quantity,
                variant: variant,
                addedAt: Date.now()
            });
        }

        this.saveToStorage();
        this.updateUI();
        this.emit('itemAdded', { product, quantity, variant });
        
        // Sincronizar con servidor
        this.syncWithServer();
        
        return this.items;
    }

    /**
     * Elimina item del carrito
     */
    removeItem(productId, variant = null) {
        const index = this.findIndex(productId, variant);
        
        if (index > -1) {
            const removedItem = this.items[index];
            this.items.splice(index, 1);
            
            this.saveToStorage();
            this.updateUI();
            this.emit('itemRemoved', removedItem);
            
            // Sincronizar con servidor
            this.syncWithServer();
            
            return removedItem;
        }
        
        return null;
    }

    /**
     * Actualiza cantidad de item
     */
    updateItemQuantity(productId, quantity, variant = null) {
        const item = this.findItem(productId, variant);
        
        if (item) {
            const oldQuantity = item.quantity;
            item.quantity = Math.max(1, Math.min(quantity, item.stock || 999));
            
            this.saveToStorage();
            this.updateUI();
            this.emit('itemUpdated', { item, oldQuantity, newQuantity: item.quantity });
            
            // Sincronizar con servidor
            this.syncWithServer();
            
            return item;
        }
        
        return null;
    }

    /**
     * Limpia el carrito
     */
    clear() {
        const oldItems = [...this.items];
        this.items = [];
        
        this.saveToStorage();
        this.updateUI();
        this.emit('cartCleared', oldItems);
        
        // Sincronizar con servidor
        this.syncWithServer();
    }

    /**
     * Encuentra item en el carrito
     */
    findItem(productId, variant = null) {
        return this.items.find(item => 
            item.id === productId && 
            JSON.stringify(item.variant) === JSON.stringify(variant)
        );
    }

    /**
     * Encuentra índice de item
     */
    findIndex(productId, variant = null) {
        return this.items.findIndex(item => 
            item.id === productId && 
            JSON.stringify(item.variant) === JSON.stringify(variant)
        );
    }

    /**
     * Calcula subtotal
     */
    getSubtotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    /**
     * Calcula total de descuentos
     */
    getTotalDiscount() {
        return this.items.reduce((total, item) => {
            if (item.originalPrice && item.originalPrice > item.price) {
                return total + ((item.originalPrice - item.price) * item.quantity);
            }
            return total;
        }, 0);
    }

    /**
     * Calcula total de items
     */
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Calcula peso total
     */
    getTotalWeight() {
        return this.items.reduce((total, item) => {
            return total + ((item.weight || 0) * item.quantity);
        }, 0);
    }

    /**
     * Aplica cupón de descuento
     */
    async applyCoupon(couponCode) {
        try {
            const response = await fetch('/api/cart/coupon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ couponCode })
            });

            if (response.ok) {
                const data = await response.json();
                this.coupon = data.coupon;
                this.saveToStorage();
                this.updateUI();
                this.emit('couponApplied', data.coupon);
                return data.coupon;
            } else {
                throw new Error('Cupón inválido');
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            throw error;
        }
    }

    /**
     * Elimina cupón
     */
    removeCoupon() {
        const oldCoupon = this.coupon;
        delete this.coupon;
        this.saveToStorage();
        this.updateUI();
        this.emit('couponRemoved', oldCoupon);
    }

    /**
     * Calcula total con descuentos
     */
    getTotal() {
        let total = this.getSubtotal();
        
        if (this.coupon) {
            if (this.coupon.type === 'percentage') {
                total = total * (1 - this.coupon.value / 100);
            } else if (this.coupon.type === 'fixed') {
                total = Math.max(0, total - this.coupon.value);
            }
        }
        
        return total;
    }

    /**
     * Verifica si el carrito tiene items
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Obtiene items agrupados por vendedor
     */
    getItemsBySeller() {
        const grouped = {};
        
        this.items.forEach(item => {
            const sellerId = item.sellerId || 'default';
            if (!grouped[sellerId]) {
                grouped[sellerId] = [];
            }
            grouped[sellerId].push(item);
        });
        
        return grouped;
    }

    /**
     * Valida el carrito antes del checkout
     */
    validate() {
        const errors = [];
        
        this.items.forEach(item => {
            if (item.quantity <= 0) {
                errors.push(`Cantidad inválida para ${item.name}`);
            }
            
            if (item.stock !== undefined && item.quantity > item.stock) {
                errors.push(`Stock insuficiente para ${item.name}`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Actualiza la UI del carrito
     */
    updateUI() {
        // Actualizar contador
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.getTotalItems();
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }

        // Actualizar badges en diferentes partes de la UI
        document.querySelectorAll('.cart-badge').forEach(badge => {
            const totalItems = this.getTotalItems();
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'inline' : 'none';
        });

        // Emitir evento para que otros componentes puedan actualizar
        document.dispatchEvent(new CustomEvent('cart:updated', {
            detail: {
                items: this.items,
                total: this.getTotal(),
                totalItems: this.getTotalItems()
            }
        }));
    }

    /**
     * Emite evento
     */
    emit(event, data) {
        document.dispatchEvent(new CustomEvent(`cart:${event}`, {
            detail: data
        }));
    }

    /**
     * Exporta carrito a JSON
     */
    export() {
        return JSON.stringify({
            items: this.items,
            coupon: this.coupon,
            subtotal: this.getSubtotal(),
            total: this.getTotal(),
            totalItems: this.getTotalItems(),
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Importa carrito desde JSON
     */
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.items && Array.isArray(data.items)) {
                this.items = data.items;
                this.coupon = data.coupon || null;
                this.saveToStorage();
                this.updateUI();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error importing cart:', error);
            return false;
        }
    }

    /**
     * Destruye el carrito
     */
    destroy() {
        this.stopSync();
        this.clear();
    }
}

// Instancia global del carrito mejorado
const enhancedCart = new EnhancedCart();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedCart, enhancedCart };
}