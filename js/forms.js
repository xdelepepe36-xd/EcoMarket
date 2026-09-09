/**
 * EcoMarket - Formularios y Validación
 * Sistema unificado de manejo de formularios
 */

class FormValidator {
    constructor(form, options = {}) {
        this.form = typeof form === 'string' ? document.querySelector(form) : form;
        this.options = {
            validateOnBlur: true,
            validateOnInput: false,
            validateOnSubmit: true,
            showErrors: true,
            errorClass: 'error',
            successClass: 'success',
            ...options
        };
        
        this.validators = {};
        this.errors = {};
        this.init();
    }

    /**
     * Inicializa el validador
     */
    init() {
        if (!this.form) return;

        // Configurar validación en blur
        if (this.options.validateOnBlur) {
            this.form.querySelectorAll('input, select, textarea').forEach(field => {
                field.addEventListener('blur', () => this.validateField(field));
            });
        }

        // Configurar validación en input
        if (this.options.validateOnInput) {
            this.form.querySelectorAll('input, select, textarea').forEach(field => {
                field.addEventListener('input', () => this.validateField(field));
            });
        }

        // Configurar validación en submit
        if (this.options.validateOnSubmit) {
            this.form.addEventListener('submit', (e) => {
                if (!this.validate()) {
                    e.preventDefault();
                    return false;
                }
            });
        }
    }

    /**
     * Añade regla de validación para un campo
     */
    addValidator(fieldName, rules) {
        this.validators[fieldName] = rules;
    }

    /**
     * Valida un campo específico
     */
    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.validators[fieldName];
        
        if (!rules) return true;

        let isValid = true;
        let errorMessage = '';

        // Validación required
        if (rules.required && !value) {
            isValid = false;
            errorMessage = rules.messages?.required || 'Este campo es obligatorio';
        }

        // Validación email
        if (isValid && rules.email && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = rules.messages?.email || 'Ingresa un email válido';
            }
        }

        // Validación minLength
        if (isValid && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.messages?.minLength || `Mínimo ${rules.minLength} caracteres`;
        }

        // Validación maxLength
        if (isValid && rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = rules.messages?.maxLength || `Máximo ${rules.maxLength} caracteres`;
        }

        // Validación pattern
        if (isValid && rules.pattern && value) {
            if (!rules.pattern.test(value)) {
                isValid = false;
                errorMessage = rules.messages?.pattern || 'Formato inválido';
            }
        }

        // Validación custom
        if (isValid && rules.custom && typeof rules.custom === 'function') {
            const customResult = rules.custom(value);
            if (customResult !== true) {
                isValid = false;
                errorMessage = customResult || rules.messages?.custom || 'Valor inválido';
            }
        }

        // Validación match (para confirmar contraseñas)
        if (isValid && rules.match && value) {
            const matchField = this.form.querySelector(`[name="${rules.match}"]`);
            if (matchField && matchField.value !== value) {
                isValid = false;
                errorMessage = rules.messages?.match || 'Los campos no coinciden';
            }
        }

        // Actualizar estado del campo
        this.updateFieldStatus(field, isValid, errorMessage);

        return isValid;
    }

    /**
     * Actualiza el estado visual del campo
     */
    updateFieldStatus(field, isValid, errorMessage) {
        const fieldName = field.name;
        
        // Remover clases anteriores
        field.classList.remove(this.options.errorClass, this.options.successClass);
        
        // Eliminar mensaje de error anterior
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        if (!isValid) {
            // Añadir clase de error
            field.classList.add(this.options.errorClass);
            this.errors[fieldName] = errorMessage;

            // Mostrar mensaje de error
            if (this.options.showErrors) {
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.textContent = errorMessage;
                field.parentNode.appendChild(errorElement);
            }
        } else {
            // Añadir clase de éxito si tiene valor
            if (field.value.trim()) {
                field.classList.add(this.options.successClass);
            }
            delete this.errors[fieldName];
        }
    }

    /**
     * Valida todo el formulario
     */
    validate() {
        let isValid = true;
        const fields = this.form.querySelectorAll('input, select, textarea');

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Obtiene los errores actuales
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Limpia todos los errores
     */
    clearErrors() {
        this.errors = {};
        this.form.querySelectorAll(`.${this.options.errorClass}, .${this.options.successClass}`).forEach(field => {
            field.classList.remove(this.options.errorClass, this.options.successClass);
        });
        this.form.querySelectorAll('.error-message').forEach(msg => msg.remove());
    }

    /**
     * Resetea el formulario
     */
    reset() {
        this.form.reset();
        this.clearErrors();
    }
}

// ==========================================
// Utilidades de formularios específicos
// ==========================================

/**
 * Configura validación de fuerza de contraseña
 */
function setupPasswordStrength(input, meter) {
    input.addEventListener('input', () => {
        const password = input.value;
        const strength = calculatePasswordStrength(password);
        updateStrengthMeter(meter, strength);
    });
}

/**
 * Calcula fuerza de contraseña
 */
function calculatePasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    return Math.min(score, 5);
}

/**
 * Actualiza medidor de fuerza de contraseña
 */
function updateStrengthMeter(meter, strength) {
    const levels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
    const colors = ['#dc3545', '#dc3545', '#ffc107', '#28a745', '#28a745'];
    const percentages = [20, 40, 60, 80, 100];

    meter.style.width = percentages[strength - 1] + '%';
    meter.style.backgroundColor = colors[strength - 1];
    meter.textContent = levels[strength - 1];
}

/**
 * Configura máscara de teléfono
 */
function setupPhoneMask(input) {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 11) {
            value = value.substring(0, 11);
        }

        if (value.length > 6) {
            value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
        } else if (value.length > 3) {
            value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }

        e.target.value = value;
    });
}

/**
 * Configura máscara de moneda
 */
function setupCurrencyMask(input, currency = 'S/') {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = (parseInt(value) / 100).toFixed(2);
        value = value.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        e.target.value = `${currency} ${value}`;
    });
}

/**
 * Configura autocomplete para direcciones
 */
function setupAddressAutocomplete(input, callback) {
    let debounceTimer;

    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        if (query.length < 3) return;

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/autocomplete/address?q=${encodeURIComponent(query)}`);
                const suggestions = await response.json();
                callback(suggestions);
            } catch (error) {
                console.error('Error en autocomplete:', error);
            }
        }, 300);
    });
}

/**
 * Configura subida de archivos con preview
 */
function setupFileUpload(input, previewContainer, options = {}) {
    const { maxFiles = 5, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;

    input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);

        if (files.length > maxFiles) {
            alert(`Máximo ${maxFiles} archivos permitidos`);
            return;
        }

        files.forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                alert(`Tipo de archivo no permitido: ${file.type}`);
                return;
            }

            if (file.size > maxSize) {
                alert(`El archivo excede el tamaño máximo de ${maxSize / 1024 / 1024}MB`);
                return;
            }

            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'file-preview';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button type="button" class="remove-file" data-name="${file.name}">×</button>
                `;
                previewContainer.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    });

    // Eliminar preview
    previewContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-file')) {
            e.target.parentElement.remove();
        }
    });
}

/**
 * Configura tags input
 */
function setupTagsInput(input, container, suggestions = []) {
    const tags = [];

    function addTag(tag) {
        if (tags.includes(tag)) return;
        tags.push(tag);
        renderTags();
        input.value = '';
    }

    function removeTag(tag) {
        const index = tags.indexOf(tag);
        if (index > -1) {
            tags.splice(index, 1);
            renderTags();
        }
    }

    function renderTags() {
        container.innerHTML = tags.map(tag => `
            <span class="tag">
                ${tag}
                <button type="button" class="remove-tag" data-tag="${tag}">×</button>
            </span>
        `).join('');
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = input.value.trim();
            if (tag) addTag(tag);
        }
    });

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-tag')) {
            removeTag(e.target.dataset.tag);
        }
    });

    return { tags, addTag, removeTag };
}

/**
 * Configura rating con estrellas
 */
function setupStarRating(container, input) {
    const stars = container.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
        });

        star.addEventListener('mouseleave', () => {
            highlightStars(parseInt(input.value) || 0);
        });

        star.addEventListener('click', () => {
            input.value = index + 1;
            highlightStars(index + 1);
        });
    });

    function highlightStars(count) {
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < count);
        });
    }
}

/**
 * Serializa formulario a objeto
 */
function serializeForm(form) {
    const formData = new FormData(form);
    const data = {};
    
    formData.forEach((value, key) => {
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    });

    return data;
}

/**
 * Deserializa objeto a formulario
 */
function deserializeForm(form, data) {
    Object.entries(data).forEach(([key, value]) => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = value;
            } else {
                field.value = value;
            }
        }
    });
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FormValidator,
        setupPasswordStrength,
        calculatePasswordStrength,
        updateStrengthMeter,
        setupPhoneMask,
        setupCurrencyMask,
        setupAddressAutocomplete,
        setupFileUpload,
        setupTagsInput,
        setupStarRating,
        serializeForm,
        deserializeForm
    };
}