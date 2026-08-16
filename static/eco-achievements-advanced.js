/**
 * eco-achievements-advanced.js - Logros y insignias avanzados
 * 
 * Funcionalidades:
 - Logros especificos
 - Insignias desbloqueables
 - Recompensas por logros
 - Sistema de niveles de logros
 - Progreso de logros
 - Exhibicion de insignias
 */

class EcoAchievementsAdvanced {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/achievements',
            storageKey: options.storageKey || 'ecomarket_achievements',
            enableRewards: options.enableRewards !== false,
            ...options
        };
        
        this.achievements = this.getDefaultAchievements();
        this.unlockedAchievements = [];
        this.badges = [];
        
        this.init();
    }
    
    init() {
        this.loadAchievements();
        this.createAchievementsUI();
        this.setupEventListeners();
        this.checkAchievements();
    }
    
    getDefaultAchievements() {
        return [
            {
                id: 'first_purchase',
                name: 'Primera Compra',
                description: 'Realiza tu primera compra',
                icon: 'bi-cart',
                type: 'purchase',
                requirement: 1,
                progress: 0,
                reward: { type: 'points', amount: 50 },
                badge: '🎯'
            },
            {
                id: 'eco_warrior',
                name: 'Guerrero Ecológico',
                description: 'Compra 10 productos ecológicos',
                icon: 'bi-tree',
                type: 'eco',
                requirement: 10,
                progress: 0,
                reward: { type: 'points', amount: 200 },
                badge: '🌿'
            },
            {
                id: 'social_butterfly',
                name: 'Mariposa Social',
                description: 'Comparte 5 productos en redes sociales',
                icon: 'bi-share',
                type: 'social',
                requirement: 5,
                progress: 0,
                reward: { type: 'discount', amount: 10 },
                badge: '🦋'
            },
            {
                id: 'review_master',
                name: 'Maestro de Reviews',
                description: 'Escribe 10 reviews verificadas',
                icon: 'bi-star',
                type: 'review',
                requirement: 10,
                progress: 0,
                reward: { type: 'points', amount: 150 },
                badge: '⭐'
            },
            {
                id: 'saver_pro',
                name: 'Ahorro Pro',
                description: 'Ahorra S/.100 usando cupones',
                icon: 'bi-piggy-bank',
                type: 'savings',
                requirement: 100,
                progress: 0,
                reward: { type: 'points', amount: 300 },
                badge: '💰'
            },
            {
                id: 'referral_king',
                name: 'Rey de Referidos',
                description: 'Refiere 5 amigos exitosamente',
                icon: 'bi-people',
                type: 'referral',
                requirement: 5,
                progress: 0,
                reward: { type: 'points', amount: 500 },
                badge: '👑'
            },
            {
                id: 'collector',
                name: 'Coleccionista',
                description: 'Compra productos de 5 categorías diferentes',
                icon: 'bi-collection',
                type: 'collection',
                requirement: 5,
                progress: 0,
                reward: { type: 'badge', amount: 1 },
                badge: '🏆'
            },
            {
                id: 'early_bird',
                name: 'Pájaro Madrugador',
                description: 'Compra en 5 días diferentes',
                icon: 'bi-sunrise',
                type: 'frequency',
                requirement: 5,
                progress: 0,
                reward: { type: 'points', amount: 100 },
                badge: '🐦'
            },
            {
                id: 'big_spender',
                name: 'Gran Gastador',
                description: 'Gasta S/.500 en total',
                icon: 'bi-currency-dollar',
                type: 'spending',
                requirement: 500,
                progress: 0,
                reward: { type: 'discount', amount: 20 },
                badge: '💎'
            },
            {
                id: 'loyal_customer',
                name: 'Cliente Leal',
                description: 'Compra durante 3 meses consecutivos',
                icon: 'bi-heart',
                type: 'loyalty',
                requirement: 3,
                progress: 0,
                reward: { type: 'points', amount: 400 },
                badge: '❤️'
            }
        ];
    }
    
    createAchievementsUI() {
        const container = document.querySelector('[data-eco-achievements]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-achievements-advanced">
                <div class="eco-achievements-header">
                    <h3>Logros e Insignias</h3>
                    <div class="eco-achievements-stats">
                        <span class="eco-unlocked-count" data-unlocked-count>${this.unlockedAchievements.length}/${this.achievements.length}</span>
                        <span class="eco-total-points" data-total-points>0 puntos</span>
                    </div>
                </div>
                
                <div class="eco-achievements-filter">
                    <button class="eco-filter-btn active" data-filter="all">Todos</button>
                    <button class="eco-filter-btn" data-filter="unlocked">Desbloqueados</button>
                    <button class="eco-filter-btn" data-filter="locked">Bloqueados</button>
                    <button class="eco-filter-btn" data-filter="purchase">Compras</button>
                    <button class="eco-filter-btn" data-filter="social">Social</button>
                </div>
                
                <div class="eco-achievements-grid" data-achievements-grid>
                    ${this.renderAchievements('all')}
                </div>
                
                <div class="eco-badges-section">
                    <h4>Mis Insignias</h4>
                    <div class="eco-badges-grid" data-badges-grid>
                        ${this.renderBadges()}
                    </div>
                </div>
                
                <div class="eco-achievements-progress">
                    <h4>Progreso General</h4>
                    <div class="eco-progress-bar">
                        <div class="eco-progress-fill" data-progress-fill style="width: ${this.calculateProgress()}%"></div>
                    </div>
                    <span class="eco-progress-text" data-progress-text>${this.calculateProgress()}% completado</span>
                </div>
            </div>
        `;
    }
    
    renderAchievements(filter) {
        let filteredAchievements = this.achievements;
        
        if (filter === 'unlocked') {
            filteredAchievements = this.achievements.filter(a => 
                this.unlockedAchievements.includes(a.id)
            );
        } else if (filter === 'locked') {
            filteredAchievements = this.achievements.filter(a => 
                !this.unlockedAchievements.includes(a.id)
            );
        } else if (filter !== 'all') {
            filteredAchievements = this.achievements.filter(a => a.type === filter);
        }
        
        return filteredAchievements.map(achievement => {
            const isUnlocked = this.unlockedAchievements.includes(achievement.id);
            const progressPercent = Math.min((achievement.progress / achievement.requirement) * 100, 100);
            
            return `
                <div class="eco-achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="eco-achievement-icon">
                        <i class="bi ${achievement.icon}"></i>
                        <span class="eco-achievement-badge">${achievement.badge}</span>
                    </div>
                    <div class="eco-achievement-info">
                        <h5>${achievement.name}</h5>
                        <p>${achievement.description}</p>
                        <div class="eco-achievement-progress">
                            <div class="eco-progress-bar-small">
                                <div class="eco-progress-fill-small" style="width: ${progressPercent}%"></div>
                            </div>
                            <span class="eco-progress-text-small">${achievement.progress}/${achievement.requirement}</span>
                        </div>
                        <div class="eco-achievement-reward">
                            <i class="bi bi-gift"></i>
                            <span>${this.formatReward(achievement.reward)}</span>
                        </div>
                    </div>
                    ${isUnlocked ? '<div class="eco-achievement-status"><i class="bi bi-check-circle"></i></div>' : ''}
                </div>
            `;
        }).join('');
    }
    
    renderBadges() {
        if (this.badges.length === 0) {
            return '<p class="eco-no-badges">Sin insignias aún</p>';
        }
        
        return this.badges.map(badge => `
            <div class="eco-badge-item">
                <span class="eco-badge-emoji">${badge.emoji}</span>
                <span class="eco-badge-name">${badge.name}</span>
                <span class="eco-badge-date">${this.formatDate(badge.date)}</span>
            </div>
        `).join('');
    }
    
    formatReward(reward) {
        switch (reward.type) {
            case 'points': return `${reward.amount} puntos`;
            case 'discount': return `${reward.amount}% descuento`;
            case 'badge': return 'Insignia exclusiva';
            default: return 'Recompensa';
        }
    }
    
    setupEventListeners() {
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterAchievements(filter);
            });
        });
    }
    
    filterAchievements(filter) {
        const grid = document.querySelector('[data-achievements-grid]');
        if (grid) {
            grid.innerHTML = this.renderAchievements(filter);
        }
        
        // Actualizar botones activos
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    }
    
    updateProgress(achievementId, progress) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement) {
            achievement.progress = progress;
            
            if (progress >= achievement.requirement && !this.unlockedAchievements.includes(achievementId)) {
                this.unlockAchievement(achievementId);
            }
            
            this.saveAchievements();
            this.updateUI();
        }
    }
    
    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !this.unlockedAchievements.includes(achievementId)) {
            this.unlockedAchievements.push(achievementId);
            this.badges.push({
                id: achievementId,
                name: achievement.name,
                emoji: achievement.badge,
                date: new Date().toISOString()
            });
            
            // Emitir evento de logro desbloqueado
            document.dispatchEvent(new CustomEvent('achievement:unlocked', {
                detail: { achievement }
            }));
            
            // Mostrar notificación
            this.showAchievementNotification(achievement);
        }
    }
    
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'eco-achievement-notification';
        notification.innerHTML = `
            <div class="eco-notification-content">
                <span class="eco-notification-badge">${achievement.badge}</span>
                <div class="eco-notification-text">
                    <h5>¡Logro Desbloqueado!</h5>
                    <p>${achievement.name}</p>
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
    
    checkAchievements() {
        // Verificar logros automáticamente
        // En producción, esto se haría con datos reales del usuario
    }
    
    calculateProgress() {
        if (this.achievements.length === 0) return 0;
        const totalProgress = this.achievements.reduce((acc, a) => acc + (a.progress / a.requirement), 0);
        return Math.round((totalProgress / this.achievements.length) * 100);
    }
    
    updateUI() {
        const unlockedCount = document.querySelector('[data-unlocked-count]');
        const progressFill = document.querySelector('[data-progress-fill]');
        const progressText = document.querySelector('[data-progress-text]');
        const badgesGrid = document.querySelector('[data-badges-grid]');
        
        if (unlockedCount) {
            unlockedCount.textContent = `${this.unlockedAchievements.length}/${this.achievements.length}`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${this.calculateProgress()}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${this.calculateProgress()}% completado`;
        }
        
        if (badgesGrid) {
            badgesGrid.innerHTML = this.renderBadges();
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    loadAchievements() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.achievements = data.achievements || this.getDefaultAchievements();
                this.unlockedAchievements = data.unlockedAchievements || [];
                this.badges = data.badges || [];
            }
        } catch {
            // Usar logros por defecto
        }
    }
    
    saveAchievements() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify({
                achievements: this.achievements,
                unlockedAchievements: this.unlockedAchievements,
                badges: this.badges
            }));
        } catch (error) {
            console.error('Error guardando logros:', error);
        }
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const achievementsContainer = document.querySelector('[data-eco-achievements]');
    if (achievementsContainer && achievementsContainer.dataset.ecoAchievements !== 'false') {
        window.ecoAchievementsAdvanced = new EcoAchievementsAdvanced({
            ...achievementsContainer.dataset
        });
    }
});