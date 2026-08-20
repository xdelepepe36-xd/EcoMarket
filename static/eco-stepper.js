// Stepper - Pasos de proceso
class EcoStepper {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.init();
    }

    init() {
        this.createStepper();
        this.addNavigation();
    }

    createStepper() {
        const stepper = document.createElement('div');
        stepper.className = 'stepper-container';
        stepper.innerHTML = `
            <h3>🛒 Proceso de compra</h3>
            <div class="stepper">
                <div class="step active" data-step="1">
                    <div class="step-number">1</div>
                    <div class="step-label">Carrito</div>
                </div>
                <div class="step-connector"></div>
                <div class="step" data-step="2">
                    <div class="step-number">2</div>
                    <div class="step-label">Envío</div>
                </div>
                <div class="step-connector"></div>
                <div class="step" data-step="3">
                    <div class="step-number">3</div>
                    <div class="step-label">Pago</div>
                </div>
                <div class="step-connector"></div>
                <div class="step" data-step="4">
                    <div class="step-number">4</div>
                    <div class="step-label">Confirmación</div>
                </div>
            </div>
            <div class="step-content">
                <div class="step-panel active" data-panel="1">
                    <h4>Paso 1: Revisa tu carrito</h4>
                    <p>Verifica los productos que deseas comprar.</p>
                </div>
                <div class="step-panel" data-panel="2">
                    <h4>Paso 2: Elige tu método de envío</h4>
                    <p>Selecciona cómo quieres recibir tu pedido.</p>
                </div>
                <div class="step-panel" data-panel="3">
                    <h4>Paso 3: Realiza el pago</h4>
                    <p>Completa el proceso de pago seguro.</p>
                </div>
                <div class="step-panel" data-panel="4">
                    <h4>Paso 4: Confirmación</h4>
                    <p>¡Tu pedido ha sido realizado exitosamente!</p>
                </div>
            </div>
            <div class="stepper-navigation">
                <button class="stepper-btn prev" disabled>Anterior</button>
                <button class="stepper-btn next">Siguiente</button>
            </div>
        `;
        document.body.appendChild(stepper);
    }

    addNavigation() {
        document.querySelector('.stepper-btn.next').addEventListener('click', () => {
            if (this.currentStep < this.totalSteps) {
                this.goToStep(this.currentStep + 1);
            }
        });

        document.querySelector('.stepper-btn.prev').addEventListener('click', () => {
            if (this.currentStep > 1) {
                this.goToStep(this.currentStep - 1);
            }
        });
    }

    goToStep(step) {
        // Actualizar pasos visuales
        document.querySelectorAll('.step').forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.remove('active', 'completed');
            
            if (stepNumber < step) {
                stepEl.classList.add('completed');
            } else if (stepNumber === step) {
                stepEl.classList.add('active');
            }
        });

        // Actualizar paneles de contenido
        document.querySelectorAll('.step-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelector(`[data-panel="${step}"]`).classList.add('active');

        // Actualizar botones
        document.querySelector('.stepper-btn.prev').disabled = step === 1;
        document.querySelector('.stepper-btn.next').textContent = step === this.totalSteps ? 'Finalizar' : 'Siguiente';

        this.currentStep = step;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoStepper();
});