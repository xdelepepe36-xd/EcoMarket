/**
 * eco-visual-decorations.js - Decoraciones visuales simplificadas
 * 
 * Funcionalidades:
 - Particulas de fondo sutiles
 - Elementos flotantes decorativos
 - Efectos de fondo suaves
 - Decoraciones tematicas ligeras
 */

class EcoVisualDecorations {
    constructor(options = {}) {
        this.options = {
            storageKey: options.storageKey || 'ecomarket_decorations',
            enableParticles: options.enableParticles !== false,
            enableFloatingElements: options.enableFloatingElements !== false,
            enableBackgroundEffects: options.enableBackgroundEffects !== false,
            ...options
        };
        
        this.particles = [];
        this.floatingElements = [];
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        
        if (this.options.enableParticles) {
            this.initParticles();
        }
        
        if (this.options.enableFloatingElements) {
            this.initFloatingElements();
        }
        
        if (this.options.enableBackgroundEffects) {
            this.initBackgroundEffects();
        }
    }
    
    initParticles() {
        const canvas = document.createElement('canvas');
        canvas.className = 'eco-particles-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.3;';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Crear menos partículas para ser más sutiles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 0.3 - 0.15,
                speedY: Math.random() * 0.3 - 0.15,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
        
        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            this.particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(46, 125, 50, ${particle.opacity})`;
                ctx.fill();
            });
            
            this.animationFrame = requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
    
    initFloatingElements() {
        const icons = ['🌱', '🌿', '🍃'];
        
        // Solo 3 elementos flotantes para ser más sutiles
        for (let i = 0; i < 3; i++) {
            const element = document.createElement('div');
            element.className = 'eco-floating-element';
            element.textContent = icons[i];
            element.style.cssText = `
                position: fixed;
                font-size: 24px;
                left: ${20 + i * 30}%;
                top: ${10 + i * 20}%;
                pointer-events: none;
                z-index: 1;
                opacity: 0.2;
                animation: float 8s ease-in-out infinite;
                animation-delay: ${i * 2}s;
            `;
            document.body.appendChild(element);
            this.floatingElements.push(element);
        }
        
        if (!document.querySelector('#eco-floating-keyframes')) {
            const style = document.createElement('style');
            style.id = 'eco-floating-keyframes';
            style.textContent = `
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    initBackgroundEffects() {
        const hero = document.querySelector('.hero, [data-hero]');
        if (hero) {
            hero.style.cssText += `
                background: linear-gradient(135deg, rgba(46, 125, 50, 0.1), rgba(76, 175, 80, 0.1));
                animation: backgroundShift 10s ease infinite;
            `;
        }
        
        // Agregar keyframes si no existen
        if (!document.querySelector('#eco-background-keyframes')) {
            const style = document.createElement('style');
            style.id = 'eco-background-keyframes';
            style.textContent = `
                @keyframes backgroundShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    setupEventListeners() {
        // Event listeners automáticos
    }
    
    removeParticles() {
        const canvas = document.querySelector('.eco-particles-canvas');
        if (canvas) {
            canvas.remove();
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.particles = [];
    }
    
    removeFloatingElements() {
        this.floatingElements.forEach(el => el.remove());
        this.floatingElements = [];
    }
    
    removeBackgroundEffects() {
        const hero = document.querySelector('.hero, [data-hero]');
        if (hero) {
            hero.style.background = '';
            hero.style.animation = '';
        }
    }
    
    destroy() {
        this.removeParticles();
        this.removeFloatingElements();
        this.removeBackgroundEffects();
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const decorationsContainer = document.querySelector('[data-eco-decorations]');
    if (decorationsContainer && decorationsContainer.dataset.ecoDecorations !== 'false') {
        window.ecoVisualDecorations = new EcoVisualDecorations({
            ...decorationsContainer.dataset
        });
    }
});