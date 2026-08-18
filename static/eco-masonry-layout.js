// Masonry Layout - Layout masonry
class EcoMasonryLayout {
    constructor() {
        this.init();
    }

    init() {
        this.createMasonry();
        this.addResizeListener();
    }

    createMasonry() {
        const masonry = document.createElement('div');
        masonry.className = 'masonry-layout';
        masonry.innerHTML = `
            <div class="masonry-item tall">
                <img src="https://via.placeholder.com/300x400/2ecc71/ffffff?text=Item+1" alt="Item 1">
            </div>
            <div class="masonry-item">
                <img src="https://via.placeholder.com/300x300/3498db/ffffff?text=Item+2" alt="Item 2">
            </div>
            <div class="masonry-item wide">
                <img src="https://via.placeholder.com/600x300/e74c3c/ffffff?text=Item+3" alt="Item 3">
            </div>
            <div class="masonry-item">
                <img src="https://via.placeholder.com/300x300/f39c12/ffffff?text=Item+4" alt="Item 4">
            </div>
            <div class="masonry-item tall">
                <img src="https://via.placeholder.com/300x400/9b59b6/ffffff?text=Item+5" alt="Item 5">
            </div>
            <div class="masonry-item">
                <img src="https://via.placeholder.com/300x300/1abc9c/ffffff?text=Item+6" alt="Item 6">
            </div>
        `;
        document.body.appendChild(masonry);
    }

    addResizeListener() {
        window.addEventListener('resize', () => {
            this.arrangeMasonry();
        });
    }

    arrangeMasonry() {
        const masonry = document.querySelector('.masonry-layout');
        const items = masonry.querySelectorAll('.masonry-item');
        // Layout masonry simple con CSS Grid
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoMasonryLayout();
});