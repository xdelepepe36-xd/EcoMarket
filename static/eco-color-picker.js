// Color Picker - Selector de color
class EcoColorPicker {
    constructor() {
        this.init();
    }

    init() {
        this.createColorPicker();
        this.addColorHandlers();
    }

    createColorPicker() {
        const container = document.createElement('div');
        container.className = 'color-picker-container';
        container.innerHTML = `
            <h3🎨 Selector de color</h3>
            <div class="color-picker">
                <div class="color-preview" id="colorPreview" style="background: #2ecc71;"></div>
                <div class="color-palette">
                    <div class="color-swatch" data-color="#2ecc71" style="background: #2ecc71;"></div>
                    <div class="color-swatch" data-color="#3498db" style="background: #3498db;"></div>
                    <div class="color-swatch" data-color="#e74c3c" style="background: #e74c3c;"></div>
                    <div class="color-swatch" data-color="#f39c12" style="background: #f39c12;"></div>
                    <div class="color-swatch" data-color="#9b59b6" style="background: #9b59b6;"></div>
                    <div class="color-swatch" data-color="#1abc9c" style="background: #1abc9c;"></div>
                    <div class="color-swatch" data-color="#34495e" style="background: #34495e;"></div>
                    <div class="color-swatch" data-color="#ffffff" style="background: #ffffff;"></div>
                </div>
                <div class="color-inputs">
                    <div class="input-group">
                        <label>Hex:</label>
                        <input type="text" id="hexInput" value="#2ecc71">
                    </div>
                    <div class="input-group">
                        <label>RGB:</label>
                        <input type="text" id="rgbInput" value="rgb(46, 204, 113)">
                    </div>
                </div>
                <input type="color" id="nativePicker" value="#2ecc71" style="display: none;">
                <button class="native-picker-btn">Selector nativo</button>
            </div>
        `;
        document.body.appendChild(container);
    }

    addColorHandlers() {
        const swatches = document.querySelectorAll('.color-swatch');
        const preview = document.getElementById('colorPreview');
        const hexInput = document.getElementById('hexInput');
        const rgbInput = document.getElementById('rgbInput');
        const nativePicker = document.getElementById('nativePicker');
        const nativeBtn = document.querySelector('.native-picker-btn');

        swatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                const color = swatch.dataset.color;
                this.setColor(color);
            });
        });

        hexInput.addEventListener('input', (e) => {
            const color = e.target.value;
            if (this.isValidHex(color)) {
                this.setColor(color);
            }
        });

        nativeBtn.addEventListener('click', () => {
            nativePicker.click();
        });

        nativePicker.addEventListener('input', (e) => {
            this.setColor(e.target.value);
        });
    }

    setColor(color) {
        const preview = document.getElementById('colorPreview');
        const hexInput = document.getElementById('hexInput');
        const rgbInput = document.getElementById('rgbInput');
        const nativePicker = document.getElementById('nativePicker');

        preview.style.background = color;
        hexInput.value = color;
        rgbInput.value = this.hexToRgb(color);
        nativePicker.value = color;
    }

    isValidHex(hex) {
        return /^#[0-9A-F]{6}$/i.test(hex);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : 
            'rgb(0, 0, 0)';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoColorPicker();
});