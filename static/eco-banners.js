/**
 * eco-banners.js - Sistema de banners promocionales dinámicos
 * 
 * Funcionalidades:
 * - Banners rotativos automáticos
 * - Personalización por usuario
 * - Banners temporales (fechas de inicio/fin)
 * - Análisis de clics e impresiones
 * - Banners responsivos
 * - Efectos de transición
 * - Integración con descuentos y promociones
 */

class EcoBanners {
    constructor(options = {}) {
        this.options = {
            container: options.container || '[data-eco-banners]',
            autoRotate: options.autoRotate !== false,
            rotationInterval: options.rotationInterval || 5000,
            enableTransitions: options.enableTransitions !== false,
            enableAnalytics: options.enableAnalytics !== false,
            storageKey: options.storageKey || 'ecomarket_banners',
            maxBanners: options.maxBanners || 5,
            ...options
        };
        
        this.banners = [];
        this.currentBannerIndex = 0;
        this.rotationTimer = null;
        this.impressionData = this.loadImpressionData();
        
        this.init();
    }
    
    init() {
        this.container = document.querySelector(this.options.container);
        if (!this.container) return;
        
        this.loadBanners();
        this.createBannerStructure();
        this.setupEventListeners();
        
        if (this.options.autoRotate && this.banners.length > 1) {
            this.startRotation();
        }
        
        // Track impresión del primer banner
        this.trackImpression(this.banners[0]);
    }
    
    async loadBanners() {
        try {
            const response = await fetch('/api/banners/activos');
            if (response.ok) {
                const data = await response.json();
                this.banners = this.filterValidBanners(data).slice(0, this.options.maxBanners);
            }
        } catch (error) {
            console.error('Error cargando banners:', error);
            // Usar banners de fallback
            this.banners = this.getFallbackBanners();
        }
    }
    
    filterValidBanners(banners) {
        const now = new Date();
        return banners.filter(banner => {
            const startDate = new Date(banner.fecha_inicio);
            const endDate = new Date(banner.fecha_fin);
            const isActive = banner.activo === true || banner.activo === 1;
            
            return isActive && now >= startDate && now <= endDate;
        });
    }
    
    getFallbackBanners() {
        return [
            {
                id: 'fallback-1',
                titulo: '¡Bienvenido a EcoMarket!',
                descripcion: 'Descubre productos ecológicos de calidad',
                imagen: '/static/assets/promo-home-1.svg',
                enlace: '/productos',
                tipo: 'info',
                descuento: null
            },
            {
                id: 'fallback-2',
                titulo: 'Envío Gratis',
                descripcion: 'En pedidos mayores a S/.50',
                imagen: '/static/assets/promo-home-2.svg',
                enlace: '/productos',
                tipo: 'promo',
                descuento: { codigo: 'ENVIOFREE', valor: 'Envío gratis' }
            },
            {
                id: 'fallback-3',
                titulo: '10% de Descuento',
                descripcion: 'Usa el código ECO10',
                imagen: '/static/assets/promo-home-3.svg',
                enlace: '/productos',
                tipo: 'cupon',
                descuento: { codigo: 'ECO10', valor: '10%' }
            }
        ];
    }
    
    createBannerStructure() {
        this.container.innerHTML = `
            <div class="eco-banners">
                <div class="eco-banners-track">
                    ${this.banners.map((banner, index) => this.createBannerHTML(banner, index)).join('')}
                </div>
                
                <div class="eco-banners-controls">
                    <button class="eco-banners-nav eco-banners-prev" aria-label="Banner anterior">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    
                    <div class="eco-banners-indicators">
                        ${this.banners.map((_, index) => `
                            <button class="eco-banners-indicator ${index === 0 ? 'active' : ''}" 
                                    data-banner-index="${index}" 
                                    aria-label="Ir al banner ${index + 1}">
                            </button>
                        `).join('')}
                    </div>
                    
                    <button class="eco-banners-nav eco-banners-next" aria-label="Banner siguiente">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
                
                <button class="eco-banners-close" aria-label="Cerrar banners">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
        
        // Referencias a elementos
        this.track = this.container.querySelector('.eco-banners-track');
        this.prevBtn = this.container.querySelector('.eco-banners-prev');
        this.nextBtn = this.container.querySelector('.eco-banners-next');
        this.indicators = this.container.querySelectorAll('.eco-banners-indicator');
        this.closeBtn = this.container.querySelector('.eco-banners-close');
    }
    
    createBannerHTML(banner, index) {
        const tipoClass = `eco-banner-${banner.tipo || 'info'}`;
        const hasDiscount = banner.descuento;
        
        return `
            <div class="eco-banner ${tipoClass} ${index === 0 ? 'active' : ''}" 
                 data-banner-id="${banner.id}" 
                 data-banner-index="${index}">
                <div class="eco-banner-content">
                    <div class="eco-banner-text">
                        ${hasDiscount ? `
                            <div class="eco-banner-discount">
                                <span class="eco-discount-code">${banner.descuento.codigo}</span>
                                <span class="eco-discount-value">${banner.descuento.valor}</span>
                            </div>
                        ` : ''}
                        
                        <h2 class="eco-banner-title">${banner.titulo}</h2>
                        <p class="eco-banner-description">${banner.descripcion}</p>
                        
                        <a href="${banner.enlace}" class="eco-banner-cta" data-banner-link>
                            ${banner.cta || 'Ver más'}
                            <i class="bi bi-arrow-right"></i>
                        </a>
                    </div>
                    
                    <div class="eco-banner-image">
                        <img src="${banner.imagen}" alt="${banner.titulo}" loading="lazy">
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Navegación
        this.prevBtn.addEventListener('click', () => this.prevBanner());
        this.nextBtn.addEventListener('click', () => this.nextBanner());
        
        // Indicadores
        this.indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const index = parseInt(indicator.dataset.bannerIndex);
                this.goToBanner(index);
            });
        });
        
        // Cerrar banners
        this.closeBtn.addEventListener('click', () => this.closeBanners());
        
        // Enlaces de banners
        this.container.querySelectorAll('[data-banner-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                const bannerId = e.target.closest('.eco-banner').dataset.bannerId;
                this.trackClick(bannerId);
            });
        });
        
        // Pausar rotación al hacer hover
        if (this.options.autoRotate) {
            this.container.addEventListener('mouseenter', () => this.pauseRotation());
            this.container.addEventListener('mouseleave', () => this.resumeRotation());
        }
        
        // Navegación con teclado
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch gestures
        this.setupTouchGestures();
    }
    
    setupTouchGestures() {
        let startX = 0;
        let endX = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.track.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextBanner();
                } else {
                    this.prevBanner();
                }
            }
        });
    }
    
    handleKeyboard(e) {
        if (!this.container.contains(document.activeElement)) return;
        
        if (e.key === 'ArrowLeft') {
            this.prevBanner();
        } else if (e.key === 'ArrowRight') {
            this.nextBanner();
        } else if (e.key === 'Escape') {
            this.closeBanners();
        }
    }
    
    goToBanner(index) {
        if (index < 0 || index >= this.banners.length) return;
        
        this.currentBannerIndex = index;
        this.updateBannerDisplay();
        
        // Track impresión del nuevo banner
        this.trackImpression(this.banners[index]);
    }
    
    prevBanner() {
        const newIndex = this.currentBannerIndex > 0 
            ? this.currentBannerIndex - 1 
            : this.banners.length - 1;
        this.goToBanner(newIndex);
    }
    
    nextBanner() {
        const newIndex = this.currentBannerIndex < this.banners.length - 1 
            ? this.currentBannerIndex + 1 
            : 0;
        this.goToBanner(newIndex);
    }
    
    updateBannerDisplay() {
        const banners = this.track.querySelectorAll('.eco-banner');
        
        banners.forEach((banner, index) => {
            banner.classList.toggle('active', index === this.currentBannerIndex);
        });
        
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentBannerIndex);
        });
        
        // Actualizar posición del track si hay transiciones
        if (this.options.enableTransitions) {
            const translateX = -this.currentBannerIndex * 100;
            this.track.style.transform = `translateX(${translateX}%)`;
        }
    }
    
    startRotation() {
        this.rotationTimer = setInterval(() => {
            this.nextBanner();
        }, this.options.rotationInterval);
    }
    
    pauseRotation() {
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
            this.rotationTimer = null;
        }
    }
    
    resumeRotation() {
        if (this.options.autoRotate && !this.rotationTimer) {
            this.startRotation();
        }
    }
    
    closeBanners() {
        this.pauseRotation();
        this.container.style.display = 'none';
        
        // Guardar preferencia del usuario
        localStorage.setItem(this.options.storageKey, 'closed');
    }
    
    trackImpression(banner) {
        if (!this.options.enableAnalytics) return;
        
        const bannerId = banner.id;
        this.impressionData[bannerId] = (this.impressionData[bannerId] || 0) + 1;
        this.saveImpressionData();
        
        // Enviar a analytics
        if (window.ecoAnalytics) {
            window.ecoAnalytics.trackEvent('banner_impression', {
                banner_id: bannerId,
                banner_type: banner.tipo
            });
        }
    }
    
    trackClick(bannerId) {
        if (!this.options.enableAnalytics) return;
        
        // Enviar a analytics
        if (window.ecoAnalytics) {
            window.ecoAnalytics.trackEvent('banner_click', {
                banner_id: bannerId
            });
        }
    }
    
    loadImpressionData() {
        try {
            return JSON.parse(localStorage.getItem(`${this.options.storageKey}_impressions`)) || {};
        } catch {
            return {};
        }
    }
    
    saveImpressionData() {
        localStorage.setItem(`${this.options.storageKey}_impressions`, JSON.stringify(this.impressionData));
    }
    
    loadImpressionData() {
        try {
            return JSON.parse(localStorage.getItem(`${this.options.storageKey}_impressions`)) || {};
        } catch {
            return {};
        }
    }
    
    saveImpressionData() {
        localStorage.setItem(`${this.options.storageKey}_impressions`, JSON.stringify(this.impressionData));
    }
    
    shouldShowBanners() {
        // Verificar si el usuario cerró los banners anteriormente
        const userPreference = localStorage.getItem(this.options.storageKey);
        return userPreference !== 'closed';
    }
    
    refreshBanners() {
        this.pauseRotation();
        this.loadBanners();
        this.createBannerStructure();
        this.setupEventListeners();
        
        if (this.options.autoRotate && this.banners.length > 1) {
            this.startRotation();
        }
    }
    
    addBanner(banner) {
        this.banners.push(banner);
        if (this.banners.length > this.options.maxBanners) {
            this.banners.shift();
        }
        this.createBannerStructure();
        this.setupEventListeners();
    }
    
    getCurrentBanner() {
        return this.banners[this.currentBannerIndex];
    }
    
    destroy() {
        this.pauseRotation();
        
        this.prevBtn.removeEventListener('click', () => this.prevBanner());
        this.nextBtn.removeEventListener('click', () => this.nextBanner());
        this.closeBtn.removeEventListener('click', () => this.closeBanners());
        
        document.removeEventListener('keydown', (e) => this.handleKeyboard(e));
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    // Buscar contenedores de banners
    const bannerContainers = document.querySelectorAll('[data-eco-banners]');
    bannerContainers.forEach(container => {
        if (container.dataset.ecoBanners !== 'false') {
            new EcoBanners({
                ...container.dataset
            });
        }
    });
});