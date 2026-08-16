/**
 * eco-confetti-celebrations.js - Sistema de confeti y celebraciones
 * 
 * Funcionalidades:
 - Efecto de confeti al completar compras
 - Celebraciones al subir de nivel
 - Animaciones al desbloquear insignias
 - Efectos de fuegos artificiales
 - Particulas en pantalla
 - Sonidos de celebracion
 - Configuracion de intensidad
 - Temas de celebracion
 */

class EcoConfettiCelebrations {
    constructor(options = {}) {
        this.options = {
            intensity: options.intensity || 'medium', // low, medium, high
            enableSound: options.enableSound !== false,
            enableFireworks: options.enableFireworks !== false,
            duration: options.duration || 3000,
            particleCount: options.particleCount || 100,
            colors: options.colors || ['#2e7d32', '#4caf50', '#ff9800', '#ffeb3b', '#2196f3'],
            ...options
        };
        
        this.activeCelebrations = new Map();
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupEventListeners();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'eco-confetti-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        // Escuchar eventos de celebración
        document.addEventListener('gamification:level-up', (e) => this.celebrateLevelUp(e));
        document.addEventListener('gamification:badge-unlocked', (e) => this.celebrateBadge(e));
        document.addEventListener('gamification:achievement', (e) => this.celebrateAchievement(e));
        document.addEventListener('ecommerce:purchase', (e) => this.celebratePurchase(e));
        document.addEventListener('ecommerce:checkout-complete', (e) => this.celebrateCheckout(e));
    }
    
    celebrateLevelUp(event) {
        const level = event.detail.level;
        this.fireworksBurst();
        this.confettiExplosion('center');
        this.showCelebrationText(`¡Nivel ${level} Subido! 🎉`);
        
        if (this.options.enableSound) {
            this.playSound('level-up');
        }
    }
    
    celebrateBadge(event) {
        const badge = event.detail.badge;
        this.confettiExplosion('random');
        this.sparkleEffect();
        this.showCelebrationText(`¡Insignia: ${badge.name}! 🏆`);
        
        if (this.options.enableSound) {
            this.playSound('badge');
        }
    }
    
    celebrateAchievement(event) {
        const achievement = event.detail.achievement;
        this.confettiExplosion('random');
        this.rippleEffect();
        this.showCelebrationText(`¡Logro: ${achievement.name}! ⭐`);
        
        if (this.options.enableSound) {
            this.playSound('achievement');
        }
    }
    
    celebratePurchase(event) {
        const amount = event.detail.amount;
        
        if (amount > 100) {
            this.confettiExplosion('random');
            this.fireworksBurst();
        } else {
            this.confettiRain();
        }
        
        this.showCelebrationText(`¡Compra realizada! 🛒`);
        
        if (this.options.enableSound) {
            this.playSound('purchase');
        }
    }
    
    celebrateCheckout(event) {
        this.confettiExplosion('center');
        this.fireworksBurst();
        this.rippleEffect();
        this.showCelebrationText(`¡Pedido Completado! 🎊`);
        
        if (this.options.enableSound) {
            this.playSound('checkout');
        }
    }
    
    confettiExplosion(type = 'center') {
        const particleCount = this.getParticleCount();
        const colors = this.options.colors;
        
        let x, y;
        if (type === 'center') {
            x = this.canvas.width / 2;
            y = this.canvas.height / 2;
        } else {
            x = Math.random() * this.canvas.width;
            y = Math.random() * this.canvas.height * 0.5;
        }
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 5 + Math.random() * 10;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 5,
                color: color,
                size: 5 + Math.random() * 10,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                gravity: 0.2,
                friction: 0.99,
                life: 1,
                decay: 0.01 + Math.random() * 0.01
            });
        }
        
        this.startAnimation();
    }
    
    confettiRain() {
        const particleCount = this.getParticleCount();
        const colors = this.options.colors;
        
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * this.canvas.width;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push({
                x: x,
                y: -20,
                vx: (Math.random() - 0.5) * 2,
                vy: 2 + Math.random() * 3,
                color: color,
                size: 5 + Math.random() * 8,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 5,
                gravity: 0.05,
                friction: 0.99,
                life: 1,
                decay: 0.005 + Math.random() * 0.005
            });
        }
        
        this.startAnimation();
    }
    
    fireworksBurst() {
        if (!this.options.enableFireworks) return;
        
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = this.canvas.height * 0.8;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                this.createFirework(x, y, color);
            }, i * 200);
        }
    }
    
    createFirework(x, y, color) {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 8 + Math.random() * 4;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: color,
                size: 3 + Math.random() * 3,
                rotation: 0,
                rotationSpeed: 0,
                gravity: 0.15,
                friction: 0.98,
                life: 1,
                decay: 0.02,
                trail: true
            });
        }
        
        this.startAnimation();
    }
    
    sparkleEffect() {
        const particleCount = 30;
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF69B4'];
        
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push({
                x: x,
                y: y,
                vx: 0,
                vy: -2 - Math.random() * 2,
                color: color,
                size: 3 + Math.random() * 5,
                rotation: 0,
                rotationSpeed: 0,
                gravity: 0,
                friction: 1,
                life: 1,
                decay: 0.03,
                sparkle: true
            });
        }
        
        this.startAnimation();
    }
    
    rippleEffect() {
        const particleCount = 40;
        const colors = this.options.colors;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                color: color,
                size: 8 + Math.random() * 4,
                rotation: 0,
                rotationSpeed: 0,
                gravity: 0,
                friction: 0.95,
                life: 1,
                decay: 0.02,
                ripple: true
            });
        }
        
        this.startAnimation();
    }
    
    showCelebrationText(text) {
        const textElement = document.createElement('div');
        textElement.className = 'eco-celebration-text';
        textElement.textContent = text;
        textElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            font-weight: 700;
            color: var(--verde, #2e7d32);
            text-shadow: 0 0 20px rgba(46, 125, 50, 0.5);
            z-index: 10000;
            animation: eco-text-bounce 0.5s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(textElement);
        
        setTimeout(() => {
            textElement.remove();
        }, 2000);
    }
    
    startAnimation() {
        if (this.animationId) return;
        
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Actualizar y dibujar partículas
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const particle = this.particles[i];
                
                // Actualizar posición
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += particle.gravity;
                particle.vx *= particle.friction;
                particle.vy *= particle.friction;
                particle.rotation += particle.rotationSpeed;
                particle.life -= particle.decay;
                
                // Dibujar partícula
                if (particle.life > 0) {
                    this.ctx.save();
                    this.ctx.translate(particle.x, particle.y);
                    this.ctx.rotate(particle.rotation * Math.PI / 180);
                    this.ctx.globalAlpha = particle.life;
                    
                    if (particle.sparkle) {
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                        this.ctx.fillStyle = particle.color;
                        this.ctx.fill();
                        
                        // Efecto de brillo
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        this.ctx.fill();
                    } else if (particle.trail) {
                        // Dibujar estela para fuegos artificiales
                        this.ctx.fillStyle = particle.color;
                        this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                    } else if (particle.ripple) {
                        // Dibujar onda
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                        this.ctx.strokeStyle = particle.color;
                        this.ctx.lineWidth = 2;
                        this.ctx.stroke();
                    } else {
                        // Dibujar confeti cuadrado
                        this.ctx.fillStyle = particle.color;
                        this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                    }
                    
                    this.ctx.restore();
                } else {
                    this.particles.splice(i, 1);
                }
            }
            
            // Continuar animación si hay partículas
            if (this.particles.length > 0) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.animationId = null;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    getParticleCount() {
        switch (this.options.intensity) {
            case 'low': return 30;
            case 'medium': return 100;
            case 'high': return 200;
            default: return 100;
        }
    }
    
    playSound(type) {
        if (!this.options.enableSound) return;
        
        // Generar sonido con Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'level-up':
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                break;
            case 'badge':
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
                oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.15); // A5
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                break;
            case 'achievement':
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
                oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.3); // A5
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
                break;
            case 'purchase':
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'checkout':
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioContext.currentTime + 0.1); // C6
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                break;
        }
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
    }
    
    triggerCelebration(type) {
        switch (type) {
            case 'confetti':
                this.confettiExplosion('center');
                break;
            case 'rain':
                this.confettiRain();
                break;
            case 'fireworks':
                this.fireworksBurst();
                break;
            case 'sparkle':
                this.sparkleEffect();
                break;
            case 'ripple':
                this.rippleEffect();
                break;
            case 'all':
                this.confettiExplosion('center');
                this.fireworksBurst();
                this.sparkleEffect();
                break;
        }
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.canvas) {
            this.canvas.remove();
        }
        
        window.removeEventListener('resize', () => this.resizeCanvas());
    }
}

// Animación CSS para texto
const style = document.createElement('style');
style.textContent = `
    @keyframes eco-text-bounce {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.2); }
    }
`;
document.head.appendChild(style);

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    window.ecoConfetti = new EcoConfettiCelebrations({
        intensity: 'medium',
        enableSound: true,
        enableFireworks: true
    });
});