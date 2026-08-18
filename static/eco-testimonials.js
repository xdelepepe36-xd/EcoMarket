// Testimonials - Testimonios mejorados
class EcoTestimonials {
    constructor() {
        this.currentSlide = 0;
        this.init();
    }

    init() {
        this.createTestimonialSlider();
        this.addNavigation();
        this.addAutoSlide();
    }

    createTestimonialSlider() {
        const testimonials = [
            {
                name: 'María García',
                location: 'Lima, Perú',
                rating: 5,
                text: 'Desde que compro en EcoMarket siento que mis decisiones de consumo realmente importan. Los productos son increíbles.',
                avatar: 'https://i.pravatar.cc/100?img=1'
            },
            {
                name: 'Carlos López',
                location: 'Bogotá, Colombia',
                rating: 5,
                text: 'Publiqué mis productos artesanales y en un mes ya tenía 20 ventas. La plataforma es muy fácil de usar.',
                avatar: 'https://i.pravatar.cc/100?img=2'
            },
            {
                name: 'Ana Torres',
                location: 'Santiago, Chile',
                rating: 5,
                text: 'Me encanta que puedo ver el impacto real de cada compra. Es motivador saber que estoy ayudando al planeta.',
                avatar: 'https://i.pravatar.cc/100?img=3'
            }
        ];

        const slider = document.createElement('div');
        slider.className = 'testimonial-slider';
        
        testimonials.forEach((testimonial, index) => {
            const slide = document.createElement('div');
            slide.className = `testimonial-slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <div class="testimonial-content">
                    <div class="testimonial-avatar">
                        <img src="${testimonial.avatar}" alt="${testimonial.name}">
                    </div>
                    <div class="testimonial-text">
                        <p>"${testimonial.text}"</p>
                        <div class="testimonial-rating">
                            ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                        </div>
                        <div class="testimonial-author">
                            <h4>${testimonial.name}</h4>
                            <p>${testimonial.location}</p>
                        </div>
                    </div>
                </div>
            `;
            slider.appendChild(slide);
        });

        document.body.appendChild(slider);
    }

    addNavigation() {
        const slider = document.querySelector('.testimonial-slider');
        if (!slider) return;

        const prevBtn = document.createElement('button');
        prevBtn.className = 'testimonial-nav prev';
        prevBtn.innerHTML = '←';
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'testimonial-nav next';
        nextBtn.innerHTML = '→';

        slider.appendChild(prevBtn);
        slider.appendChild(nextBtn);

        prevBtn.addEventListener('click', () => this.prevSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());
    }

    addAutoSlide() {
        setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    nextSlide() {
        const slides = document.querySelectorAll('.testimonial-slide');
        slides[this.currentSlide].classList.remove('active');
        this.currentSlide = (this.currentSlide + 1) % slides.length;
        slides[this.currentSlide].classList.add('active');
    }

    prevSlide() {
        const slides = document.querySelectorAll('.testimonial-slide');
        slides[this.currentSlide].classList.remove('active');
        this.currentSlide = (this.currentSlide - 1 + slides.length) % slides.length;
        slides[this.currentSlide].classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoTestimonials();
});