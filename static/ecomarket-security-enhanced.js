/**
 * EcoMarket - Mejoras de Seguridad Adicionales
 * Seguridad mejorada en el frontend
 */

const EcoSecurity = {
    // Configuración de seguridad
    config: {
        maxLoginAttempts: 5,
        lockoutTime: 15 * 60 * 1000, // 15 minutos
        sessionTimeout: 30 * 60 * 1000, // 30 minutos
        csrfToken: null,
        sanitizeInput: true,
        validateOnSubmit: true
    },
    
    // Estado de seguridad
    state: {
        loginAttempts: 0,
        lockedUntil: null,
        lastActivity: Date.now(),
        securityEvents: []
    },
    
    init() {
        this.initCSRFProtection();
        this.initSessionTimeout();
        this.initInputValidation();
        this.initXSSProtection();
        this.initContentSecurityPolicy();
        this.initSecurityMonitoring();
        this.initSecureStorage();
    },
    
    // Protección CSRF mejorada
    initCSRFProtection() {
        // Obtener token CSRF del servidor
        this.config.csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || 
                                document.querySelector('input[name="csrf_token"]')?.value;
        
        // Interceptar todas las solicitudes POST
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE') {
                const headers = options.headers || {};
                if (!headers['X-CSRF-Token'] && EcoSecurity.config.csrfToken) {
                    headers['X-CSRF-Token'] = EcoSecurity.config.csrfToken;
                }
                options.headers = headers;
            }
            return originalFetch(url, options);
        };
        
        // Agregar token a formularios
        document.querySelectorAll('form').forEach(form => {
            if (!form.querySelector('input[name="csrf_token"]') && this.config.csrfToken) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'csrf_token';
                input.value = this.config.csrfToken;
                form.appendChild(input);
            }
        });
    },
    
    // Timeout de sesión
    initSessionTimeout() {
        // Actualizar última actividad
        this.updateActivity();
        
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => this.updateActivity());
        });
        
        // Verificar timeout cada minuto
        setInterval(() => this.checkSessionTimeout(), 60000);
    },
    
    updateActivity() {
        this.state.lastActivity = Date.now();
    },
    
    checkSessionTimeout() {
        const inactiveTime = Date.now() - this.state.lastActivity;
        
        if (inactiveTime > this.config.sessionTimeout) {
            this.logSecurityEvent('session_timeout', 'Session expired due to inactivity');
            this.logoutUser();
        } else if (inactiveTime > this.config.sessionTimeout - 5 * 60 * 1000) {
            // Mostrar advertencia 5 minutos antes
            this.showSessionWarning();
        }
    },
    
    showSessionWarning() {
        if (window.EcoToast) {
            EcoToast.show(
                'Sesión por expirar',
                'Tu sesión expirará pronto por inactividad',
                'warning',
                10000
            );
        }
    },
    
    logoutUser() {
        // Redirigir a logout
        window.location.href = '/logout';
    },
    
    // Validación de input
    initInputValidation() {
        // Sanitizar inputs en tiempo real
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                if (this.config.sanitizeInput) {
                    this.sanitizeInput(e.target);
                }
            }
        });
        
        // Validar formularios al submit
        if (this.config.validateOnSubmit) {
            document.addEventListener('submit', (e) => {
                if (e.target.tagName === 'FORM') {
                    if (!this.validateForm(e.target)) {
                        e.preventDefault();
                    }
                }
            });
        }
    },
    
    sanitizeInput(element) {
        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<[^>]*on\w+\s*=[^>]*>/gi
        ];
        
        let value = element.value;
        let wasSanitized = false;
        
        dangerousPatterns.forEach(pattern => {
            if (pattern.test(value)) {
                value = value.replace(pattern, '');
                wasSanitized = true;
            }
        });
        
        if (wasSanitized) {
            element.value = value;
            this.logSecurityEvent('input_sanitized', `Sanitized input in ${element.name || element.id}`);
        }
    },
    
    validateForm(form) {
        let isValid = true;
        const errors = [];
        
        // Validar campos requeridos
        form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                errors.push(`${field.name || field.id} es requerido`);
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });
        
        // Validar email
        form.querySelectorAll('input[type="email"]').forEach(field => {
            if (field.value && !this.isValidEmail(field.value)) {
                isValid = false;
                errors.push(`${field.name || field.id} no es un email válido`);
                field.classList.add('error');
            }
        });
        
        // Validar contraseña
        form.querySelectorAll('input[type="password"]').forEach(field => {
            if (field.value && field.value.length < 8) {
                isValid = false;
                errors.push(`${field.name || field.id} debe tener al menos 8 caracteres`);
                field.classList.add('error');
            }
        });
        
        if (!isValid && window.EcoToast) {
            EcoToast.show('Error de validación', errors.join(', '), 'error');
        }
        
        return isValid;
    },
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailRegex.test(email);
    },
    
    // Protección XSS
    initXSSProtection() {
        // Sanitizar HTML dinámico
        const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(html) {
                // Sanitizar HTML antes de asignar
                const sanitized = EcoSecurity.sanitizeHTML(html);
                originalInnerHTML.set.call(this, sanitized);
            },
            get: function() {
                return originalInnerHTML.get.call(this);
            }
        });
    },
    
    sanitizeHTML(html) {
        // Sanitización básica de HTML
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    },
    
    // Content Security Policy (cliente)
    initContentSecurityPolicy() {
        // Monitorear violaciones de CSP
        document.addEventListener('securitypolicyviolation', (e) => {
            this.logSecurityEvent('csp_violation', {
                violatedDirective: e.violatedDirective,
                blockedURI: e.blockedURI,
                originalPolicy: e.originalPolicy
            });
        });
    },
    
    // Monitoreo de seguridad
    initSecurityMonitoring() {
        // Detectar ataques comunes
        this.detectSQLInjection();
        this.detectXSSAttempts();
        this.detectSuspiciousActivity();
    },
    
    detectSQLInjection() {
        // Detectar patrones de SQL injection en URLs
        const sqlPatterns = [
            /(\bunion\b.*\bselect\b)/gi,
            /(\bor\b.*1\s*=\s*1)/gi,
            /(\bdrop\b.*\btable\b)/gi,
            /(\bexec\b.*\bxp_cmdshell\b)/gi
        ];
        
        const url = window.location.href;
        sqlPatterns.forEach(pattern => {
            if (pattern.test(url)) {
                this.logSecurityEvent('sql_injection_attempt', { url });
                this.blockSuspiciousActivity();
            }
        });
    },
    
    detectXSSAttempts() {
        // Detectar patrones XSS en parámetros URL
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi
        ];
        
        const params = new URLSearchParams(window.location.search);
        params.forEach((value, key) => {
            xssPatterns.forEach(pattern => {
                if (pattern.test(value)) {
                    this.logSecurityEvent('xss_attempt', { param: key, value });
                    this.blockSuspiciousActivity();
                }
            });
        });
    },
    
    detectSuspiciousActivity() {
        // Detectar actividad sospechosa
        let clickCount = 0;
        let clickThreshold = 50; // clicks por segundo
        let clickTimeframe = 1000;
        
        document.addEventListener('click', () => {
            clickCount++;
            setTimeout(() => clickCount--, clickTimeframe);
            
            if (clickCount > clickThreshold) {
                this.logSecurityEvent('suspicious_activity', { type: 'rapid_clicking' });
                this.blockSuspiciousActivity();
            }
        });
    },
    
    blockSuspiciousActivity() {
        // Bloquear actividad sospechosa
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0;">
                <div style="text-align: center; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <h2 style="color: #e74c3c;">🛡️ Actividad Sospechosa Detectada</h2>
                    <p>Por razones de seguridad, hemos bloqueado esta actividad.</p>
                    <p>Si esto es un error, por favor contacta al soporte.</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Recargar Página</button>
                </div>
            </div>
        `;
    },
    
    // Almacenamiento seguro
    initSecureStorage() {
        // Encriptar datos sensibles en localStorage
        const originalSetItem = localStorage.setItem;
        const originalGetItem = localStorage.getItem;
        
        localStorage.setItem = function(key, value) {
            if (EcoSecurity.isSensitiveKey(key)) {
                value = EcoSecurity.encrypt(value);
            }
            originalSetItem.call(this, key, value);
        };
        
        localStorage.getItem = function(key) {
            const value = originalGetItem.call(this, key);
            if (value && EcoSecurity.isSensitiveKey(key)) {
                return EcoSecurity.decrypt(value);
            }
            return value;
        };
    },
    
    isSensitiveKey(key) {
        const sensitiveKeys = ['password', 'token', 'credit_card', 'ssn', 'personal'];
        return sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive));
    },
    
    encrypt(text) {
        // Encriptación simple (para producción usar algo más robusto)
        return btoa(encodeURIComponent(text));
    },
    
    decrypt(encoded) {
        // Desencriptación simple
        return decodeURIComponent(atob(encoded));
    },
    
    // Logging de eventos de seguridad
    logSecurityEvent(type, details) {
        const event = {
            type: type,
            details: details,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.state.securityEvents.push(event);
        
        // Guardar en localStorage
        try {
            const events = JSON.parse(localStorage.getItem('ecomarket_security_events') || '[]');
            events.push(event);
            if (events.length > 100) events.shift(); // Mantener solo últimos 100
            localStorage.setItem('ecomarket_security_events', JSON.stringify(events));
        } catch (e) {
            console.error('Error saving security event:', e);
        }
        
        // Enviar al servidor si está disponible
        this.sendSecurityEventToServer(event);
    },
    
    sendSecurityEventToServer(event) {
        fetch('/api/security/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': this.config.csrfToken
            },
            body: JSON.stringify(event)
        }).catch(e => console.error('Error sending security event:', e));
    },
    
    // Utilidades de seguridad
    generateSecureId() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },
    
    validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoSecurity.init());
} else {
    EcoSecurity.init();
}

// Exponer globalmente
window.EcoSecurity = EcoSecurity;