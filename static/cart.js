document.addEventListener('DOMContentLoaded', function () {
    const cartKey = 'EcoMarketCart';

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(cartKey) || '[]');
        } catch (error) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(cartKey, JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        const cart = getCart();
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
    }

    function normalizeProductImage(path) {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
            return path;
        }
        return `${window.location.origin}/static/${path}`;
    }

    function addToCart(productoId) {
        const cart = getCart();
        if (!cart.includes(productoId)) {
            cart.push(productoId);
            saveCart(cart);
            if (typeof showToast === 'function') {
                showToast('Producto agregado al carrito.', 'success');
            }
        }
    }

    function removeFromCart(productoId) {
        const cart = getCart().filter((id) => id !== productoId);
        saveCart(cart);
        renderCart();
        if (typeof showToast === 'function') {
            showToast('Producto eliminado del carrito.', 'info');
        }
    }

    function renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const cartItemCount = document.getElementById('cartItemCount');
        const emptyCartMessage = document.getElementById('emptyCartMessage');
        const checkoutButton = document.getElementById('checkoutButton');
        const cart = getCart();

        if (!cartItems || !cartTotal || !cartItemCount || !emptyCartMessage || !checkoutButton) {
            return;
        }

        let products = JSON.parse(localStorage.getItem('EcoMarketProducts') || '[]');
        const productData = document.getElementById('cartProductsData');
        if ((!products || products.length === 0) && productData) {
            try {
                products = JSON.parse(productData.textContent || '[]');
            } catch (error) {
                products = [];
            }
        }
        const selected = products.filter((producto) => cart.includes(producto.id.toString()));

        cartItems.innerHTML = '';
        let total = 0;

        if (selected.length === 0) {
            emptyCartMessage.hidden = false;
            checkoutButton.disabled = true;
            cartItemCount.textContent = '0';
            cartTotal.textContent = 'S/. 0.00';
            return;
        }

        emptyCartMessage.hidden = true;
        checkoutButton.disabled = false;
        cartItemCount.textContent = selected.length.toString();

        selected.forEach((producto) => {
            total += producto.precio;
            const item = document.createElement('article');
            item.className = 'carrito-item';
            const imageUrl = normalizeProductImage(producto.imagen);
            item.innerHTML = `
                <img src="${imageUrl}" alt="${producto.nombre}">
                <div>
                    <h3>${producto.nombre}</h3>
                    <p class="categoria">${producto.categoria}</p>
                    <p>S/. ${producto.precio.toFixed(2)}</p>
                </div>
                <button class="btn-secundario remove-cart" data-producto-id="${producto.id}">Eliminar</button>
            `;
            cartItems.appendChild(item);
        });

        cartTotal.textContent = `S/. ${total.toFixed(2)}`;

        document.querySelectorAll('.remove-cart').forEach((button) => {
            button.addEventListener('click', function () {
                removeFromCart(button.dataset.productoId);
            });
        });
    }

    document.querySelectorAll('.add-cart').forEach((button) => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const productoId = button.dataset.productoId;
            if (!productoId) return;
            addToCart(productoId);
        });
    });

    window.addEventListener('load', function () {
        updateCartCount();
        renderCart();
    });

    const checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function () {
            window.location.href = '/checkout';
        });
    }
});
