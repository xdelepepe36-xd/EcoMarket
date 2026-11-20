/**
 * EcoMarket - Validación de formularios en cliente
 * EcoValidation: validators, setError/clearError, medidor de contraseña
 * y validación en vivo. Reglas alineadas con el backend (app.py).
 */
const EcoValidation = {
    validators: {
        nombre(v) {
            return typeof v === 'string' && /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]{2,80}$/.test(v.trim());
        },
        email(v) {
            return typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim()) && !v.includes('..');
        },
        telefono(v) {
            const digits = (v || '').replace(/\D/g, '');
            return digits.length >= 6 && digits.length <= 15;
        },
        direccion(v) {
            return typeof v === 'string' && v.trim().length >= 5 && v.trim().length <= 200;
        },
        ciudad(v) {
            return typeof v === 'string' && v.trim().length >= 2 && v.trim().length <= 80;
        },
        password(v) {
            if (!v || v.length < 8) return false;
            if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return false;
            if (/\s/.test(v)) return false;
            return true;
        }
    },

    setError(el, msg) {
        if (!el) return;
        el.classList.add('is-invalid', 'field-error');
        el.setAttribute('aria-invalid', 'true');
        let hint = el.parentElement ? el.parentElement.querySelector('.field-error-msg') : null;
        if (!hint) {
            hint = document.createElement('small');
            hint.className = 'field-error-msg';
            hint.style.cssText = 'display:block;color:#c62828;font-size:0.78rem;margin-top:4px;';
            (el.parentElement || el).appendChild(hint);
        }
        hint.textContent = msg;
        hint.style.display = 'block';
    },

    clearError(el) {
        if (!el) return;
        el.classList.remove('is-invalid', 'field-error');
        el.removeAttribute('aria-invalid');
        const hint = el.parentElement ? el.parentElement.querySelector('.field-error-msg') : null;
        if (hint) hint.style.display = 'none';
    },

    attachPasswordMeter(input) {
        if (!input || input.dataset.pwMeter) return;
        input.dataset.pwMeter = '1';

        const meter = document.createElement('div');
        meter.className = 'pw-meter';
        meter.style.cssText = 'margin-top:6px;';
        meter.innerHTML = `
            <div style="display:flex;gap:4px;height:6px;border-radius:3px;overflow:hidden;background:#eee;">
                <div class="pw-seg" style="flex:1;background:#eee;"></div>
                <div class="pw-seg" style="flex:1;background:#eee;"></div>
                <div class="pw-seg" style="flex:1;background:#eee;"></div>
                <div class="pw-seg" style="flex:1;background:#eee;"></div>
            </div>
            <small class="pw-hint" style="display:block;margin-top:4px;font-size:0.78rem;color:#777;"></small>
        `;
        input.insertAdjacentElement('afterend', meter);
        const segs = meter.querySelectorAll('.pw-seg');
        const hint = meter.querySelector('.pw-hint');

        const score = (v) => {
            let s = 0;
            if (!v) return 0;
            if (v.length >= 8) s++;
            if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
            if (/\d/.test(v)) s++;
            if (/[^A-Za-z0-9]/.test(v)) s++;
            return s;
        };

        const update = () => {
            const v = input.value || '';
            const s = score(v);
            const colors = ['#eee', '#e53935', '#fb8c00', '#fdd835', '#43a047'];
            segs.forEach((seg, i) => {
                seg.style.background = i < s ? colors[s] : '#eee';
            });
            const msgs = ['', 'Muy débil', 'Débil', 'Aceptable', 'Fuerte'];
            hint.textContent = v ? msgs[s] : 'Mínimo 8 caracteres, letras y números';
            hint.style.color = ['#777', '#e53935', '#fb8c00', '#f9a825', '#43a047'][s];
        };

        input.addEventListener('input', update);
        update();
    },

    enableLiveValidation(form) {
        if (!form) return;
        const rules = {
            nombre: 'nombre', apellido: 'nombre', email: 'email', telefono: 'telefono',
            direccion: 'direccion', ciudad: 'ciudad', password: 'password'
        };
        const fieldMsg = {
            nombre: 'Nombre inválido', apellido: 'Apellido inválido', email: 'Email inválido',
            telefono: 'Teléfono inválido', direccion: 'Dirección inválida',
            ciudad: 'Ciudad inválida', password: 'Contraseña muy débil (mín. 8, letras y números)'
        };

        const validateField = (input) => {
            const rule = rules[input.name];
            if (!rule) return true;
            const ok = this.validators[rule](input.value);
            if (ok) {
                this.clearError(input);
            } else if (input.value) {
                this.setError(input, fieldMsg[rule]);
            }
            return ok;
        };

        form.querySelectorAll('input[name]').forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid') || input.classList.contains('field-error')) {
                    validateField(input);
                }
            });
        });

        form.addEventListener('submit', (e) => {
            let firstBad = null;
            form.querySelectorAll('input[name]').forEach(input => {
                const rule = rules[input.name];
                if (!rule) return;
                if (!this.validators[rule](input.value)) {
                    this.setError(input, fieldMsg[rule]);
                    if (!firstBad) firstBad = input;
                }
            });
            if (firstBad) {
                e.preventDefault();
                e.stopPropagation();
                firstBad.focus();
            }
        }, true);
    }
};

window.EcoValidation = EcoValidation;
