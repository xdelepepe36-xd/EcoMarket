// Horizontal Timeline - Línea de tiempo horizontal
class EcoHorizontalTimeline {
    constructor() {
        this.init();
    }

    init() {
        this.createHorizontalTimeline();
    }

    createHorizontalTimeline() {
        const container = document.createElement('div');
        container.className = 'horizontal-timeline-container';
        container.innerHTML = `
            <h3>📅 Línea de tiempo horizontal</h3>
            <div class="horizontal-timeline">
                <div class="timeline-item">
                    <div class="timeline-marker">
                        <span class="marker-number">1</span>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-date">15/08/2026</div>
                        <h4>Orden creada</h4>
                        <p>Has creado tu orden de compra.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-marker">
                        <span class="marker-number">2</span>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-date">16/08/2026</div>
                        <h4>En preparación</h4>
                        <p>Tu pedido está siendo preparado.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-marker">
                        <span class="marker-number">3</span>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-date">17/08/2026</div>
                        <h4>Pago confirmado</h4>
                        <p>El pago ha sido verificado.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-marker">
                        <span class="marker-number">4</span>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-date">18/08/2026</div>
                        <h4>Pedido entregado</h4>
                        <p>Tu pedido ha sido entregado.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoHorizontalTimeline();
});