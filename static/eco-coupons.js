/**
 * eco-coupons.js - Sistema avanzado de cupones y descuentos
 * 
 * Funcionalidades:
 * - Validación de cupones en tiempo real
 * - Aplicación automática de descuentos
 * - Cálculo de ahorros
 * - Historial de cupones usados
 * - Sugerencias de cupones disponibles
 * - Códigos promocionales dinámicos
 */

class EcoCoupons {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '/api/cupon/validar',
            storageKey: options.storageKey || 'ecomarket_coupons',
            autoApply: options.autoApply !== false,
            showSuggestions: options.showSuggestions !== false,
            ...options
        };
        
        this.currentCoupon = null;
        this.availableCoupons = [];
        this.usedCoupons = this.loadUsedCoupons();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadAvailableCoupons();
        
        if (this.options.showSuggestions) {
            this.showCouponSuggestions();
        }
    }
    
    setupEventListeners() {
        // Buscar campos de cupón en el formulario
        const couponInput = document.querySelector('[data-coupon-input]');
        const couponButton = document.querySelector('[data-coupon-button]');
        const couponRemove = document.querySelector('[data-coupon-remove]');
        
        if (couponInput) {
            couponInput.addEventListener('input', (e) => this.handleCouponInput(e));
            couponInput.addEventListener('blur', (e) => this.validateCouponFormat(e.target.value));
        }
        
        if (couponButton) {
            couponButton.addEventListener('click', () => this.applyCoupon());
        }
        
        if (couponRemove) {
            couponRemove.addEventListener('click', () => this.removeCoupon());
        }
        
        // Escuchar eventos personalizados
        document.addEventListener('ecommerce:cart:updated', () => this.updateCouponValidity());
        document.addEventListener('ecommerce:coupon:applied', (e) => this.handleCouponApplied(e));
        document.addEventListener('ecommerce:coupon:removed', () => this.handleCouponRemoved());
    }
    
    async loadAvailableCoupons() {
        try {
            const response = await fetch('/api/cupones/disponibles');
            if (response.ok) {
                this.availableCoupons = await response.json();
                this.updateCouponSuggestions();
            }
        } catch (error) {
            console.error('Error cargando cupones disponibles:', error);
        }
    }
    
    handleCouponInput(event) {
        const value = event.target.value.toUpperCase();
        event.target.value = value;
        
        // Auto-aplicar si está habilitado y el código parece válido
        if (this.options.autoApply && this.isValidCouponFormat(value)) {
            this.debounceApplyCoupon(value);
        }
    }
    
    debounceApplyCoupon(code) {
        clearTimeout(this.applyTimeout);
        this.applyTimeout = setTimeout(() => {
            this.applyCoupon(code);
        }, 500);
    }
    
    isValidCouponFormat(code) {
        // Formato típico: letras y números, 6-20 caracteres
        return /^[A-Z0-9]{6,20}$/.test(code);
    }
    
    async validateCouponFormat(code) {
        if (!code) return;
        
        const input = document.querySelector('[data-coupon-input]');
        const message = document.querySelector('[data-coupon-message]');
        
        if (!this.isValidCouponFormat(code)) {
            if (message) {
                message.textContent = 'Formato inválido. Usa 6-20 caracteres alfanuméricos.';
                message.className = 'coupon-message error';
            }
            if (input) {
                input.classList.add('invalid');
            }
            return false;
        }
        
        if (input) {
            input.classList.remove('invalid');
        }
        
        return true;
    }
    
    async applyCoupon(code = null) {
        const couponCode = code || document.querySelector('[data-coupon-input]')?.value;
        
        if (!couponCode) {
            this.showCouponMessage('Ingresa un código de cupón', 'error');
            return;
        }
        
        if (!this.isValidCouponFormat(couponCode)) {
            this.showCouponMessage('Formato de cupón inválido', 'error');
            return;
        }
        
        const button = document.querySelector('[data-coupon-button]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="bi bi-spinner spin"></i> Validando...';
        }
        
        try {
            const cartTotal = this.getCartTotal();
            const response = await fetch(this.options.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigo: couponCode,
                    total: cartTotal
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.valido) {
                this.currentCoupon = {
                    codigo: data.codigo,
                    descuento: data.descuento,
                    tipo: data.tipo,
                    ahorro: data.ahorro
                };
                
                this.applyDiscountToCart(data);
                this.saveUsedCoupon(couponCode);
                this.showCouponMessage(`¡Cupón aplicado! Ahorras S/.${data.ahorro.toFixed(2)}`, 'success');
                
                // Emitir evento personalizado
                document.dispatchEvent(new CustomEvent('ecommerce:coupon:applied', {
                    detail: this.currentCoupon
                }));
                
                this.updateCouponUI(true);
            } else {
                this.showCouponMessage(data.mensaje || 'Cupón inválido o expirado', 'error');
                this.updateCouponUI(false);
            }
        } catch (error) {
            console.error('Error validando cupón:', error);
            this.showCouponMessage('Error al validar el cupón', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="bi bi-check-circle"></i> Aplicar';
            }
        }
    }
    
    removeCoupon() {
        this.currentCoupon = null;
        this.removeDiscountFromCart();
        this.updateCouponUI(false);
        this.showCouponMessage('Cupón removido', 'info');
        
        // Emitir evento personalizado
        document.dispatchEvent(new CustomEvent('ecommerce:coupon:removed'));
        
        const input = document.querySelector('[data-coupon-input]');
        if (input) {
            input.value = '';
            input.classList.remove('invalid');
        }
    }
    
    applyDiscountToCart(couponData) {
        const cartTotal = this.getCartTotal();
        let discountAmount = 0;
        
        if (couponData.tipo === '%') {
            discountAmount = cartTotal * (couponData.descuento / 100);
        } else if (couponData.tipo === 'fixed') {
            discountAmount = couponData.descuento;
        } else if (couponData.tipo === 'shipping') {
            discountAmount = this.getShippingCost();
        }
        
        // Actualizar el total del carrito
        this.updateCartTotal(cartTotal - discountAmount);
        this.updateSavingsDisplay(discountAmount);
    }
    
    removeDiscountFromCart() {
        const cartTotal = this.getCartTotal();
        this.updateCartTotal(cartTotal);
        this.updateSavingsDisplay(0);
    }
    
    getCartTotal() {
        // Obtener el total del carrito (integración con eco-cart.js)
        const cartElement = document.querySelector('[data-cart-total]');
        return cartElement ? parseFloat(cartElement.dataset.cartTotal) || 0 : 0;
    }
    
    getShippingCost() {
        const shippingElement = document.querySelector('[data-shipping-cost]');
        return shippingElement ? parseFloat(shippingElement.dataset.shippingCost) || 0 : 0;
    }
    
    updateCartTotal(newTotal) {
        const totalElement = document.querySelector('[data-cart-total]');
        if (totalElement) {
            totalElement.textContent = `S/.${newTotal.toFixed(2)}`;
            totalElement.dataset.cartTotal = newTotal;
        }
    }
    
    updateSavingsDisplay(savings) {
        const savingsElement = document.querySelector('[data-savings]');
        if (savingsElement) {
            if (savings > 0) {
                savingsElement.textContent = `Ahorras: S/.${savings.toFixed(2)}`;
                savingsElement.style.display = 'block';
            } else {
                savingsElement.style.display = 'none';
            }
        }
    }
    
    updateCouponUI(hasCoupon) {
        const couponSection = document.querySelector('[data-coupon-section]');
        const appliedSection = document.querySelector('[data-coupon-applied]');
        const inputSection = document.querySelector('[data-coupon-input-section]');
        
        if (hasCoupon && this.currentCoupon) {
            if (couponSection) couponSection.style.display = 'none';
            if (appliedSection) {
                appliedSection.style.display = 'block';
                appliedSection.innerHTML = `
                    <div class="coupon-applied">
                        <div class="coupon-code">${this.currentCoupon.codigo}</div>
                        <div class="coupon-discount">
                            ${this.currentCoupon.tipo === '%' ? this.currentCoupon.descuento + '%' : 'S/.' + this.currentCoupon.descuento}
                        </div>
                        <button data-coupon-remove class="btn-remove-coupon">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                `;
            }
        } else {
            if (couponSection) couponSection.style.display = 'block';
            if (appliedSection) appliedSection.style.display = 'none';
        }
    }
    
    showCouponMessage(message, type = 'info') {
        const messageElement = document.querySelector('[data-coupon-message]');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `coupon-message ${type}`;
            messageElement.style.display = 'block';
            
            // Ocultar automáticamente después de 5 segundos
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    }
    
    showCouponSuggestions() {
        const suggestionsContainer = document.querySelector('[data-coupon-suggestions]');
        if (!suggestionsContainer) return;
        
        const validCoupons = this.availableCoupons.filter(coupon => 
            !this.usedCoupons.includes(coupon.codigo)
        );
        
        if (validCoupons.length > 0) {
            suggestionsContainer.innerHTML = `
                <div class="coupon-suggestions">
                    <h4>Cupones disponibles:</h4>
                    <div class="coupon-list">
                        ${validCoupons.map(coupon => `
                            <div class="coupon-suggestion" data-coupon-code="${coupon.codigo}">
                                <div class="coupon-suggestion-code">${coupon.codigo}</div>
                                <div class="coupon-suggestion-desc">
                                    ${coupon.tipo === '%' ? coupon.descuento + '% de descuento' : 'S/.' + coupon.descuento + ' de descuento'}
                                </div>
                                <button class="btn-apply-suggestion" data-coupon="${coupon.codigo}">
                                    Aplicar
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // Agregar eventos a los botones de sugerencia
            suggestionsContainer.querySelectorAll('.btn-apply-suggestion').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const code = e.target.dataset.coupon;
                    const input = document.querySelector('[data-coupon-input]');
                    if (input) {
                        input.value = code;
                        this.applyCoupon(code);
                    }
                });
            });
        } else {
            suggestionsContainer.innerHTML = '';
        }
    }
    
    updateCouponSuggestions() {
        if (this.options.showSuggestions) {
            this.showCouponSuggestions();
        }
    }
    
    updateCouponValidity() {
        // Verificar si el cupón actual sigue siendo válido con el nuevo carrito
        if (this.currentCoupon) {
            this.applyCoupon(this.currentCoupon.codigo);
        }
    }
    
    handleCouponApplied(event) {
        console.log('Cupón aplicado:', event.detail);
        // Integración con analytics
        if (window.ecoAnalytics) {
            window.ecoAnalytics.trackEvent('coupon_applied', {
                coupon_code: event.detail.codigo,
                discount_type: event.detail.tipo,
                savings: event.detail.ahorro
            });
        }
    }
    
    handleCouponRemoved() {
        console.log('Cupón removido');
        // Integración con analytics
        if (window.ecoAnalytics) {
            window.ecoAnalytics.trackEvent('coupon_removed');
        }
    }
    
    loadUsedCoupons() {
        try {
            return JSON.parse(localStorage.getItem(this.options.storageKey)) || [];
        } catch {
            return [];
        }
    }
    
    saveUsedCoupon(code) {
        if (!this.usedCoupons.includes(code)) {
            this.usedCoupons.push(code);
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.usedCoupons));
        }
    }
    
    generateRandomCoupon() {
        const prefix = 'ECO';
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}${random}`;
    }
    
    getCurrentCoupon() {
        return this.currentCoupon;
    }
    
    hasAppliedCoupon() {
        return this.currentCoupon !== null;
    }
    
    destroy() {
        // Limpiar eventos
        document.removeEventListener('ecommerce:cart:updated', () => this.updateCouponValidity());
        document.removeEventListener('ecommerce:coupon:applied', (e) => this.handleCouponApplied(e));
        document.removeEventListener('ecommerce:coupon:removed', () => this.handleCouponRemoved());
        
        clearTimeout(this.applyTimeout);
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    // Buscar contenedores de cupones
    const couponContainers = document.querySelectorAll('[data-eco-coupons]');
    couponContainers.forEach(container => {
        new EcoCoupons({
            ...container.dataset
        });
    });
});