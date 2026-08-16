/**
 * eco-returns-system.js - Sistema de devoluciones
 * 
 * Funcionalidades:
 - Solicitudes de devolucion
 - Reembolsos
 - Gestion de tickets
 - Estados de devolucion
 - Politica de devolucion
 - Historial de devoluciones
 */

class EcoReturnsSystem {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/returns',
            storageKey: options.storageKey || 'ecomarket_returns',
            returnPeriod: options.returnPeriod || 30, // 30 días
            enableRefunds: options.enableRefunds !== false,
            ...options
        };
        
        this.returns = [];
        this.refunds = [];
        
        this.init();
    }
    
    init() {
        this.loadReturns();
        this.createReturnsUI();
        this.setupEventListeners();
    }
    
    createReturnsUI() {
        const container = document.querySelector('[data-eco-returns]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-returns-system">
                <div class="eco-returns-header">
                    <h3>Sistema de Devoluciones</h3>
                    <p>Periodo de devolución: ${this.options.returnPeriod} días</p>
                </div>
                
                <div class="eco-returns-actions">
                    <button class="eco-btn-eco" data-request-return>
                        <i class="bi bi-arrow-counterclockwise"></i>
                        Solicitar Devolución
                    </button>
                    <button class="eco-btn-secondary" data-view-policy>
                        <i class="bi bi-file-text"></i>
                        Ver Política
                    </button>
                </div>
                
                <div class="eco-returns-form" data-returns-form style="display: none;">
                    <h4>Nueva Solicitud de Devolución</h4>
                    <div class="eco-form-group">
                        <label>Orden ID:</label>
                        <input type="text" data-return-order placeholder="ORD-12345" required>
                    </div>
                    <div class="eco-form-group">
                        <label>Producto:</label>
                        <select data-return-product required>
                            <option value="">Seleccionar producto</option>
                            <option value="1">Botella Térmica</option>
                            <option value="2">Kit Compostaje</option>
                            <option value="3">Jabón Natural</option>
                        </select>
                    </div>
                    <div class="eco-form-group">
                        <label>Motivo:</label>
                        <select data-return-reason required>
                            <option value="">Seleccionar motivo</option>
                            <option value="defecto">Producto defectuoso</option>
                            <option value="no-matches">No coincide con descripción</option>
                            <option value="wrong-item">Producto equivocado</option>
                            <option value="not-needed">Ya no lo necesito</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>
                    <div class="eco-form-group">
                        <label>Descripción:</label>
                        <textarea data-return-description placeholder="Describe el problema..." rows="3"></textarea>
                    </div>
                    <div class="eco-form-group">
                        <label>Evidencia (fotos):</label>
                        <input type="file" data-return-evidence accept="image/*" multiple>
                    </div>
                    <div class="eco-form-group">
                        <label>Tipo de devolución:</label>
                        <select data-return-type required>
                            <option value="refund">Reembolso</option>
                            <option value="exchange">Cambio por otro producto</option>
                            <option value="store-credit">Crédito en tienda</option>
                        </select>
                    </div>
                    <div class="eco-form-actions">
                        <button class="eco-btn-eco" data-submit-return>
                            Enviar Solicitud
                        </button>
                        <button class="eco-btn-secondary" data-cancel-return>
                            Cancelar
                        </button>
                    </div>
                </div>
                
                <div class="eco-returns-history">
                    <h4>Historial de Devoluciones</h4>
                    <div class="eco-returns-list" data-returns-list>
                        ${this.renderReturns()}
                    </div>
                </div>
                
                <div class="eco-refunds-history">
                    <h4>Historial de Reembolsos</h4>
                    <div class="eco-refunds-list" data-refunds-list>
                        ${this.renderRefunds()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderReturns() {
        if (this.returns.length === 0) {
            return '<p class="eco-no-returns">Sin devoluciones</p>';
        }
        
        return this.returns.map(ret => `
            <div class="eco-return-item">
                <div class="eco-return-info">
                    <span class="eco-return-id">#${ret.id}</span>
                    <span class="eco-return-product">${ret.product}</span>
                    <span class="eco-return-date">${this.formatDate(ret.date)}</span>
                </div>
                <div class="eco-return-status">
                    <span class="eco-status-badge ${this.getStatusClass(ret.status)}">
                        ${this.getStatusText(ret.status)}
                    </span>
                    <span class="eco-return-type">${this.getTypeText(ret.type)}</span>
                </div>
            </div>
        `).join('');
    }
    
    renderRefunds() {
        if (this.refunds.length === 0) {
            return '<p class="eco-no-refunds">Sin reembolsos</p>';
        }
        
        return this.refunds.map(ref => `
            <div class="eco-refund-item">
                <div class="eco-refund-info">
                    <span class="eco-refund-id">#${ref.id}</span>
                    <span class="eco-refund-amount">S/.${ref.amount.toFixed(2)}</span>
                    <span class="eco-refund-date">${this.formatDate(ref.date)}</span>
                </div>
                <div class="eco-refund-status">
                    <span class="eco-status-badge ${ref.status === 'completed' ? 'success' : 'pending'}">
                        ${ref.status === 'completed' ? 'Completado' : 'Pendiente'}
                    </span>
                    <span class="eco-refund-method">${ref.method}</span>
                </div>
            </div>
        `).join('');
    }
    
    getStatusClass(status) {
        switch (status) {
            case 'pending': return 'pending';
            case 'approved': return 'approved';
            case 'rejected': return 'rejected';
            case 'completed': return 'completed';
            default: return 'pending';
        }
    }
    
    getStatusText(status) {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'approved': return 'Aprobado';
            case 'rejected': return 'Rechazado';
            case 'completed': return 'Completado';
            default: return 'Pendiente';
        }
    }
    
    getTypeText(type) {
        switch (type) {
            case 'refund': return 'Reembolso';
            case 'exchange': return 'Cambio';
            case 'store-credit': return 'Crédito';
            default: return 'Reembolso';
        }
    }
    
    setupEventListeners() {
        document.querySelector('[data-request-return]')?.addEventListener('click', () => {
            this.showReturnForm();
        });
        
        document.querySelector('[data-view-policy]')?.addEventListener('click', () => {
            this.showPolicy();
        });
        
        document.querySelector('[data-submit-return]')?.addEventListener('click', () => {
            this.submitReturn();
        });
        
        document.querySelector('[data-cancel-return]')?.addEventListener('click', () => {
            this.hideReturnForm();
        });
    }
    
    showReturnForm() {
        const form = document.querySelector('[data-returns-form]');
        if (form) {
            form.style.display = 'block';
        }
    }
    
    hideReturnForm() {
        const form = document.querySelector('[data-returns-form]');
        if (form) {
            form.style.display = 'none';
        }
    }
    
    showPolicy() {
        alert(`
POLÍTICA DE DEVOLUCIONES:
- Periodo de devolución: ${this.options.returnPeriod} días
- El producto debe estar en su estado original
- Incluir empaque y accesorios
- Reembolso en 3-5 días hábiles
- Cambios disponibles por otros productos
- Crédito en tienda disponible inmediatamente
        `);
    }
    
    submitReturn() {
        const orderId = document.querySelector('[data-return-order]')?.value;
        const product = document.querySelector('[data-return-product]')?.value;
        const reason = document.querySelector('[data-return-reason]')?.value;
        const description = document.querySelector('[data-return-description]')?.value;
        const type = document.querySelector('[data-return-type]')?.value;
        
        if (!orderId || !product || !reason || !type) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }
        
        const newReturn = {
            id: Date.now(),
            orderId: orderId,
            product: document.querySelector('[data-return-product] option:checked')?.text,
            reason: reason,
            description: description,
            type: type,
            status: 'pending',
            date: new Date().toISOString()
        };
        
        this.returns.unshift(newReturn);
        this.saveReturns();
        this.updateUI();
        this.hideReturnForm();
        
        alert('Solicitud de devolución enviada. Te notificaremos cuando sea procesada.');
    }
    
    processRefund(returnId, amount, method) {
        const refund = {
            id: Date.now(),
            returnId: returnId,
            amount: amount,
            method: method,
            status: 'pending',
            date: new Date().toISOString()
        };
        
        this.refunds.unshift(refund);
        this.saveReturns();
        this.updateUI();
    }
    
    updateUI() {
        const returnsList = document.querySelector('[data-returns-list]');
        if (returnsList) {
            returnsList.innerHTML = this.renderReturns();
        }
        
        const refundsList = document.querySelector('[data-refunds-list]');
        if (refundsList) {
            refundsList.innerHTML = this.renderRefunds();
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
    
    loadReturns() {
        try {
            const saved = localStorage.getItem(this.options.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.returns = data.returns || [];
                this.refunds = data.refunds || [];
            }
        } catch {
            // Usar devoluciones por defecto
        }
    }
    
    saveReturns() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify({
                returns: this.returns,
                refunds: this.refunds
            }));
        } catch (error) {
            console.error('Error guardando devoluciones:', error);
        }
    }
    
    destroy() {
        // Limpiar event listeners
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const returnsContainer = document.querySelector('[data-eco-returns]');
    if (returnsContainer && returnsContainer.dataset.ecoReturns !== 'false') {
        window.ecoReturnsSystem = new EcoReturnsSystem({
            ...returnsContainer.dataset
        });
    }
});