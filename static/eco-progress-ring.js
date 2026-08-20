// Progress Ring - Anillo de progreso
class EcoProgressRing {
    constructor() {
        this.init();
    }

    init() {
        this.createProgressRing();
        this.animateProgress();
    }

    createProgressRing() {
        const container = document.createElement('div');
        container.className = 'progress-ring-container';
        container.innerHTML = `
            <h3>⭕ Anillo de progreso</h3>
            <div class="progress-ring">
                <svg class="progress-svg" width="200" height="200">
                    <circle class="progress-circle-bg" cx="100" cy="100" r="80"></circle>
                    <circle class="progress-circle" cx="100" cy="100" r="80"></circle>
                </svg>
                <div class="progress-text">
                    <span class="progress-percentage">0%</span>
                    <span class="progress-label">Completado</span>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    animateProgress() {
        const circle = document.querySelector('.progress-circle');
        const percentage = document.querySelector('.progress-percentage');
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            const offset = circumference - (progress / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            percentage.textContent = `${progress}%`;
            
            if (progress >= 75) {
                clearInterval(interval);
            }
        }, 50);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoProgressRing();
});