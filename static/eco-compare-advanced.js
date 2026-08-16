/**
 * eco-compare-advanced.js - Sistema avanzado de comparación de productos
 * 
 * Funcionalidades:
 * - Comparación de múltiples productos
 * - Comparación lado a lado
 * - Resaltado de diferencias
 * - Exportación de comparación
 * - Compartir comparación
 * - Filtrado de características
 * - Puntuación de recomendación
 */

class EcoCompare {
    constructor(options = {}) {
        this.options = {
            maxProducts: options.maxProducts || 4,
            storageKey: options.storageKey || 'ecomarket_compare',
            apiEndpoint: options.apiEndpoint || '/api/comparar',
            enableExport: options.enableExport !== false,
            enableShare: options.enableShare !== false,
            ...options
        };
        
        this.products = [];
        this.comparisonData = {};
        
        this.init();
    }
    
    init() {
        this.loadComparison();
        this.setupEventListeners();
        this.renderComparison();
    }
    
    setupEventListeners() {
        // Botones de agregar a comparación
        document.querySelectorAll('[data-compare-add]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.addProduct(productId);
            });
        });
        
        // Botón de abrir comparador
        const compareBtn = document.querySelector('[data-compare-open]');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => this.openComparisonModal());
        }
        
        // Botón de cerrar comparador
        const closeBtn = document.querySelector('[data-compare-close]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeComparisonModal());
        }
    }
    
    addProduct(productId) {
        if (this.products.length >= this.options.maxProducts) {
            this.showCompareMessage(`Máximo ${this.options.maxProducts} productos para comparar`, 'error');
            return;
        }
        
        if (this.products.includes(productId)) {
            this.showCompareMessage('El producto ya está en comparación', 'info');
            return;
        }
        
        this.products.push(productId);
        this.saveComparison();
        this.updateCompareButton();
        this.showCompareMessage('Producto agregado a comparación', 'success');
    }
    
    removeProduct(productId) {
        const index = this.products.indexOf(productId);
        if (index > -1) {
            this.products.splice(index, 1);
            this.saveComparison();
            this.renderComparison();
            this.updateCompareButton();
        }
    }
    
    clearComparison() {
        this.products = [];
        this.saveComparison();
        this.renderComparison();
        this.updateCompareButton();
    }
    
    async loadComparisonData() {
        if (this.products.length === 0) return;
        
        try {
            const response = await fetch(`${this.options.apiEndpoint}?productos=${this.products.join(',')}`);
            if (response.ok) {
                this.comparisonData = await response.json();
            }
        } catch (error) {
            console.error('Error cargando datos de comparación:', error);
        }
    }
    
    renderComparison() {
        const container = document.querySelector('[data-compare-container]');
        if (!container) return;
        
        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="eco-compare-empty">
                    <i class="bi bi-scales"></i>
                    <p>No hay productos para comparar</p>
                    <button class="eco-btn-eco" data-compare-clear>
                        <i class="bi bi-arrow-return-left"></i>
                        Seguir comprando
                    </button>
                </div>
            `;
            return;
        }
        
        if (Object.keys(this.comparisonData).length === 0) {
            this.loadComparisonData().then(() => this.renderComparison());
            return;
        }
        
        const productsList = Object.values(this.comparisonData);
        
        container.innerHTML = `
            <div class="eco-compare-grid">
                <div class="eco-compare-header">
                    <h2>Comparación de Productos</h2>
                    <button class="eco-compare-clear" data-compare-clear>
                        <i class="bi bi-trash"></i>
                        Limpiar todo
                    </button>
                </div>
                
                <div class="eco-compare-body">
                    ${this.renderComparisonTable(productsList)}
                </div>
                
                <div class="eco-compare-footer">
                    ${this.options.enableExport ? `
                        <button class="eco-compare-export" data-compare-export>
                            <i class="bi bi-download"></i>
                            Exportar
                        </button>
                    ` : ''}
                    
                    ${this.options.enableShare ? `
                        <button class="eco-compare-share" data-compare-share>
                            <i class="bi bi-share"></i>
                            Compartir
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        this.setupComparisonEvents();
    }
    
    renderComparisonTable(products) {
        const characteristics = this.getComparisonCharacteristics(products);
        
        return `
            <div class="eco-compare-table">
                <!-- Header row con productos -->
                <div class="eco-compare-row eco-compare-header-row">
                    <div class="eco-compare-cell eco-compare-label">Característica</div>
                    ${products.map(product => `
                        <div class="eco-compare-cell eco-compare-product">
                            <button class="eco-remove-product" data-product-id="${product.id}">
                                <i class="bi bi-x"></i>
                            </button>
                            <img src="${product.imagen}" alt="${product.nombre}" class="eco-product-thumb">
                            <h3>${product.nombre}</h3>
                            <div class="eco-product-price">S/.${product.precio.toFixed(2)}</div>
                            <a href="/producto/${product.id}" class="eco-view-product">
                                Ver detalles
                            </a>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Características -->
                ${characteristics.map(char => {
                    const values = products.map(p => this.getCharacteristicValue(p, char.key));
                    const hasDifferences = this.hasDifference(values);
                    
                    return `
                        <div class="eco-compare-row ${hasDifferences ? 'eco-difference' : ''}">
                            <div class="eco-compare-cell eco-compare-label">
                                <i class="bi ${char.icon}"></i>
                                ${char.label}
                            </div>
                            ${values.map((value, index) => `
                                <div class="eco-compare-cell">
                                    ${this.formatCharacteristicValue(value, char.type)}
                                </div>
                            `).join('')}
                        </div>
                    `;
                }).join('')}
                
                <!-- Recomendación -->
                <div class="eco-compare-row eco-compare-recommendation">
                    <div class="eco-compare-cell eco-compare-label">
                        <i class="bi bi-star"></i>
                        Recomendación
                    </div>
                    ${products.map(product => `
                        <div class="eco-compare-cell">
                            ${this.getRecommendation(product, products)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    getComparisonCharacteristics(products) {
        return [
            { key: 'precio', label: 'Precio', icon: 'bi-currency-dollar', type: 'price' },
            { key: 'categoria', label: 'Categoría', icon: 'bi-tag', type: 'text' },
            { key: 'condicion', label: 'Condición', icon: 'bi-check-circle', type: 'text' },
            { key: 'stock', label: 'Stock', icon: 'bi-box', type: 'number' },
            { key: 'descripcion', label: 'Descripción', icon: 'bi-text-paragraph', type: 'text' },
            { key: 'calificacion', label: 'Calificación', icon: 'bi-star-fill', type: 'rating' },
            { key: 'vendedor', label: 'Vendedor', icon: 'bi-person', type: 'text' },
            { key: 'envio', label: 'Envío', icon: 'bi-truck', type: 'text' },
        ];
    }
    
    getCharacteristicValue(product, key) {
        const valueMap = {
            'precio': product.precio,
            'categoria': product.categoria,
            'condicion': product.condicion,
            'stock': product.stock,
            'descripcion': product.descripcion,
            'calificacion': product.calificacion_promedio || 0,
            'vendedor': product.vendedor_nombre || 'No disponible',
            'envio': product.envio_gratis ? 'Gratis' : 'S/. ' + (product.costo_envio || 0).toFixed(2)
        };
        
        return valueMap[key] || 'N/A';
    }
    
    formatCharacteristicValue(value, type) {
        switch (type) {
            case 'price':
                return `S/.${parseFloat(value).toFixed(2)}`;
            case 'rating':
                return value > 0 ? `${value.toFixed(1)} ⭐` : 'Sin calificación';
            case 'number':
                return value.toString();
            case 'text':
            default:
                return value && value.length > 50 ? value.substring(0, 50) + '...' : value || 'N/A';
        }
    }
    
    hasDifference(values) {
        const uniqueValues = new Set(values.map(v => String(v)));
        return uniqueValues.size > 1;
    }
    
    getRecommendation(product, allProducts) {
        const scores = allProducts.map(p => this.calculateProductScore(p));
        const maxScore = Math.max(...scores);
        const productScore = this.calculateProductScore(product);
        
        if (productScore === maxScore && maxScore > 0) {
            return `
                <div class="eco-recommendation-badge eco-best">
                    <i class="bi bi-trophy-fill"></i>
                    Mejor opción
                </div>
            `;
        } else if (productScore > maxScore * 0.8) {
            return `
                <div class="eco-recommendation-badge eco-good">
                    <i class="bi bi-hand-thumbs-up"></i>
                    Buena opción
                </div>
            `;
        } else {
            return `
                <div class="eco-recommendation-badge eco-neutral">
                    <i class="bi bi-info-circle"></i>
                    Opción regular
                </div>
            `;
        }
    }
    
    calculateProductScore(product) {
        let score = 0;
        
        // Precio (menor es mejor, pero muy barato puede ser malo)
        if (product.precio > 0 && product.precio < 100) score += 2;
        else if (product.precio >= 100 && product.precio < 200) score += 3;
        else if (product.precio >= 200) score += 1;
        
        // Stock
        if (product.stock > 10) score += 2;
        else if (product.stock > 0) score += 1;
        
        // Calificación
        if (product.calificacion_promedio >= 4) score += 3;
        else if (product.calificacion_promedio >= 3) score += 2;
        else if (product.calificacion_promedio > 0) score += 1;
        
        // Condición
        if (product.condicion === 'nuevo') score += 2;
        else if (product.condicion === 'como_nuevo') score += 1;
        
        return score;
    }
    
    setupComparisonEvents() {
        // Botón de limpiar
        document.querySelector('[data-compare-clear]')?.addEventListener('click', () => {
            this.clearComparison();
        });
        
        // Botones de eliminar producto
        document.querySelectorAll('.eco-remove-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.eco-remove-product').dataset.productId;
                this.removeProduct(productId);
            });
        });
        
        // Exportar
        if (this.options.enableExport) {
            document.querySelector('[data-compare-export]')?.addEventListener('click', () => {
                this.exportComparison();
            });
        }
        
        // Compartir
        if (this.options.enableShare) {
            document.querySelector('[data-compare-share]')?.addEventListener('click', () => {
                this.shareComparison();
            });
        }
    }
    
    exportComparison() {
        const productsList = Object.values(this.comparisonData);
        const csvContent = this.generateCSV(productsList);
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'comparacion_productos.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    generateCSV(products) {
        const characteristics = this.getComparisonCharacteristics(products);
        const headers = ['Producto', ...characteristics.map(c => c.label)];
        const rows = products.map(product => {
            return [
                product.nombre,
                ...characteristics.map(char => this.getCharacteristicValue(product, char.key))
            ];
        });
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    shareComparison() {
        const url = window.location.href + '?compare=' + this.products.join(',');
        
        if (navigator.share) {
            navigator.share({
                title: 'Comparación de productos EcoMarket',
                url: url,
                text: 'Mira esta comparación de productos'
            });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                this.showCompareMessage('Enlace copiado al portapapeles', 'success');
            });
        }
    }
    
    openComparisonModal() {
        const modal = document.querySelector('[data-compare-modal]');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeComparisonModal() {
        const modal = document.querySelector('[data-compare-modal]');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    updateCompareButton() {
        const compareBtn = document.querySelector('[data-compare-open]');
        const compareCount = document.querySelector('[data-compare-count]');
        
        if (compareCount) {
            compareCount.textContent = this.products.length;
        }
        
        if (compareBtn) {
            compareBtn.classList.toggle('eco-has-items', this.products.length > 0);
        }
    }
    
    showCompareMessage(message, type = 'info') {
        const messageContainer = document.querySelector('[data-compare-message]');
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.className = `eco-compare-message ${type}`;
            messageContainer.style.display = 'block';
            
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 3000);
        }
    }
    
    loadComparison() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.products = JSON.parse(saved);
            }
        } catch {
            this.products = [];
        }
    }
    
    saveComparison() {
        localStorage.setItem(this.options.storageKey, JSON.stringify(this.products));
    }
    
    getProductCount() {
        return this.products.length;
    }
    
    isProductInComparison(productId) {
        return this.products.includes(productId);
    }
    
    destroy() {
        // Limpiar eventos
        document.querySelectorAll('[data-compare-add]').forEach(btn => {
            btn.removeEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.addProduct(productId);
            });
        });
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    // Buscar contenedores de comparación
    const compareContainers = document.querySelectorAll('[data-eco-compare]');
    compareContainers.forEach(container => {
        new EcoCompare({
            ...container.dataset
        });
    });
});