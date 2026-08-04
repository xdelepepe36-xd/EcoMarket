/**
 * eco-cart.js — Carrito persistente EcoMarket v2
 * Incluir en cualquier HTML: <script src="eco-cart.js"></script>
 * Funcionalidades:
 *   - Gestión completa de carrito con localStorage
 *   - Cupones de descuento
 *   - Cálculo de envío según subtotal
 *   - Mini carrito flotante
 *   - Eventos personalizados
 *   - Integración con gamificación
 */
const EcoCart = (() => {
    const KEY = 'ecomarket_cart';
    const COUPON_KEY = 'ecomarket_coupon';

    // ── Cupones disponibles ─────────────────────────────────
    const COUPONS = {
        ECO10: { type: 'percentage', value: 10, min: 30, label: '10% OFF', desc: '10% de descuento en tu compra' },
        ECO20: { type: 'percentage', value: 20, min: 80, label: '20% OFF', desc: '20% de descuento en compras > S/.80' },
        ECO50: { type: 'fixed', value: 50, min: 200, label: 'S/.50 OFF', desc: 'S/.50 de descuento en compras > S/.200' },
        BIENVENIDO: { type: 'fixed', value: 15, min: 0, label: 'S/.15 OFF', desc: 'Descuento de bienvenida' },
        ENVIOFREE: { type: 'free_shipping', value: 0, min: 0, label: 'Envío gratis', desc: 'Envío gratis sin mínimo' },
    };

    const SHIPPING_FREE_MIN = 150; // Envío gratis sobre S/.150
    const SHIPPING_COST = 12;      // Costo de envío normal

    // ── Datos ──────────────────────────────────────────────
    function getItems() {
        try { return JSON.parse(localStorage.getItem(KEY)) || []; }
        catch { return []; }
    }

    function saveItems(items) {
        localStorage.setItem(KEY, JSON.stringify(items));
        _dispatch();
    }

    function addItem(product) {
        const items = getItems();
        const existing = items.find(i => i.id === product.id);
        if (existing) {
            existing.qty = Math.min(existing.qty + 1, 99);
        } else {
            items.push({ ...product, qty: 1 });
        }
        saveItems(items);
        _showToast(`"${product.name.substring(0, 24)}..." agregado al carrito`);

        // Gamificación
        if (window.EcoGamification) {
            EcoGamification.addPoints('purchase', { co2: 0.3, plastic: 0.1 });
        }
    }

    function removeItem(id) {
        saveItems(getItems().filter(i => i.id !== id));
    }

    function updateQty(id, qty) {
        const items = getItems();
        const item = items.find(i => i.id === id);
        if (!item) return;
        if (qty <= 0) { removeItem(id); return; }
        item.qty = Math.min(qty, 99);
        saveItems(items);
    }

    function clearCart() {
        saveItems([]);
        _clearCoupon();
    }

    // ── Cupones ────────────────────────────────────────────
    function applyCoupon(code) {
        const c = code.trim().toUpperCase();
        const coupon = COUPONS[c];
        if (!coupon) {
            _showToast('Código de cupón inválido', 'warning');
            return null;
        }

        const subtotal = getSubtotal();
        if (subtotal < coupon.min) {
            _showToast(`Mínimo de S/.${coupon.min.toFixed(2)} para este cupón`, 'warning');
            return null;
        }

        localStorage.setItem(COUPON_KEY, c);
        _showToast(`🎉 Cupón aplicado: ${coupon.label}`, 'success');
        _dispatch();
        return getDiscount();
    }

    function getAppliedCoupon() {
        const code = localStorage.getItem(COUPON_KEY);
        if (!code) return null;
        const coupon = COUPONS[code];
        if (!coupon) { _clearCoupon(); return null; }
        return { code, ...coupon };
    }

    function _clearCoupon() {
        localStorage.removeItem(COUPON_KEY);
    }

    function getDiscount() {
        const coupon = getAppliedCoupon();
        if (!coupon) return 0;
        const subtotal = getSubtotal();
        if (coupon.type === 'percentage') return subtotal * (coupon.value / 100);
        if (coupon.type === 'fixed') return Math.min(coupon.value, subtotal);
        if (coupon.type === 'free_shipping') return 0; // El descuento se aplica al envío
        return 0;
    }

    // ── Envío ──────────────────────────────────────────────
    function getShipping() {
        const subtotal = getSubtotal();
        const coupon = getAppliedCoupon();
        if (subtotal >= SHIPPING_FREE_MIN) return 0;
        if (coupon && coupon.type === 'free_shipping') return 0;
        return SHIPPING_COST;
    }

    // ── Totales ────────────────────────────────────────────
    function getSubtotal() {
        return getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
    }

    function getTotal() {
        return getSubtotal() - getDiscount() + getShipping();
    }

    function getCount() {
        return getItems().reduce((sum, i) => sum + i.qty, 0);
    }

    function getSummary() {
        return {
            items: getItems(),
            count: getCount(),
            subtotal: getSubtotal(),
            discount: getDiscount(),
            shipping: getShipping(),
            total: getTotal(),
            coupon: getAppliedCoupon()
        };
    }

    // ── UI ─────────────────────────────────────────────────
    function _dispatch() {
        const summary = getSummary();
        window.dispatchEvent(new CustomEvent('ecocart:update', { detail: summary }));
        _updateBadges();
        _updateCouponUI();
    }

    function _updateBadges() {
        const count = getCount();
        document.querySelectorAll('.nav-badge, .cart-badge-count, #cartCount').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    function _updateCouponUI() {
        const coupon = getAppliedCoupon();
        document.querySelectorAll('.coupon-status').forEach(el => {
            if (coupon) {
                el.innerHTML = `<span style="color:#2e7d32;font-weight:700">🎉 ${coupon.label}</span>`;
            } else {
                el.innerHTML = '';
            }
        });
    }

    // Toast global
    function _showToast(msg, type = 'success') {
        let toast = document.getElementById('ecoToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ecoToast';
            toast.style.cssText = `
                position:fixed; bottom:28px; right:28px; z-index:99999;
                background:#2e7d32; color:#fff; padding:14px 22px;
                border-radius:14px; font-family:'Poppins',sans-serif;
                font-weight:600; font-size:0.9rem;
                display:flex; align-items:center; gap:10px;
                box-shadow:0 12px 30px rgba(46,125,50,0.35);
                transform:translateY(80px); opacity:0;
                transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s;
                max-width:320px; pointer-events:none;
            `;
            document.body.appendChild(toast);
        }
        const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
        toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
        if (type === 'error') toast.style.background = '#b91c1c';
        else if (type === 'warning') toast.style.background = '#d97706';
        else if (type === 'info') toast.style.background = '#1565c0';
        else toast.style.background = '#2e7d32';

        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.transform = 'translateY(80px)';
            toast.style.opacity = '0';
        }, 2800);
    }

    // Mini carrito flotante
    function _buildMiniCart() {
        if (document.getElementById('ecoMiniCart')) return;

        const mc = document.createElement('div');
        mc.id = 'ecoMiniCart';
        mc.style.cssText = `
            position:fixed; top:80px; right:20px; z-index:9998;
            background:#fff; border-radius:20px; width:320px;
            box-shadow:0 24px 60px rgba(0,0,0,0.15);
            border:1px solid rgba(46,125,50,0.12);
            font-family:'Poppins',sans-serif;
            transform:translateY(-10px) scale(0.95); opacity:0;
            pointer-events:none;
            transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
        `;
        mc.innerHTML = `
            <div style="padding:18px 20px;border-bottom:1px solid rgba(46,125,50,0.08);display:flex;align-items:center;justify-content:space-between">
                <strong style="font-size:0.95rem">🛍️ Mi carrito</strong>
                <span id="mcCount" style="background:#e8f5e9;color:#2e7d32;padding:3px 10px;border-radius:999px;font-size:0.78rem;font-weight:700">0</span>
            </div>
            <div id="mcItems" style="max-height:260px;overflow-y:auto;padding:12px 16px"></div>
            <div style="padding:14px 20px;border-top:1px solid rgba(46,125,50,0.08)">
                <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1rem;margin-bottom:12px">
                    <span>Total</span>
                    <span id="mcTotal" style="color:#2e7d32">S/. 0.00</span>
                </div>
                <a href="/carrito" style="display:block;text-align:center;background:linear-gradient(135deg,#4caf50,#2e7d32);color:#fff;padding:11px;border-radius:12px;font-weight:700;text-decoration:none;font-size:0.9rem">Ver carrito completo</a>
            </div>
        `;
        document.body.appendChild(mc);
    }

    function _renderMiniCart() {
        const items = getItems();
        const mcItems = document.getElementById('mcItems');
        const mcCount = document.getElementById('mcCount');
        const mcTotal = document.getElementById('mcTotal');
        if (!mcItems) return;

        mcCount.textContent = getCount();
        mcTotal.textContent = `S/. ${getTotal().toFixed(2)}`;

        if (items.length === 0) {
            mcItems.innerHTML = `<div style="text-align:center;padding:24px;color:#5d6a5f;font-size:0.88rem">Tu carrito está vacío 🌱</div>`;
            return;
        }
        mcItems.innerHTML = items.map(item => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(46,125,50,0.06)">
                <span style="font-size:1.6rem;width:36px;text-align:center">${item.emoji || '📦'}</span>
                <div style="flex:1;min-width:0">
                    <div style="font-size:0.82rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</div>
                    <div style="font-size:0.75rem;color:#5d6a5f">x${item.qty} · S/. ${(item.price * item.qty).toFixed(2)}</div>
                </div>
                <button onclick="EcoCart.removeItem('${item.id}')" style="background:none;border:none;color:#e53935;cursor:pointer;font-size:1rem;padding:4px">×</button>
            </div>
        `).join('');
    }

    function _toggleMiniCart(show) {
        const mc = document.getElementById('ecoMiniCart');
        if (!mc) return;
        _renderMiniCart();
        if (show) {
            mc.style.pointerEvents = 'auto';
            mc.style.transform = 'translateY(0) scale(1)';
            mc.style.opacity = '1';
        } else {
            mc.style.pointerEvents = 'none';
            mc.style.transform = 'translateY(-10px) scale(0.95)';
            mc.style.opacity = '0';
        }
    }

    // ── Auto-bind botones ─────────────────────────────────
    function _bindButtons() {
        document.querySelectorAll('[data-eco-add]').forEach(btn => {
            if (btn._ecoBound) return;
            btn._ecoBound = true;
            btn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                addItem({
                    id: btn.dataset.id || Math.random().toString(36).slice(2),
                    name: btn.dataset.name || 'Producto',
                    price: parseFloat(btn.dataset.price) || 0,
                    emoji: btn.dataset.emoji || '📦',
                    category: btn.dataset.category || ''
                });
            });
        });

        // Botones .add-cart con data-producto-* (formato Flask)
        document.querySelectorAll('.add-cart').forEach(btn => {
            if (btn._ecoBound) return;
            btn._ecoBound = true;
            btn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.dataset.productoId || btn.dataset.id || Math.random().toString(36).slice(2);
                const name = btn.dataset.productoNombre || btn.dataset.name || 'Producto';
                const price = parseFloat(btn.dataset.productoPrecio || btn.dataset.price) || 0;
                const category = btn.dataset.productoCategoria || btn.dataset.category || '';
                const image = btn.dataset.productoImagen || '';
                addItem({
                    id: id,
                    name: name,
                    price: price,
                    emoji: '📦',
                    category: category,
                    image: image
                });
            });
        });

        // Botones de cupón
        document.querySelectorAll('[data-eco-coupon]').forEach(btn => {
            if (btn._couponBound) return;
            btn._couponBound = true;
            btn.addEventListener('click', () => {
                const input = document.querySelector(btn.dataset.ecoCouponInput || '#couponInput');
                if (input) applyCoupon(input.value);
            });
        });
    }

    // ── Init ───────────────────────────────────────────────
    function init() {
        _buildMiniCart();
        _updateBadges();
        _bindButtons();

        // Hover en iconos de carrito del nav
        document.querySelectorAll('a[href*="/carrito"], .nav-icon[href*="/carrito"]').forEach(el => {
            el.addEventListener('mouseenter', () => _toggleMiniCart(true));
            el.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    const mc = document.getElementById('ecoMiniCart');
                    if (mc && !mc.matches(':hover')) _toggleMiniCart(false);
                }, 200);
            });
        });
        document.getElementById('ecoMiniCart')?.addEventListener('mouseleave', () => _toggleMiniCart(false));

        // Re-bind en cambios del DOM
        new MutationObserver(_bindButtons).observe(document.body, { childList: true, subtree: true });
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();

    return {
        getItems, addItem, removeItem, updateQty, clearCart,
        getSubtotal, getTotal, getCount, getSummary,
        applyCoupon, getAppliedCoupon, getDiscount, getShipping,
        COUPONS, SHIPPING_COST, SHIPPING_FREE_MIN,
        showToast: _showToast
    };
})();

window.EcoCart = EcoCart;