// Decorative Divider - Divisores decorativos
class EcoDecorativeDivider {
    constructor() {
        this.init();
    }

    init() {
        this.createDecorativeDivider();
    }

    createDecorativeDivider() {
        const container = document.createElement('div');
        container.className = 'decorative-divider-container';
        container.innerHTML = `
            <h3>✨ Divisores decorativos</h3>
            <div class="divider-demo">
                <div class="divider-section">
                    <p>Sección 1</p>
                    <div class="divider divider-waves"></div>
                    <p>Sección 2</p>
                </div>
                <div class="divider-section">
                    <p>Sección 3</p>
                    <div class="divider divider-dots"></div>
                    <p>Sección 4</p>
                </div>
                <div class="divider-section">
                    <p>Sección 5</p>
                    <div class="divider divider-arrows"></div>
                    <p>Sección 6</p>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoDecorativeDivider();
});