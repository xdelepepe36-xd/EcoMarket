/**
 * EcoMarket - Sistema de Temas Mejorado
 * Funcionalidades avanzadas para gestión de temas
 */

const EcoThemes = {
    // Configuración de temas
    themes: {
        light: {
            name: 'Claro',
            icon: 'bi-sun',
            description: 'Tema claro por defecto'
        },
        dark: {
            name: 'Oscuro',
            icon: 'bi-moon',
            description: 'Modo oscuro mejorado'
        },
        sepia: {
            name: 'Sepia',
            icon: 'bi-book',
            description: 'Tonos cálidos como papel antiguo'
        },
        nature: {
            name: 'Naturaleza',
            icon: 'bi-tree',
            description: 'Tonos verdes y marrones'
        },
        ocean: {
            name: 'Océano',
            icon: 'bi-water',
            description: 'Tonos azules'
        },
        midnight: {
            name: 'Medianoche',
            icon: 'bi-stars',
            description: 'Más oscuro que dark mode'
        },
        rose: {
            name: 'Rosa',
            icon: 'bi-heart',
            description: 'Tema pastel rosa'
        },
        'high-contrast': {
            name: 'Alto Contraste',
            icon: 'bi-eye',
            description: 'Para accesibilidad'
        }
    },

    // Tema actual
    currentTheme: null,

    // Inicializar
    init() {
        this.currentTheme = localStorage.getItem('ecomarket-theme') || 'light';
        this.applyTheme(this.currentTheme);
        this.initThemeSelector();
        this.initAutoTheme();
    },

    // Aplicar tema
    applyTheme(theme) {
        if (!this.themes[theme]) {
            console.warn(`Tema "${theme}" no existe, usando light`);
            theme = 'light';
        }
        
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('ecomarket-theme', theme);
        
        // Actualizar icono del toggle
        this.updateToggleIcon();
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    },

    // Cambiar al siguiente tema
    nextTheme() {
        const themeKeys = Object.keys(this.themes);
        const currentIndex = themeKeys.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        this.applyTheme(themeKeys[nextIndex]);
    },

    // Cambiar al tema anterior
    prevTheme() {
        const themeKeys = Object.keys(this.themes);
        const currentIndex = themeKeys.indexOf(this.currentTheme);
        const prevIndex = (currentIndex - 1 + themeKeys.length) % themeKeys.length;
        this.applyTheme(themeKeys[prevIndex]);
    },

    // Actualizar icono del toggle
    updateToggleIcon() {
        const toggleBtn = document.querySelector('[data-theme-switcher]');
        if (toggleBtn) {
            const themeInfo = this.themes[this.currentTheme];
            toggleBtn.innerHTML = `<i class="bi ${themeInfo.icon}"></i>`;
            toggleBtn.setAttribute('title', `Tema: ${themeInfo.name}`);
        }
    },

    // Inicializar selector de temas (dropdown)
    initThemeSelector() {
        // Verificar si ya existe el selector
        if (document.querySelector('#themeDropdown')) return;

        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        // Crear contenedor del dropdown
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'theme-dropdown-container';
        dropdownContainer.innerHTML = `
            <button class="theme-selector-btn" id="themeSelectorBtn" aria-label="Seleccionar tema">
                <i class="bi ${this.themes[this.currentTheme].icon}"></i>
                <i class="bi bi-chevron-down"></i>
            </button>
            <div class="theme-dropdown" id="themeDropdown">
                ${Object.entries(this.themes).map(([key, theme]) => `
                    <button class="theme-option ${key === this.currentTheme ? 'active' : ''}" 
                            data-theme="${key}" 
                            title="${theme.description}">
                        <i class="bi ${theme.icon}"></i>
                        <span>${theme.name}</span>
                        ${key === this.currentTheme ? '<i class="bi bi-check"></i>' : ''}
                    </button>
                `).join('')}
            </div>
        `;

        // Insertar antes del toggle existente
        const existingToggle = document.querySelector('[data-theme-switcher]');
        if (existingToggle) {
            headerActions.insertBefore(dropdownContainer, existingToggle);
        } else {
            headerActions.appendChild(dropdownContainer);
        }

        // Event listeners
        const selectorBtn = dropdownContainer.querySelector('#themeSelectorBtn');
        const dropdown = dropdownContainer.querySelector('#themeDropdown');

        selectorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });

        // Seleccionar tema
        dropdown.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.applyTheme(theme);
                
                // Actualizar estado activo
                dropdown.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Actualizar icono del selector
                selectorBtn.querySelector('i:first-child').className = `bi ${this.themes[theme].icon}`;
            });
        });
    },

    // Inicializar tema automático según hora del día
    initAutoTheme() {
        const autoTheme = localStorage.getItem('ecomarket-auto-theme');
        
        if (autoTheme === 'true') {
            this.applyAutoTheme();
            
            // Verificar cada minuto
            setInterval(() => this.applyAutoTheme(), 60000);
        }
    },

    // Aplicar tema automático
    applyAutoTheme() {
        const hour = new Date().getHours();
        
        // Modo oscuro entre 19:00 y 7:00
        if (hour >= 19 || hour < 7) {
            this.applyTheme('dark');
        } else {
            this.applyTheme('light');
        }
    },

    // Activar/desactivar tema automático
    toggleAutoTheme() {
        const current = localStorage.getItem('ecomarket-auto-theme') === 'true';
        localStorage.setItem('ecomarket-auto-theme', !current);
        
        if (!current) {
            this.applyAutoTheme();
        }
        
        return !current;
    },

    // Obtener información del tema actual
    getCurrentThemeInfo() {
        return this.themes[this.currentTheme];
    },

    // Obtener todos los temas disponibles
    getAllThemes() {
        return this.themes;
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoThemes.init());
} else {
    EcoThemes.init();
}

// Exponer globalmente
window.EcoThemes = EcoThemes;
