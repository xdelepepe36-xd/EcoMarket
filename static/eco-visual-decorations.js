/**
 * eco-visual-decorations.js - Decoraciones visuales
 * 
 * Funcionalidades:
 - Particulas de fondo
 - Animaciones decorativas
 - Efectos visuales
 - Elementos flotantes
 - Efectos de fondo animados
 - Decoraciones tematicas
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
        this.createDecorationUI();
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
    
    createDecorationUI() {
        const container = document.querySelector('[data-eco-decorations]');
        if (!container) return;
        
        container.innerHTML = `
            <div class="eco-visual-decorations">
                <div class="eco-decorations-controls">
                    <h3>Decoraciones Visuales</h3>
                    <div class="eco-control-group">
                        <label>
                            <input type="checkbox" data-particles-toggle ${this.options.enableParticles ? 'checked' : ''}>
                            Partículas de fondo
                        </label>
                    </div>
                    <div class="eco-control-group">
                        <label>
                            <input type="checkbox" data-floating-toggle ${this.options.enableFloatingElements ? 'checked' : ''}>
                            Elementos flotantes
                        </label>
                    </div>
                    <div class="eco-control-group">
                        <label>
                            <input type="checkbox" data-background-toggle ${this.options.enableBackgroundEffects ? 'checked' : ''}>
                            Efectos de fondo
                        </label>
                    </div>
                </div>
                
                <div class="eco-decorations-canvas" data-decorations-canvas></div>
            </div>
        `;
    }
    
    initParticles() {
        const canvas = document.createElement('canvas');
        canvas.className = 'eco-particles-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Crear partículas
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
        
        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            this.particles.forEach(particle => {
                // Mover partícula
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // Rebotar en bordes
                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
                
                // Dibujar partícula
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(46, 125, 50, ${particle.opacity})`;
                ctx.fill();
            });
            
            this.animationFrame = requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
        
        // Ajustar tamaño al redimensionar
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
    
    initFloatingElements() {
        const icons = ['🌱', '🌿', '🍃', '🌳', '🌲', '🌴', '🌵', '🌷', '🌸', '🌺'];
        
        for (let i = 0; i < 10; i++) {
            const element = document.createElement('div');
            element.className = 'eco-floating-element';
            element.textContent = icons[Math.floor(Math.random() * icons.length)];
            element.style.cssText = `
                position: fixed;
                font-size: ${Math.random() * 20 + 20}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                pointer-events: none;
                z-index: 1;
                opacity: 0.3;
                animation: float ${Math.random() * 5 + 5}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            document.body.appendChild(element);
            this.floatingElements.push(element);
        }
        
        // Agregar keyframes si no existen
        if (!document.querySelector('#eco-floating-keyframes')) {
            const style = document.createElement('style');
            style.id = 'eco-floating-keyframes';
            style.textContent = `
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
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
        document.querySelector('[data-particles-toggle]')?.addEventListener('change', (e) => {
            this.options.enableParticles = e.target.checked;
            if (e.target.checked) {
                this.initParticles();
            } else {
                this.removeParticles();
            }
        });
        
        document.querySelector('[data-floating-toggle]')?.addEventListener('change', (e) => {
            this.options.enableFloatingElements = e.target.checked;
            if (e.target.checked) {
                this.initFloatingElements();
            } else {
                this.removeFloatingElements();
            }
        });
        
        document.querySelector('[data-background-toggle]')?.addEventListener('change', (e) => {
            this.options.enableBackgroundEffects = e.target.checked;
            if (e.target.checked) {
                this.initBackgroundEffects();
            } else {
                this.removeBackgroundEffects();
            }
        });
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