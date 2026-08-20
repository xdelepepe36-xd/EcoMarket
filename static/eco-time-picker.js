// Time Picker - Selector de hora
class EcoTimePicker {
    constructor() {
        this.init();
    }

    init() {
        this.createTimePicker();
        this.addTimeHandlers();
    }

    createTimePicker() {
        const container = document.createElement('div');
        container.className = 'time-picker-container';
        container.innerHTML = `
            <h3>⏰ Selector de hora</h3>
            <div class="time-picker">
                <div class="time-display">
                    <div class="time-part" id="hours">00</div>
                    <div class="time-separator">:</div>
                    <div class="time-part" id="minutes">00</div>
                    <div class="time-separator">:</div>
                    <div class="time-part" id="seconds">00</div>
                    <div class="time-period" id="period">AM</div>
                </div>
                <div class="time-controls">
                    <div class="time-column">
                        <button class="time-btn up" data-part="hours">▲</button>
                        <div class="time-label">Horas</div>
                        <button class="time-btn down" data-part="hours">▼</button>
                    </div>
                    <div class="time-column">
                        <button class="time-btn up" data-part="minutes">▲</button>
                        <div class="time-label">Minutos</div>
                        <button class="time-btn down" data-part="minutes">▼</button>
                    </div>
                    <div class="time-column">
                        <button class="time-btn up" data-part="seconds">▲</button>
                        <div class="time-label">Segundos</div>
                        <button class="time-btn down" data-part="seconds">▼</button>
                    </div>
                    <div class="time-column">
                        <button class="time-btn up" data-part="period">▲</button>
                        <div class="time-label">AM/PM</div>
                        <button class="time-btn down" data-part="period">▼</button>
                    </div>
                </div>
                <div class="time-input">
                    <input type="text" id="selectedTime" placeholder="Selecciona hora" readonly>
                    <button class="now-btn">Ahora</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
        
        this.time = { hours: 0, minutes: 0, seconds: 0, period: 'AM' };
    }

    addTimeHandlers() {
        const upBtns = document.querySelectorAll('.time-btn.up');
        const downBtns = document.querySelectorAll('.time-btn.down');

        upBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const part = btn.dataset.part;
                this.incrementTime(part);
            });
        });

        downBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const part = btn.dataset.part;
                this.decrementTime(part);
            });
        });

        document.querySelector('.now-btn').addEventListener('click', () => {
            this.setNow();
        });
    }

    incrementTime(part) {
        if (part === 'hours') {
            this.time.hours = (this.time.hours + 1) % 12;
        } else if (part === 'minutes') {
            this.time.minutes = (this.time.minutes + 1) % 60;
        } else if (part === 'seconds') {
            this.time.seconds = (this.time.seconds + 1) % 60;
        } else if (part === 'period') {
            this.time.period = this.time.period === 'AM' ? 'PM' : 'AM';
        }
        this.updateDisplay();
    }

    decrementTime(part) {
        if (part === 'hours') {
            this.time.hours = (this.time.hours - 1 + 12) % 12;
        } else if (part === 'minutes') {
            this.time.minutes = (this.time.minutes - 1 + 60) % 60;
        } else if (part === 'seconds') {
            this.time.seconds = (this.time.seconds - 1 + 60) % 60;
        } else if (part === 'period') {
            this.time.period = this.time.period === 'AM' ? 'PM' : 'AM';
        }
        this.updateDisplay();
    }

    setNow() {
        const now = new Date();
        let hours = now.getHours();
        this.time.period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        
        this.time.hours = hours;
        this.time.minutes = now.getMinutes();
        this.time.seconds = now.getSeconds();
        
        this.updateDisplay();
    }

    updateDisplay() {
        document.getElementById('hours').textContent = String(this.time.hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(this.time.minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(this.time.seconds).padStart(2, '0');
        document.getElementById('period').textContent = this.time.period;
        
        const timeString = `${String(this.time.hours).padStart(2, '0')}:${String(this.time.minutes).padStart(2, '0')}:${String(this.time.seconds).padStart(2, '0')} ${this.time.period}`;
        document.getElementById('selectedTime').value = timeString;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoTimePicker();
});