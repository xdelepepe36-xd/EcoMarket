/**
 * eco-validation.js — Validación de formularios en el cliente
 *
 * Proporciona utilidades reutilizables:
 *   - validación de email, nombre, dirección y teléfono
 *   - medidor de fuerza de contraseña (barra + texto)
 *   - resaltado de errores en campos
 *
 * Usado por registro (registro.html), login (login.html) y checkout (checkout.html).
 */
const EcoValidation = (() => {
  const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

  const validators = {
    email: (v) => EMAIL_RE.test((v || '').trim()),
    nombre: (v) => {
      const s = (v || '').trim();
      return s.length >= 2 && s.length <= 80 && /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' ]+$/.test(s);
    },
    direccion: (v) => {
      const s = (v || '').trim();
      return s.length >= 8 && s.length <= 120 && /\d/.test(s) && /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(s);
    },
    telefono: (v) => {
      const s = (v || '').trim();
      if (!s) return true; // opcional
      const limpio = s.replace(/[\s\-()]/g, '');
      return /^\d{7,15}$/.test(limpio);
    },
    ciudad: (v) => (v || '').trim().length >= 2,
    required: (v) => (v || '').trim().length > 0
  };

  const validate = (fieldEl) => {
    const rules = (fieldEl.dataset.validate || '').split(',').map((s) => s.trim()).filter(Boolean);
    const value = fieldEl.value;
    for (const rule of rules) {
      const fn = validators[rule];
      if (fn && !fn(value)) {
        return { ok: false, rule };
      }
    }
    return { ok: rules.length === 0 ? true : true, rule: '' };
  };

  // ── Resaltado de errores ──
  const setError = (fieldEl, message) => {
    fieldEl.classList.remove('eco-valid');
    fieldEl.classList.add('eco-invalid');
    fieldEl.setAttribute('aria-invalid', 'true');
    let tip = fieldEl.parentElement.querySelector('.eco-field-error');
    if (message && !tip) {
      tip = document.createElement('small');
      tip.className = 'eco-field-error';
      tip.style.cssText = 'display:block;color:#b91c1c;font-size:0.75rem;margin-top:4px;font-weight:600;';
      fieldEl.parentElement.appendChild(tip);
    }
    if (tip) tip.textContent = message || '';
  };

  const setValid = (fieldEl) => {
    fieldEl.classList.remove('eco-invalid');
    fieldEl.classList.add('eco-valid');
    fieldEl.removeAttribute('aria-invalid');
    const tip = fieldEl.parentElement.querySelector('.eco-field-error');
    if (tip) tip.textContent = '';
  };

  // ── Medidor de fuerza de contraseña ──
  const passwordScore = (value) => {
    if (!value) return 0;
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
  };

  const passwordLevels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];

  const attachPasswordMeter = (inputEl, opts = {}) => {
    if (!inputEl) return null;
    const bar = opts.bar || document.querySelector('[data-password-bar]');
    const label = opts.label || document.querySelector('[data-password-label]');
    const attr = opts.attrBar || '[data-password-bar]';
    const barEl = document.querySelector(attr);

    const update = () => {
      const score = passwordScore(inputEl.value);
      const level = passwordLevels[score];
      if (bar || barEl) {
        const b = bar || barEl;
        b.style.width = `${score * 25}%`;
        const color = ['#b91c1c', '#ea580c', '#eab308', '#65a30d', '#16a34a'][score];
        b.style.background = color;
      }
      if (label) label.textContent = inputEl.value ? level : '';
      if (label) {
        const colors = ['#b91c1c', '#ea580c', '#eab308', '#65a30d', '#16a34a'];
        label.style.color = inputEl.value ? colors[score] : '';
      }
      // Clases para i18n opcional
      const n = inputEl.closest('.form-group, .auth-field, form')?.querySelector('[data-password-label]');
      if (n) {
        const keys = ['auth.very_weak', 'auth.weak', 'auth.fair', 'auth.strong', 'auth.very_strong'];
        if (window.EcoI18n) n.textContent = inputEl.value ? EcoI18n.t(keys[score], {}, level) : '';
      }
    };

    inputEl.addEventListener('input', update);
    update();
    return { update };
  };

  // ── Validación en vivo de un formulario ──
  const enableLiveValidation = (formEl) => {
    if (!formEl) return;
    formEl.querySelectorAll('[data-validate]').forEach((el) => {
      const show = (ev) => {
        const res = validate(el);
        if (res.ok) {
          setValid(el);
        } else {
          let msg = '';
          const map = {
            email: 'Ingresa un correo válido.',
            nombre: 'Solo letras, mínimo 2 caracteres.',
            direccion: 'Dirección completa (calle y número).',
            telefono: 'Teléfono inválido (7-15 dígitos).',
            ciudad: 'Ingresa tu ciudad.',
            required: 'Campo obligatorio.'
          };
          msg = map[res.rule] || 'Dato inválido.';
          if (window.EcoI18n) {
            const k = {
              email: 'auth.invalid_email', nombre: 'auth.invalid_name',
              direccion: 'checkout.invalid_address', telefono: 'checkout.invalid_phone',
              ciudad: 'checkout.invalid_city', required: 'auth.invalid_required'
            }[res.rule];
            msg = EcoI18n.t(k, {}, msg);
          }
          setError(el, msg);
        }
      };
      el.addEventListener('blur', show);
      el.addEventListener('input', () => {
        if (el.classList.contains('eco-invalid')) show();
      });
    });
  };

  return { validators, validate, setError, setValid, passwordScore, passwordLevels, attachPasswordMeter, enableLiveValidation };
})();

window.EcoValidation = EcoValidation;