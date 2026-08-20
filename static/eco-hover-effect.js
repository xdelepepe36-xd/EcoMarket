// Hover Effect - Efectos hover avanzados
class EcoHoverEffect {
    constructor() {
        this.init();
    }

    init() {
        this.createHoverEffect();
    }

    createHoverEffect() {
        const container = document.createElement('div');
        container.className = 'hover-effect-container';
        container.innerHTML = `
            <h3>🎯 Efectos hover avanzados</h3>
            <div class="hover-demo">
                <div class="hover-item hover-lift">
                    <div class="hover-content">
                        <span class="hover-icon">🌱</span>
                        <span>Efecto lift</span>
                    </div>
                </div>
                <div class="hover-item hover-scale">
                    <div class="hover-content">
                        <span class="hover-icon">🛒</span>
                        <span>Efecto scale</span>
                    </div>
                </div>
                <div class="hover-item hover-shine">
                    <div class="hover-content">
                        <span class="hover-icon">❤️</span>
                        <span>Efecto shine</span>
                    </div>
                </div>
                <div class="hover-item hover-3d">
                    <div class="hover-content">
                        <span class="hover-icon">🔥</span>
                        <span>Efecto 3D</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoHoverEffect();
});