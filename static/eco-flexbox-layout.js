// Flexbox Layout - Layout flexbox
class EcoFlexboxLayout {
    constructor() {
        this.init();
    }

    init() {
        this.createFlexbox();
    }

    createFlexbox() {
        const flexbox = document.createElement('div');
        flexbox.className = 'flexbox-layout';
        flexbox.innerHTML = `
            <div class="flex-item">
                <div class="flex-content">
                    <h3>🌱 Sostenibilidad</h3>
                    <p>Productos 100% ecológicos</p>
                </div>
            </div>
            <div class="flex-item">
                <div class="flex-content">
                    <h3>🚚 Envío Rápido</h3>
                    <p>Entrega en 24-48 horas</p>
                </div>
            </div>
            <div class="flex-item">
                <div class="flex-content">
                    <h3>💰 Precio Justo</h3>
                    <p>Los mejores precios del mercado</p>
                </div>
            </div>
            <div class="flex-item">
                <div class="flex-content">
                    <h3>🛡️ Garantía</h3>
                    <p>30 días de devolución</p>
                </div>
            </div>
        `;
        document.body.appendChild(flexbox);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoFlexboxLayout();
});