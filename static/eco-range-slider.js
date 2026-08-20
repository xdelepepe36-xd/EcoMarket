// Range Slider - Slider de rango
class EcoRangeSlider {
    constructor() {
        this.init();
    }

    init() {
        this.createRangeSlider();
        this.addSliderHandlers();
    }

    createRangeSlider() {
        const container = document.createElement('div');
        container.className = 'range-slider-container';
        container.innerHTML = `
            <h3>🎚️ Slider de rango</h3>
            <div class="range-slider">
                <div class="slider-header">
                    <span class="slider-label">Precio: S/. <span id="minValue">0</span> - S/. <span id="maxValue">1000</span></span>
                </div>
                <div class="slider-track">
                    <div class="slider-range-highlight"></div>
                </div>
                <div class="slider-thumbs">
                    <input type="range" class="slider-thumb" id="minSlider" min="0" max="1000" value="0">
                    <input type="range" class="slider-thumb" id="maxSlider" min="0" max="1000" value="1000">
                </div>
                <div class="slider-values">
                    <div class="value-input">
                        <label>Mínimo:</label>
                        <input type="number" id="minInput" value="0" min="0" max="1000">
                    </div>
                    <div class="value-input">
                        <label>Máximo:</label>
                        <input type="number" id="maxInput" value="1000" min="0" max="1000">
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addSliderHandlers() {
        const minSlider = document.getElementById('minSlider');
        const maxSlider = document.getElementById('maxSlider');
        const minInput = document.getElementById('minInput');
        const maxInput = document.getElementById('maxInput');
        const minValue = document.getElementById('minValue');
        const maxValue = document.getElementById('maxValue');
        const highlight = document.querySelector('.slider-range-highlight');

        const updateSlider = () => {
            let min = parseInt(minSlider.value);
            let max = parseInt(maxSlider.value);

            if (min > max) {
                [min, max] = [max, min];
            }

            minSlider.value = min;
            maxSlider.value = max;
            minInput.value = min;
            maxInput.value = max;
            minValue.textContent = min;
            maxValue.textContent = max;

            const percent = ((max - min) / 1000) * 100;
            const leftPercent = (min / 1000) * 100;
            
            highlight.style.left = leftPercent + '%';
            highlight.style.width = percent + '%';
        };

        minSlider.addEventListener('input', updateSlider);
        maxSlider.addEventListener('input', updateSlider);
        minInput.addEventListener('input', () => {
            minSlider.value = minInput.value;
            updateSlider();
        });
        maxInput.addEventListener('input', () => {
            maxSlider.value = maxInput.value;
            updateSlider();
        });

        updateSlider();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoRangeSlider();
});