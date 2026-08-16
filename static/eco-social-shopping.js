/**
 * eco-social-shopping.js - Sistema de compras sociales
 * 
 * Funcionalidades:
 - Compartir listas de deseos
 - Votos colaborativos
 - Compras grupales
 - Comunidad activa
 - Perfiles sociales
 - Seguir usuarios
 - Actividad social
 - Notificaciones sociales
 */

class EcoSocialShopping {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/social',
            storageKey: options.storageKey || 'ecomarket_social',
            enableFollow: options.enableFollow !== false,
            enableGroups: options.enableGroups !== false,
            ...options
        };
        
        this.userProfile = {
            followers: [],
            following: [],
            sharedLists: [],
            groupPurchases: [],
            activity: []
        };
        
        this.init();
    }
    
    init() {
        this.loadUserProfile();
        this.createSocialUI();
        this.setupEventListeners();
    }
    
    createSocialUI() {
        const container = document.querySelector('[data-eco-social]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-social-shopping">
                <div class="eco-social-header">
                    <h3>Compras Sociales</h3>
                    <p>Comparte, vota y compra con amigos</p>
                </div>
                
                <div class="eco-social-tabs">
                    <button class="eco-tab-btn active" data-social-tab="lists">Listas Compartidas</button>
                    <button class="eco-tab-btn" data-social-tab="groups">Compras Grupales</button>
                    <button class="eco-tab-btn" data-social-tab="activity">Actividad</button>
                </div>
                
                <div class="eco-social-content">
                    <div class="eco-social-tab active" data-social-content="lists">
                        <div class="eco-social-actions">
                            <button class="eco-btn-eco" data-create-list>
                                <i class="bi bi-plus"></i>
                                Crear Lista
                            </button>
                        </div>
                        <div class="eco-shared-lists" data-shared-lists>
                            ${this.renderSharedLists()}
                        </div>
                    </div>
                    
                    <div class="eco-social-tab" data-social-content="groups">
                        <div class="eco-social-actions">
                            <button class="eco-btn-eco" data-create-group>
                                <i class="bi bi-plus"></i>
                                Crear Grupo
                            </button>
                        </div>
                        <div class="eco-group-purchases" data-group-purchases>
                            ${this.renderGroupPurchases()}
                        </div>
                    </div>
                    
                    <div class="eco-social-tab" data-social-content="activity">
                        <div class="eco-social-activity" data-social-activity>
                            ${this.renderActivity()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSharedLists() {
        const lists = [
            { id: 1, name: 'Regalos Navideños', author: 'María', items: 8, votes: 12 },
            { id: 2, name: 'Camping Eco', author: 'Juan', items: 5, votes: 8 },
            { id: 3, name: 'Decoración Hogar', author: 'Ana', items: 10, votes: 15 }
        ];
        
        return lists.map(list => `
            <div class="eco-shared-list-card">
                <div class="eco-list-header">
                    <h4>${list.name}</h4>
                    <span class="eco-list-author">por ${list.author}</span>
                </div>
                <div class="eco-list-stats">
                    <span><i class="bi bi-list-check"></i> ${list.items} items</span>
                    <span><i class="bi bi-heart"></i> ${list.votes} votos</span>
                </div>
                <div class="eco-list-actions">
                    <button class="eco-btn-secondary" data-vote-list="${list.id}">
                        <i class="bi bi-heart"></i> Votar
                    </button>
                    <button class="eco-btn-secondary" data-view-list="${list.id}">
                        <i class="bi bi-eye"></i> Ver
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderGroupPurchases() {
        const groups = [
            { id: 1, name: 'Compra Orgánica Semanal', members: 5, progress: 80, deadline: '2 días' },
            { id: 2, name: 'Kit Camping Equipo', members: 3, progress: 60, deadline: '5 días' }
        ];
        
        return groups.map(group => `
            <div class="eco-group-purchase-card">
                <div class="eco-group-header">
                    <h4>${group.name}</h4>
                    <span class="eco-group-members">${group.members} miembros</span>
                </div>
                <div class="eco-group-progress">
                    <div class="eco-progress-bar">
                        <div class="eco-progress-fill" style="width: ${group.progress}%"></div>
                    </div>
                    <span class="eco-progress-text">${group.progress}% completado</span>
                </div>
                <div class="eco-group-deadline">
                    <i class="bi bi-clock"></i>
                    ${group.deadline}
                </div>
                <button class="eco-btn-eco" data-join-group="${group.id}">
                    Unirse
                </button>
            </div>
        `).join('');
    }
    
    renderActivity() {
        const activities = [
            { user: 'María', action: 'votó en', target: 'Regalos Navideños', time: 'hace 5 min' },
            { user: 'Juan', action: 'compartió', target: 'Camping Eco', time: 'hace 15 min' },
            { user: 'Ana', action: 'se unió a', target: 'Compra Orgánica', time: 'hace 30 min' }
        ];
        
        return activities.map(activity => `
            <div class="eco-activity-item">
                <div class="eco-activity-avatar">${activity.user.charAt(0)}</div>
                <div class="eco-activity-content">
                    <p><strong>${activity.user}</strong> ${activity.action} <strong>${activity.target}</strong></p>
                    <span class="eco-activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // Tabs
        document.querySelectorAll('[data-social-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.socialTab;
                this.switchTab(tab);
            });
        });
        
        // Votar lista
        document.querySelectorAll('[data-vote-list]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const listId = e.target.dataset.voteList;
                this.voteList(listId);
            });
        });
        
        // Unirse a grupo
        document.querySelectorAll('[data-join-group]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const groupId = e.target.dataset.joinGroup;
                this.joinGroup(groupId);
            });
        });
    }
    
    switchTab(tab) {
        document.querySelectorAll('[data-social-tab]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.socialTab === tab);
        });
        
        document.querySelectorAll('[data-social-content]').forEach(content => {
            content.classList.toggle('active', content.dataset.socialContent === tab);
        });
    }
    
    voteList(listId) {
        alert(`Votaste por la lista #${listId}`);
        // Emitir evento de voto
        document.dispatchEvent(new CustomEvent('social:vote', {
            detail: { listId }
        }));
    }
    
    joinGroup(groupId) {
        alert(`Te uniste al grupo #${groupId}`);
        // Emitir evento de unión
        document.dispatchEvent(new CustomEvent('social:join', {
            detail: { groupId }
        }));
    }
    
    loadUserProfile() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.userProfile = JSON.parse(saved);
            }
        } catch {
            // Usar perfil por defecto
        }
    }
    
    saveUserProfile() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.userProfile));
        } catch (error) {
            console.error('Error guardando perfil social:', error);
        }
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const socialContainer = document.querySelector('[data-eco-social]');
    if (socialContainer && socialContainer.dataset.ecoSocial !== 'false') {
        window.ecoSocialShopping = new EcoSocialShopping({
            ...socialContainer.dataset
        });
    }
});