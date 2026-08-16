/**
 * eco-gamification-advanced.js - Sistema de gamificación avanzado para EcoMarket
 * 
 * Funcionalidades:
 - Sistema de niveles (50 niveles de Semilla a Bosque)
 - Insignias y logros
 - Leaderboard global
 - XP multiplicador por acciones
 - Retos diarios y semanales
 - Streaks de actividad
 - Recompensas por logros
 - Sistema de puntos de impacto (EcoPoints)
 */

class EcoGamificationAdvanced {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/gamificacion',
            storageKey: options.storageKey || 'ecomarket_gamification',
            enableLeaderboard: options.enableLeaderboard !== false,
            enableChallenges: options.enableChallenges !== false,
            enableStreaks: options.enableStreaks !== false,
            maxLevel: options.maxLevel || 50,
            ...options
        };
        
        this.userData = {
            level: 1,
            xp: 0,
            totalXP: 0,
            ecoPoints: 0,
            badges: [],
            achievements: [],
            streak: 0,
            lastActive: null,
            challenges: []
        };
        
        this.levels = this.generateLevels();
        this.badges = this.generateBadges();
        this.achievements = this.generateAchievements();
        this.challenges = this.generateChallenges();
        
        this.init();
    }
    
    init() {
        this.loadUserData();
        this.createGamificationUI();
        this.setupEventListeners();
        this.checkStreak();
        this.generateDailyChallenges();
    }
    
    generateLevels() {
        const levelNames = [
            'Semilla', 'Brote', 'Plántula', 'Rama', 'Hojas',
            'Tallo', 'Yema', 'Flor', 'Fruto', 'Árbol joven',
            'Árbol maduro', 'Bosque', 'Selva', 'Ecosistema', 'Planeta'
        ];
        
        const levels = [];
        let cumulativeXP = 0;
        
        for (let i = 1; i <= this.options.maxLevel; i++) {
            const xpRequired = Math.floor(100 * Math.pow(1.2, i - 1));
            cumulativeXP += xpRequired;
            
            const tierIndex = Math.floor((i - 1) / 5);
            const name = `${levelNames[tierIndex % levelNames.length]} ${((i - 1) % 5) + 1}`;
            
            levels.push({
                level: i,
                name: name,
                xpRequired: xpRequired,
                cumulativeXP: cumulativeXP,
                icon: this.getLevelIcon(i)
            });
        }
        
        return levels;
    }
    
    getLevelIcon(level) {
        const icons = ['🌱', '🌿', '🪴', '🌳', '🌲'];
        return icons[Math.floor((level - 1) / 10) % icons.length];
    }
    
    generateBadges() {
        return [
            { id: 'first_purchase', name: 'Primera Compra', icon: '🛒', description: 'Realiza tu primera compra', condition: 'purchases >= 1' },
            { id: 'eco_warrior', name: 'Guerrero Eco', icon: '⚔️', description: 'Compra 10 productos ecológicos', condition: 'eco_purchases >= 10' },
            { id: 'green_hero', name: 'Héroe Verde', icon: '🦸', description: 'Ahorra 50kg de CO₂', condition: 'co2_saved >= 50' },
            { id: 'review_master', name: 'Maestro de Reviews', icon: '⭐', description: 'Escribe 20 reviews', condition: 'reviews >= 20' },
            { id: 'top_seller', name: 'Vendedor Top', icon: '🏆', description: 'Vende 50 productos', condition: 'sales >= 50' },
            { id: 'community_star', name: 'Estrella Comunitaria', icon: '⭐', description: 'Obtén 100 likes en reviews', condition: 'review_likes >= 100' },
            { id: 'streak_master', name: 'Maestro de Streak', icon: '🔥', description: 'Mantén streak de 30 días', condition: 'streak >= 30' },
            { id: 'explorer', name: 'Explorador', icon: '🗺️', description: 'Explora todas las categorías', condition: 'categories_explored >= 6' },
            { id: 'collaborator', name: 'Colaborador', icon: '🤝', description: 'Participa en 5 foros', condition: 'forum_posts >= 5' },
            { id: 'influencer', name: 'Influencer', icon: '📱', description: 'Comparte tu perfil 10 veces', condition: 'profile_shares >= 10' }
        ];
    }
    
    generateAchievements() {
        return [
            { id: 'weekend_warrior', name: 'Guerrero de Fin de Semana', icon: '🎯', xp: 50, description: 'Compra 3 productos en un fin de semana' },
            { id: 'early_bird', name: 'Madrugador', icon: '🌅', xp: 30, description: 'Compra antes de las 9am' },
            { id: 'night_owl', name: 'Búho Nocturno', icon: '🦉', xp: 30, description: 'Compra después de las 10pm' },
            { id: 'big_spender', name: 'Gran Gastador', icon: '💰', xp: 100, description: 'Gasta más de S/.500 en un mes' },
            { id: 'variety_seeker', name: 'Buscador de Variedad', icon: '🎨', xp: 40, description: 'Compra de 5 categorías diferentes' },
            { id: 'loyal_customer', name: 'Cliente Leal', icon: '💎', xp: 200, description: 'Compra durante 6 meses consecutivos' },
            { id: 'social_butterfly', name: 'Mariposa Social', icon: '🦋', xp: 60, description: 'Comparte 5 productos' },
            { id: 'feedback_champion', name: 'Campeón de Feedback', icon: '💬', xp: 70, description: 'Deja feedback en 10 productos' },
            { id: 'eco_saver', name: 'Ahorrador Eco', icon: '♻️', xp: 80, description: 'Usa 5 cupones de descuento' },
            { id: 'quick_shopper', name: 'Comprador Rápido', icon: '⚡', xp: 50, description: 'Completa checkout en menos de 2 minutos' }
        ];
    }
    
    generateChallenges() {
        return [
            { id: 'daily_purchase', name: 'Compra Diaria', type: 'daily', xp: 20, description: 'Compra 1 producto hoy', target: 1, progress: 0 },
            { id: 'daily_explore', name: 'Explorador Diario', type: 'daily', xp: 15, description: 'Explora 3 categorías', target: 3, progress: 0 },
            { id: 'daily_review', name: 'Crítico Diario', type: 'daily', xp: 25, description: 'Escribe 1 review', target: 1, progress: 0 },
            { id: 'weekly_savings', name: 'Ahorro Semanal', type: 'weekly', xp: 100, description: 'Ahorra S/.100 con cupones', target: 100, progress: 0 },
            { id: 'weekly_eco', name: 'Eco Semanal', type: 'weekly', xp: 150, description: 'Compra 5 productos ecológicos', target: 5, progress: 0 },
            { id: 'monthly_streak', name: 'Streak Mensual', type: 'monthly', xp: 500, description: 'Mantén streak por 30 días', target: 30, progress: 0 }
        ];
    }
    
    createGamificationUI() {
        const container = document.querySelector('[data-eco-gamification]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-gamification-advanced">
                <div class="eco-level-progress">
                    <div class="eco-level-info">
                        <div class="eco-level-icon">${this.levels[this.userData.level - 1].icon}</div>
                        <div class="eco-level-details">
                            <h3>Nivel ${this.userData.level}: ${this.levels[this.userData.level - 1].name}</h3>
                            <div class="eco-xp-bar">
                                <div class="eco-xp-fill" style="width: ${this.getXPProgress()}%"></div>
                            </div>
                            <span class="eco-xp-text">${this.userData.xp} / ${this.levels[this.userData.level - 1].xpRequired} XP</span>
                        </div>
                    </div>
                    <div class="eco-streak-badge">
                        <i class="bi bi-fire"></i>
                        <span>${this.userData.streak} días</span>
                    </div>
                </div>
                
                <div class="eco-eco-points">
                    <div class="eco-points-display">
                        <i class="bi bi-leaf"></i>
                        <span class="eco-points-value">${this.userData.ecoPoints}</span>
                        <span class="eco-points-label">EcoPoints</span>
                    </div>
                </div>
                
                <div class="eco-badges-section">
                    <h4>Insignias</h4>
                    <div class="eco-badges-grid" data-badges-grid>
                        ${this.renderBadges()}
                    </div>
                </div>
                
                ${this.options.enableChallenges ? `
                    <div class="eco-challenges-section">
                        <h4>Retos Activos</h4>
                        <div class="eco-challenges-list" data-challenges-list>
                            ${this.renderChallenges()}
                        </div>
                    </div>
                ` : ''}
                
                ${this.options.enableLeaderboard ? `
                    <div class="eco-leaderboard-section">
                        <h4>Leaderboard</h4>
                        <div class="eco-leaderboard-list" data-leaderboard-list>
                            <div class="eco-loading-skeleton">Cargando leaderboard...</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        if (this.options.enableLeaderboard) {
            this.loadLeaderboard();
        }
    }
    
    renderBadges() {
        if (this.userData.badges.length === 0) {
            return '<p class="eco-empty-badges">¡Gana insignias completando logros!</p>';
        }
        
        return this.userData.badges.map(badgeId => {
            const badge = this.badges.find(b => b.id === badgeId);
            if (!badge) return '';
            
            return `
                <div class="eco-badge-item" title="${badge.description}">
                    <span class="eco-badge-icon">${badge.icon}</span>
                    <span class="eco-badge-name">${badge.name}</span>
                </div>
            `;
        }).join('');
    }
    
    renderChallenges() {
        const activeChallenges = this.userData.challenges.filter(c => !c.completed);
        
        if (activeChallenges.length === 0) {
            return '<p class="eco-empty-challenges">¡Todos los retos completados!</p>';
        }
        
        return activeChallenges.map(challenge => {
            const progress = (challenge.progress / challenge.target) * 100;
            
            return `
                <div class="eco-challenge-item">
                    <div class="eco-challenge-info">
                        <h5>${challenge.name}</h5>
                        <p>${challenge.description}</p>
                        <div class="eco-challenge-progress">
                            <div class="eco-progress-bar">
                                <div class="eco-progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="eco-progress-text">${challenge.progress}/${challenge.target}</span>
                        </div>
                    </div>
                    <div class="eco-challenge-reward">
                        <span class="eco-xp-reward">+${challenge.xp} XP</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    async loadLeaderboard() {
        try {
            const response = await fetch(`${this.options.apiEndpoint}/leaderboard`);
            if (response.ok) {
                const data = await response.json();
                this.renderLeaderboard(data);
            }
        } catch (error) {
            console.error('Error cargando leaderboard:', error);
        }
    }
    
    renderLeaderboard(leaderboard) {
        const container = document.querySelector('[data-leaderboard-list]');
        if (!container) return;
        
        container.innerHTML = leaderboard.map((user, index) => `
            <div class="eco-leaderboard-item ${user.id === this.userData.id ? 'current-user' : ''}">
                <div class="eco-rank ${index < 3 ? 'top-' + (index + 1) : ''}">${index + 1}</div>
                <div class="eco-user-info">
                    <div class="eco-user-avatar">${user.name.charAt(0)}</div>
                    <span class="eco-user-name">${user.name}</span>
                </div>
                <div class="eco-user-xp">${user.xp} XP</div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // Eventos de gamificación
        document.addEventListener('ecommerce:purchase', (e) => this.handlePurchase(e));
        document.addEventListener('ecommerce:review', (e) => this.handleReview(e));
        document.addEventListener('ecommerce:login', () => this.handleLogin());
        document.addEventListener('ecommerce:share', (e) => this.handleShare(e));
    }
    
    handlePurchase(event) {
        const amount = event.detail.amount || 0;
        const isEco = event.detail.isEco || false;
        
        // XP por compra
        const xpGain = Math.floor(amount * 2);
        this.addXP(xpGain);
        
        // EcoPoints por compra ecológica
        if (isEco) {
            this.addEcoPoints(Math.floor(amount));
        }
        
        // Verificar insignias
        this.checkBadges({ purchases: 1, eco_purchases: isEco ? 1 : 0 });
        
        // Verificar logros
        this.checkAchievements({ purchase_amount: amount });
        
        // Actualizar retos
        this.updateChallenges('daily_purchase', 1);
    }
    
    handleReview(event) {
        // XP por review
        this.addXP(25);
        
        // Verificar insignias
        this.checkBadges({ reviews: 1 });
        
        // Actualizar retos
        this.updateChallenges('daily_review', 1);
    }
    
    handleLogin() {
        this.checkStreak();
    }
    
    handleShare(event) {
        // XP por compartir
        this.addXP(10);
        
        // Verificar insignias
        this.checkBadges({ profile_shares: 1 });
    }
    
    addXP(amount) {
        this.userData.xp += amount;
        this.userData.totalXP += amount;
        
        // Verificar si subió de nivel
        this.checkLevelUp();
        
        this.saveUserData();
        this.updateUI();
    }
    
    addEcoPoints(amount) {
        this.userData.ecoPoints += amount;
        this.saveUserData();
        this.updateUI();
    }
    
    checkLevelUp() {
        const currentLevel = this.userData.level;
        const levelData = this.levels[currentLevel - 1];
        
        if (this.userData.xp >= levelData.xpRequired && currentLevel < this.options.maxLevel) {
            // Subir de nivel
            this.userData.level++;
            this.userData.xp -= levelData.xpRequired;
            
            // Notificar subida de nivel
            this.showLevelUpNotification();
            
            // XP bonus por subir de nivel
            this.addXP(Math.floor(levelData.xpRequired * 0.1));
        }
    }
    
    showLevelUpNotification() {
        const levelData = this.levels[this.userData.level - 1];
        
        const notification = document.createElement('div');
        notification.className = 'eco-level-up-notification';
        notification.innerHTML = `
            <div class="eco-notification-content">
                <span class="eco-level-icon">${levelData.icon}</span>
                <div class="eco-level-text">
                    <h3>¡Nivel Subido!</h3>
                    <p>Ahora eres ${levelData.name}</p>
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
    
    checkBadges(conditions) {
        this.badges.forEach(badge => {
            if (this.userData.badges.includes(badge.id)) return;
            
            if (this.evaluateCondition(badge.condition, conditions)) {
                this.userData.badges.push(badge.id);
                this.showBadgeNotification(badge);
                this.addXP(50); // XP por insignia
            }
        });
        
        this.saveUserData();
    }
    
    evaluateCondition(condition, conditions) {
        // Simplificación: evaluar condiciones básicas
        const parts = condition.split(' ');
        const key = parts[0];
        const operator = parts[1];
        const value = parseInt(parts[2]);
        
        if (conditions[key] !== undefined) {
            switch (operator) {
                case '>=': return conditions[key] >= value;
                case '>': return conditions[key] > value;
                case '<=': return conditions[key] <= value;
                case '<': return conditions[key] < value;
                case '==': return conditions[key] == value;
                default: return false;
            }
        }
        
        return false;
    }
    
    checkAchievements(conditions) {
        this.achievements.forEach(achievement => {
            if (this.userData.achievements.includes(achievement.id)) return;
            
            if (this.evaluateCondition(achievement.condition, conditions)) {
                this.userData.achievements.push(achievement.id);
                this.addXP(achievement.xp);
                this.showAchievementNotification(achievement);
            }
        });
        
        this.saveUserData();
    }
    
    showBadgeNotification(badge) {
        const notification = document.createElement('div');
        notification.className = 'eco-badge-notification';
        notification.innerHTML = `
            <div class="eco-notification-content">
                <span class="eco-badge-icon">${badge.icon}</span>
                <div class="eco-badge-text">
                    <h3>¡Insignia Desbloqueada!</h3>
                    <p>${badge.name}</p>
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
    
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'eco-achievement-notification';
        notification.innerHTML = `
            <div class="eco-notification-content">
                <span class="eco-achievement-icon">${achievement.icon}</span>
                <div class="eco-achievement-text">
                    <h3>¡Logro Completado!</h3>
                    <p>${achievement.name} (+${achievement.xp} XP)</p>
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
    
    checkStreak() {
        const today = new Date().toDateString();
        const lastActive = this.userData.lastActive;
        
        if (lastActive) {
            const lastDate = new Date(lastActive);
            const daysDiff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                // Streak continuo
                this.userData.streak++;
            } else if (daysDiff > 1) {
                // Streak roto
                this.userData.streak = 1;
            }
        } else {
            this.userData.streak = 1;
        }
        
        this.userData.lastActive = today;
        this.saveUserData();
        this.updateUI();
    }
    
    generateDailyChallenges() {
        // Generar retos diarios si no existen
        if (this.userData.challenges.length === 0) {
            this.userData.challenges = this.challenges.filter(c => c.type === 'daily').map(c => ({
                ...c,
                progress: 0,
                completed: false
            }));
            this.saveUserData();
        }
    }
    
    updateChallenges(challengeId, increment) {
        const challenge = this.userData.challenges.find(c => c.id === challengeId);
        if (challenge && !challenge.completed) {
            challenge.progress = Math.min(challenge.progress + increment, challenge.target);
            
            if (challenge.progress >= challenge.target) {
                challenge.completed = true;
                this.addXP(challenge.xp);
                this.showChallengeCompleted(challenge);
            }
            
            this.saveUserData();
            this.updateUI();
        }
    }
    
    showChallengeCompleted(challenge) {
        const notification = document.createElement('div');
        notification.className = 'eco-challenge-notification';
        notification.innerHTML = `
            <div class="eco-notification-content">
                <span class="eco-challenge-icon">🎯</span>
                <div class="eco-challenge-text">
                    <h3>¡Reto Completado!</h3>
                    <p>${challenge.name} (+${challenge.xp} XP)</p>
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
    
    getXPProgress() {
        const levelData = this.levels[this.userData.level - 1];
        return (this.userData.xp / levelData.xpRequired) * 100;
    }
    
    updateUI() {
        // Actualizar barra de XP
        const xpFill = document.querySelector('.eco-xp-fill');
        if (xpFill) {
            xpFill.style.width = `${this.getXPProgress()}%`;
        }
        
        // Actualizar texto de XP
        const xpText = document.querySelector('.eco-xp-text');
        if (xpText) {
            xpText.textContent = `${this.userData.xp} / ${this.levels[this.userData.level - 1].xpRequired} XP`;
        }
        
        // Actualizar streak
        const streakBadge = document.querySelector('.eco-streak-badge span');
        if (streakBadge) {
            streakBadge.textContent = `${this.userData.streak} días`;
        }
        
        // Actualizar EcoPoints
        const pointsValue = document.querySelector('.eco-points-value');
        if (pointsValue) {
            pointsValue.textContent = this.userData.ecoPoints;
        }
    }
    
    loadUserData() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.userData = { ...this.userData, ...JSON.parse(saved) };
            }
        } catch {
            // Usar datos por defecto
        }
    }
    
    saveUserData() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.userData));
        } catch (error) {
            console.error('Error guardando datos de gamificación:', error);
        }
    }
    
    getCurrentLevel() {
        return this.userData.level;
    }
    
    getTotalXP() {
        return this.userData.totalXP;
    }
    
    getEcoPoints() {
        return this.userData.ecoPoints;
    }
    
    getBadges() {
        return this.userData.badges;
    }
    
    destroy() {
        // Limpiar event listeners
        document.removeEventListener('ecommerce:purchase', (e) => this.handlePurchase(e));
        document.removeEventListener('ecommerce:review', (e) => this.handleReview(e));
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const gamificationContainer = document.querySelector('[data-eco-gamification]');
    if (gamificationContainer && gamificationContainer.dataset.ecoGamification !== 'false') {
        window.ecoGamification = new EcoGamificationAdvanced({
            ...gamificationContainer.dataset
        });
    }
});