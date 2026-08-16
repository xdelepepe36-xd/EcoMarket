/**
 * eco-accessibility.js - Sistema de accesibilidad mejorado con ARIA labels
 * 
 * Funcionalidades:
 - ARIA labels automáticos para componentes
 - Soporte para lectores de pantalla
 - Navegación por teclado mejorada
 - Focus visible mejorado
 - Skip links
 - Anuncios dinámicos ARIA live
 - Soporte para high contrast mode
 - Accesibilidad completa
 */

class EcoAccessibility {
    constructor(options = {}) {
        this.options = {
            enableAutoARIA: options.enableAutoARIA !== false,
            enableKeyboardNav: options.enableKeyboardNav !== false,
            enableFocusManagement: options.enableFocusManagement !== false,
            enableAnnouncements: options.enableAnnouncements !== false,
            ...options
        };
        
        this.announcer = null;
        this.init();
    }
    
    init() {
        this.createSkipLinks();
        this.setupARIARegions();
        this.autoARIALabels();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.createAnnouncer();
        this.setupHighContrastSupport();
    }
    
    createSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'eco-skip-link';
        skipLink.textContent = 'Saltar al contenido principal';
        skipLink.setAttribute('aria-label', 'Saltar al contenido principal');
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Estilos para skip link
        const style = document.createElement('style');
        style.textContent = `
            .eco-skip-link {
                position: absolute;
                top: -40px;
                left: 0;
                background: var(--verde, #2e7d32);
                color: white;
                padding: 8px 16px;
                z-index: 10000;
                text-decoration: none;
                transition: top 0.3s ease;
            }
            
            .eco-skip-link:focus {
                top: 0;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupARIARegions() {
        // Marcar regiones principales
        const main = document.querySelector('main') || document.querySelector('[role="main"]');
        if (main) {
            main.setAttribute('id', 'main-content');
            main.setAttribute('role', 'main');
            main.setAttribute('aria-label', 'Contenido principal');
        }
        
        const header = document.querySelector('header');
        if (header) {
            header.setAttribute('role', 'banner');
            header.setAttribute('aria-label', 'Encabezado del sitio');
        }
        
        const nav = document.querySelector('nav');
        if (nav) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Navegación principal');
        }
        
        const footer = document.querySelector('footer');
        if (footer) {
            footer.setAttribute('role', 'contentinfo');
            footer.setAttribute('aria-label', 'Pie de página');
        }
        
        // Buscar elementos de búsqueda
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="buscar"]');
        if (searchInput) {
            searchInput.setAttribute('aria-label', 'Buscar productos');
            searchInput.setAttribute('aria-autocomplete', 'list');
        }
        
        // Botones de carrito
        const cartButtons = document.querySelectorAll('[data-cart], .cart-btn');
        cartButtons.forEach(btn => {
            btn.setAttribute('aria-label', 'Ver carrito de compras');
            btn.setAttribute('role', 'button');
        });
        
        // Botones de favoritos
        const favButtons = document.querySelectorAll('[data-favorite], .fav-btn');
        favButtons.forEach(btn => {
            btn.setAttribute('aria-label', 'Agregar a favoritos');
            btn.setAttribute('role', 'button');
        });
    }
    
    autoARIALabels() {
        if (!this.options.enableAutoARIA) return;
        
        // Botones sin texto
        document.querySelectorAll('button:not([aria-label])').forEach(btn => {
            if (!btn.textContent.trim() && !btn.querySelector('img, svg')) {
                const icon = btn.querySelector('i');
                if (icon) {
                    const iconClass = icon.className;
                    let label = 'Botón';
                    
                    if (iconClass.includes('search')) label = 'Buscar';
                    else if (iconClass.includes('cart')) label = 'Carrito';
                    else if (iconClass.includes('heart')) label = 'Favoritos';
                    else if (iconClass.includes('user')) label = 'Perfil';
                    else if (iconClass.includes('menu')) label = 'Menú';
                    else if (iconClass.includes('close')) label = 'Cerrar';
                    else if (iconClass.includes('arrow')) label = 'Navegar';
                    
                    btn.setAttribute('aria-label', label);
                }
            }
        });
        
        // Links sin texto descriptivo
        document.querySelectorAll('a:not([aria-label])').forEach(link => {
            if (!link.textContent.trim() && !link.querySelector('img')) {
                const icon = link.querySelector('i');
                if (icon) {
                    const iconClass = icon.className;
                    let label = 'Enlace';
                    
                    if (iconClass.includes('facebook')) label = 'Facebook';
                    else if (iconClass.includes('instagram')) label = 'Instagram';
                    else if (iconClass.includes('twitter')) label = 'Twitter';
                    else if (iconClass.includes('youtube')) label = 'YouTube';
                    
                    link.setAttribute('aria-label', label);
                }
            }
        });
        
        // Inputs sin label
        document.querySelectorAll('input:not([aria-label])').forEach(input => {
            if (!input.labels || input.labels.length === 0) {
                const placeholder = input.placeholder;
                if (placeholder) {
                    input.setAttribute('aria-label', placeholder);
                }
            }
        });
        
        // Imágenes sin alt
        document.querySelectorAll('img:not([alt])').forEach(img => {
            img.setAttribute('alt', 'Imagen');
            img.setAttribute('role', 'presentation');
        });
        
        // Modales
        document.querySelectorAll('.modal, [data-modal]').forEach(modal => {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', modal.querySelector('h1, h2, h3')?.id || 'modal-title');
        });
        
        // Tabs
        document.querySelectorAll('[role="tablist"]').forEach(tablist => {
            tablist.setAttribute('aria-label', 'Navegación por pestañas');
        });
        
        document.querySelectorAll('[role="tab"]').forEach(tab => {
            const panelId = tab.getAttribute('aria-controls');
            if (panelId) {
                const panel = document.getElementById(panelId);
                if (panel) {
                    panel.setAttribute('role', 'tabpanel');
                    panel.setAttribute('aria-labelledby', tab.id);
                }
            }
        });
    }
    
    setupKeyboardNavigation() {
        if (!this.options.enableKeyboardNav) return;
        
        // Navegación por teclado para menús
        document.querySelectorAll('.menu, [role="menu"]').forEach(menu => {
            menu.setAttribute('role', 'menu');
            
            menu.querySelectorAll('a, button').forEach((item, index) => {
                item.setAttribute('role', 'menuitem');
                item.setAttribute('tabindex', index === 0 ? '0' : '-1');
            });
        });
        
        // Navegación por flechas para listas
        document.querySelectorAll('[data-keyboard-nav]').forEach(container => {
            container.addEventListener('keydown', (e) => {
                const items = container.querySelectorAll('[role="menuitem"], [role="option"]');
                const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
                
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % items.length;
                    items[nextIndex].focus();
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + items.length) % items.length;
                    items[prevIndex].focus();
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    items[0].focus();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    items[items.length - 1].focus();
                }
            });
        });
        
        // Escape para cerrar modales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show, [data-modal].show');
                if (openModal) {
                    const closeBtn = openModal.querySelector('[data-close], .close');
                    if (closeBtn) closeBtn.click();
                }
            }
        });
    }
    
    setupFocusManagement() {
        if (!this.options.enableFocusManagement) return;
        
        // Focus visible mejorado
        const style = document.createElement('style');
        style.textContent = `
            :focus-visible {
                outline: 3px solid var(--verde, #2e7d32);
                outline-offset: 2px;
            }
            
            :focus:not(:focus-visible) {
                outline: none;
            }
        `;
        document.head.appendChild(style);
        
        // Trap focus en modales
        document.querySelectorAll('.modal, [data-modal]').forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    const focusableElements = modal.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            });
        });
    }
    
    createAnnouncer() {
        if (!this.options.enableAnnouncements) return;
        
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('role', 'status');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.className = 'sr-only';
        this.announcer.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;';
        
        document.body.appendChild(this.announcer);
    }
    
    announce(message, priority = 'polite') {
        if (!this.announcer) return;
        
        this.announcer.setAttribute('aria-live', priority);
        this.announcer.textContent = message;
        
        // Limpiar después del anuncio
        setTimeout(() => {
            this.announcer.textContent = '';
        }, 1000);
    }
    
    setupHighContrastSupport() {
        // Detectar modo de alto contraste
        const mediaQuery = window.matchMedia('(prefers-contrast: more)');
        
        const handleHighContrast = (e) => {
            if (e.matches) {
                document.body.classList.add('eco-high-contrast');
            } else {
                document.body.classList.remove('eco-high-contrast');
            }
        };
        
        mediaQuery.addEventListener('change', handleHighContrast);
        handleHighContrast(mediaQuery);
        
        // Estilos para alto contraste
        const style = document.createElement('style');
        style.textContent = `
            .eco-high-contrast {
                --verde: #ffff00;
                --verde-claro: #ffffff;
                --texto: #ffffff;
                --blanco: #000000;
                --gris-claro: #000000;
                --gris-medio: #ffffff;
            }
            
            .eco-high-contrast * {
                text-shadow: none !important;
                box-shadow: none !important;
            }
            
            .eco-high-contrast a,
            .eco-high-contrast button {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Métodos públicos
    setARIALabel(element, label) {
        element.setAttribute('aria-label', label);
    }
    
    setARIADescribedBy(element, descriptionId) {
        element.setAttribute('aria-describedby', descriptionId);
    }
    
    setARIAExpanded(element, expanded) {
        element.setAttribute('aria-expanded', expanded.toString());
    }
    
    setARIAHidden(element, hidden) {
        element.setAttribute('aria-hidden', hidden.toString());
    }
    
    setInvalidField(field, message) {
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', field.id + '-error');
        
        let errorElement = document.getElementById(field.id + '-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = field.id + '-error';
            errorElement.className = 'eco-field-error';
            errorElement.setAttribute('role', 'alert');
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        errorElement.textContent = message;
    }
    
    clearInvalidField(field) {
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
        
        const errorElement = document.getElementById(field.id + '-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    destroy() {
        if (this.announcer) {
            this.announcer.remove();
        }
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    window.ecoAccessibility = new EcoAccessibility();
});

// Helper functions globales
window.announce = (message, priority) => {
    if (window.ecoAccessibility) {
        window.ecoAccessibility.announce(message, priority);
    }
};