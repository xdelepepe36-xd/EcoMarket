/**
 * eco-referral-system.js - Sistema de referidos
 * 
 * Funcionalidades:
 - Sistema de referidos
 - Ganancias por invitar amigos
 - Bonificaciones por referidos
 - Código de referido único
 - Seguimiento de referidos
 - Retiro de ganancias
 */

class EcoReferralSystem {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/referral',
            storageKey: options.storageKey || 'ecomarket_referral',
            referralBonus: options.referralBonus || 10, // S/.10 por referido
            refereeBonus: options.refereeBonus || 5, // S/.5 para el referido
            enableWithdrawals: options.enableWithdrawals !== false,
            ...options
        };
        
        this.referralData = {
            code: this.generateReferralCode(),
            referrals: [],
            earnings: 0,
            withdrawn: 0,
            available: 0
        };
        
        this.init();
    }
    
    init() {
        this.loadReferralData();
        this.createReferralUI();
        this.setupEventListeners();
    }
    
    createReferralUI() {
        const container = document.querySelector('[data-eco-referral]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-referral-system">
                <div class="eco-referral-header">
                    <h3>Sistema de Referidos</h3>
                    <p>Gana invitando amigos</p>
                </div>
                
                <div class="eco-referral-code">
                    <h4>Tu Código de Referido</h4>
                    <div class="eco-code-display">
                        <span class="eco-code-text" data-referral-code>${this.referralData.code}</span>
                        <button class="eco-copy-btn" data-copy-code>
                            <i class="bi bi-clipboard"></i>
                            Copiar
                        </button>
                    </div>
                    <div class="eco-share-buttons">
                        <button class="eco-share-btn" data-share-whatsapp>
                            <i class="bi bi-whatsapp"></i>
                            WhatsApp
                        </button>
                        <button class="eco-share-btn" data-share-facebook>
                            <i class="bi bi-facebook"></i>
                            Facebook
                        </button>
                        <button class="eco-share-btn" data-share-twitter>
                            <i class="bi bi-twitter"></i>
                            Twitter
                        </button>
                    </div>
                </div>
                
                <div class="eco-referral-stats">
                    <div class="eco-stat-card">
                        <div class="eco-stat-icon">
                            <i class="bi bi-people"></i>
                        </div>
                        <div class="eco-stat-value" data-referrals-count>${this.referralData.referrals.length}</div>
                        <div class="eco-stat-label">Referidos</div>
                    </div>
                    
                    <div class="eco-stat-card">
                        <div class="eco-stat-icon">
                            <i class="bi bi-currency-dollar"></i>
                        </div>
                        <div class="eco-stat-value" data-earnings>S/.${this.referralData.earnings.toFixed(2)}</div>
                        <div class="eco-stat-label">Ganancias Totales</div>
                    </div>
                    
                    <div class="eco-stat-card">
                        <div class="eco-stat-icon">
                            <i class="bi bi-wallet"></i>
                        </div>
                        <div class="eco-stat-value" data-available>S/.${this.referralData.available.toFixed(2)}</div>
                        <div class="eco-stat-label">Disponible</div>
                    </div>
                    
                    <div class="eco-stat-card">
                        <div class="eco-stat-icon">
                            <i class="bi bi-check-circle"></i>
                        </div>
                        <div class="eco-stat-value" data-withdrawn>S/.${this.referralData.withdrawn.toFixed(2)}</div>
                        <div class="eco-stat-label">Retirado</div>
                    </div>
                </div>
                
                <div class="eco-referral-info">
                    <h4>¿Cómo funciona?</h4>
                    <div class="eco-steps">
                        <div class="eco-step">
                            <div class="eco-step-number">1</div>
                            <div class="eco-step-content">
                                <h5>Comparte tu código</h5>
                                <p>Envía tu código a amigos y familiares</p>
                            </div>
                        </div>
                        <div class="eco-step">
                            <div class="eco-step-number">2</div>
                            <div class="eco-step-content">
                                <h5>Ellos se registran</h5>
                                <p>Tus amigos usan el código al registrarse</p>
                            </div>
                        </div>
                        <div class="eco-step">
                            <div class="eco-step-number">3</div>
                            <div class="eco-step-content">
                                <h5>¡Ambos ganan!</h5>
                                <p>Tú ganas S/.${this.options.referralBonus} y ellos S/.${this.options.refereeBonus}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="eco-referral-history">
                    <h4>Historial de Referidos</h4>
                    <div class="eco-referrals-list" data-referrals-list>
                        ${this.renderReferrals()}
                    </div>
                </div>
                
                ${this.options.enableWithdrawals ? `
                    <div class="eco-withdrawal-section">
                        <h4>Retirar Ganancias</h4>
                        <div class="eco-withdrawal-form">
                            <input type="number" data-withdraw-amount placeholder="Monto a retirar" min="10">
                            <select data-withdraw-method>
                                <option value="wallet">Wallet Digital</option>
                                <option value="bank">Transferencia Bancaria</option>
                                <option value="yape">Yape</option>
                                <option value="plin">Plin</option>
                            </select>
                            <button class="eco-btn-eco" data-withdraw>
                                Retirar
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderReferrals() {
        if (this.referralData.referrals.length === 0) {
            return '<p class="eco-no-referrals">Sin referidos aún</p>';
        }
        
        return this.referralData.referrals.map(ref => `
            <div class="eco-referral-item">
                <div class="eco-referral-info">
                    <span class="eco-referral-name">${ref.name}</span>
                    <span class="eco-referral-date">${this.formatDate(ref.date)}</span>
                </div>
                <div class="eco-referral-status">
                    <span class="eco-status-badge ${ref.status === 'completed' ? 'success' : 'pending'}">
                        ${ref.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </span>
                    <span class="eco-referral-earning">+S/.${ref.earning.toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        document.querySelector('[data-copy-code]')?.addEventListener('click', () => {
            this.copyCode();
        });
        
        document.querySelector('[data-share-whatsapp]')?.addEventListener('click', () => {
            this.shareOnWhatsApp();
        });
        
        document.querySelector('[data-share-facebook]')?.addEventListener('click', () => {
            this.shareOnFacebook();
        });
        
        document.querySelector('[data-share-twitter]')?.addEventListener('click', () => {
            this.shareOnTwitter();
        });
        
        document.querySelector('[data-withdraw]')?.addEventListener('click', () => {
            this.withdraw();
        });
    }
    
    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    copyCode() {
        const code = this.referralData.code;
        navigator.clipboard.writeText(code).then(() => {
            alert('Código copiado al portapapeles');
        });
    }
    
    shareOnWhatsApp() {
        const message = `¡Únete a EcoMarket con mi código de referido: ${this.referralData.code} y obtén S/.${this.options.refereeBonus} de descuento!`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }
    
    shareOnFacebook() {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`Únete a EcoMarket con mi código: ${this.referralData.code}`)}`;
        window.open(url, '_blank');
    }
    
    shareOnTwitter() {
        const message = `Únete a EcoMarket con mi código de referido: ${this.referralData.code} 🌱`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
    }
    
    addReferral(name, status = 'completed') {
        const newReferral = {
            id: Date.now(),
            name: name,
            date: new Date().toISOString(),
            status: status,
            earning: this.options.referralBonus
        };
        
        this.referralData.referrals.unshift(newReferral);
        this.referralData.earnings += this.options.referralBonus;
        this.referralData.available += this.options.referralBonus;
        
        this.saveReferralData();
        this.updateUI();
    }
    
    withdraw() {
        const amount = parseFloat(document.querySelector('[data-withdraw-amount]')?.value);
        const method = document.querySelector('[data-withdraw-method]')?.value;
        
        if (!amount || amount < 10) {
            alert('El monto mínimo de retiro es S/.10');
            return;
        }
        
        if (amount > this.referralData.available) {
            alert('Saldo insuficiente');
            return;
        }
        
        this.referralData.available -= amount;
        this.referralData.withdrawn += amount;
        
        this.saveReferralData();
        this.updateUI();
        
        alert(`Retiro de S/.${amount.toFixed(2)} a ${method} procesado exitosamente`);
    }
    
    updateUI() {
        const referralsCount = document.querySelector('[data-referrals-count]');
        const earningsEl = document.querySelector('[data-earnings]');
        const availableEl = document.querySelector('[data-available]');
        const withdrawnEl = document.querySelector('[data-withdrawn]');
        const referralsList = document.querySelector('[data-referrals-list]');
        
        if (referralsCount) {
            referralsCount.textContent = this.referralData.referrals.length;
        }
        
        if (earningsEl) {
            earningsEl.textContent = `S/.${this.referralData.earnings.toFixed(2)}`;
        }
        
        if (availableEl) {
            availableEl.textContent = `S/.${this.referralData.available.toFixed(2)}`;
        }
        
        if (withdrawnEl) {
            withdrawnEl.textContent = `S/.${this.referralData.withdrawn.toFixed(2)}`;
        }
        
        if (referralsList) {
            referralsList.innerHTML = this.renderReferrals();
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
    
    loadReferralData() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                this.referralData = JSON.parse(saved);
            }
        } catch {
            // Usar datos por defecto
        }
    }
    
    saveReferralData() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.referralData));
        } catch (error) {
            console.error('Error guardando datos de referidos:', error);
        }
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const referralContainer = document.querySelector('[data-eco-referral]');
    if (referralContainer && referralContainer.dataset.ecoReferral !== 'false') {
        window.ecoReferralSystem = new EcoReferralSystem({
            ...referralContainer.dataset
        });
    }
});