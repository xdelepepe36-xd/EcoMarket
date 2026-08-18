// Progress Bar - Barra de progreso
class EcoProgressBar {
    constructor() {
        this.init();
    }

    init() {
        this.createProgressBar();
        this.animateProgress();
    }

    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar-container';
        progressBar.innerHTML = `
            <div class="progress-label">Meta mensual de ventas</div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-value">0%</div>
        `;
        document.body.appendChild(progressBar);
    }

    animateProgress() {
        const fill = document.querySelector('.progress-fill');
        const value = document.querySelector('.progress-value');
        let progress = 0;

        const interval = setInterval(() => {
            progress += 1;
            fill.style.width = progress + '%';
            value.textContent = progress + '%';

            if (progress >= 75) {
                clearInterval(interval);
            }
        }, 50);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoProgressBar();
});