// Countdown Timer - Temporizador de ofertas
class EcoCountdownTimer {
    constructor() {
        this.init();
    }

    init() {
        this.createCountdown();
        this.startTimer();
    }

    createCountdown() {
        const countdown = document.createElement('div');
        countdown.className = 'countdown-timer';
        countdown.innerHTML = `
            <h3>⏰ Oferta termina en:</h3>
            <div class="timer-display">
                <div class="time-unit">
                    <span class="time-value" id="days">00</span>
                    <span class="time-label">Días</span>
                </div>
                <div class="time-unit">
                    <span class="time-value" id="hours">00</span>
                    <span class="time-label">Horas</span>
                </div>
                <div class="time-unit">
                    <span class="time-value" id="minutes">00</span>
                    <span class="time-label">Minutos</span>
                </div>
                <div class="time-unit">
                    <span class="time-value" id="seconds">00</span>
                    <span class="time-label">Segundos</span>
                </div>
            </div>
        `;
        document.body.appendChild(countdown);
    }

    startTimer() {
        // Establecer fecha final (7 días desde ahora)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);

        const updateTimer = () => {
            const now = new Date();
            const diff = endDate - now;

            if (diff <= 0) {
                // Reiniciar el temporizador
                this.startTimer();
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoCountdownTimer();
});