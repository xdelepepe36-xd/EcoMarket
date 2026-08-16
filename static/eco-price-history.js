/**
 * eco-price-history.js - Sistema de precios historicos
 * 
 * Funcionalidades:
 - Historial de precios
 - Alertas de precios bajos
 - Graficos de evolucion de precios
 - Comparacion de precios
 - Tendencias de precios
 */

class EcoPriceHistory {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/precios',
            storageKey: options.storageKey || 'ecomarket_prices',
            enableAlerts: options.enableAlerts !== false,
            ...options
        };
        
        this.priceHistory = {};
        this.alerts = [];
        
        this.init();
    }
    
    init() {
        this.loadPriceHistory();
        this.createPriceHistoryUI();
        this.setupEventListeners();
    }
    
    createPriceHistoryUI() {
        const container = document.querySelector('[data-eco-price-history]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-price-history">
                <div class="eco-price-header">
                    <h3>Historial de Precios</h3>
                    <p>Evolución y tendencias de precios</p>
                </div>
                
                <div class="eco-price-search">
                    <input type="text" data-price-search placeholder="Buscar producto...">
                    <button class="eco-search-btn">
                        <i class="bi bi-search"></i>
                    </button>
                </div>
                
                <div class="eco-price-list" data-price-list>
                    ${this.renderPriceList()}
                </div>
                
                <div class="eco-price-alerts">
                    <h4>Alertas de Precios</h4>
                    <div class="eco-alerts-list" data-alerts-list>
                        ${this.renderAlerts()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPriceList() {
        const products = [
            { id: 1, name: 'Botella Térmica', currentPrice: 45, lowestPrice: 38, highestPrice: 60, trend: 'down' },
            { id: 2, name: 'Kit Compostaje', currentPrice: 55, lowestPrice: 50, highestPrice: 65, trend: 'stable' },
            { id: 3, name: 'Jabón Natural', currentPrice: 15, lowestPrice: 12, highestPrice: 18, trend: 'up' }
        ];
        
        return products.map(product => `
            <div class="eco-price-item" data-product-id="${product.id}">
                <div class="eco-price-info">
                    <h4>${product.name}</h4>
                    <div class="eco-price-current">S/.${product.currentPrice}</div>
                </div>
                <div class="eco-price-range">
                    <span class="eco-price-low">Mín: S/.${product.lowestPrice}</span>
                    <span class="eco-price-high">Máx: S/.${product.highestPrice}</span>
                </div>
                <div class="eco-price-trend ${product.trend}">
                    <i class="bi bi-arrow-${product.trend === 'up' ? 'up' : product.trend === 'down' ? 'down' : 'right'}"></i>
                    ${product.trend === 'up' ? 'Subiendo' : product.trend === 'down' ? 'Bajando' : 'Estable'}
                </div>
                <button class="eco-btn-secondary" data-set-alert="${product.id}">
                    <i class="bi bi-bell"></i>
                    Alerta
                </button>
            </div>
        `).join('');
    }
    
    renderAlerts() {
        if (this.alerts.length === 0) {
            return '<p class="eco-no-alerts">Sin alertas activas</p>';
        }
        
        return this.alerts.map(alert => `
            <div class="eco-alert-item">
                <div class="eco-alert-info">
                    <span class="eco-alert-product">${alert.product}</span>
                    <span class="eco-alert-target">S/.${alert.targetPrice}</span>
                </div>
                <button class="eco-btn-secondary" data-remove-alert="${alert.id}">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // Buscar producto
        document.querySelector('[data-price-search]')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchProduct(e.target.value);
            }
        });
        
        // Configurar alerta
        document.querySelectorAll('[data-set-alert]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.setAlert;
                this.setAlert(productId);
            });
        });
        
        // Remover alerta
        document.querySelectorAll('[data-remove-alert]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = e.target.dataset.removeAlert;
                this.removeAlert(alertId);
            });
        });
    }
    
    searchProduct(query) {
        alert(`Buscando: ${query}`);
    }
    
    setAlert(productId) {
        const targetPrice = prompt('Precio objetivo:');
        if (targetPrice) {
            this.alerts.push({
                id: Date.now(),
                productId: productId,
                product: 'Producto ' + productId,
                targetPrice: parseFloat(targetPrice)
            });
            this.saveAlerts();
            this.updateAlertsUI();
            alert('Alerta configurada');
        }
    }
    
    removeAlert(alertId) {
        this.alerts = this.alerts.filter(a => a.id !== parseInt(alertId));
        this.saveAlerts();
        this.updateAlertsUI();
    }
    
    updateAlertsUI() {
        const alertsList = document.querySelector('[data-alerts-list]');
        if (alertsList) {
            alertsList.innerHTML = this.renderAlerts();
        }
    }
    
    loadPriceHistory() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.priceHistory = JSON.parse(saved);
            }
        } catch {
            // Usar historial por defecto
        }
    }
    
    saveAlerts() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.alerts));
        } catch (error) {
            console.error('Error guardando alertas:', error);
        }
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const priceHistoryContainer = document.querySelector('[data-eco-price-history]');
    if (priceHistoryContainer && priceHistoryContainer.dataset.ecoPriceHistory !== 'false') {
        window.ecoPriceHistory = new EcoPriceHistory({
            ...priceHistoryContainer.dataset
        });
    }
});