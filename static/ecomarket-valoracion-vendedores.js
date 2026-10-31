/*
   EcoMarket - Sistema de Valoración de Vendedores
   Sistema de valoración con estrellas, reseñas y ranking
   Author: EcoMarket Team
   Version: 4.0
*/

class SistemaValoracionVendedores {
    constructor() {
        this.vendedorId = null;
        this.valoracion = null;
        this.init();
    }

    init() {
        this.obtenerVendedorId();
        this.cargarValoracion();
        this.inicializarEventListeners();
    }

    obtenerVendedorId() {
        const elemento = document.querySelector('[data-vendedor-id]');
        if (elemento) {
            this.vendedorId = elemento.dataset.vendedorId;
        }
    }

    async cargarValoracion() {
        if (!this.vendedorId) return;

        try {
            const response = await fetch(`/api/vendedores/${this.vendedorId}/valoracion`);
            if (response.ok) {
                const data = await response.json();
                this.valoracion = data;
                this.renderizarValoracion();
            }
        } catch (error) {
            console.error('Error cargando valoración:', error);
        }
    }

    inicializarEventListeners() {
        // Sistema de estrellas interactivo
        const estrellas = document.querySelectorAll('.estrella-valoracion');
        estrellas.forEach((estrella, indice) => {
            estrella.addEventListener('mouseenter', () => {
                this.iluminarEstrellas(indice + 1);
            });

            estrella.addEventListener('mouseleave', () => {
                this.iluminarEstrellas(this.valoracion?.promedio || 0);
            });

            estrella.addEventListener('click', () => {
                this.enviarValoracion(indice + 1);
            });
        });

        // Formulario de reseña
        const formResena = document.getElementById('form-resena-vendedor');
        if (formResena) {
            formResena.addEventListener('submit', (e) => {
                e.preventDefault();
                this.enviarResena();
            });
        }

        // Filtros de reseñas
        const filtroEstrellas = document.getElementById('filtro-estrellas');
        if (filtroEstrellas) {
            filtroEstrellas.addEventListener('change', (e) => {
                this.filtrarResenas(parseInt(e.target.value));
            });
        }
    }

    async enviarValoracion(puntuacion) {
        try {
            const response = await fetch(`/api/vendedores/${this.vendedorId}/valorar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ puntuacion })
            });

            if (response.ok) {
                const data = await response.json();
                this.valoracion = data;
                this.renderizarValoracion();
                this.mostrarExito('¡Gracias por tu valoración!');
            } else {
                this.mostrarError('Error al enviar valoración');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    async enviarResena() {
        const texto = document.getElementById('texto-resena-vendedor')?.value.trim();
        const rating = parseInt(document.getElementById('rating-resena-vendedor')?.value || 5);

        if (!texto || texto.length < 10) {
            this.mostrarError('La reseña debe tener al menos 10 caracteres');
            return;
        }

        try {
            const response = await fetch(`/api/vendedores/${this.vendedorId}/resena`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    texto: texto,
                    rating: rating
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.valoracion.resenas.unshift(data.resena);
                this.renderizarResenas();
                document.getElementById('texto-resena-vendedor').value = '';
                this.mostrarExito('Reseña enviada');
            } else {
                this.mostrarError('Error al enviar reseña');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    renderizarValoracion() {
        if (!this.valoracion) return;

        // Promedio de estrellas
        const promedio = this.valoracion.promedio || 0;
        this.iluminarEstrellas(promedio);

        // Número promedio
        const numeroPromedio = document.getElementById('numero-promedio');
        if (numeroPromedio) {
            numeroPromedio.textContent = promedio.toFixed(1);
        }

        // Total de valoraciones
        const totalValoraciones = document.getElementById('total-valoraciones');
        if (totalValoraciones) {
            totalValoraciones.textContent = `${this.valoracion.total} valoraciones`;
        }

        // Distribución de estrellas
        this.renderizarDistribucion();

        // Ranking
        this.renderizarRanking();

        // Reseñas
        this.renderizarResenas();
    }

    iluminarEstrellas(cantidad) {
        const estrellas = document.querySelectorAll('.estrella-valoracion');
        estrellas.forEach((estrella, indice) => {
            if (indice < cantidad) {
                estrella.classList.add('llena');
                estrella.classList.remove('vacia');
            } else {
                estrella.classList.remove('llena');
                estrella.classList.add('vacia');
            }
        });
    }

    renderizarDistribucion() {
        const contenedor = document.getElementById('distribucion-estrellas');
        if (!contenedor || !this.valoracion?.distribucion) return;

        let html = '<div class="distribucion-estrellas">';
        
        for (let i = 5; i >= 1; i--) {
            const cantidad = this.valoracion.distribucion[i] || 0;
            const porcentaje = this.valoracion.total > 0 
                ? (cantidad / this.valoracion.total) * 100 
                : 0;
            
            html += `
                <div class="fila-distribucion">
                    <div class="estrella-fija">${i} <i class="bi bi-star-fill"></i></div>
                    <div class="barra-progreso">
                        <div class="barra-fill" style="width: ${porcentaje}%"></div>
                    </div>
                    <div class="cantidad">${cantidad}</div>
                </div>
            `;
        }
        
        html += '</div>';
        contenedor.innerHTML = html;
    }

    renderizarRanking() {
        const ranking = document.getElementById('ranking-vendedor');
        if (!ranking || !this.valoracion?.ranking) return;

        ranking.textContent = `#${this.valoracion.ranking} en vendedores`;
        
        // Badge de top
        if (this.valoracion.ranking <= 10) {
            ranking.classList.add('top-vendedor');
        }
    }

    renderizarResenas(filtroEstrellas = null) {
        const contenedor = document.getElementById('contenedor-resenas-vendedor');
        if (!contenedor || !this.valoracion?.resenas) return;

        let reseñas = this.valoracion.resenas;
        
        if (filtroEstrellas) {
            reseñas = reseñas.filter(r => r.rating === filtroEstrellas);
        }

        if (reseñas.length === 0) {
            contenedor.innerHTML = '<p class="sin-resenas">No hay reseñas</p>';
            return;
        }

        let html = '<div class="lista-resenas-vendedor">';
        
        reseñas.forEach(r => {
            const estrellas = this.generarEstrellas(r.rating);
            const fecha = this.formatearFecha(r.fecha);
            
            html += `
                <div class="resena-vendedor">
                    <div class="encabezado-resena">
                        <img src="${r.usuario.avatar || '/static/assets/avatar-default.png'}" alt="${r.usuario.nombre}" class="avatar-resena">
                        <div>
                            <div class="nombre-resena">${r.usuario.nombre}</div>
                            <div class="estrellas-resena">${estrellas}</div>
                        </div>
                        <div class="fecha-resena">${fecha}</div>
                    </div>
                    <div class="texto-resena">${r.texto}</div>
                    <div class="compra-asociada">
                        <i class="bi bi-box-seam"></i>
                        <span>Compra: ${r.producto}</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        contenedor.innerHTML = html;
    }

    filtrarResenas(estrellas) {
        this.renderizarResenas(estrellas);
    }

    generarEstrellas(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                html += '<i class="bi bi-star-fill"></i>';
            } else {
                html += '<i class="bi bi-star"></i>';
            }
        }
        return html;
    }

    formatearFecha(fechaIso) {
        const fecha = new Date(fechaIso);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
    if (document.querySelector('.sistema-valoracion-vendedor')) {
        window.sistemaValoracionVendedores = new SistemaValoracionVendedores();
    }
});
