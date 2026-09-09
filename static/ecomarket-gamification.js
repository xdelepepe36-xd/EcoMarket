// Sistema de Gamificación Avanzada - EcoMarket
(function() {
    'use strict';

    const GamificationSystem = {
        // Configuración de niveles
        levels: {
            1: { name: 'Semilla 🌱', xp: 0, ecoPoints: 0 },
            2: { name: 'Brote 🌿', xp: 100, ecoPoints: 50 },
            3: { name: 'Planta 🪴', xp: 300, ecoPoints: 150 },
            4: { name: 'Árbol Joven 🌳', xp: 600, ecoPoints: 300 },
            5: { name: 'Bosque 🌲', xp: 1000, ecoPoints: 500 },
            6: { name: 'Ecosistema 🌍', xp: 2000, ecoPoints: 1000 },
            7: { name: 'Guardián 🛡️', xp: 3500, ecoPoints: 1750 },
            8: { name: 'Maestro 🏆', xp: 5000, ecoPoints: 2500 },
            9: { name: 'Leyenda 👑', xp: 10000, ecoPoints: 5000 },
            10: { name: 'Héroe Ecológico 🌟', xp: 20000, ecoPoints: 10000 }
        },

        // Logros desbloqueables
        achievements: {
            first_purchase: {
                id: 'first_purchase',
                name: 'Primera Compra',
                description: 'Realiza tu primera compra',
                icon: '🛒',
                xp: 50,
                ecoPoints: 25,
                condition: (user) => user.totalPurchases >= 1
            },
            first_sale: {
                id: 'first_sale',
                name: 'Primera Venta',
                description: 'Vende tu primer producto',
                icon: '💰',
                xp: 100,
                ecoPoints: 50,
                condition: (user) => user.totalSales >= 1
            },
            eco_warrior: {
                id: 'eco_warrior',
                name: 'Guerrero Ecológico',
                description: 'Compra 10 productos eco-friendly',
                icon: '🌱',
                xp: 200,
                ecoPoints: 100,
                condition: (user) => user.ecoPurchases >= 10
            },
            reviewer: {
                id: 'reviewer',
                name: 'Crítico',
                description: 'Escribe 5 reseñas',
                icon: '⭐',
                xp: 150,
                ecoPoints: 75,
                condition: (user) => user.totalReviews >= 5
            },
            social_butterfly: {
                id: 'social_butterfly',
                name: 'Mariposa Social',
                description: 'Comparte 5 productos',
                icon: '🦋',
                xp: 100,
                ecoPoints: 50,
                condition: (user) => user.totalShares >= 5
            },
            collector: {
                id: 'collector',
                name: 'Coleccionista',
                description: 'Guarda 10 productos en favoritos',
                icon: '❤️',
                xp: 75,
                ecoPoints: 37,
                condition: (user) => user.totalFavorites >= 10
            },
            early_bird: {
                id: 'early_bird',
                name: 'Madrugador',
                description: 'Compra antes de las 9am',
                icon: '🐦',
                xp: 50,
                ecoPoints: 25,
                condition: (user) => user.earlyPurchases >= 1
            },
            night_owl: {
                id: 'night_owl',
                name: 'Búho Nocturno',
                description: 'Compra después de las 10pm',
                icon: '🦉',
                xp: 50,
                ecoPoints: 25,
                condition: (user) => user.latePurchases >= 1
            },
            big_spender: {
                id: 'big_spender',
                name: 'Gran Gastador',
                description: 'Gasta más de S/500 en total',
                icon: '💎',
                xp: 300,
                ecoPoints: 150,
                condition: (user) => user.totalSpent >= 500
            },
            trusted_seller: {
                id: 'trusted_seller',
                name: 'Vendedor Confiable',
                description: 'Vende 20 productos con 5 estrellas',
                icon: '🏅',
                xp: 500,
                ecoPoints: 250,
                condition: (user) => user.fiveStarSales >= 20
            }
        },

        // Misiones diarias
        dailyMissions: {
            browse_products: {
                id: 'browse_products',
                name: 'Explorador',
                description: 'Navega por 20 productos',
                icon: '🔍',
                xp: 30,
                ecoPoints: 15,
                target: 20,
                type: 'browse'
            },
            add_to_cart: {
                id: 'add_to_cart',
                name: 'Comprador Potencial',
                description: 'Agrega 5 productos al carrito',
                icon: '🛒',
                xp: 40,
                ecoPoints: 20,
                target: 5,
                type: 'cart'
            },
            share_product: {
                id: 'share_product',
                name: 'Influencer',
                description: 'Comparte 2 productos',
                icon: '📤',
                xp: 35,
                ecoPoints: 17,
                target: 2,
                type: 'share'
            },
            leave_review: {
                id: 'leave_review',
                name: 'Opinador',
                description: 'Deja 1 reseña',
                icon: '✍️',
                xp: 50,
                ecoPoints: 25,
                target: 1,
                type: 'review'
            }
        },

        // Misiones semanales
        weeklyMissions: {
            purchase_products: {
                id: 'purchase_products',
                name: 'Comprador Semanal',
                description: 'Compra 3 productos',
                icon: '🛍️',
                xp: 100,
                ecoPoints: 50,
                target: 3,
                type: 'purchase'
            },
            sell_products: {
                id: 'sell_products',
                name: 'Vendedor Semanal',
                description: 'Vende 2 productos',
                icon: '💼',
                xp: 150,
                ecoPoints: 75,
                target: 2,
                type: 'sale'
            },
            eco_champion: {
                id: 'eco_champion',
                name: 'Campeón Ecológico',
                description: 'Compra 5 productos eco-friendly',
                icon: '🌿',
                xp: 120,
                ecoPoints: 60,
                target: 5,
                type: 'eco_purchase'
            }
        },

        // Estado del usuario
        userState: {
            xp: 0,
            ecoPoints: 0,
            level: 1,
            achievements: [],
            dailyProgress: {},
            weeklyProgress: {},
            stats: {
                totalPurchases: 0,
                totalSales: 0,
                ecoPurchases: 0,
                totalReviews: 0,
                totalShares: 0,
                totalFavorites: 0,
                earlyPurchases: 0,
                latePurchases: 0,
                totalSpent: 0,
                fiveStarSales: 0
            }
        },

        // Inicializar sistema
        init() {
            this.loadUserState();
            this.checkLevelUp();
            this.checkAchievements();
            this.startDailyReset();
            this.startWeeklyReset();
            this.renderGamificationUI();
            console.log('🎮 Sistema de Gamificación inicializado');
        },

        // Cargar estado del usuario
        loadUserState() {
            const saved = localStorage.getItem('ecomarket_gamification');
            if (saved) {
                try {
                    this.userState = JSON.parse(saved);
                } catch (e) {
                    console.error('Error cargando estado de gamificación:', e);
                }
            }
        },

        // Guardar estado del usuario
        saveUserState() {
            localStorage.setItem('ecomarket_gamification', JSON.stringify(this.userState));
        },

        // Añadir XP
        addXP(amount) {
            this.userState.xp += amount;
            this.checkLevelUp();
            this.saveUserState();
            this.showXPNotification(amount);
        },

        // Añadir puntos ecológicos
        addEcoPoints(amount) {
            this.userState.ecoPoints += amount;
            this.saveUserState();
            this.showEcoPointsNotification(amount);
        },

        // Verificar subida de nivel
        checkLevelUp() {
            const currentLevel = this.userState.level;
            let newLevel = currentLevel;

            for (let level = this.levels.length; level >= 1; level--) {
                if (this.userState.xp >= this.levels[level].xp) {
                    newLevel = level;
                    break;
                }
            }

            if (newLevel > currentLevel) {
                this.userState.level = newLevel;
                this.showLevelUpNotification(newLevel);
                this.saveUserState();
            }
        },

        // Verificar logros
        checkAchievements() {
            for (const [key, achievement] of Object.entries(this.achievements)) {
                if (!this.userState.achievements.includes(key)) {
                    if (achievement.condition(this.userState.stats)) {
                        this.unlockAchievement(key);
                    }
                }
            }
        },

        // Desbloquear logro
        unlockAchievement(achievementId) {
            const achievement = this.achievements[achievementId];
            if (!achievement) return;

            this.userState.achievements.push(achievementId);
            this.addXP(achievement.xp);
            this.addEcoPoints(achievement.ecoPoints);
            this.showAchievementNotification(achievement);
            this.saveUserState();
        },

        // Progreso de misión diaria
        updateDailyProgress(missionId, increment = 1) {
            if (!this.userState.dailyProgress[missionId]) {
                this.userState.dailyProgress[missionId] = 0;
            }
            this.userState.dailyProgress[missionId] += increment;
            this.checkDailyMissionCompletion(missionId);
            this.saveUserState();
        },

        // Verificar completación de misión diaria
        checkDailyMissionCompletion(missionId) {
            const mission = this.dailyMissions[missionId];
            if (!mission) return;

            const progress = this.userState.dailyProgress[missionId] || 0;
            if (progress >= mission.target && !this.userState.achievements.includes(`daily_${missionId}`)) {
                this.userState.achievements.push(`daily_${missionId}`);
                this.addXP(mission.xp);
                this.addEcoPoints(mission.ecoPoints);
                this.showMissionCompletionNotification(mission, 'daily');
            }
        },

        // Progreso de misión semanal
        updateWeeklyProgress(missionId, increment = 1) {
            if (!this.userState.weeklyProgress[missionId]) {
                this.userState.weeklyProgress[missionId] = 0;
            }
            this.userState.weeklyProgress[missionId] += increment;
            this.checkWeeklyMissionCompletion(missionId);
            this.saveUserState();
        },

        // Verificar completación de misión semanal
        checkWeeklyMissionCompletion(missionId) {
            const mission = this.weeklyMissions[missionId];
            if (!mission) return;

            const progress = this.userState.weeklyProgress[missionId] || 0;
            if (progress >= mission.target && !this.userState.achievements.includes(`weekly_${missionId}`)) {
                this.userState.achievements.push(`weekly_${missionId}`);
                this.addXP(mission.xp);
                this.addEcoPoints(mission.ecoPoints);
                this.showMissionCompletionNotification(mission, 'weekly');
            }
        },

        // Reset diario
        startDailyReset() {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const msUntilMidnight = tomorrow - now;
            setTimeout(() => {
                this.userState.dailyProgress = {};
                this.saveUserState();
                this.startDailyReset();
            }, msUntilMidnight);
        },

        // Reset semanal
        startWeeklyReset() {
            const now = new Date();
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + (7 - now.getDay()));
            nextWeek.setHours(0, 0, 0, 0);

            const msUntilNextWeek = nextWeek - now;
            setTimeout(() => {
                this.userState.weeklyProgress = {};
                this.saveUserState();
                this.startWeeklyReset();
            }, msUntilNextWeek);
        },

        // Notificaciones
        showXPNotification(amount) {
            this.showNotification(`+${amount} XP`, 'xp');
        },

        showEcoPointsNotification(amount) {
            this.showNotification(`+${amount} Puntos Ecológicos`, 'eco');
        },

        showLevelUpNotification(level) {
            const levelInfo = this.levels[level];
            this.showNotification(`🎉 ¡Nivel ${level} desbloqueado! ${levelInfo.name}`, 'level');
        },

        showAchievementNotification(achievement) {
            this.showNotification(`🏆 Logro desbloqueado: ${achievement.icon} ${achievement.name}`, 'achievement');
        },

        showMissionCompletionNotification(mission, type) {
            const typeName = type === 'daily' ? 'Diaria' : 'Semanal';
            this.showNotification(`✅ Misión ${typeName} completada: ${mission.icon} ${mission.name}`, 'mission');
        },

        showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `gamification-notification gamification-${type}`;
            notification.innerHTML = `
                <div class="gamification-content">
                    <span class="gamification-message">${message}</span>
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
        },

        // Renderizar UI de gamificación
        renderGamificationUI() {
            this.renderLevelDisplay();
            this.renderAchievementsPanel();
            this.renderMissionsPanel();
        },

        renderLevelDisplay() {
            const levelDisplay = document.querySelector('.level-display');
            if (!levelDisplay) return;

            const levelInfo = this.levels[this.userState.level];
            const nextLevelInfo = this.levels[this.userState.level + 1];
            const progress = nextLevelInfo 
                ? ((this.userState.xp - levelInfo.xp) / (nextLevelInfo.xp - levelInfo.xp)) * 100 
                : 100;

            levelDisplay.innerHTML = `
                <div class="level-info">
                    <span class="level-badge">${levelInfo.name}</span>
                    <span class="level-number">Nivel ${this.userState.level}</span>
                </div>
                <div class="xp-bar">
                    <div class="xp-progress" style="width: ${progress}%"></div>
                </div>
                <div class="xp-info">
                    <span>${this.userState.xp} XP</span>
                    <span>${this.userState.ecoPoints} Puntos Ecológicos</span>
                </div>
            `;
        },

        renderAchievementsPanel() {
            const panel = document.querySelector('.achievements-panel');
            if (!panel) return;

            let html = '<h3>🏆 Logros</h3><div class="achievements-grid">';
            
            for (const [key, achievement] of Object.entries(this.achievements)) {
                const unlocked = this.userState.achievements.includes(key);
                html += `
                    <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-info">
                            <div class="achievement-name">${achievement.name}</div>
                            <div class="achievement-description">${achievement.description}</div>
                            <div class="achievement-rewards">
                                <span>+${achievement.xp} XP</span>
                                <span>+${achievement.ecoPoints} Eco</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            html += '</div>';
            panel.innerHTML = html;
        },

        renderMissionsPanel() {
            const panel = document.querySelector('.missions-panel');
            if (!panel) return;

            let html = '<h3>📋 Misiones</h3>';
            
            html += '<div class="missions-section"><h4>🌅 Diarias</h4><div class="missions-grid">';
            for (const [key, mission] of Object.entries(this.dailyMissions)) {
                const progress = this.userState.dailyProgress[key] || 0;
                const completed = this.userState.achievements.includes(`daily_${key}`);
                const progressPercent = Math.min((progress / mission.target) * 100, 100);
                
                html += `
                    <div class="mission-card ${completed ? 'completed' : ''}">
                        <div class="mission-icon">${mission.icon}</div>
                        <div class="mission-info">
                            <div class="mission-name">${mission.name}</div>
                            <div class="mission-description">${mission.description}</div>
                            <div class="mission-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                                </div>
                                <span class="progress-text">${progress}/${mission.target}</span>
                            </div>
                            <div class="mission-rewards">
                                <span>+${mission.xp} XP</span>
                                <span>+${mission.ecoPoints} Eco</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            html += '</div></div>';
            
            html += '<div class="missions-section"><h4>📅 Semanales</h4><div class="missions-grid">';
            for (const [key, mission] of Object.entries(this.weeklyMissions)) {
                const progress = this.userState.weeklyProgress[key] || 0;
                const completed = this.userState.achievements.includes(`weekly_${key}`);
                const progressPercent = Math.min((progress / mission.target) * 100, 100);
                
                html += `
                    <div class="mission-card ${completed ? 'completed' : ''}">
                        <div class="mission-icon">${mission.icon}</div>
                        <div class="mission-info">
                            <div class="mission-name">${mission.name}</div>
                            <div class="mission-description">${mission.description}</div>
                            <div class="mission-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                                </div>
                                <span class="progress-text">${progress}/${mission.target}</span>
                            </div>
                            <div class="mission-rewards">
                                <span>+${mission.xp} XP</span>
                                <span>+${mission.ecoPoints} Eco</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            html += '</div></div>';
            
            panel.innerHTML = html;
        },

        // API pública
        trackAction(actionType, data = {}) {
            switch (actionType) {
                case 'purchase':
                    this.userState.stats.totalPurchases++;
                    if (data.isEco) this.userState.stats.ecoPurchases++;
                    if (data.amount) this.userState.stats.totalSpent += data.amount;
                    const hour = new Date().getHours();
                    if (hour < 9) this.userState.stats.earlyPurchases++;
                    if (hour >= 22) this.userState.stats.latePurchases++;
                    this.updateDailyProgress('browse_products');
                    this.updateWeeklyProgress('purchase_products');
                    break;
                case 'sale':
                    this.userState.stats.totalSales++;
                    if (data.rating === 5) this.userState.stats.fiveStarSales++;
                    this.updateWeeklyProgress('sell_products');
                    break;
                case 'review':
                    this.userState.stats.totalReviews++;
                    this.updateDailyProgress('leave_review');
                    break;
                case 'share':
                    this.userState.stats.totalShares++;
                    this.updateDailyProgress('share_product');
                    break;
                case 'favorite':
                    this.userState.stats.totalFavorites++;
                    break;
                case 'browse':
                    this.updateDailyProgress('browse_products');
                    break;
                case 'cart':
                    this.updateDailyProgress('add_to_cart');
                    break;
            }
            this.checkAchievements();
            this.saveUserState();
        }
    };

    // Exponer al scope global
    window.EcoGamification = GamificationSystem;

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => GamificationSystem.init());
    } else {
        GamificationSystem.init();
    }

})();