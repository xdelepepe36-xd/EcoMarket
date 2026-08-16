/**
 * eco-rewards-shop.js - Sistema de recompensas donde los puntos sirven
 * 
 * Funcionalidades:
 - Canjear EcoPoints por descuentos
 - Canjear XP por productos gratis
 - Canjear puntos por envío gratis
 - Canjear puntos por insignias exclusivas
 - Sistema de canje de puntos
 - Historial de canjes
 - Beneficios exclusivos por nivel
 - Ofertas especiales con puntos
 */

class EcoRewardsShop {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/recompensas',
            storageKey: options.storageKey || 'ecomarket_rewards',
            enableConversion: options.enableConversion !== false,
            exchangeRate: options.exchangeRate || 100, // 100 EcoPoints = S/.1
            ...options
        };
        
        this.userPoints = {
            ecoPoints: 0,
            xp: 0,
            purchases: []
        };
        
        this.rewards = [];
        this.history = [];
        
        this.init();
    }
    
    init() {
        this.loadUserPoints();
        this.generateRewards();
        this.createRewardsUI();
        this.setupEventListeners();
    }
    
    generateRewards() {
        this.rewards = [
            // Descuentos con EcoPoints
            {
                id: 'discount_5',
                type: 'discount',
                name: 'Descuento 5%',
                description: '5% de descuento en tu próxima compra',
                cost: 500,
                currency: 'ecoPoints',
                value: 5,
                category: 'discounts',
                icon: 'bi-tag',
                available: true
            },
            {
                id: 'discount_10',
                type: 'discount',
                name: 'Descuento 10%',
                description: '10% de descuento en tu próxima compra',
                cost: 1000,
                currency: 'ecoPoints',
                value: 10,
                category: 'discounts',
                icon: 'bi-tag',
                available: true
            },
            {
                id: 'discount_15',
                type: 'discount',
                name: 'Descuento 15%',
                description: '15% de descuento en tu próxima compra',
                cost: 2000,
                currency: 'ecoPoints',
                value: 15,
                category: 'discounts',
                icon: 'bi-tag',
                available: true
            },
            {
                id: 'discount_20',
                type: 'discount',
                name: 'Descuento 20%',
                description: '20% de descuento en tu próxima compra',
                cost: 3500,
                currency: 'ecoPoints',
                value: 20,
                category: 'discounts',
                icon: 'bi-tag',
                available: true
            },
            
            // Envío gratis
            {
                id: 'free_shipping',
                type: 'shipping',
                name: 'Envío Gratis',
                description: 'Envío gratis en tu próximo pedido',
                cost: 2500,
                currency: 'ecoPoints',
                value: 'free',
                category: 'shipping',
                icon: 'bi-truck',
                available: true
            },
            
            // Productos gratis
            {
                id: 'free_product_cheap',
                type: 'product',
                name: 'Producto Gratis (Hasta S/.20)',
                description: 'Elige un producto hasta S/.20 totalmente gratis',
                cost: 5000,
                currency: 'ecoPoints',
                value: 20,
                category: 'products',
                icon: 'bi-gift',
                available: true
            },
            {
                id: 'free_product_medium',
                type: 'product',
                name: 'Producto Gratis (Hasta S/.50)',
                description: 'Elige un producto hasta S/.50 totalmente gratis',
                cost: 10000,
                currency: 'ecoPoints',
                value: 50,
                category: 'products',
                icon: 'bi-gift',
                available: true
            },
            
            // Envolturas regalos
            {
                id: 'gift_wrap',
                type: 'gift',
                name: 'Envoltura Regalo Premium',
                description: 'Empaque regalo premium para tu pedido',
                cost: 300,
                currency: 'ecoPoints',
                value: 'gift',
                category: 'gifts',
                icon: 'bi-gift',
                available: true
            },
            
            // Insignias exclusivas
            {
                id: 'badge_gold',
                type: 'badge',
                name: 'Insignia Dorada',
                description: 'Insignia exclusiva dorada para tu perfil',
                cost: 3000,
                currency: 'ecoPoints',
                value: 'gold',
                category: 'badges',
                icon: 'bi-award',
                available: true
            },
            {
                id: 'badge_diamond',
                type: 'badge',
                name: 'Insignia Diamante',
                description: 'Insignia exclusiva diamante para tu perfil',
                cost: 8000,
                currency: 'ecoPoints',
                value: 'diamond',
                category: 'badges',
                icon: 'bi-award',
                available: true
            },
            
            // Beneficios de nivel
            {
                id: 'xp_multiplier',
                type: 'boost',
                name: 'Multiplicador XP (2x)',
                description: 'Duplica tu XP por 24 horas',
                cost: 1500,
                currency: 'ecoPoints',
                value: 2,
                category: 'boosts',
                icon: 'bi-lightning',
                available: true
            },
            {
                id: 'eco_points_multiplier',
                type: 'boost',
                name: 'Multiplicador EcoPoints (2x)',
                description: 'Duplica tus EcoPoints por 24 horas',
                cost: 2000,
                currency: 'ecoPoints',
                value: 2,
                category: 'boosts',
                icon: 'bi-lightning',
                available: true
            },
            
            // VIP features
            {
                id: 'vip_week',
                type: 'vip',
                name: 'Acceso VIP Semanal',
                description: 'Acceso a productos exclusivos por 1 semana',
                cost: 10000,
                currency: 'ecoPoints',
                value: 'week',
                category: 'vip',
                icon: 'bi-crown',
                available: true
            },
            
            // Conversión XP a EcoPoints
            {
                id: 'convert_xp',
                type: 'conversion',
                name: 'Convertir XP a EcoPoints',
                description: '1000 XP = 100 EcoPoints',
                cost: 1000,
                currency: 'xp',
                value: 100,
                category: 'conversion',
                icon: 'bi-arrow-repeat',
                available: this.options.enableConversion
            }
        ];
    }
    
    createRewardsUI() {
        const container = document.querySelector('[data-eco-rewards]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-rewards-shop">
                <div class="eco-rewards-header">
                    <h3>Tienda de Recompensas</h3>
                    <div class="eco-points-display">
                        <div class="eco-points-item">
                            <i class="bi bi-leaf"></i>
                            <span class="eco-points-value" data-eco-points>${this.userPoints.ecoPoints}</span>
                            <span class="eco-points-label">EcoPoints</span>
                        </div>
                        <div class="eco-points-item">
                            <i class="bi bi-star"></i>
                            <span class="eco-points-value" data-xp>${this.userPoints.xp}</span>
                            <span class="eco-points-label">XP</span>
                        </div>
                    </div>
                </div>
                
                ${this.options.enableConversion ? `
                    <div class="eco-conversion-section">
                        <div class="eco-conversion-info">
                            <p>Conversión: 1000 XP = 100 EcoPoints</p>
                            <button class="eco-btn-eco" data-convert-xp>
                                Convertir XP a EcoPoints
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                <div class="eco-rewards-categories">
                    <button class="eco-category-btn active" data-category="all">Todas</button>
                    <button class="eco-category-btn" data-category="discounts">Descuentos</button>
                    <button class="eco-category-btn" data-category="shipping">Envíos</button>
                    <button class="eco-category-btn" data-category="products">Productos</button>
                    <button class="eco-category-btn" data-category="badges">Insignias</button>
                    <button class="eco-category-btn" data-category="boosts">Boosts</button>
                    <button class="eco-category-btn" data-category="vip">VIP</button>
                </div>
                
                <div class="eco-rewards-grid" data-rewards-grid>
                    ${this.renderRewards('all')}
                </div>
                
                <div class="eco-rewards-history">
                    <h4>Historial de Canjes</h4>
                    <div class="eco-history-list" data-history-list>
                        ${this.renderHistory()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderRewards(category) {
        const filteredRewards = category === 'all' 
            ? this.rewards 
            : this.rewards.filter(r => r.category === category);
        
        if (filteredRewards.length === 0) {
            return '<p class="eco-no-rewards">No hay recompensas en esta categoría</p>';
        }
        
        return filteredRewards.map(reward => {
            const canAfford = this.canAfford(reward);
            const iconColor = this.getIconColor(reward.category);
            
            return `
                <div class="eco-reward-card ${!canAfford ? 'disabled' : ''}" data-reward-id="${reward.id}">
                    <div class="eco-reward-icon" style="color: ${iconColor}">
                        <i class="bi ${reward.icon}"></i>
                    </div>
                    <div class="eco-reward-info">
                        <h4>${reward.name}</h4>
                        <p>${reward.description}</p>
                        <div class="eco-reward-cost">
                            <span class="eco-cost-value">${reward.cost}</span>
                            <span class="eco-cost-currency">${reward.currency}</span>
                        </div>
                    </div>
                    <button class="eco-redeem-btn" data-redeem="${reward.id}" ${!canAfford ? 'disabled' : ''}>
                        Canjear
                    </button>
                </div>
            `;
        }).join('');
    }
    
    renderHistory() {
        if (this.history.length === 0) {
            return '<p class="eco-no-history">Sin historial de canjes</p>';
        }
        
        return this.history.slice(0, 10).map(item => `
            <div class="eco-history-item">
                <div class="eco-history-info">
                    <span class="eco-history-name">${item.name}</span>
                    <span class="eco-history-date">${this.formatDate(item.date)}</span>
                </div>
                <div class="eco-history-cost">
                    <span class="eco-history-value">-${item.cost}</span>
                    <span class="eco-history-currency">${item.currency}</span>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // Categorías
        document.querySelectorAll('.eco-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterRewards(category);
            });
        });
        
        // Canjear recompensas
        document.querySelectorAll('[data-redeem]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rewardId = e.target.dataset.redeem;
                this.redeemReward(rewardId);
            });
        });
        
        // Conversión XP
        document.querySelector('[data-convert-xp]')?.addEventListener('click', () => {
            this.convertXP();
        });
    }
    
    filterRewards(category) {
        document.querySelectorAll('.eco-category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        const grid = document.querySelector('[data-rewards-grid]');
        if (grid) {
            grid.innerHTML = this.renderRewards(category);
        }
    }
    
    canAfford(reward) {
        if (reward.currency === 'ecoPoints') {
            return this.userPoints.ecoPoints >= reward.cost;
        } else if (reward.currency === 'xp') {
            return this.userPoints.xp >= reward.cost;
        }
        return false;
    }
    
    async redeemReward(rewardId) {
        const reward = this.rewards.find(r => r.id === rewardId);
        if (!reward) return;
        
        if (!this.canAfford(reward)) {
            alert('No tienes suficientes puntos para canjear esta recompensa');
            return;
        }
        
        if (!confirm(`¿Canjear "${reward.name}" por ${reward.cost} ${reward.currency}?`)) {
            return;
        }
        
        try {
            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reward_id: rewardId,
                    cost: reward.cost,
                    currency: reward.currency
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Descontar puntos
                if (reward.currency === 'ecoPoints') {
                    this.userPoints.ecoPoints -= reward.cost;
                } else if (reward.currency === 'xp') {
                    this.userPoints.xp -= reward.cost;
                }
                
                // Agregar al historial
                this.history.unshift({
                    reward_id: rewardId,
                    name: reward.name,
                    cost: reward.cost,
                    currency: reward.currency,
                    date: new Date().toISOString()
                });
                
                this.saveUserPoints();
                this.updateUI();
                this.showSuccessNotification(reward);
                
                // Emitir evento de recompensa canjeada
                document.dispatchEvent(new CustomEvent('rewards:redeemed', {
                    detail: { reward, data }
                }));
            } else {
                alert('Error al canjear recompensa');
            }
        } catch (error) {
            console.error('Error canjeando recompensa:', error);
            alert('Error al canjear recompensa');
        }
    }
    
    convertXP() {
        const xpToConvert = Math.floor(this.userPoints.xp / 1000) * 1000;
        
        if (xpToConvert < 1000) {
            alert('Necesitas al menos 1000 XP para convertir');
            return;
        }
        
        const ecoPointsGained = Math.floor(xpToConvert / 10);
        
        if (confirm(`¿Convertir ${xpToConvert} XP por ${ecoPointsGained} EcoPoints?`)) {
            this.userPoints.xp -= xpToConvert;
            this.userPoints.ecoPoints += ecoPointsGained;
            
            this.saveUserPoints();
            this.updateUI();
            
            alert(`¡Conversión exitosa! +${ecoPointsGained} EcoPoints`);
        }
    }
    
    showSuccessNotification(reward) {
        const notification = document.createElement('div');
        notification.className = 'eco-reward-notification';
        notification.innerHTML = `
            <div class="eco-notification-content">
                <span class="eco-reward-icon">🎁</span>
                <div class="eco-reward-text">
                    <h3>¡Recompensa Canjeada!</h3>
                    <p>${reward.name}</p>
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
    
    getIconColor(category) {
        const colors = {
            'discounts': '#FF9800',
            'shipping': '#2196F3',
            'products': '#4CAF50',
            'gifts': '#E91E63',
            'badges': '#FFD700',
            'boosts': '#9C27B0',
            'vip': '#673AB7',
            'conversion': '#795548'
        };
        
        return colors[category] || '#2e7d32';
    }
    
    updateUI() {
        const ecoPointsEl = document.querySelector('[data-eco-points]');
        const xpEl = document.querySelector('[data-xp]');
        
        if (ecoPointsEl) {
            ecoPointsEl.textContent = this.userPoints.ecoPoints;
        }
        
        if (xpEl) {
            xpEl.textContent = this.userPoints.xp;
        }
        
        // Actualizar botones de canje
        document.querySelectorAll('[data-redeem]').forEach(btn => {
            const rewardId = btn.dataset.redeem;
            const reward = this.rewards.find(r => r.id === rewardId);
            if (reward) {
                btn.disabled = !this.canAfford(reward);
                btn.closest('.eco-reward-card').classList.toggle('disabled', !this.canAfford(reward));
            }
        });
        
        // Actualizar historial
        const historyList = document.querySelector('[data-history-list]');
        if (historyList) {
            historyList.innerHTML = this.renderHistory();
        }
    }
    
    loadUserPoints() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.userPoints = JSON.parse(saved);
            }
        } catch {
            // Usar puntos por defecto
        }
    }
    
    saveUserPoints() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.userPoints));
        } catch (error) {
            console.error('Error guardando puntos:', error);
        }
    }
    
    getEcoPoints() {
        return this.userPoints.ecoPoints;
    }
    
    getXP() {
        return this.userPoints.xp;
    }
    
    addEcoPoints(amount) {
        this.userPoints.ecoPoints += amount;
        this.saveUserPoints();
        this.updateUI();
    }
    
    addXP(amount) {
        this.userPoints.xp += amount;
        this.saveUserPoints();
        this.updateUI();
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const rewardsContainer = document.querySelector('[data-eco-rewards]');
    if (rewardsContainer && rewardsContainer.dataset.ecoRewards !== 'false') {
        window.ecoRewardsShop = new EcoRewardsShop({
            ...rewardsContainer.dataset
        });
    }
});