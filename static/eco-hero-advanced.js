// Hero Advanced - Mejoras reales del hero section
class EcoHeroAdvanced {
    constructor() {
        this.hero = document.querySelector('.hero-section');
        this.init();
    }

    init() {
        if (!this.hero) return;
        this.addParallaxEffect();
        this.addVideoBackground();
        this.addAnimatedContent();
        this.addScrollEffects();
    }

    addParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = this.hero;
            if (hero) {
                hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }

    addVideoBackground() {
        const videoContainer = document.createElement('div');
        videoContainer.className = 'hero-video-background';
        videoContainer.innerHTML = `
            <video autoplay muted loop playsinline>
                <source src="https://assets.mixkit.co/videos/preview/mixkit-nature-background-3260-large.mp4" type="video/mp4">
            </video>
        `;
        this.hero.insertBefore(videoContainer, this.hero.firstChild);
    }

    addAnimatedContent() {
        const content = this.hero.querySelector('.hero-content');
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                content.style.transition = 'all 1s ease';
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }, 500);
        }
    }

    addScrollEffects() {
        const heroElements = this.hero.querySelectorAll('h1, p, .btn');
        heroElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = `all 0.8s ease ${index * 0.1}s`;
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 800 + index * 100);
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new EcoHeroAdvanced();
});