// Image Gallery - Galería de imágenes
class EcoImageGallery {
    constructor() {
        this.currentIndex = 0;
        this.init();
    }

    init() {
        this.createGallery();
        this.addNavigation();
        this.addThumbnails();
        this.addKeyboardNavigation();
    }

    createGallery() {
        const gallery = document.createElement('div');
        gallery.className = 'image-gallery';
        gallery.innerHTML = `
            <div class="gallery-main">
                <img src="" alt="Gallery Image" class="main-image">
                <button class="gallery-nav prev">←</button>
                <button class="gallery-nav next">→</button>
            </div>
            <div class="gallery-thumbnails"></div>
        `;
        document.body.appendChild(gallery);

        const images = [
            'https://via.placeholder.com/800x600/2ecc71/ffffff?text=Producto+1',
            'https://via.placeholder.com/800x600/3498db/ffffff?text=Producto+2',
            'https://via.placeholder.com/800x600/e74c3c/ffffff?text=Producto+3',
            'https://via.placeholder.com/800x600/f39c12/ffffff?text=Producto+4',
            'https://via.placeholder.com/800x600/9b59b6/ffffff?text=Producto+5'
        ];

        this.images = images;
        this.loadImage(0);
        this.createThumbnails(images);
    }

    createThumbnails(images) {
        const container = document.querySelector('.gallery-thumbnails');
        images.forEach((img, index) => {
            const thumb = document.createElement('img');
            thumb.src = img;
            thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumb.addEventListener('click', () => {
                this.loadImage(index);
            });
            container.appendChild(thumb);
        });
    }

    loadImage(index) {
        const mainImage = document.querySelector('.main-image');
        mainImage.src = this.images[index];
        this.currentIndex = index;

        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    addNavigation() {
        document.querySelector('.gallery-nav.prev').addEventListener('click', () => {
            this.prevImage();
        });

        document.querySelector('.gallery-nav.next').addEventListener('click', () => {
            this.nextImage();
        });
    }

    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevImage();
            } else if (e.key === 'ArrowRight') {
                this.nextImage();
            }
        });
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.loadImage(this.currentIndex);
    }

    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.loadImage(this.currentIndex);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoImageGallery();
});