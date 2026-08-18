// Parallax Scroll - Efecto parallax al hacer scroll
class EcoParallaxScroll {
    constructor() {
        this.init();
    }

    init() {
        this.addParallaxElements();
        this.addScrollListener();
    }

    addParallaxElements() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            element.style.position = 'relative';
            element.dataset.speed = speed;
        });
    }

    addScrollListener() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            document.querySelectorAll('[data-parallax]').forEach(element => {
                const speed = parseFloat(element.dataset.speed);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoParallaxScroll();
});