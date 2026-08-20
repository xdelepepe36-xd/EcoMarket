// Process Bar - Barra de proceso
class EcoProcessBar {
    constructor() {
        this.init();
    }

    init() {
        this.createProcessBar();
        this.animateProcess();
    }

    createProcessBar() {
        const container = document.createElement('div');
        container.className = 'process-bar-container';
        container.innerHTML = `
            <h3📊 Barra de proceso</h3>
            <div class="process-bar">
                <div class="process-steps">
                    <div class="process-step completed">
                        <span class="step-number">1</span>
                        <span class="step-label">Paso 1</span>
                    </div>
                    <div class="process-step completed">
                        <span class="step-number">2</span>
                        <span class="step-label">Paso 2</span>
                    </div>
                    <div class="process-step active">
                        <span class="step-number">3</span>
                        <span class="step-label">Paso 3</span>
                    </div>
                    <div class="process-step">
                        <span class="step-number">4</span>
                        <span class="step-label">Paso 4</span>
                    </div>
                    <div class="process-step">
                        <span class="step-number">5</span>
                        <span class="step-label">Paso 5</span>
                    </div>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: 50%"></div>
                </div>
                <div class="process-info">
                    <span class="process-text">Progreso: 50%</span>
                    <span class="process-status">En proceso</span>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    animateProcess() {
        const fill = document.querySelector('.progress-fill');
        const text = document.querySelector('.process-text');
        const status = document.querySelector('.process-status');
        
        let progress = 50;
        const interval = setInterval(() => {
            progress += 1;
            fill.style.width = progress + '%';
            text.textContent = `Progreso: ${progress}%`;
            
            if (progress === 100) {
                status.textContent = 'Completado';
                clearInterval(interval);
            }
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoProcessBar();
});