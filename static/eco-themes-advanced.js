/**
 * eco-themes-advanced.js - Sistema de temas avanzado para EcoMarket
 * 
 * Funcionalidades:
 * - 7 temas: Claro, Oscuro, Eco (verde), Ocean (azul), Sunset (naranja), Forest (bosque), Alto Contraste
 * - Transiciones suaves entre temas
 * - Persistencia de preferencias
 * - Tema automático según hora del día
 * - Integración con sistema operativo
 * - Accesibilidad con modo alto contraste
 * - Variables sepia y ciudad en todos los temas
 * - Switcher completo con todos los temas
 */

class EcoThemesAdvanced {
    constructor(options = {}) {
        this.options = {
            storageKey: options.storageKey || 'ecomarket_theme',
            enableAutoTheme: options.enableAutoTheme !== false,
            enableSystemTheme: options.enableSystemTheme !== false,
            enableTransitions: options.enableTransitions !== false,
            transitionDuration: options.transitionDuration || 300,
            ...options
        };
        
        this.themes = {
            light: {
                name: 'Claro',
                icon: 'bi-sun',
                colors: {
                    background: '#ffffff',
                    text: '#333333',
                    primary: '#2e7d32',
                    secondary: '#4caf50',
                    accent: '#ff9800',
                    surface: '#f5f5f5',
                    border: '#e0e0e0'
                }
            },
            dark: {
                name: 'Oscuro',
                icon: 'bi-moon',
                colors: {
                    background: '#1a1a1a',
                    text: '#ffffff',
                    primary: '#4caf50',
                    secondary: '#2e7d32',
                    accent: '#ff9800',
                    surface: '#2a2a2a',
                    border: '#404040'
                }
            },
            eco: {
                name: 'Eco',
                icon: 'bi-tree',
                colors: {
                    background: '#e8f5e9',
                    text: '#1b5e20',
                    primary: '#2e7d32',
                    secondary: '#4caf50',
                    accent: '#8bc34a',
                    surface: '#c8e6c9',
                    border: '#a5d6a7'
                }
            },
            ocean: {
                name: 'Ocean',
                icon: 'bi-droplet',
                colors: {
                    background: '#e3f2fd',
                    text: '#0d47a1',
                    primary: '#1976d2',
                    secondary: '#2196f3',
                    accent: '#03a9f4',
                    surface: '#bbdefb',
                    border: '#90caf9'
                }
            },
            sunset: {
                name: 'Sunset',
                icon: 'bi-sunrise',
                colors: {
                    background: '#fff3e0',
                    text: '#e65100',
                    primary: '#ff5722',
                    secondary: '#ff9800',
                    accent: '#ffc107',
                    surface: '#ffe0b2',
                    border: '#ffcc80'
                }
            },
            forest: {
                name: 'Forest',
                icon: 'bi-tree-fill',
                colors: {
                    background: '#e8f5e9',
                    text: '#1b5e20',
                    primary: '#2e7d32',
                    secondary: '#66bb6a',
                    accent: '#81c784',
                    surface: '#c8e6c9',
                    border: '#a5d6a7'
                }
            },
            high_contrast: {
                name: 'Alto Contraste',
                icon: 'bi-eye',
                colors: {
                    background: '#000000',
                    text: '#ffffff',
                    primary: '#ffff00',
                    secondary: '#ffffff',
                    accent: '#00ffff',
                    surface: '#000000',
                    border: '#ffffff'
                }
            }
        };
        
        this.currentTheme = 'light';
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.createThemeUI();
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
        
        // Auto tema según hora
        if (this.options.enableAutoTheme) {
            this.setupAutoTheme();
        }
        
        // Integración con sistema operativo
        if (this.options.enableSystemTheme) {
            this.setupSystemTheme();
        }
    }
    
    createThemeUI() {
        const container = document.querySelector('[data-theme-switcher]');
        if (!container) return;
        
        const themesList = Object.entries(this.themes).map(([key, theme]) => `
            <button class="eco-theme-btn ${key === this.currentTheme ? 'active' : ''}" 
                    data-theme="${key}" 
                    title="${theme.name}"
                    style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid transparent; background: var(--gris-claro, #f5f5f5); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--texto, #333); transition: all 0.2s;">
                <i class="bi ${theme.icon}"></i>
            </button>
        `).join('');
        
        container.innerHTML = `
            <div class="eco-theme-switcher" style="position: fixed; top: 80px; right: 20px; background: var(--blanco, #ffffff); border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); padding: 12px; z-index: 1000; display: flex; gap: 8px; align-items: center;">
                ${themesList}
            </div>
        `;
    }
    
    setupEventListeners() {
        const container = document.querySelector('[data-theme-switcher]');
        if (!container) return;
        
        // Botones de tema
        container.querySelectorAll('.eco-theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.setTheme(theme);
            });
        });
        
        // Auto tema
        const autoThemeCheckbox = container.querySelector('#auto-theme');
        if (autoThemeCheckbox) {
            autoThemeCheckbox.addEventListener('change', (e) => {
                this.setAutoTheme(e.target.checked);
            });
        }
        
        // Sistema tema
        const systemThemeCheckbox = container.querySelector('#system-theme');
        if (systemThemeCheckbox) {
            systemThemeCheckbox.addEventListener('change', (e) => {
                this.setSystemTheme(e.target.checked);
            });
        }
    }
    
    setTheme(theme) {
        if (!this.themes[theme]) return;
        
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveTheme();
        this.updateThemeUI();
        
        // Emitir evento
        document.dispatchEvent(new CustomEvent('theme:changed', {
            detail: { theme, colors: this.themes[theme].colors }
        }));
    }
    
    applyTheme(theme) {
        const colors = this.themes[theme].colors;
        const root = document.documentElement;
        
        // Aplicar variables CSS
        root.style.setProperty('--blanco', colors.background);
        root.style.setProperty('--texto', colors.text);
        root.style.setProperty('--verde', colors.primary);
        root.style.setProperty('--verde-claro', colors.secondary);
        root.style.setProperty('--verde-oscuro', this.darkenColor(colors.primary, 20));
        root.style.setProperty('--accent', colors.accent);
        root.style.setProperty('--gris-claro', colors.surface);
        root.style.setProperty('--gris-oscuro', this.darkenColor(colors.surface, 10));
        root.style.setProperty('--gris-medio', colors.border);
        root.style.setProperty('--fondo-oscuro', colors.background);
        root.style.setProperty('--texto-claro', colors.text);
        root.style.setProperty('--texto-secundario', this.lightenColor(colors.text, 30));
        root.style.setProperty('--texto-secundario-claro', this.lightenColor(colors.text, 50));
        
        // Atributo data-theme
        root.setAttribute('data-theme', theme);
        
        // Clase para estilos específicos
        root.className = root.className.replace(/theme-\w+/g, '');
        root.classList.add(`theme-${theme}`);
        
        // Animación de transición
        if (this.options.enableTransitions) {
            root.style.transition = `background-color ${this.options.transitionDuration}ms, color ${this.options.transitionDuration}ms`;
            setTimeout(() => {
                root.style.transition = '';
            }, this.options.transitionDuration);
        }
    }
    
    updateThemeUI() {
        const container = document.querySelector('[data-theme-switcher]');
        if (!container) return;
        
        container.querySelectorAll('.eco-theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
        });
    }
    
    setupAutoTheme() {
        const checkTime = () => {
            if (!this.isAutoThemeEnabled()) return;
            
            const hour = new Date().getHours();
            const isNight = hour < 6 || hour >= 18;
            const autoTheme = isNight ? 'dark' : 'light';
            
            if (this.currentTheme !== autoTheme) {
                this.setTheme(autoTheme);
            }
        };
        
        // Verificar cada minuto
        setInterval(checkTime, 60000);
        checkTime(); // Verificar inmediatamente
    }
    
    setAutoTheme(enabled) {
        localStorage.setItem(this.options.storageKey + '_auto', enabled);
        if (enabled) {
            this.setupAutoTheme();
        }
    }
    
    isAutoThemeEnabled() {
        return localStorage.getItem(this.options.storageKey + '_auto') === 'true';
    }
    
    setupSystemTheme() {
        if (!this.isSystemThemeEnabled()) return;
        
        const handleSystemTheme = (e) => {
            const systemTheme = e.matches ? 'dark' : 'light';
            if (this.currentTheme !== systemTheme) {
                this.setTheme(systemTheme);
            }
        };
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', handleSystemTheme);
        handleSystemTheme(mediaQuery);
    }
    
    setSystemTheme(enabled) {
        localStorage.setItem(this.options.storageKey + '_system', enabled);
        if (enabled) {
            this.setupSystemTheme();
        }
    }
    
    isSystemThemeEnabled() {
        return localStorage.getItem(this.options.storageKey + '_system') === 'true';
    }
    
    loadTheme() {
        const saved = localStorage.getItem(this.options.storageKey);
        if (saved && this.themes[saved]) {
            this.currentTheme = saved;
        } else if (this.isSystemThemeEnabled()) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }
    }
    
    saveTheme() {
        localStorage.setItem(this.options.storageKey, this.currentTheme);
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    getThemeColors(theme = null) {
        const themeKey = theme || this.currentTheme;
        return this.themes[themeKey]?.colors || this.themes.light.colors;
    }
    
    // Utilidades de color
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min((num >> 16) + amt, 255);
        const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
        const B = Math.min((num & 0x0000FF) + amt, 255);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    destroy() {
        // Limpiar event listeners
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.removeEventListener('change', this.handleSystemTheme);
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    const themeContainer = document.querySelector('[data-theme-switcher]');
    if (themeContainer && themeContainer.dataset.themeSwitcher !== 'false') {
        window.ecoThemes = new EcoThemesAdvanced({
            ...themeContainer.dataset
        });
    }
});