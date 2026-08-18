// Animated Hero - Hero con animaciones
class EcoAnimatedHero {
    constructor() {
        this.init();
    }

    init() {
        this.addFloatingElements();
        this.addGradientAnimation();
        this.addTextReveal();
        this.addParticleEffect();
    }

    addFloatingElements() {
        const hero = document.querySelector('.hero-section');
        if (!hero) return;

        for (let i = 0; i < 5; i++) {
            const floating = document.createElement('div');
            floating.className = 'floating-element';
            floating.style.animationDelay = `${i * 0.5}s`;
            floating.style.left = `${10 + i * 20}%`;
            hero.appendChild(floating);
        }
    }

    addGradientAnimation() {
        const hero = document.querySelector('.hero-section');
        if (!hero) return;

        hero.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        hero.style.backgroundSize = '400% 400%';
        hero.style.animation = 'gradientBG 15s ease infinite';
    }

    addTextReveal() {
        const headings = document.querySelectorAll('.hero-section h1, .hero-section h2');
        headings.forEach(heading => {
            heading.style.opacity = '0';
            heading.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                heading.style.transition = 'all 1s ease';
                heading.style.opacity = '1';
                heading.style.transform = 'translateY(0)';
            }, 500);
        });
    }

    addParticleEffect() {
        const hero = document.querySelector('.hero-section');
        if (!hero) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'particle-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        hero.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;

        const particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fill();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoAnimatedHero();
});