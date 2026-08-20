// Progress Steps - Pasos de progreso
class EcoProgressSteps {
    constructor() {
        this.init();
    }

    init() {
        this.createProgressSteps();
        this.addInteractivity();
    }

    createProgressSteps() {
        const container = document.createElement('div');
        container.className = 'progress-steps-container';
        container.innerHTML = `
            <h3>📋 Estado del pedido</h3>
            <div class="progress-steps">
                <div class="progress-step completed">
                    <div class="step-icon">✓</div>
                    <div class="step-label">Pedido realizado</div>
                    <div class="step-date">15/08/2026</div>
                </div>
                <div class="progress-step completed">
                    <div class="step-icon">✓</div>
                    <div class="step-label">Pago confirmado</div>
                    <div class="step-date">15/08/2026</div>
                </div>
                <div class="progress-step completed">
                    <div class="step-icon">✓</div>
                    <div class="step-label">En preparación</div>
                    <div class="step-date">16/08/2026</div>
                </div>
                <div class="progress-step active">
                    <div class="step-icon">🚚</div>
                    <div class="step-label">En camino</div>
                    <div class="step-date">En proceso</div>
                </div>
                <div class="progress-step">
                    <div class="step-icon">📦</div>
                    <div class="step-label">Entregado</div>
                    <div class="step-date">Pendiente</div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addInteractivity() {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((step, index) => {
            step.addEventListener('click', () => {
                this.showStepDetails(index);
            });
        });
    }

    showStepDetails(index) {
        const modal = document.createElement('div');
        modal.className = 'step-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h4>Detalles del paso ${index + 1}</h4>
                <p>Información detallada sobre este paso del proceso.</p>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoProgressSteps();
});