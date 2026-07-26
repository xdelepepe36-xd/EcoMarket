document.addEventListener('DOMContentLoaded', function () {
    const cartKey = 'EcoMarketCart';
    const productsKey = 'EcoMarketProducts';
    const checkoutItems = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const shippingEl = document.getElementById('checkoutShipping');
    const totalEl = document.getElementById('checkoutTotal');
    const emptyMessage = document.getElementById('checkoutEmpty');
    const confirmButton = document.getElementById('confirmCheckout');
    const checkoutMessage = document.getElementById('checkoutMessage');
    const checkoutError = document.getElementById('checkoutError');
    const checkoutForm = document.getElementById('checkoutForm');
    const productsData = document.getElementById('checkoutProductsData');

    if (!checkoutItems || !subtotalEl || !shippingEl || !totalEl || !confirmButton) {
        return;
    }

    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    let products = JSON.parse(localStorage.getItem(productsKey) || '[]');

    function normalizeProductImage(path) {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
            return path;
        }
        return `${window.location.origin}/static/${path}`;
    }

    if ((!products || products.length === 0) && productsData) {
        try {
            products = JSON.parse(productsData.textContent || '[]');
        } catch (error) {
            products = [];
        }
    }

    const selectedProducts = products.filter((product) => cart.includes(product.id.toString()));

    function formatPrice(value) {
        return `S/. ${value.toFixed(2)}`;
    }

    function renderCheckout() {
        checkoutItems.innerHTML = '';
        let subtotal = 0;

        if (selectedProducts.length === 0) {
            emptyMessage.hidden = false;
            confirmButton.disabled = true;
            subtotalEl.textContent = formatPrice(0);
            shippingEl.textContent = formatPrice(0);
            totalEl.textContent = formatPrice(0);
            return;
        }

        emptyMessage.hidden = true;
        confirmButton.disabled = false;

        selectedProducts.forEach((product) => {
            subtotal += product.precio;
            const item = document.createElement('article');
            item.className = 'checkout-item';
            item.innerHTML = `
                <img src="${normalizeProductImage(product.imagen)}" alt="${product.nombre}">
                <div class="checkout-item-details">
                    <h4>${product.nombre}</h4>
                    <p>${product.categoria}</p>
                    <strong>${formatPrice(product.precio)}</strong>
                </div>
            `;
            checkoutItems.appendChild(item);
        });

        const shipping = subtotal >= 150 ? 0 : 12;
        subtotalEl.textContent = formatPrice(subtotal);
        shippingEl.textContent = formatPrice(shipping);
        totalEl.textContent = formatPrice(subtotal + shipping);
    }

    function clearCart() {
        localStorage.removeItem(cartKey);
        checkoutMessage.hidden = false;
        if (checkoutError) {
            checkoutError.hidden = true;
        }
        confirmButton.disabled = true;
        if (checkoutForm) {
            checkoutForm.reset();
        }
    }

    function isFormValid() {
        if (!checkoutForm) return true;
        return Array.from(checkoutForm.elements).every((field) => {
            if (!field.name || field.type === 'button' || field.type === 'submit') {
                return true;
            }
            if (field.required) {
                return field.value.trim() !== '';
            }
            return true;
        });
    }

    confirmButton.addEventListener('click', function () {
        if (selectedProducts.length === 0) {
            return;
        }

        if (!isFormValid()) {
            if (checkoutError) {
                checkoutError.hidden = false;
                checkoutMessage.hidden = true;
            }
            return;
        }

        clearCart();
        renderCheckout();
        if (typeof showToast === 'function') {
            showToast('Compra confirmada. Gracias por apoyar EcoMarket.', 'success');
        }
    });

    renderCheckout();
});
