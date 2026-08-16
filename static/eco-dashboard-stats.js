/**
 * eco-dashboard-stats.js - Dashboard de estadisticas personales
 * 
 * Funcionalidades:
 - Graficos de compras
 - Ahorro acumulado
 - Impacto ambiental personal
 - Tendencias personales
 - Dashboard completo
 - Metricas detalladas
 */

class EcoDashboardStats {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/dashboard',
            storageKey: options.storageKey || 'ecomarket_dashboard',
            enableCharts: options.enableCharts !== false,
            ...options
        };
        
        this.userStats = {
            totalPurchases: 0,
            totalSpent: 0,
            totalSaved: 0,
            totalProducts: 0,
            categories: {},
            monthlyData: [],
            yearlyData: []
        };
        
        this.init();
    }
    
    init() {
        this.loadUserStats();
        this.createDashboardUI();
        this.setupEventListeners();
    }
    
    createDashboardUI() {
        const container = document.querySelector('[data-eco-dashboard]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-dashboard-stats">
                <div class="eco-dashboard-header">
                    <h3>Dashboard Personal</h3>
                    <p>Tus estadísticas y tendencias</p>
                </div>
                
                <div class="eco-dashboard-summary">
                    <div class="eco-stat-card">
                        <div class="eco-stat-icon" style="color: #4CAF50;">
                            <i class="bi bi-cart"></i>
                        </div>
                        <div class="eco-stat-value" data-total-purchases>${this.userStats.totalPurchases}</div>
                        <div class="eco-stat-label">Compras Totales</div>
                    </div>
                    
                    <div class="eco-stat-card">
                        <div class="eco-stat-icon" style="color: #2196F3;">
                            <i class="bi bi-currency-dollar"></i>
                        </div>
                        <div class="eco-stat-value" data-total-spent>S/.${this.userStats.totalSpent.toFixed(2)}</div>
                        <div class="eco-stat-label">Gastado Total</div>
                    </div>
                    
                    <div class="eco-stat-card">
                        <div class="eco-stat-icon" style="color: #FF9800;">
                            <i class="bi bi-piggy-bank"></i>
                        </div>
                        <div class="eco-stat-value" data-total-saved>S/.${this.userStats.totalSaved.toFixed(2)}</div>
                        <div class="eco-stat-label">Ahorro Total</div>
                    </div>
                    
                    <div class="eco-stat-card">
                        <div class="eco-stat-icon" style="color: #9C27B0;">
                            <i class="bi bi-box"></i>
                        </div>
                        <div class="eco-stat-value" data-total-products>${this.userStats.totalProducts}</div>
                        <div class="eco-stat-label">Productos</div>
                    </div>
                </div>
                
                <div class="eco-dashboard-charts">
                    <div class="eco-chart-section">
                        <h4>Compras por Categoría</h4>
                        <div class="eco-chart-bar" data-category-chart>
                            ${this.renderCategoryChart()}
                        </div>
                    </div>
                    
                    <div class="eco-chart-section">
                        <h4>Gastos Mensuales</h4>
                        <div class="eco-chart-line" data-monthly-chart>
                            ${this.renderMonthlyChart()}
                        </div>
                    </div>
                </div>
                
                <div class="eco-dashboard-details">
                    <h4>Detalles de Compras</h4>
                    <div class="eco-purchases-list" data-purchases-list>
                        ${this.renderPurchasesList()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCategoryChart() {
        const categories = {
            'Hogar': 12,
            'Higiene': 8,
            'Accesorios': 15,
            'Jardín': 5,
            'Alimentación': 10,
            'Ropa': 7
        };
        
        const max = Math.max(...Object.values(categories));
        
        return Object.entries(categories).map(([category, count]) => `
            <div class="eco-chart-bar-item">
                <div class="eco-bar-label">${category}</div>
                <div class="eco-bar-container">
                    <div class="eco-bar-fill" style="width: ${(count / max) * 100}%;">
                        <span>${count}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderMonthlyChart() {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const data = [120, 180, 150, 200, 170, 220, 190, 250, 210, 280, 240, 300];
        const max = Math.max(...data);
        
        return `
            <div class="eco-line-chart">
                ${data.map((value, index) => `
                    <div class="eco-line-point" style="left: ${(index / (data.length - 1)) * 100}%; bottom: ${(value / max) * 100}%;">
                        <span class="eco-point-value">S/.${value}</span>
                        <span class="eco-point-label">${months[index]}</span>
                    </div>
                `).join('')}
                <svg class="eco-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                        points="${data.map((value, index) => `${(index / (data.length - 1)) * 100},${100 - (value / max) * 100}`).join(' ')}"
                        fill="none"
                        stroke="var(--verde, #2e7d32)"
                        stroke-width="2"
                    />
                </svg>
            </div>
        `;
    }
    
    renderPurchasesList() {
        const purchases = [
            { id: 1, product: 'Botella Térmica', date: '2024-01-15', price: 45, category: 'Accesorios' },
            { id: 2, product: 'Kit Compostaje', date: '2024-01-10', price: 55, category: 'Jardín' },
            { id: 3, product: 'Jabón Natural', date: '2024-01-05', price: 15, category: 'Higiene' }
        ];
        
        return purchases.map(purchase => `
            <div class="eco-purchase-item">
                <div class="eco-purchase-info">
                    <span class="eco-purchase-product">${purchase.product}</span>
                    <span class="eco-purchase-category">${purchase.category}</span>
                </div>
                <div class="eco-purchase-details">
                    <span class="eco-purchase-date">${this.formatDate(purchase.date)}</span>
                    <span class="eco-purchase-price">S/.${purchase.price}</span>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // Track de compras para actualizar estadísticas
        document.addEventListener('ecommerce:purchase', (e) => {
            this.updateStats(e.detail);
        });
    }
    
    updateStats(purchaseData) {
        this.userStats.totalPurchases++;
        this.userStats.totalSpent += purchaseData.amount || 0;
        this.userStats.totalSaved += purchaseData.saved || 0;
        this.userStats.totalProducts += purchaseData.quantity || 1;
        
        this.saveUserStats();
        this.updateUI();
    }
    
    updateUI() {
        const totalPurchasesEl = document.querySelector('[data-total-purchases]');
        const totalSpentEl = document.querySelector('[data-total-spent]');
        const totalSavedEl = document.querySelector('[data-total-saved]');
        const totalProductsEl = document.querySelector('[data-total-products]');
        
        if (totalPurchasesEl) totalPurchasesEl.textContent = this.userStats.totalPurchases;
        if (totalSpentEl) totalSpentEl.textContent = `S/.${this.userStats.totalSpent.toFixed(2)}`;
        if (totalSavedEl) totalSavedEl.textContent = `S/.${this.userStats.totalSaved.toFixed(2)}`;
        if (totalProductsEl) totalProductsEl.textContent = this.userStats.totalProducts;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    loadUserStats() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.userStats = JSON.parse(saved);
            }
        } catch {
            // Usar estadísticas por defecto
        }
    }
    
    saveUserStats() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.userStats));
        } catch (error) {
            console.error('Error guardando estadísticas:', error);
        }
    }
    
    getUserStats() {
        return this.userStats;
    }
    
    destroy() {
        document.removeEventListener('ecommerce:purchase', (e) => this.updateStats(e));
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const dashboardContainer = document.querySelector('[data-eco-dashboard]');
    if (dashboardContainer && dashboardContainer.dataset.ecoDashboard !== 'false') {
        window.ecoDashboardStats = new EcoDashboardStats({
            ...dashboardContainer.dataset
        });
    }
});