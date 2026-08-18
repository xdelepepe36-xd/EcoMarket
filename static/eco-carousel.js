// Carousel - Carrusel de imágenes
class EcoCarousel {
    constructor() {
        this.currentSlide = 0;
        this.init();
    }

    init() {
        this.createCarousel();
        this.addNavigation();
        this.addIndicators();
        this.addAutoPlay();
    }

    createCarousel() {
        const carousel = document.createElement('div');
        carousel.className = 'eco-carousel';
        carousel.innerHTML = `
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <img src="https://via.placeholder.com/1200x400/2ecc71/ffffff?text=Oferta+1" alt="Slide 1">
                    <div class="carousel-caption">
                        <h3>¡Oferta especial!</h3>
                        <p>20% de descuento en productos ecológicos</p>
                    </div>
                </div>
                <div class="carousel-item">
                    <img src="https://via.placeholder.com/1200x400/3498db/ffffff?text=Oferta+2" alt="Slide 2">
                    <div class="carousel-caption">
                        <h3>Nuevos productos</h3>
                        <p>Descubre lo último en sostenibilidad</p>
                    </div>
                </div>
                <div class="carousel-item">
                    <img src="https://via.placeholder.com/1200x400/e74c3c/ffffff?text=Oferta+3" alt="Slide 3">
                    <div class="carousel-caption">
                        <h3>Envío gratis</h3>
                        <p>En pedidos mayores a S/. 100</p>
                    </div>
                </div>
            </div>
            <button class="carousel-control prev">‹</button>
            <button class="carousel-control next">›</button>
            <div class="carousel-indicators"></div>
        `;
        document.body.appendChild(carousel);

        this.items = carousel.querySelectorAll('.carousel-item');
        this.createIndicators();
    }

    createIndicators() {
        const indicators = document.querySelector('.carousel-indicators');
        this.items.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
            indicators.appendChild(indicator);
        });
    }

    addNavigation() {
        document.querySelector('.carousel-control.prev').addEventListener('click', () => {
            this.prevSlide();
        });

        document.querySelector('.carousel-control.next').addEventListener('click', () => {
            this.nextSlide();
        });
    }

    addAutoPlay() {
        setInterval(() => {
            this.nextSlide();
        }, 4000);
    }

    goToSlide(index) {
        this.items[this.currentSlide].classList.remove('active');
        document.querySelectorAll('.indicator')[this.currentSlide].classList.remove('active');
        
        this.currentSlide = index;
        
        this.items[this.currentSlide].classList.add('active');
        document.querySelectorAll('.indicator')[this.currentSlide].classList.add('active');
    }

    nextSlide() {
        this.goToSlide((this.currentSlide + 1) % this.items.length);
    }

    prevSlide() {
        this.goToSlide((this.currentSlide - 1 + this.items.length) % this.items.length);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoCarousel();
});