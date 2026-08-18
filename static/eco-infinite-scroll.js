// Infinite Scroll - Scroll infinito
class EcoInfiniteScroll {
    constructor() {
        this.page = 1;
        this.loading = false;
        this.init();
    }

    init() {
        this.addScrollListener();
        this.addLoadingIndicator();
    }

    addScrollListener() {
        window.addEventListener('scroll', () => {
            if (this.isNearBottom() && !this.loading) {
                this.loadMoreProducts();
            }
        });
    }

    isNearBottom() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        return scrollTop + winHeight >= docHeight - 500;
    }

    async loadMoreProducts() {
        this.loading = true;
        this.showLoading();

        // Simular carga de productos
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newProducts = this.generateMockProducts();
        this.appendProducts(newProducts);

        this.loading = false;
        this.hideLoading();
        this.page++;
    }

    generateMockProducts() {
        const products = [];
        for (let i = 0; i < 6; i++) {
            products.push({
                id: 100 + this.page * 10 + i,
                name: `Producto Ecológico ${this.page}-${i}`,
                price: (Math.random() * 50 + 10).toFixed(2),
                image: 'https://via.placeholder.com/300x300'
            });
        }
        return products;
    }

    appendProducts(products) {
        const container = document.querySelector('.products-grid');
        if (!container) return;

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p class="price">S/. ${product.price}</p>
                <button class="add-to-cart">Agregar al carrito</button>
            `;
            container.appendChild(card);
        });
    }

    showLoading() {
        const loading = document.querySelector('.loading-indicator');
        if (loading) loading.style.display = 'block';
    }

    hideLoading() {
        const loading = document.querySelector('.loading-indicator');
        if (loading) loading.style.display = 'none';
    }

    addLoadingIndicator() {
        const loading = document.createElement('div');
        loading.className = 'loading-indicator';
        loading.innerHTML = '<div class="spinner"></div><p>Cargando más productos...</p>';
        loading.style.display = 'none';
        document.body.appendChild(loading);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoInfiniteScroll();
});