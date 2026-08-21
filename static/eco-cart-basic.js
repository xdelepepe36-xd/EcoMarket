// Funcionalidad básica del carrito para EcoMarket
document.addEventListener('DOMContentLoaded', function() {
    // Agregar al carrito
    const addToCartButtons = document.querySelectorAll('.btn-add-cart, .add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener datos del producto
            const productCard = this.closest('.product-card, .producto-card');
            if (!productCard) return;
            
            const productName = productCard.querySelector('.product-name, .producto-nombre')?.textContent || 'Producto';
            const productPrice = productCard.querySelector('.product-price, .producto-precio')?.textContent || '0';
            const productImage = productCard.querySelector('img')?.src || '';
            
            // Obtener carrito actual
            let cart = JSON.parse(localStorage.getItem('ecomarket_cart')) || [];
            
            // Agregar producto
            cart.push({
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
            
            // Guardar carrito
            localStorage.setItem('ecomarket_cart', JSON.stringify(cart));
            
            // Actualizar contador
            updateCartCount();
            
            // Mostrar notificación
            showNotification('Producto agregado al carrito');
        });
    });
    
    // Actualizar contador del carrito
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('ecomarket_cart')) || [];
        const countElement = document.getElementById('cartCount');
        if (countElement) {
            countElement.textContent = cart.length;
        }
    }
    
    // Mostrar notificación
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2ecc71;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    // Inicializar contador
    updateCartCount();
    
    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});