/**
 * EcoMarket - Dashboard de Usuario
 * Panel de control para usuarios con estadísticas y funcionalidades
 */

const EcoDashboard = {
    datos: {
        usuario: null,
        estadisticas: null,
        actividad: null,
        recomendaciones: null
    },

    init() {
        this.cargarDatos();
        this.renderDashboard();
        this.inicializarGraficos();
        this.inicializarNotificaciones();
    },

    cargarDatos() {
        // Simular carga de datos
        this.datos.usuario = {
            nombre: 'Usuario Demo',
            email: 'demo@ecomarket.com',
            nivel: 3,
            xp: 450,
            eco_puntos: 1250,
            fecha_registro: '2026-01-15',
            avatar: '/static/uploads/default-avatar.png'
        };

        this.datos.estadisticas = {
            compras: 23,
            ventas: 0,
            productos_publicados: 5,
            reseñas_escritas: 12,
            favoritos: 45,
            seguidores: 34,
            siguiendo: 28,
            impacto_ecologico: 156 // kg de CO2 ahorrados
        };

        this.datos.actividad = [
            { tipo: 'compra', descripcion: 'Botella ecológica', fecha: '2026-08-25', puntos: 10 },
            { tipo: 'reseña', descripcion: 'Jabón natural', fecha: '2026-08-24', puntos: 5 },
            { tipo: 'favorito', descripcion: 'Kit cultivo', fecha: '2026-08-23', puntos: 2 },
            { tipo: 'compartir', descripcion: 'Compartido producto', fecha: '2026-08-22', puntos: 3 }
        ];

        this.datos.recomendaciones = [
            { id: 1, nombre: 'Cepillo bambú', categoria: 'Higiene', motivo: 'Basado en tus compras' },
            { id: 2, nombre: 'Compostera', categoria: 'Jardín', motivo: 'Popular en tu área' },
            { id: 3, nombre: 'Bolsa algodón', categoria: 'Hogar', motivo: 'Complementa tu compra' }
        ];
    },

    renderDashboard() {
        const container = document.getElementById('dashboardContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="dashboard-layout">
                <!-- Sidebar -->
                <aside class="dashboard-sidebar">
                    <div class="user-profile-mini">
                        <div class="user-avatar-mini">
                            <img src="${this.datos.usuario.avatar}" alt="Avatar">
                            <span class="user-nivel-badge">Nivel ${this.datos.usuario.nivel}</span>
                        </div>
                        <h3>${this.datos.usuario.nombre}</h3>
                        <p>${this.datos.usuario.email}</p>
                    </div>
                    
                    <nav class="dashboard-nav">
                        <a href="#" class="nav-item active" data-tab="overview">
                            <i class="bi bi-grid"></i> Resumen
                        </a>
                        <a href="#" class="nav-item" data-tab="compras">
                            <i class="bi bi-cart3"></i> Mis Compras
                        </a>
                        <a href="#" class="nav-item" data-tab="ventas">
                            <i class="bi bi-currency-dollar"></i> Mis Ventas
                        </a>
                        <a href="#" class="nav-item" data-tab="productos">
                            <i class="bi bi-box-seam"></i> Mis Productos
                        </a>
                        <a href="#" class="nav-item" data-tab="favoritos">
                            <i class="bi bi-heart"></i> Favoritos
                        </a>
                        <a href="#" class="nav-item" data-tab="configuracion">
                            <i class="bi bi-gear"></i> Configuración
                        </a>
                    </nav>
                </aside>

                <!-- Main Content -->
                <main class="dashboard-main">
                    <!-- Overview Tab -->
                    <div class="dashboard-tab active" id="tab-overview">
                        <h2 class="dashboard-title">Resumen</h2>
                        
                        <!-- Stats Cards -->
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon compras">
                                    <i class="bi bi-cart-check"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>${this.datos.estadisticas.compras}</h3>
                                    <p>Compras</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon puntos">
                                    <i class="bi bi-star"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>${this.datos.usuario.eco_puntos}</h3>
                                    <p>Eco-Puntos</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon impacto">
                                    <i class="bi bi-globe"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>${this.datos.estadisticas.impacto_ecologico}kg</h3>
                                    <p>CO2 Ahorrado</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon nivel">
                                    <i class="bi bi-trophy"></i>
                                </div>
                                <div class="stat-info">
                                    <h3>Nivel ${this.datos.usuario.nivel}</h3>
                                    <p>${this.datos.usuario.xp} XP</p>
                                </div>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="progress-section">
                            <h3>Progreso al siguiente nivel</h3>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width: 75%">
                                    <span>450/600 XP</span>
                                </div>
                            </div>
                            <p>150 XP para el Nivel 4</p>
                        </div>

                        <!-- Activity Feed -->
                        <div class="activity-section">
                            <h3>Actividad Reciente</h3>
                            <div class="activity-list">
                                ${this.datos.actividad.map(act => `
                                    <div class="activity-item">
                                        <div class="activity-icon ${act.tipo}">
                                            <i class="bi ${this.getIconoActividad(act.tipo)}"></i>
                                        </div>
                                        <div class="activity-details">
                                            <p>${act.descripcion}</p>
                                            <span class="activity-date">${act.fecha}</span>
                                        </div>
                                        <div class="activity-points">+${act.puntos} pts</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Recommendations -->
                        <div class="recommendations-section">
                            <h3>Recomendado para ti</h3>
                            <div class="recommendations-grid">
                                ${this.datos.recomendaciones.map(rec => `
                                    <div class="recommendation-card">
                                        <div class="rec-category">${rec.categoria}</div>
                                        <h4>${rec.nombre}</h4>
                                        <p>${rec.motivo}</p>
                                        <button class="btn-ver-producto">Ver</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Other Tabs (placeholders) -->
                    <div class="dashboard-tab" id="tab-compras">
                        <h2 class="dashboard-title">Mis Compras</h2>
                        <p class="dashboard-placeholder">Historial de compras</p>
                    </div>
                    <div class="dashboard-tab" id="tab-ventas">
                        <h2 class="dashboard-title">Mis Ventas</h2>
                        <p class="dashboard-placeholder">Gestión de ventas</p>
                    </div>
                    <div class="dashboard-tab" id="tab-productos">
                        <h2 class="dashboard-title">Mis Productos</h2>
                        <p class="dashboard-placeholder">Productos publicados</p>
                    </div>
                    <div class="dashboard-tab" id="tab-favoritos">
                        <h2 class="dashboard-title">Favoritos</h2>
                        <p class="dashboard-placeholder">Lista de deseos</p>
                    </div>
                    <div class="dashboard-tab" id="tab-configuracion">
                        <h2 class="dashboard-title">Configuración</h2>
                        <p class="dashboard-placeholder">Ajustes de cuenta</p>
                    </div>
                </main>
            </div>
        `;

        this.inicializarTabs();
    },

    getIconoActividad(tipo) {
        const iconos = {
            compra: 'bi-cart-check',
            reseña: 'bi-star',
            favorito: 'bi-heart',
            compartir: 'bi-share'
        };
        return iconos[tipo] || 'bi-activity';
    },

    inicializarTabs() {
        const navItems = document.querySelectorAll('.dashboard-nav .nav-item');
        const tabs = document.querySelectorAll('.dashboard-tab');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = item.dataset.tab;
                
                // Actualizar nav
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Actualizar tabs
                tabs.forEach(tab => tab.classList.remove('active'));
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    },

    inicializarGraficos() {
        // Placeholder para gráficos con Chart.js o similar
        console.log('Gráficos inicializados');
    },

    inicializarNotificaciones() {
        // Sistema de notificaciones del dashboard
        const notificaciones = [
            { tipo: 'info', mensaje: 'Tu pedido ha sido enviado', fecha: 'Hace 2 horas' },
            { tipo: 'success', mensaje: '¡Nuevo logro desbloqueado!', fecha: 'Hace 1 día' },
            { tipo: 'warning', mensaje: 'Oferta flash terminando pronto', fecha: 'Hace 3 días' }
        ];

        const container = document.getElementById('notificacionesDashboard');
        if (container) {
            container.innerHTML = notificaciones.map(notif => `
                <div class="notificacion-item ${notif.tipo}">
                    <i class="bi ${this.getIconoNotificacion(notif.tipo)}"></i>
                    <div class="notif-info">
                        <p>${notif.mensaje}</p>
                        <span>${notif.fecha}</span>
                    </div>
                </div>
            `).join('');
        }
    },

    getIconoNotificacion(tipo) {
        const iconos = {
            info: 'bi-info-circle',
            success: 'bi-check-circle',
            warning: 'bi-exclamation-triangle',
            error: 'bi-x-circle'
        };
        return iconos[tipo] || 'bi-bell';
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoDashboard.init());
} else {
    EcoDashboard.init();
}

// Exponer globalmente
window.EcoDashboard = EcoDashboard;
