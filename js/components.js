/**
 * EcoMarket - Componentes UI Avanzados
 * Sistema de componentes reutilizables: sliders, tabs, modales, etc.
 */

// ==========================================
// Slider Component
// ==========================================
class Slider {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            autoplay: false,
            interval: 5000,
            slidesPerView: 1,
            spaceBetween: 0,
            navigation: true,
            pagination: true,
            loop: false,
            ...options
        };
        
        this.slides = [];
        this.currentIndex = 0;
        this.autoplayTimer = null;
        
        this.init();
    }

    init() {
        if (!this.container) return;

        this.slides = Array.from(this.container.querySelectorAll('.slide'));
        if (this.slides.length === 0) return;

        this.setupStructure();
        this.setupNavigation();
        this.setupPagination();
        this.setupAutoplay();
        this.goTo(0);
    }

    setupStructure() {
        // Wrapper para slides
        const wrapper = document.createElement('div');
        wrapper.className = 'slider-wrapper';
        wrapper.style.display = 'flex';
        wrapper.style.transition = 'transform 0.5s ease';
        wrapper.style.width = '100%';

        this.slides.forEach(slide => {
            slide.style.flex = `0 0 ${100 / this.options.slidesPerView}%`;
            slide.style.padding = `0 ${this.options.spaceBetween / 2}px`;
            wrapper.appendChild(slide);
        });

        this.container.insertBefore(wrapper, this.container.firstChild);
        this.wrapper = wrapper;
    }

    setupNavigation() {
        if (!this.options.navigation) return;

        const prevBtn = document.createElement('button');
        prevBtn.className = 'slider-nav slider-prev';
        prevBtn.innerHTML = '‹';
        prevBtn.style.cssText = `
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 10;
            font-size: 1.5rem;
        `;

        const nextBtn = document.createElement('button');
        nextBtn.className = 'slider-nav slider-next';
        nextBtn.innerHTML = '›';
        nextBtn.style.cssText = prevBtn.style.cssText.replace('left: 10px', 'right: 10px');

        prevBtn.addEventListener('click', () => this.prev());
        nextBtn.addEventListener('click', () => this.next());

        this.container.style.position = 'relative';
        this.container.appendChild(prevBtn);
        this.container.appendChild(nextBtn);
    }

    setupPagination() {
        if (!this.options.pagination) return;

        const pagination = document.createElement('div');
        pagination.className = 'slider-pagination';
        pagination.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 10;
        `;

        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot';
            dot.style.cssText = `
                width: 10px;
                height: 10px;
                border-radius: 50%;
                border: none;
                background: rgba(255,255,255,0.5);
                cursor: pointer;
                transition: background 0.3s ease;
            `;

            dot.addEventListener('click', () => this.goTo(index));
            pagination.appendChild(dot);
        });

        this.container.appendChild(pagination);
        this.pagination = pagination;
    }

    setupAutoplay() {
        if (!this.options.autoplay) return;

        this.startAutoplay();

        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => this.next(), this.options.interval);
    }

    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }

    goTo(index) {
        const maxIndex = Math.max(0, this.slides.length - this.options.slidesPerView);
        this.currentIndex = Math.max(0, Math.min(index, maxIndex));

        const translateX = -(this.currentIndex * (100 / this.options.slidesPerView));
        this.wrapper.style.transform = `translateX(${translateX}%)`;

        this.updatePagination();
    }

    next() {
        const maxIndex = Math.max(0, this.slides.length - this.options.slidesPerView);
        if (this.options.loop && this.currentIndex >= maxIndex) {
            this.goTo(0);
        } else {
            this.goTo(this.currentIndex + 1);
        }
    }

    prev() {
        if (this.options.loop && this.currentIndex <= 0) {
            this.goTo(Math.max(0, this.slides.length - this.options.slidesPerView));
        } else {
            this.goTo(this.currentIndex - 1);
        }
    }

    updatePagination() {
        if (!this.pagination) return;

        const dots = this.pagination.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.style.background = index === this.currentIndex ? 'white' : 'rgba(255,255,255,0.5)';
        });
    }

    destroy() {
        this.stopAutoplay();
        if (this.wrapper) {
            this.wrapper.style.transform = '';
        }
    }
}

// ==========================================
// Tabs Component
// ==========================================
class Tabs {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            activeClass: 'active',
            initialTab: 0,
            ...options
        };
        
        this.tabs = [];
        this.panels = [];
        
        this.init();
    }

    init() {
        if (!this.container) return;

        this.tabs = Array.from(this.container.querySelectorAll('.tab'));
        this.panels = Array.from(this.container.querySelectorAll('.tab-panel'));

        if (this.tabs.length === 0 || this.panels.length === 0) return;

        this.setupTabs();
        this.activateTab(this.options.initialTab);
    }

    setupTabs() {
        this.tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => this.activateTab(index));
            tab.style.cursor = 'pointer';
        });
    }

    activateTab(index) {
        // Desactivar todos
        this.tabs.forEach(tab => tab.classList.remove(this.options.activeClass));
        this.panels.forEach(panel => panel.style.display = 'none');

        // Activar tab específico
        if (this.tabs[index]) {
            this.tabs[index].classList.add(this.options.activeClass);
        }

        if (this.panels[index]) {
            this.panels[index].style.display = 'block';
        }

        // Emitir evento
        this.container.dispatchEvent(new CustomEvent('tab:change', {
            detail: { index, tab: this.tabs[index], panel: this.panels[index] }
        }));
    }

    getActiveTab() {
        const activeIndex = this.tabs.findIndex(tab => tab.classList.contains(this.options.activeClass));
        return {
            index: activeIndex,
            tab: this.tabs[activeIndex],
            panel: this.panels[activeIndex]
        };
    }
}

// ==========================================
// Modal Component
// ==========================================
class Modal {
    constructor(options = {}) {
        this.options = {
            title: '',
            content: '',
            size: 'medium', // 'small' | 'medium' | 'large'
            closeOnOverlay: true,
            closeOnEscape: true,
            showClose: true,
            ...options
        };
        
        this.modal = null;
        this.isOpen = false;
        
        this.create();
    }

    create() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;

        // Modal
        const modal = document.createElement('div');
        modal.className = 'modal-content';
        
        const sizes = {
            small: '400px',
            medium: '600px',
            large: '800px'
        };
        
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            max-width: ${sizes[this.options.size]};
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        // Header
        if (this.options.title || this.options.showClose) {
            const header = document.createElement('div');
            header.className = 'modal-header';
            header.style.cssText = `
                padding: 1.5rem;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            if (this.options.title) {
                const title = document.createElement('h2');
                title.textContent = this.options.title;
                title.style.cssText = 'margin: 0; font-size: 1.25rem; font-weight: 700;';
                header.appendChild(title);
            }

            if (this.options.showClose) {
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '×';
                closeBtn.style.cssText = `
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    line-height: 1;
                `;
                closeBtn.addEventListener('click', () => this.close());
                header.appendChild(closeBtn);
            }

            modal.appendChild(header);
        }

        // Body
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.style.cssText = 'padding: 1.5rem;';
        
        if (typeof this.options.content === 'string') {
            body.innerHTML = this.options.content;
        } else if (this.options.content instanceof HTMLElement) {
            body.appendChild(this.options.content);
        }

        modal.appendChild(body);

        // Footer (si hay botones)
        if (this.options.buttons) {
            const footer = document.createElement('div');
            footer.className = 'modal-footer';
            footer.style.cssText = `
                padding: 1rem 1.5rem;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: flex-end;
                gap: 0.5rem;
            `;

            this.options.buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.textContent = button.text;
                btn.className = button.class || '';
                btn.style.cssText = `
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    ${button.primary ? 'background: #2e7d32; color: white;' : 'background: #f5f5f5; color: #333;'}
                `;
                btn.addEventListener('click', () => {
                    if (button.onClick) button.onClick();
                    if (button.close !== false) this.close();
                });
                footer.appendChild(btn);
            });

            modal.appendChild(footer);
        }

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        this.overlay = overlay;
        this.modal = modal;

        // Event listeners
        if (this.options.closeOnOverlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }

        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) this.close();
            });
        }
    }

    open() {
        this.isOpen = true;
        this.overlay.style.visibility = 'visible';
        this.overlay.style.opacity = '1';
        this.modal.style.transform = 'scale(1)';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        this.overlay.style.opacity = '0';
        this.modal.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.overlay.style.visibility = 'hidden';
            document.body.style.overflow = '';
        }, 300);
    }

    setContent(content) {
        const body = this.modal.querySelector('.modal-body');
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.innerHTML = '';
            body.appendChild(content);
        }
    }

    destroy() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
}

// ==========================================
// Accordion Component
// ==========================================
class Accordion {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            multiple: false,
            initialOpen: null,
            ...options
        };
        
        this.items = [];
        
        this.init();
    }

    init() {
        if (!this.container) return;

        this.items = Array.from(this.container.querySelectorAll('.accordion-item'));
        if (this.items.length === 0) return;

        this.setupItems();
        
        if (this.options.initialOpen !== null) {
            this.open(this.options.initialOpen);
        }
    }

    setupItems() {
        this.items.forEach((item, index) => {
            const header = item.querySelector('.accordion-header');
            const content = item.querySelector('.accordion-content');

            if (header && content) {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => this.toggle(index));

                // Estilos iniciales
                content.style.maxHeight = '0';
                content.style.overflow = 'hidden';
                content.style.transition = 'max-height 0.3s ease';
            }
        });
    }

    toggle(index) {
        const item = this.items[index];
        if (!item) return;

        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        const isOpen = item.classList.contains('open');

        if (this.options.multiple) {
            // Toggle individual
            if (isOpen) {
                this.close(index);
            } else {
                this.open(index);
            }
        } else {
            // Close all, open one
            this.closeAll();
            if (!isOpen) {
                this.open(index);
            }
        }
    }

    open(index) {
        const item = this.items[index];
        if (!item) return;

        const content = item.querySelector('.accordion-content');
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
    }

    close(index) {
        const item = this.items[index];
        if (!item) return;

        const content = item.querySelector('.accordion-content');
        item.classList.remove('open');
        content.style.maxHeight = '0';
    }

    closeAll() {
        this.items.forEach((_, index) => this.close(index));
    }
}

// ==========================================
// Dropdown Component
// ==========================================
class Dropdown {
    constructor(trigger, menu, options = {}) {
        this.trigger = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
        this.menu = typeof menu === 'string' ? document.querySelector(menu) : menu;
        this.options = {
            closeOnClickOutside: true,
            closeOnEscape: true,
            ...options
        };
        
        this.isOpen = false;
        
        this.init();
    }

    init() {
        if (!this.trigger || !this.menu) return;

        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Estilos del menú
        this.menu.style.position = 'absolute';
        this.menu.style.top = '100%';
        this.menu.style.left = '0';
        this.menu.style.minWidth = '200px';
        this.menu.style.background = 'white';
        this.menu.style.borderRadius = '8px';
        this.menu.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
        this.menu.style.padding = '0.5rem 0';
        this.menu.style.display = 'none';
        this.menu.style.zIndex = '100';

        if (this.options.closeOnClickOutside) {
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.trigger.contains(e.target) && !this.menu.contains(e.target)) {
                    this.close();
                }
            });
        }

        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) this.close();
            });
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.menu.style.display = 'block';
        this.trigger.classList.add('active');
    }

    close() {
        this.isOpen = false;
        this.menu.style.display = 'none';
        this.trigger.classList.remove('active');
    }
}

// ==========================================
// Tooltip Component
// ==========================================
class Tooltip {
    constructor(element, content, options = {}) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.content = content;
        this.options = {
            position: 'top', // 'top' | 'bottom' | 'left' | 'right'
            delay: 0,
            ...options
        };
        
        this.tooltip = null;
        this.timeout = null;
        
        this.init();
    }

    init() {
        if (!this.element) return;

        this.element.addEventListener('mouseenter', () => this.show());
        this.element.addEventListener('mouseleave', () => this.hide());
    }

    show() {
        if (this.timeout) clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            this.createTooltip();
            this.positionTooltip();
            this.tooltip.style.opacity = '1';
        }, this.options.delay);
    }

    hide() {
        if (this.timeout) clearTimeout(this.timeout);

        if (this.tooltip) {
            this.tooltip.style.opacity = '0';
            setTimeout(() => {
                if (this.tooltip && this.tooltip.parentNode) {
                    this.tooltip.parentNode.removeChild(this.tooltip);
                    this.tooltip = null;
                }
            }, 300);
        }
    }

    createTooltip() {
        if (this.tooltip) return;

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.tooltip.textContent = this.content;
        this.tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
            font-size: 0.85rem;
            white-space: nowrap;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;

        document.body.appendChild(this.tooltip);
    }

    positionTooltip() {
        const rect = this.element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();

        const positions = {
            top: {
                top: rect.top - tooltipRect.height - 8,
                left: rect.left + (rect.width - tooltipRect.width) / 2
            },
            bottom: {
                top: rect.bottom + 8,
                left: rect.left + (rect.width - tooltipRect.width) / 2
            },
            left: {
                top: rect.top + (rect.height - tooltipRect.height) / 2,
                left: rect.left - tooltipRect.width - 8
            },
            right: {
                top: rect.top + (rect.height - tooltipRect.height) / 2,
                left: rect.right + 8
            }
        };

        const pos = positions[this.options.position];
        this.tooltip.style.top = pos.top + 'px';
        this.tooltip.style.left = pos.left + 'px';
    }

    setContent(content) {
        this.content = content;
        if (this.tooltip) {
            this.tooltip.textContent = content;
        }
    }

    destroy() {
        this.element.removeEventListener('mouseenter', () => this.show());
        this.element.removeEventListener('mouseleave', () => this.hide());
        this.hide();
    }
}

// Exportar componentes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Slider,
        Tabs,
        Modal,
        Accordion,
        Dropdown,
        Tooltip
    };
}