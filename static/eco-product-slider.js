// Product Slider - Slider de productos
class EcoProductSlider {
    constructor() {
        this.currentSlide = 0;
        this.init();
    }

    init() {
        this.createSlider();
        this.addNavigation();
        this.addAutoSlide();
        this.addTouchSupport();
    }

    createSlider() {
        const slider = document.createElement('div');
        slider.className = 'product-slider';
        slider.innerHTML = `
            <div class="slider-container">
                <div class="slider-track">
                    <div class="slide">
                        <div class="product-card">
                            <img src="https://via.placeholder.com/300x300/2ecc71/ffffff?text=Producto+1" alt="Producto 1">
                            <h3>Producto Ecológico 1</h3>
                            <p class="price">S/. 25.00</p>
                        </div>
                    </div>
                    <div class="slide">
                        <div class="product-card">
                            <img src="https://via.placeholder.com/300x300/3498db/ffffff?text=Producto+2" alt="Producto 2">
                            <h3>Producto Ecológico 2</h3>
                            <p class="price">S/. 35.00</p>
                        </div>
                    </div>
                    <div class="slide">
                        <div class="product-card">
                            <img src="https://via.placeholder.com/300x300/e74c3c/ffffff?text=Producto+3" alt="Producto 3">
                            <h3>Producto Ecológico 3</h3>
                            <p class="price">S/. 45.00</p>
                        </div>
                    </div>
                    <div class="slide">
                        <div class="product-card">
                            <img src="https://via.placeholder.com/300x300/f39c12/ffffff?text=Producto+4" alt="Producto 4">
                            <h3>Producto Ecológico 4</h3>
                            <p class="price">S/. 55.00</p>
                        </div>
                    </div>
                    <div class="slide">
                        <div class="product-card">
                            <img src="https://via.placeholder.com/300x300/9b59b6/ffffff?text=Producto+5" alt="Producto 5">
                            <h3>Producto Ecológico 5</h3>
                            <p class="price">S/. 65.00</p>
                        </div>
                    </div>
                </div>
            </div>
            <button class="slider-nav prev">←</button>
            <button class="slider-nav next">→</button>
            <div class="slider-dots"></div>
        `;
        document.body.appendChild(slider);

        this.slides = slider.querySelectorAll('.slide');
        this.track = slider.querySelector('.slider-track');
        this.createDots();
    }

    createDots() {
        const dotsContainer = document.querySelector('.slider-dots');
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                this.goToSlide(index);
            });
            dotsContainer.appendChild(dot);
        });
    }

    addNavigation() {
        document.querySelector('.slider-nav.prev').addEventListener('click', () => {
            this.prevSlide();
        });

        document.querySelector('.slider-nav.next').addEventListener('click', () => {
            this.nextSlide();
        });
    }

    addAutoSlide() {
        setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    addTouchSupport() {
        let startX = 0;
        let endX = 0;

        const slider = document.querySelector('.product-slider');
        
        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        slider.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            if (startX - endX > 50) {
                this.nextSlide();
            } else if (endX - startX > 50) {
                this.prevSlide();
            }
        });
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlider();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlider();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.updateSlider();
    }

    updateSlider() {
        const translateX = -this.currentSlide * 100;
        this.track.style.transform = `translateX(${translateX}%)`;

        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoProductSlider();
});