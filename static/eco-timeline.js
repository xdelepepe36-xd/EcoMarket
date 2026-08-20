// Timeline - Línea de tiempo
class EcoTimeline {
    constructor() {
        this.init();
    }

    init() {
        this.createTimeline();
    }

    createTimeline() {
        const timeline = document.createElement('div');
        timeline.className = 'timeline-container';
        timeline.innerHTML = `
            <h3>📅 Historial de pedidos</h3>
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">18/08/2026</div>
                        <h4>Pedido #1234 entregado</h4>
                        <p>Tu pedido ha sido entregado exitosamente.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">17/08/2026</div>
                        <h4>Pedido #1234 en camino</h4>
                        <p>Tu pedido está siendo transportado.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">16/08/2026</div>
                        <h4>Pedido #1234 procesado</h4>
                        <p>Tu pedido ha sido procesado y preparado.</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">15/08/2026</div>
                        <h4>Pedido #1234 realizado</h4>
                        <p>Has realizado tu pedido exitosamente.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(timeline);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoTimeline();
});