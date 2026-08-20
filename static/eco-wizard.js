// Wizard - Asistente paso a paso
class EcoWizard {
    constructor() {
        this.currentStep = 0;
        this.init();
    }

    init() {
        this.createWizard();
        this.addNavigation();
    }

    createWizard() {
        const wizard = document.createElement('div');
        wizard.className = 'wizard-container';
        wizard.innerHTML = `
            <h3>🧙 Asistente de configuración</h3>
            <div class="wizard-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 25%"></div>
                </div>
                <div class="step-indicator">Paso 1 de 4</div>
            </div>
            <div class="wizard-steps">
                <div class="wizard-step active" data-step="0">
                    <h4>👤 Información personal</h4>
                    <div class="form-group">
                        <label>Nombre completo</label>
                        <input type="text" placeholder="Tu nombre">
                    </div>
                    <div class="form-group">
                        <label>Correo electrónico</label>
                        <input type="email" placeholder="tu@email.com">
                    </div>
                </div>
                <div class="wizard-step" data-step="1">
                    <h4>📍 Dirección de envío</h4>
                    <div class="form-group">
                        <label>Dirección</label>
                        <input type="text" placeholder="Calle, número, departamento">
                    </div>
                    <div class="form-group">
                        <label>Ciudad</label>
                        <input type="text" placeholder="Tu ciudad">
                    </div>
                </div>
                <div class="wizard-step" data-step="2">
                    <h4>💳 Método de pago</h4>
                    <div class="payment-options">
                        <label class="payment-option">
                            <input type="radio" name="payment" value="card">
                            <span>💳 Tarjeta</span>
                        </label>
                        <label class="payment-option">
                            <input type="radio" name="payment" value="paypal">
                            <span>🅿️ PayPal</span>
                        </label>
                        <label class="payment-option">
                            <input type="radio" name="payment" value="yape">
                            <span>📱 Yape</span>
                        </label>
                    </div>
                </div>
                <div class="wizard-step" data-step="3">
                    <h4>✅ Confirmación</h4>
                    <div class="summary">
                        <p>Revisa tu información antes de continuar.</p>
                        <div class="summary-item">
                            <strong>Nombre:</strong> <span id="summary-name">-</span>
                        </div>
                        <div class="summary-item">
                            <strong>Email:</strong> <span id="summary-email">-</span>
                        </div>
                        <div class="summary-item">
                            <strong>Pago:</strong> <span id="summary-payment">-</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="wizard-navigation">
                <button class="wizard-btn prev" disabled>Anterior</button>
                <button class="wizard-btn next">Siguiente</button>
                <button class="wizard-btn finish" style="display: none">Finalizar</button>
            </div>
        `;
        document.body.appendChild(wizard);
    }

    addNavigation() {
        document.querySelector('.wizard-btn.next').addEventListener('click', () => {
            if (this.currentStep < 3) {
                this.nextStep();
            }
        });

        document.querySelector('.wizard-btn.prev').addEventListener('click', () => {
            if (this.currentStep > 0) {
                this.prevStep();
            }
        });

        document.querySelector('.wizard-btn.finish').addEventListener('click', () => {
            this.finishWizard();
        });
    }

    nextStep() {
        this.currentStep++;
        this.updateWizard();
    }

    prevStep() {
        this.currentStep--;
        this.updateWizard();
    }

    updateWizard() {
        // Actualizar pasos
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            step.classList.toggle('active', index === this.currentStep);
        });

        // Actualizar barra de progreso
        const progress = ((this.currentStep + 1) / 4) * 100;
        document.querySelector('.progress-fill').style.width = progress + '%';
        document.querySelector('.step-indicator').textContent = `Paso ${this.currentStep + 1} de 4`;

        // Actualizar botones
        document.querySelector('.wizard-btn.prev').disabled = this.currentStep === 0;
        
        if (this.currentStep === 3) {
            document.querySelector('.wizard-btn.next').style.display = 'none';
            document.querySelector('.wizard-btn.finish').style.display = 'inline-block';
        } else {
            document.querySelector('.wizard-btn.next').style.display = 'inline-block';
            document.querySelector('.wizard-btn.finish').style.display = 'none';
        }
    }

    finishWizard() {
        const success = document.createElement('div');
        success.className = 'wizard-success';
        success.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✅</span>
                <h3>¡Configuración completada!</h3>
                <p>Tu información ha sido guardada exitosamente.</p>
                <button class="close-success">Cerrar</button>
            </div>
        `;
        document.body.appendChild(success);

        success.querySelector('.close-success').addEventListener('click', () => {
            success.remove();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoWizard();
});