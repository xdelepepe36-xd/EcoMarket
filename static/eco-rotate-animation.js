// Rotate Animation - Animación de rotación
class EcoRotateAnimation {
    constructor() {
        this.init();
    }

    init() {
        this.createRotateAnimation();
    }

    createRotateAnimation() {
        const container = document.createElement('div');
        container.className = 'rotate-animation-container';
        container.innerHTML = `
            <h3>🔄 Animación de rotación</h3>
            <div class="rotate-demo">
                <div class="rotate-item">
                    <div class="rotate-shape rotate-continuous">🌱</div>
                    <span>Rotación continua</span>
                </div>
                <div class="rotate-item">
                    <div class="rotate-shape rotate-hover">🛒</div>
                    <span>Rotación al hover</span>
                </div>
                <div class="rotate-item">
                    <div class="rotate-shape rotate-bounce">❤️</div>
                    <span>Rotación con rebote</span>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoRotateAnimation();
});