// Date Picker - Selector de fecha
class EcoDatePicker {
    constructor() {
        this.init();
    }

    init() {
        this.createDatePicker();
        this.addDateHandlers();
    }

    createDatePicker() {
        const container = document.createElement('div');
        container.className = 'date-picker-container';
        container.innerHTML = `
            <h3>📅 Selector de fecha</h3>
            <div class="date-picker">
                <div class="date-header">
                    <button class="nav-btn prev-month">←</button>
                    <div class="current-month">Agosto 2026</div>
                    <button class="nav-btn next-month">→</button>
                </div>
                <div class="calendar-grid">
                    <div class="day-name">Dom</div>
                    <div class="day-name">Lun</div>
                    <div class="day-name">Mar</div>
                    <div class="day-name">Mié</div>
                    <div class="day-name">Jue</div>
                    <div class="day-name">Vie</div>
                    <div class="day-name">Sáb</div>
                </div>
                <div class="calendar-days" id="calendarDays"></div>
                <div class="date-input">
                    <input type="text" id="selectedDate" placeholder="Selecciona una fecha" readonly>
                    <button class="today-btn">Hoy</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
        
        this.currentDate = new Date();
        this.renderCalendar();
    }

    renderCalendar() {
        const calendarDays = document.getElementById('calendarDays');
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Actualizar título del mes
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        document.querySelector('.current-month').textContent = `${monthNames[month]} ${year}`;
        
        // Calcular días del mes
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        calendarDays.innerHTML = '';
        
        // Días vacíos antes del primer día del mes
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarDays.appendChild(emptyDay);
        }
        
        // Días del mes
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            dayElement.addEventListener('click', () => {
                this.selectDate(day, month, year);
            });
            
            calendarDays.appendChild(dayElement);
        }
    }

    addDateHandlers() {
        document.querySelector('.prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.querySelector('.next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        document.querySelector('.today-btn').addEventListener('click', () => {
            const today = new Date();
            this.selectDate(today.getDate(), today.getMonth(), today.getFullYear());
        });
    }

    selectDate(day, month, year) {
        const selectedDate = document.getElementById('selectedDate');
        const date = new Date(year, month, day);
        const formattedDate = date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        selectedDate.value = formattedDate;
        
        // Remover selección anterior
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        
        // Agregar selección al día actual
        const days = document.querySelectorAll('.calendar-day:not(.empty)');
        const dayIndex = day - 1;
        if (days[dayIndex]) {
            days[dayIndex].classList.add('selected');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoDatePicker();
});