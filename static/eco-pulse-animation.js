// Pulse Animation - Animación de pulso
class EcoPulseAnimation {
    constructor() {
        this.init();
    }

    init() {
        this.createPulseAnimation();
    }

    createPulseAnimation() {
        const container = document.createElement('div');
        container.className = 'pulse-animation-container';
        container.innerHTML = `
            <h3>💓 Animación de pulso</h3>
            <div class="pulse-demo">
                <div class="pulse-item">
                    <div class="pulse-circle"></div>
                    <span>Notificación</span>
                </div>
                <div class="pulse-item">
                    <div class="pulse-circle pulse-warning"></div>
                    <span>Alerta</span>
                </div>
                <div class="pulse-item">
                    <div class="pulse-circle pulse-success"></div>
                    <span>Éxito</span>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoPulseAnimation();
});