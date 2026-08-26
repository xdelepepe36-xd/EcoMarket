/**
 * EcoMarket - Características Avanzadas Adicionales
 * Mejoras UX/UI adicionales propuestas
 */

const EcoAdvanced = {
    // Sistema de productos vistos recientemente
    recientes: {
        maximo: 10,
        productos: [],

        init() {
            this.cargar();
            this.rastrearVisitas();
        },

        rastrearVisitas() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const productoCard = entry.target.closest('[data-producto-id]');
                        if (productoCard) {
                            const productoId = productoCard.dataset.productoId;
                            this.agregar(productoId);
                        }
                    }
                });
            }, { threshold: 0.5 });

            document.querySelectorAll('.producto-card').forEach(card => {
                observer.observe(card);
            });
        },

        agregar(productoId) {
            if (!this.productos.includes(productoId)) {
                this.productos.unshift(productoId);
                if (this.productos.length > this.maximo) {
                    this.productos.pop();
                }
                this.guardar();
            }
        },

        guardar() {
            localStorage.setItem('ecomarket-recientes', JSON.stringify(this.productos));
        },

        cargar() {
            const saved = localStorage.getItem('ecomarket-recientes');
            if (saved) {
                this.productos = JSON.parse(saved);
            }
        },

        render() {
            const container = document.getElementById('recientesContainer');
            if (!container || this.productos.length === 0) return;

            container.innerHTML = `
                <h3><i class="bi bi-clock-history"></i> Vistos Recientemente</h3>
                <div class="recientes-grid">
                    ${this.productos.slice(0, 5).map(id => `
                        <div class="reciente-item" data-producto-id="${id}">
                            <!-- Se llena dinámicamente -->
                        </div>
                    `).join('')}
                </div>
            `;
        }
    },

    // Sistema de tooltips informativos
    tooltips: {
        init() {
            this.crearTooltips();
        },

        crearTooltips() {
            const elementosConTooltip = document.querySelectorAll('[data-tooltip]');
            
            elementosConTooltip.forEach(elemento => {
                const tooltip = document.createElement('div');
                tooltip.className = 'eco-tooltip';
                tooltip.textContent = elemento.dataset.tooltip;
                document.body.appendChild(tooltip);

                elemento.addEventListener('mouseenter', (e) => {
                    const rect = elemento.getBoundingClientRect();
                    tooltip.style.left = `${rect.left + rect.width / 2}px`;
                    tooltip.style.top = `${rect.top - 10}px`;
                    tooltip.classList.add('visible');
                });

                elemento.addEventListener('mouseleave', () => {
                    tooltip.classList.remove('visible');
                });
            });
        }
    },

    // Sistema de animaciones de entrada
    animacionesEntrada: {
        init() {
            this.animarElementos();
        },

        animarElementos() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animado');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.animar-entrada').forEach(elemento => {
                observer.observe(elemento);
            });
        }
    },

    // Sistema de quick actions
    quickActions: {
        init() {
            this.crearQuickActions();
        },

        crearQuickActions() {
            const contenedor = document.getElementById('quickActionsContainer');
            if (!contenedor) return;

            const actions = [
                { icono: 'bi-heart', accion: 'favoritos', tooltip: 'Favoritos' },
                { icono: 'bi-cart3', accion: 'carrito', tooltip: 'Carrito' },
                { icono: 'bi-search', accion: 'buscar', tooltip: 'Buscar' },
                { icono: 'bi-chat', accion: 'chat', tooltip: 'Chat' }
            ];

            contenedor.innerHTML = `
                <div class="quick-actions">
                    ${actions.map(action => `
                        <button class="quick-action-btn" data-accion="${action.accion}" 
                                data-tooltip="${action.tooltip}" aria-label="${action.tooltip}">
                            <i class="bi ${action.icono}"></i>
                        </button>
                    `).join('')}
                </div>
            `;

            contenedor.querySelectorAll('.quick-action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const accion = btn.dataset.accion;
                    this.ejecutarAccion(accion);
                });
            });
        },

        ejecutarAccion(accion) {
            switch(accion) {
                case 'favoritos':
                    window.location.href = '/favoritos';
                    break;
                case 'carrito':
                    window.location.href = '/carrito';
                    break;
                case 'buscar':
                    document.getElementById('searchInput')?.focus();
                    break;
                case 'chat':
                    if (window.EcoToast) {
                        EcoToast.show('Próximamente', 'El chat estará disponible pronto', 'info');
                    }
                    break;
            }
        }
    },

    // Sistema de banners rotativos
    banners: {
        banners: [],
        indice: 0,
        intervalo: null,

        init() {
            this.cargarBanners();
            this.iniciarRotacion();
        },

        cargarBanners() {
            this.banners = [
                {
                    imagen: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=400&fit=crop',
                    titulo: '¡Oferta de Verano!',
                    descripcion: 'Hasta 50% de descuento en productos ecológicos',
                    boton: 'Ver Ofertas',
                    enlace: '/productos'
                },
                {
                    imagen: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=400&fit=crop',
                    titulo: 'Nueva Colección',
                    descripcion: 'Descubre nuestros productos de jardín',
                    boton: 'Explorar',
                    enlace: '/productos?categoria=Jardín'
                },
                {
                    imagen: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&h=400&fit=crop',
                    titulo: 'Envío Gratis',
                    descripcion: 'En pedidos mayores a S/ 100',
                    boton: 'Comprar Ahora',
                    enlace: '/productos'
                }
            ];
            this.renderBanner();
        },

        iniciarRotacion() {
            this.intervalo = setInterval(() => {
                this.siguiente();
            }, 5000);
        },

        siguiente() {
            this.indice = (this.indice + 1) % this.banners.length;
            this.renderBanner();
        },

        anterior() {
            this.indice = (this.indice - 1 + this.banners.length) % this.banners.length;
            this.renderBanner();
        },

        renderBanner() {
            const container = document.getElementById('bannerContainer');
            if (!container) return;

            const banner = this.banners[this.indice];
            
            container.innerHTML = `
                <div class="banner-slide banner-entrando">
                    <img src="${banner.imagen}" alt="${banner.titulo}" class="banner-imagen">
                    <div class="banner-contenido">
                        <h2>${banner.titulo}</h2>
                        <p>${banner.descripcion}</p>
                        <a href="${banner.enlace}" class="btn-principal">${banner.boton}</a>
                    </div>
                </div>
                <div class="banner-controles">
                    <button class="banner-control" onclick="EcoAdvanced.banners.anterior()">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    <div class="banner-indicadores">
                        ${this.banners.map((_, i) => `
                            <button class="banner-indicador ${i === this.indice ? 'activo' : ''}" 
                                    onclick="EcoAdvanced.banners.irA(${i})"></button>
                        `).join('')}
                    </div>
                    <button class="banner-control" onclick="EcoAdvanced.banners.siguiente()">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
            `;
        },

        irA(indice) {
            this.indice = indice;
            this.renderBanner();
        }
    },

    // Sistema de estadísticas visuales
    estadisticas: {
        init() {
            this.renderEstadisticas();
        },

        renderEstadisticas() {
            const container = document.getElementById('estadisticasContainer');
            if (!container) return;

            const stats = [
                { icono: 'bi-box-seam', valor: '79', etiqueta: 'Productos', color: '#4CAF50' },
                { icono: 'bi-people', valor: '1500', etiqueta: 'Usuarios', color: '#2196F3' },
                { icono: 'bi-cart-check', valor: '3500', etiqueta: 'Ventas', color: '#FF9800' },
                { icono: 'bi-star', valor: '4.8', etiqueta: 'Rating', color: '#F44336' }
            ];

            container.innerHTML = `
                <div class="estadisticas-grid">
                    ${stats.map(stat => `
                        <div class="estadistica-card">
                            <div class="estadistica-icono" style="background: ${stat.color}20; color: ${stat.color}">
                                <i class="bi ${stat.icono}"></i>
                            </div>
                            <div class="estadistica-info">
                                <h3>${stat.valor}</h3>
                                <p>${stat.etiqueta}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    },

    // Sistema de skeleton loading mejorado
    skeletonLoading: {
        init() {
            this.crearSkeletons();
        },

        crearSkeletons() {
            // Skeleton para productos
            const productosGrid = document.getElementById('productosGrid');
            if (productosGrid && productosGrid.children.length === 0) {
                productosGrid.innerHTML = Array(6).fill(0).map(() => `
                    <div class="producto-card skeleton">
                        <div class="skeleton-imagen"></div>
                        <div class="skeleton-line skeleton-titulo"></div>
                        <div class="skeleton-line skeleton-subtitulo"></div>
                        <div class="skeleton-line skeleton-precio"></div>
                    </div>
                `).join('');
            }
        },

        eliminarSkeletons() {
            document.querySelectorAll('.skeleton').forEach(el => {
                el.remove();
            });
        }
    },

    // Sistema de feedback visual
    feedbackVisual: {
        init() {
            this.agregarFeedbackBotones();
        },

        agregarFeedbackBotones() {
            document.querySelectorAll('.btn-principal, .btn-secundario').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.mostrarFeedback(e.currentTarget);
                });
            });
        },

        mostrarFeedback(elemento) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            
            const rect = elemento.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${rect.width / 2 - size / 2}px`;
            ripple.style.top = `${rect.height / 2 - size / 2}px`;
            
            elemento.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        }
    },

    // Sistema de búsqueda mejorada
    busquedaMejorada: {
        historial: [],
        maximo: 10,

        init() {
            this.cargarHistorial();
            this.renderHistorial();
        },

        agregarBusqueda(termino) {
            if (termino && !this.historial.includes(termino)) {
                this.historial.unshift(termino);
                if (this.historial.length > this.maximo) {
                    this.historial.pop();
                }
                this.guardar();
                this.renderHistorial();
            }
        },

        guardar() {
            localStorage.setItem('ecomarket-busqueda-historial', JSON.stringify(this.historial));
        },

        cargar() {
            const saved = localStorage.getItem('ecomarket-busqueda-historial');
            if (saved) {
                this.historial = JSON.parse(saved);
            }
        },

        renderHistorial() {
            const container = document.getElementById('busquedaHistorial');
            if (!container || this.historial.length === 0) return;

            container.innerHTML = `
                <h4>Búsquedas recientes</h4>
                <div class="busqueda-historial-lista">
                    ${this.historial.map(termino => `
                        <button class="busqueda-historial-item" onclick="EcoAdvanced.busquedaMejorada.buscar('${termino}')">
                            <i class="bi bi-clock"></i> ${termino}
                        </button>
                    `).join('')}
                </div>
            `;
        },

        buscar(termino) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = termino;
                searchInput.dispatchEvent(new Event('change'));
            }
        },

        limpiar() {
            this.historial = [];
            this.guardar();
            this.renderHistorial();
        }
    },

    // Sistema de modo lectura
    modoLectura: {
        activo: false,

        init() {
            this.crearToggle();
        },

        crearToggle() {
            const headerActions = document.querySelector('.header-actions');
            if (!headerActions) return;

            const toggle = document.createElement('button');
            toggle.className = 'modo-lectura-toggle';
            toggle.setAttribute('aria-label', 'Modo lectura');
            toggle.innerHTML = '<i class="bi bi-book"></i>';
            
            toggle.addEventListener('click', () => this.toggle());
            
            headerActions.appendChild(toggle);
        },

        toggle() {
            this.activo = !this.activo;
            document.body.classList.toggle('modo-lectura', this.activo);
            
            if (this.activo) {
                document.body.style.setProperty('--font-size', '1.1rem');
                document.body.style.setProperty('--line-height', '1.8');
            } else {
                document.body.style.removeProperty('--font-size');
                document.body.style.removeProperty('--line-height');
            }
        }
    },

    // Sistema de accesibilidad mejorado
    accesibilidad: {
        init() {
            this.mejorarContraste();
            this.agregarAtajos();
        },

        mejorarContraste() {
            // Detectar preferencia del sistema
            if (window.matchMedia('(prefers-contrast: more)').matches) {
                document.documentElement.setAttribute('data-theme', 'high-contrast');
            }
        },

        agregarAtajos() {
            document.addEventListener('keydown', (e) => {
                // Alt + S: Buscar
                if (e.altKey && e.key === 's') {
                    e.preventDefault();
                    document.getElementById('searchInput')?.focus();
                }
                
                // Alt + C: Carrito
                if (e.altKey && e.key === 'c') {
                    e.preventDefault();
                    window.location.href = '/carrito';
                }
                
                // Alt + F: Favoritos
                if (e.altKey && e.key === 'f') {
                    e.preventDefault();
                    window.location.href = '/favoritos';
                }
                
                // Alt + T: Cambiar tema
                if (e.altKey && e.key === 't') {
                    e.preventDefault();
                    if (window.EcoThemes) {
                        EcoThemes.nextTheme();
                    }
                }
            });
        }
    },

    // Inicializar todo
    init() {
        this.recientes.init();
        this.tooltips.init();
        this.animacionesEntrada.init();
        this.quickActions.init();
        this.banners.init();
        this.estadisticas.init();
        this.skeletonLoading.init();
        this.feedbackVisual.init();
        this.busquedaMejorada.init();
        this.modoLectura.init();
        this.accesibilidad.init();
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoAdvanced.init());
} else {
    EcoAdvanced.init();
}

// Exponer globalmente
window.EcoAdvanced = EcoAdvanced;
