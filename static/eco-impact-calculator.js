/**
 * eco-impact-calculator.js - Calculadora de impacto ambiental
 * 
 * Funcionalidades:
 - Calcular huella de carbono de cada compra
 - Calcular ahorro de agua
 - Calcular impacto ambiental real
 - Comparativa con productos convencionales
 - Certificaciones ecológicas
 - Impacto acumulado del usuario
 - Gráficos de impacto
 - Recomendaciones para reducir impacto
 */

class EcoImpactCalculator {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/impacto',
            storageKey: options.storageKey || 'ecomarket_impact',
            enableTracking: options.enableTracking !== false,
            ...options
        };
        
        this.userImpact = {
            co2Saved: 0,
            waterSaved: 0,
            treesEquivalent: 0,
            plasticSaved: 0,
            purchases: []
        };
        
        this.impactFactors = {
            co2PerProduct: 2.5, // kg CO2 ahorrado por producto ecológico
            waterPerProduct: 500, // litros ahorrados por producto ecológico
            plasticPerProduct: 0.1, // kg plástico ahorrado por producto ecológico
            treesPerCo2: 0.02 // árboles equivalentes por kg CO2
        };
        
        this.init();
    }
    
    init() {
        this.loadUserImpact();
        this.createImpactUI();
        this.setupEventListeners();
    }
    
    createImpactUI() {
        const container = document.querySelector('[data-eco-impact]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-impact-calculator">
                <div class="eco-impact-header">
                    <h3>Calculadora de Impacto Ambiental</h3>
                    <p>Tu impacto positivo en el planeta</p>
                </div>
                
                <div class="eco-impact-summary">
                    <div class="eco-impact-card">
                        <div class="eco-impact-icon" style="color: #4CAF50;">
                            <i class="bi bi-cloud"></i>
                        </div>
                        <div class="eco-impact-value" data-co2-saved>${this.formatNumber(this.userImpact.co2Saved)}</div>
                        <div class="eco-impact-label">kg CO₂ Ahorrado</div>
                    </div>
                    
                    <div class="eco-impact-card">
                        <div class="eco-impact-icon" style="color: #2196F3;">
                            <i class="bi bi-droplet"></i>
                        </div>
                        <div class="eco-impact-value" data-water-saved>${this.formatNumber(this.userImpact.waterSaved)}</div>
                        <div class="eco-impact-label">Litros Ahorrados</div>
                    </div>
                    
                    <div class="eco-impact-card">
                        <div class="eco-impact-icon" style="color: #8BC34A;">
                            <i class="bi bi-tree"></i>
                        </div>
                        <div class="eco-impact-value" data-trees-equiv>${this.formatNumber(this.userImpact.treesEquivalent)}</div>
                        <div class="eco-impact-label">Árboles Equivalentes</div>
                    </div>
                    
                    <div class="eco-impact-card">
                        <div class="eco-impact-icon" style="color: #FF9800;">
                            <i class="bi bi-recycle"></i>
                        </div>
                        <div class="eco-impact-value" data-plastic-saved>${this.formatNumber(this.userImpact.plasticSaved)}</div>
                        <div class="eco-impact-label">kg Plástico Ahorrado</div>
                    </div>
                </div>
                
                <div class="eco-impact-comparison">
                    <h4>Comparativa con Productos Convencionales</h4>
                    <div class="eco-comparison-chart" data-comparison-chart>
                        ${this.renderComparisonChart()}
                    </div>
                </div>
                
                <div class="eco-impact-recommendations">
                    <h4>Recomendaciones para Reducir Impacto</h4>
                    <div class="eco-recommendations-list" data-recommendations-list>
                        ${this.renderRecommendations()}
                    </div>
                </div>
                
                <div class="eco-impact-history">
                    <h4>Historial de Impacto</h4>
                    <div class="eco-impact-history-list" data-impact-history>
                        ${this.renderImpactHistory()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderComparisonChart() {
        const ecoProduct = {
            co2: 1.5,
            water: 200,
            plastic: 0.05
        };
        
        const conventionalProduct = {
            co2: 5.0,
            water: 1000,
            plastic: 0.5
        };
        
        return `
            <div class="eco-comparison-item">
                <div class="eco-comparison-label">Huella de Carbono</div>
                <div class="eco-comparison-bars">
                    <div class="eco-bar eco-bar-eco" style="width: ${ecoProduct.co2 / conventionalProduct.co2 * 100}%;">
                        <span>Eco: ${ecoProduct.co2} kg</span>
                    </div>
                    <div class="eco-bar eco-bar-conventional" style="width: 100%;">
                        <span>Convencional: ${conventionalProduct.co2} kg</span>
                    </div>
                </div>
            </div>
            
            <div class="eco-comparison-item">
                <div class="eco-comparison-label">Uso de Agua</div>
                <div class="eco-comparison-bars">
                    <div class="eco-bar eco-bar-eco" style="width: ${ecoProduct.water / conventionalProduct.water * 100}%;">
                        <span>Eco: ${ecoProduct.water} L</span>
                    </div>
                    <div class="eco-bar eco-bar-conventional" style="width: 100%;">
                        <span>Convencional: ${conventionalProduct.water} L</span>
                    </div>
                </div>
            </div>
            
            <div class="eco-comparison-item">
                <div class="eco-comparison-label">Plástico</div>
                <div class="eco-comparison-bars">
                    <div class="eco-bar eco-bar-eco" style="width: ${ecoProduct.plastic / conventionalProduct.plastic * 100}%;">
                        <span>Eco: ${ecoProduct.plastic} kg</span>
                    </div>
                    <div class="eco-bar eco-bar-conventional" style="width: 100%;">
                        <span>Convencional: ${conventionalProduct.plastic} kg</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderRecommendations() {
        const recommendations = [
            {
                icon: 'bi-bag',
                title: 'Usa Bolsas Reutilizables',
                description: 'Cada bolsa reutilizable ahorra 500 bolsas plásticas al año',
                impact: '50 kg CO₂'
            },
            {
                icon: 'bi-cup',
                title: 'Botella Reutilizable',
                description: 'Una botella reutilizable ahorra 167 botellas plásticas al año',
                impact: '25 kg CO₂'
            },
            {
                icon: 'bi-lightning',
                title: 'Iluminación LED',
                description: 'Las bombillas LED consumen 75% menos energía',
                impact: '100 kg CO₂'
            },
            {
                icon: 'bi-shop',
                title: 'Compra Local',
                description: 'Reducir la distancia de transporte disminuye la huella de carbono',
                impact: '30 kg CO₂'
            }
        ];
        
        return recommendations.map(rec => `
            <div class="eco-recommendation-item">
                <div class="eco-recommendation-icon">
                    <i class="bi ${rec.icon}"></i>
                </div>
                <div class="eco-recommendation-content">
                    <h5>${rec.title}</h5>
                    <p>${rec.description}</p>
                    <span class="eco-recommendation-impact">Impacto: ${rec.impact}</span>
                </div>
            </div>
        `).join('');
    }
    
    renderImpactHistory() {
        if (this.userImpact.purchases.length === 0) {
            return '<p class="eco-no-impact">Sin historial de impacto</p>';
        }
        
        return this.userImpact.purchases.slice(0, 10).map(purchase => `
            <div class="eco-impact-history-item">
                <div class="eco-impact-product">
                    <span class="eco-product-name">${purchase.product}</span>
                    <span class="eco-impact-date">${this.formatDate(purchase.date)}</span>
                </div>
                <div class="eco-impact-metrics">
                    <span class="eco-metric">-${purchase.co2} kg CO₂</span>
                    <span class="eco-metric">-${purchase.water} L agua</span>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // Track de compras para calcular impacto
        document.addEventListener('ecommerce:purchase', (e) => {
            this.calculatePurchaseImpact(e.detail);
        });
    }
    
    calculatePurchaseImpact(purchaseData) {
        const quantity = purchaseData.quantity || 1;
        const isEco = purchaseData.isEco !== false;
        
        if (!isEco) return;
        
        const co2Saved = this.impactFactors.co2PerProduct * quantity;
        const waterSaved = this.impactFactors.waterPerProduct * quantity;
        const plasticSaved = this.impactFactors.plasticPerProduct * quantity;
        const treesEquivalent = co2Saved * this.impactFactors.treesPerCo2;
        
        // Actualizar impacto del usuario
        this.userImpact.co2Saved += co2Saved;
        this.userImpact.waterSaved += waterSaved;
        this.userImpact.plasticSaved += plasticSaved;
        this.userImpact.treesEquivalent += treesEquivalent;
        
        // Agregar al historial
        this.userImpact.purchases.unshift({
            product: purchaseData.productName || 'Producto',
            date: new Date().toISOString(),
            co2: co2Saved,
            water: waterSaved,
            plastic: plasticSaved
        });
        
        this.saveUserImpact();
        this.updateUI();
        
        // Mostrar notificación de impacto
        this.showImpactNotification(co2Saved, waterSaved);
    }
    
    showImpactNotification(co2, water) {
        const notification = document.createElement('div');
        notification.className = 'eco-impact-notification';
        notification.innerHTML = `
            <div class="eco-notification-content">
                <span class="eco-impact-icon">🌍</span>
                <div class="eco-impact-text">
                    <h3>¡Impacto Positivo!</h3>
                    <p>Ahorras ${co2.toFixed(1)} kg CO₂ y ${water} L de agua</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    updateUI() {
        const co2El = document.querySelector('[data-co2-saved]');
        const waterEl = document.querySelector('[data-water-saved]');
        const treesEl = document.querySelector('[data-trees-equiv]');
        const plasticEl = document.querySelector('[data-plastic-saved]');
        
        if (co2El) co2El.textContent = this.formatNumber(this.userImpact.co2Saved);
        if (waterEl) waterEl.textContent = this.formatNumber(this.userImpact.waterSaved);
        if (treesEl) treesEl.textContent = this.formatNumber(this.userImpact.treesEquivalent);
        if (plasticEl) plasticEl.textContent = this.formatNumber(this.userImpact.plasticSaved);
        
        // Actualizar historial
        const historyList = document.querySelector('[data-impact-history]');
        if (historyList) {
            historyList.innerHTML = this.renderImpactHistory();
        }
    }
    
    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toFixed(1);
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    loadUserImpact() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.userImpact = JSON.parse(saved);
            }
        } catch {
            // Usar impacto por defecto
        }
    }
    
    saveUserImpact() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.userImpact));
        } catch (error) {
            console.error('Error guardando impacto:', error);
        }
    }
    
    getUserImpact() {
        return this.userImpact;
    }
    
    destroy() {
        document.removeEventListener('ecommerce:purchase', (e) => this.calculatePurchaseImpact(e));
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const impactContainer = document.querySelector('[data-eco-impact]');
    if (impactContainer && impactContainer.dataset.ecoImpact !== 'false') {
        window.ecoImpactCalculator = new EcoImpactCalculator({
            ...impactContainer.dataset
        });
    }
});