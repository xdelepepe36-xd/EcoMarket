/*
   EcoMarket - Dashboard de Usuario Premium
   Estadísticas de compras, ventas, ahorro ecológico y badges
   Author: EcoMarket Team
   Version: 4.0
*/

class DashboardUsuarioPremium {
    constructor() {
        this.datosUsuario = null;
        this.estadisticas = null;
        this.init();
    }

    init() {
        this.cargarDatosUsuario();
        this.cargarEstadisticas();
        this.inicializarGraficos();
        this.inicializarEventListeners();
    }

    async cargarDatosUsuario() {
        try {
            const response = await fetch('/api/usuario/datos');
            if (response.ok) {
                this.datosUsuario = await response.json();
                this.renderizarPerfil();
            }
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
        }
    }

    async cargarEstadisticas() {
        try {
            const response = await fetch('/api/usuario/estadisticas');
            if (response.ok) {
                this.estadisticas = await response.json();
                this.renderizarEstadisticas();
                this.renderizarGraficos();
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }

    renderizarPerfil() {
        if (!this.datosUsuario) return;

        // Avatar y nombre
        const avatar = document.getElementById('dashboard-avatar');
        const nombre = document.getElementById('dashboard-nombre');
        const rango = document.getElementById('dashboard-rango');
        const nivel = document.getElementById('dashboard-nivel');
        const xp = document.getElementById('dashboard-xp');

        if (avatar) avatar.src = this.datosUsuario.avatar;
        if (nombre) nombre.textContent = this.datosUsuario.nombre;
        if (rango) rango.textContent = this.datosUsuario.rango;
        if (nivel) nivel.textContent = `Nivel ${this.datosUsuario.nivel}`;
        if (xp) xp.textContent = `${this.datosUsuario.xp} XP`;
    }

    renderizarEstadisticas() {
        if (!this.estadisticas) return;

        // Compras
        const totalCompras = document.getElementById('stat-total-compras');
        const gastoTotal = document.getElementById('stat-gasto-total');
        const comprasMes = document.getElementById('stat-compras-mes');

        if (totalCompras) totalCompras.textContent = this.estadisticas.compras.total;
        if (gastoTotal) gastoTotal.textContent = `S/ ${this.estadisticas.compras.gastoTotal.toFixed(2)}`;
        if (comprasMes) comprasMes.textContent = this.estadisticas.compras.mes;

        // Ventas
        const totalVentas = document.getElementById('stat-total-ventas');
        const ingresosTotal = document.getElementById('stat-ingresos-total');
        const ventasMes = document.getElementById('stat-ventas-mes');

        if (totalVentas) totalVentas.textContent = this.estadisticas.ventas.total;
        if (ingresosTotal) ingresosTotal.textContent = `S/ ${this.estadisticas.ventas.ingresosTotal.toFixed(2)}`;
        if (ventasMes) ventasMes.textContent = this.estadisticas.ventas.mes;

        // Impacto Ecológico
        const co2Ahorrado = document.getElementById('stat-co2-ahorrado');
        const plasticoAhorrado = document.getElementById('stat-plastico-ahorrado');
        const arbolesPlantados = document.getElementById('stat-arboles-plantados');

        if (co2Ahorrado) co2Ahorrado.textContent = `${this.estadisticas.impacto.co2} kg`;
        if (plasticoAhorrado) plasticoAhorrado.textContent = `${this.estadisticas.impacto.plastico} kg`;
        if (arbolesPlantados) arbolesPlantados.textContent = this.estadisticas.impacto.arboles;

        // Badges
        this.renderizarBadges();
    }

    renderizarBadges() {
        const contenedor = document.getElementById('contenedor-badges');
        if (!contenedor || !this.datosUsuario?.badges) return;

        let html = '<div class="grid-badges">';
        
        this.datosUsuario.badges.forEach(badge => {
            html += `
                <div class="badge-item ${badge.obtenido ? 'obtenido' : 'pendiente'}">
                    <div class="badge-icono">
                        <i class="bi ${badge.icono}"></i>
                    </div>
                    <div class="badge-info">
                        <div class="badge-nombre">${badge.nombre}</div>
                        <div class="badge-descripcion">${badge.descripcion}</div>
                        ${!badge.obtenido ? `<div class="badge-progreso">${badge.progreso}%</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        contenedor.innerHTML = html;
    }

    inicializarGraficos() {
        this.graficoCompras();
        this.graficoVentas();
        this.graficoImpacto();
    }

    graficoCompras() {
        const canvas = document.getElementById('grafico-compras');
        if (!canvas || !this.estadisticas?.compras.historial) return;

        const ctx = canvas.getContext('2d');
        const datos = this.estadisticas.compras.historial;
        
        // Gráfico simple con canvas
        this.dibujarGraficoLinea(ctx, datos, '#2e7d32');
    }

    graficoVentas() {
        const canvas = document.getElementById('grafico-ventas');
        if (!canvas || !this.estadisticas?.ventas.historial) return;

        const ctx = canvas.getContext('2d');
        const datos = this.estadisticas.ventas.historial;
        
        this.dibujarGraficoLinea(ctx, datos, '#1976d2');
    }

    graficoImpacto() {
        const canvas = document.getElementById('grafico-impacto');
        if (!canvas || !this.estadisticas?.impacto.distribucion) return;

        const ctx = canvas.getContext('2d');
        const datos = this.estadisticas.impacto.distribucion;
        
        this.dibujarGraficoCircular(ctx, datos);
    }

    dibujarGraficoLinea(ctx, datos, color) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 40;
        
        ctx.clearRect(0, 0, width, height);
        
        // Encontrar máximos
        const maxValor = Math.max(...datos);
        
        // Dibujar líneas de grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 4; i++) {
            const y = padding + (height - 2 * padding) * (i / 4);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Dibujar línea de datos
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        datos.forEach((valor, indice) => {
            const x = padding + (width - 2 * padding) * (indice / (datos.length - 1));
            const y = height - padding - (height - 2 * padding) * (valor / maxValor);
            
            if (indice === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Dibujar puntos
        ctx.fillStyle = color;
        datos.forEach((valor, indice) => {
            const x = padding + (width - 2 * padding) * (indice / (datos.length - 1));
            const y = height - padding - (height - 2 * padding) * (valor / maxValor);
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    dibujarGraficoCircular(ctx, datos) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radio = Math.min(width, height) / 2 - 20;
        
        ctx.clearRect(0, 0, width, height);
        
        const colores = ['#2e7d32', '#1976d2', '#f57c00', '#7b1fa2'];
        const total = Object.values(datos).reduce((a, b) => a + b, 0);
        
        let anguloActual = 0;
        
        Object.entries(datos).forEach(([categoria, valor], indice) => {
            const angulo = (valor / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radio, anguloActual, anguloActual + angulo);
            ctx.closePath();
            
            ctx.fillStyle = colores[indice % colores.length];
            ctx.fill();
            
            anguloActual += angulo;
        });
        
        // Dibujar círculo blanco en el centro (donut chart)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radio * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }

    inicializarEventListeners() {
        // Pestañas del dashboard
        const pestañas = document.querySelectorAll('.pestaña-dashboard');
        pestañas.forEach(pestaña => {
            pestaña.addEventListener('click', () => {
                this.cambiarPestaña(pestaña.dataset.pestana);
            });
        });

        // Botón exportar datos
        const btnExportar = document.getElementById('btn-exportar-datos');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => {
                this.exportarDatos();
            });
        }

        // Botón configurar notificaciones
        const btnNotificaciones = document.getElementById('btn-configurar-notificaciones');
        if (btnNotificaciones) {
            btnNotificaciones.addEventListener('click', () => {
                this.configurarNotificaciones();
            });
        }
    }

    cambiarPestaña(pestanaId) {
        // Ocultar todos los contenidos
        document.querySelectorAll('.contenido-pestana').forEach(el => {
            el.style.display = 'none';
        });

        // Mostrar contenido seleccionado
        const contenido = document.getElementById(`contenido-${pestanaId}`);
        if (contenido) {
            contenido.style.display = 'block';
        }

        // Actualizar pestañas activas
        document.querySelectorAll('.pestaña-dashboard').forEach(pestaña => {
            if (pestaña.dataset.pestana === pestañaId) {
                pestaña.classList.add('activa');
            } else {
                pestaña.classList.remove('activa');
            }
        });
    }

    exportarDatos() {
        if (!this.estadisticas) return;

        const datos = {
            usuario: this.datosUsuario,
            estadisticas: this.estadisticas,
            fechaExportacion: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ecomarket_datos_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.mostrarExito('Datos exportados exitosamente');
    }

    configurarNotificaciones() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.mostrarExito('Notificaciones activadas');
                } else {
                    this.mostrarError('Notificaciones denegadas');
                }
            });
        } else {
            this.mostrarError('Tu navegador no soporta notificaciones');
        }
    }

    mostrarExito(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion notificacion-exito';
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('visible');
        }, 10);
        
        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }

    mostrarError(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion notificacion-error';
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('visible');
        }, 10);
        
        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.dashboard-premium')) {
        window.dashboardPremium = new DashboardUsuarioPremium();
    }
});