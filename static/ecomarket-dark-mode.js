// Sistema de Modo Oscuro con Persistencia
(function() {
    'use strict';

    const ThemeManager = {
        // Verificar preferencia del sistema
        getSystemPreference() {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        },

        // Obtener tema guardado o usar preferencia del sistema
        getSavedTheme() {
            const saved = localStorage.getItem('ecomarket-theme');
            if (saved) return saved;
            return this.getSystemPreference();
        },

        // Aplicar tema al documento
        applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('ecomarket-theme', theme);
            this.updateToggleIcon(theme);
            
            // Disparar evento personalizado
            document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
        },

        // Cambiar tema
        toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // Agregar animación
            document.body.classList.add('theme-switching');
            
            setTimeout(() => {
                this.applyTheme(newTheme);
                document.body.classList.remove('theme-switching');
            }, 150);
        },

        // Actualizar icono del botón
        updateToggleIcon(theme) {
            const toggle = document.querySelector('.theme-toggle');
            if (!toggle) return;

            const sunIcon = toggle.querySelector('.icon-sun');
            const moonIcon = toggle.querySelector('.icon-moon');

            if (theme === 'dark') {
                if (sunIcon) sunIcon.style.display = 'block';
                if (moonIcon) moonIcon.style.display = 'none';
            } else {
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'block';
            }
        },

        // Crear botón de cambio de tema
        createToggleButton() {
            // Verificar si ya existe
            if (document.querySelector('.theme-toggle')) return;

            const button = document.createElement('button');
            button.className = 'theme-toggle';
            button.setAttribute('aria-label', 'Cambiar tema');
            button.setAttribute('title', 'Cambiar entre modo claro y oscuro');
            button.innerHTML = `
                <span class="icon-moon">🌙</span>
                <span class="icon-sun">☀️</span>
            `;

            button.addEventListener('click', () => this.toggleTheme());
            document.body.appendChild(button);
        },

        // Inicializar sistema de temas
        init() {
            // Aplicar tema guardado
            const theme = this.getSavedTheme();
            this.applyTheme(theme);

            // Crear botón de cambio
            this.createToggleButton();

            // Escuchar cambios en preferencia del sistema
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('ecomarket-theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });

            // Escuchar atajos de teclado
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + Shift + D para cambiar tema
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });

            console.log('🎨 Theme Manager inicializado:', theme);
        }
    };

    // Exponer al scope global
    window.EcoTheme = ThemeManager;

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
    } else {
        ThemeManager.init();
    }

    // API para control programático
    window.EcoThemeAPI = {
        setTheme: (theme) => ThemeManager.applyTheme(theme),
        getTheme: () => document.documentElement.getAttribute('data-theme') || 'light',
        toggle: () => ThemeManager.toggleTheme(),
        reset: () => {
            localStorage.removeItem('ecomarket-theme');
            ThemeManager.applyTheme(ThemeManager.getSystemPreference());
        }
    };

})();

// Integración con otros módulos de EcoMarket
(function() {
    'use strict';

    // Escuchar cambios de tema para ajustar otros componentes
    document.addEventListener('themeChanged', (e) => {
        const theme = e.detail.theme;
        
        // Ajustar colores en gráficos si existen
        if (window.EcoCharts) {
            EcoCharts.updateTheme(theme);
        }

        // Ajustar mapa si existe
        if (window.EcoMap) {
            EcoMap.updateTheme(theme);
        }

        // Notificar a los usuarios que usan screen readers
        const notification = document.createElement('div');
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.className = 'sr-only';
        notification.textContent = `Tema cambiado a modo ${theme === 'dark' ? 'oscuro' : 'claro'}`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 1000);
    });

})();