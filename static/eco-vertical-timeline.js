// Vertical Timeline - Línea de tiempo vertical
class EcoVerticalTimeline {
    constructor() {
        this.init();
    }

    init() {
        this.createVerticalTimeline();
    }

    createVerticalTimeline() {
        const container = document.createElement('div');
        container.className = 'vertical-timeline-container';
        container.innerHTML = `
            <h3📅 Línea de tiempo vertical</h3>
            <div class="vertical-timeline">
                <div class="timeline-item">
                    <div class="timeline-date">18/08/2026</div>
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <h4>Pedido realizado</h4>
                        <p>Tu pedido ha sido procesado exitosamente.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">17/08/2026</div>
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <h4>Pago confirmado</h4>
                        <p>El pago ha sido verificado y aprobado.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">16/08/2026</div>
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <h4>En preparación</h4>
                        <p>Tu pedido está siendo preparado para envío.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">15/08/2026</div>
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <h4>Orden creada</h4>
                        <p>Has creado tu orden de compra.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoVerticalTimeline();
});