// Product Zoom - Zoom en productos
class EcoProductZoom {
    constructor() {
        this.init();
    }

    init() {
        this.addZoomToProducts();
        this.createZoomLens();
    }

    addZoomToProducts() {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            const image = product.querySelector('.product-image');
            if (image) {
                image.addEventListener('mouseenter', (e) => {
                    this.showZoom(e, image);
                });
                image.addEventListener('mouseleave', () => {
                    this.hideZoom();
                });
                image.addEventListener('mousemove', (e) => {
                    this.moveZoom(e, image);
                });
            }
        });
    }

    createZoomLens() {
        const lens = document.createElement('div');
        lens.className = 'zoom-lens';
        lens.style.display = 'none';
        document.body.appendChild(lens);
    }

    showZoom(e, image) {
        const lens = document.querySelector('.zoom-lens');
        lens.style.display = 'block';
        lens.style.backgroundImage = `url(${image.src})`;
        lens.style.backgroundSize = '200%';
    }

    moveZoom(e, image) {
        const lens = document.querySelector('.zoom-lens');
        const rect = image.getBoundingClientRect();
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        lens.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
        lens.style.left = `${e.clientX + 10}px`;
        lens.style.top = `${e.clientY + 10}px`;
    }

    hideZoom() {
        const lens = document.querySelector('.zoom-lens');
        lens.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoProductZoom();
});