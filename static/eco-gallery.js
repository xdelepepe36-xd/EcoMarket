/**
 * eco-gallery.js - Sistema de galería de productos con lazy loading
 * 
 * Funcionalidades:
 * - Galería de imágenes con zoom
 * - Lazy loading de imágenes
 * - Navegación con teclado
 * - Indicadores de carga
 * - Optimización de rendimiento
 */

class EcoGallery {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            enableZoom: options.enableZoom !== false,
            enableKeyboard: options.enableKeyboard !== false,
            enableThumbnails: options.enableThumbnails !== false,
            zoomLevel: options.zoomLevel || 2,
            transitionDuration: options.transitionDuration || 300,
            ...options
        };
        
        this.images = [];
        this.currentIndex = 0;
        this.loadedImages = new Set();
        this.isZoomed = false;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        // Crear estructura de la galería
        this.createGalleryStructure();
        
        // Configurar lazy loading
        this.setupLazyLoading();
        
        // Configurar eventos
        this.setupEvents();
        
        // Cargar primera imagen
        this.loadImage(0);
    }
    
    createGalleryStructure() {
        this.container.innerHTML = `
            <div class="eco-gallery">
                <div class="eco-gallery-main">
                    <div class="eco-gallery-image-container">
                        <img class="eco-gallery-main-image" src="" alt="" loading="lazy">
                        <div class="eco-gallery-zoom-overlay"></div>
                        <div class="eco-gallery-loading">
                            <div class="eco-gallery-spinner"></div>
                        </div>
                    </div>
                    
                    <div class="eco-gallery-controls">
                        <button class="eco-gallery-btn eco-gallery-prev" aria-label="Imagen anterior">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <button class="eco-gallery-btn eco-gallery-next" aria-label="Imagen siguiente">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                        <button class="eco-gallery-btn eco-gallery-zoom" aria-label="Zoom">
                            <i class="bi bi-zoom-in"></i>
                        </button>
                        <button class="eco-gallery-btn eco-gallery-fullscreen" aria-label="Pantalla completa">
                            <i class="bi bi-fullscreen"></i>
                        </button>
                    </div>
                    
                    <div class="eco-gallery-counter">
                        <span class="eco-gallery-current">1</span> / <span class="eco-gallery-total">1</span>
                    </div>
                </div>
                
                <div class="eco-gallery-thumbnails"></div>
            </div>
        `;
        
        // Referencias a elementos
        this.mainImage = this.container.querySelector('.eco-gallery-main-image');
        this.imageContainer = this.container.querySelector('.eco-gallery-image-container');
        this.prevBtn = this.container.querySelector('.eco-gallery-prev');
        this.nextBtn = this.container.querySelector('.eco-gallery-next');
        this.zoomBtn = this.container.querySelector('.eco-gallery-zoom');
        this.fullscreenBtn = this.container.querySelector('.eco-gallery-fullscreen');
        this.thumbnailsContainer = this.container.querySelector('.eco-gallery-thumbnails');
        this.loadingIndicator = this.container.querySelector('.eco-gallery-loading');
        this.currentCounter = this.container.querySelector('.eco-gallery-current');
        this.totalCounter = this.container.querySelector('.eco-gallery-total');
    }
    
    setImages(images) {
        this.images = images;
        this.totalCounter.textContent = images.length;
        
        if (this.options.enableThumbnails) {
            this.createThumbnails();
        }
        
        // Resetear estado
        this.currentIndex = 0;
        this.loadedImages.clear();
        this.loadImage(0);
    }
    
    createThumbnails() {
        this.thumbnailsContainer.innerHTML = '';
        
        this.images.forEach((image, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'eco-gallery-thumbnail';
            thumb.dataset.index = index;
            
            const img = document.createElement('img');
            img.src = image.thumb || image.url;
            img.alt = image.alt || `Imagen ${index + 1}`;
            img.loading = 'lazy';
            
            thumb.appendChild(img);
            thumb.addEventListener('click', () => this.goToImage(index));
            
            this.thumbnailsContainer.appendChild(thumb);
        });
        
        this.updateThumbnailActive();
    }
    
    setupLazyLoading() {
        // Configurar Intersection Observer para lazy loading
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        this.imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px',
            threshold: 0.1
        });
    }
    
    loadImage(index) {
        if (index < 0 || index >= this.images.length) return;
        
        this.currentIndex = index;
        const image = this.images[index];
        
        // Mostrar indicador de carga
        this.loadingIndicator.style.display = 'flex';
        
        // Precargar imagen
        const img = new Image();
        img.onload = () => {
            this.mainImage.src = image.url;
            this.mainImage.alt = image.alt || `Imagen ${index + 1}`;
            this.loadingIndicator.style.display = 'none';
            this.loadedImages.add(index);
            this.updateThumbnailActive();
            this.updateCounter();
        };
        
        img.onerror = () => {
            this.loadingIndicator.style.display = 'none';
            // Usar imagen de error
            this.mainImage.src = '/static/assets/product-placeholder.svg';
        };
        
        img.src = image.url;
        
        // Actualizar botones
        this.prevBtn.disabled = index === 0;
        this.nextBtn.disabled = index === this.images.length - 1;
    }
    
    setupEvents() {
        // Navegación con botones
        this.prevBtn.addEventListener('click', () => this.prevImage());
        this.nextBtn.addEventListener('click', () => this.nextImage());
        
        // Zoom
        if (this.options.enableZoom) {
            this.zoomBtn.addEventListener('click', () => this.toggleZoom());
            this.imageContainer.addEventListener('click', () => this.toggleZoom());
        }
        
        // Pantalla completa
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Navegación con teclado
        if (this.options.enableKeyboard) {
            document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        }
        
        // Gestos táctiles
        this.setupTouchGestures();
    }
    
    setupTouchGestures() {
        let startX = 0;
        let endX = 0;
        
        this.imageContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.imageContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextImage();
                } else {
                    this.prevImage();
                }
            }
        });
    }
    
    handleKeyboard(e) {
        if (e.key === 'ArrowLeft') {
            this.prevImage();
        } else if (e.key === 'ArrowRight') {
            this.nextImage();
        } else if (e.key === 'Escape' && this.isZoomed) {
            this.toggleZoom();
        } else if (e.key === '+' || e.key === '=') {
            this.zoomIn();
        } else if (e.key === '-') {
            this.zoomOut();
        }
    }
    
    prevImage() {
        if (this.currentIndex > 0) {
            this.loadImage(this.currentIndex - 1);
        }
    }
    
    nextImage() {
        if (this.currentIndex < this.images.length - 1) {
            this.loadImage(this.currentIndex + 1);
        }
    }
    
    goToImage(index) {
        this.loadImage(index);
    }
    
    toggleZoom() {
        this.isZoomed = !this.isZoomed;
        
        if (this.isZoomed) {
            this.imageContainer.classList.add('eco-gallery-zoomed');
            this.mainImage.style.transform = `scale(${this.options.zoomLevel})`;
            this.zoomBtn.innerHTML = '<i class="bi bi-zoom-out"></i>';
        } else {
            this.imageContainer.classList.remove('eco-gallery-zoomed');
            this.mainImage.style.transform = 'scale(1)';
            this.zoomBtn.innerHTML = '<i class="bi bi-zoom-in"></i>';
        }
    }
    
    zoomIn() {
        if (!this.isZoomed) {
            this.toggleZoom();
        } else {
            const currentScale = parseFloat(this.mainImage.style.transform) || this.options.zoomLevel;
            const newScale = Math.min(currentScale + 0.5, 5);
            this.mainImage.style.transform = `scale(${newScale})`;
        }
    }
    
    zoomOut() {
        if (this.isZoomed) {
            const currentScale = parseFloat(this.mainImage.style.transform) || this.options.zoomLevel;
            const newScale = Math.max(currentScale - 0.5, 1);
            
            if (newScale <= 1) {
                this.toggleZoom();
            } else {
                this.mainImage.style.transform = `scale(${newScale})`;
            }
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().catch(err => {
                console.log(`Error al entrar en pantalla completa: ${err.message}`);
            });
            this.fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
        } else {
            document.exitFullscreen();
            this.fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
        }
    }
    
    updateThumbnailActive() {
        const thumbnails = this.thumbnailsContainer.querySelectorAll('.eco-gallery-thumbnail');
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    updateCounter() {
        this.currentCounter.textContent = this.currentIndex + 1;
    }
    
    destroy() {
        // Limpiar eventos y observers
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        
        this.prevBtn.removeEventListener('click', () => this.prevImage());
        this.nextBtn.removeEventListener('click', () => this.nextImage());
        
        if (this.options.enableKeyboard) {
            document.removeEventListener('keydown', (e) => this.handleKeyboard(e));
        }
    }
}

// Lazy loading global para todas las imágenes
class EcoLazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: options.rootMargin || '50px',
            threshold: options.threshold || 0.1,
            placeholder: options.placeholder || '/static/assets/product-placeholder.svg',
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    this.observer.unobserve(img);
                }
            });
        }, {
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        });
        
        // Observar todas las imágenes con data-src
        this.observeImages();
    }
    
    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            // Mostrar placeholder mientras carga
            if (!img.src) {
                img.src = this.options.placeholder;
            }
            this.observer.observe(img);
        });
    }
    
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        const newImg = new Image();
        newImg.onload = () => {
            img.src = src;
            img.classList.add('eco-lazy-loaded');
            img.removeAttribute('data-src');
        };
        
        newImg.onerror = () => {
            img.src = this.options.placeholder;
            img.classList.add('eco-lazy-error');
        };
        
        newImg.src = src;
    }
    
    refresh() {
        this.observeImages();
    }
    
    destroy() {
        this.observer.disconnect();
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar lazy loader global
    window.ecoLazyLoader = new EcoLazyLoader();
    
    // Buscar contenedores de galería
    const galleryContainers = document.querySelectorAll('[data-eco-gallery]');
    galleryContainers.forEach(container => {
        const images = JSON.parse(container.dataset.ecoGallery || '[]');
        new EcoGallery(container, { images });
    });
});