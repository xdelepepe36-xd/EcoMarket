/*
   EcoMarket - Página de Producto Mejorada
   Galería de imágenes, productos relacionados, reseñas destacadas
   Author: EcoMarket Team
   Version: 4.0
*/

class PaginaProductoMejorada {
    constructor() {
        this.productoId = null;
        this.imagenes = [];
        this.indiceImagenActual = 0;
        this.init();
    }

    init() {
        this.obtenerProductoId();
        this.inicializarGaleria();
        this.inicializarZoom();
        this.cargarProductosRelacionados();
        this.inicializarEventListeners();
        this.cargarResenasDestacadas();
    }

    obtenerProductoId() {
        const elemento = document.querySelector('[data-producto-id]');
        if (elemento) {
            this.productoId = elemento.dataset.productoId;
        }
    }

    inicializarGaleria() {
        // Obtener imágenes del producto
        const contenedorImagenes = document.getElementById('galeria-imagenes');
        if (contenedorImagenes) {
            const imagenes = contenedorImagenes.querySelectorAll('.imagen-galeria');
            this.imagenes = Array.from(imagenes).map(img => img.src);
        }

        // Inicializar thumbnails
        const thumbnails = document.querySelectorAll('.thumbnail-imagen');
        thumbnails.forEach((thumb, indice) => {
            thumb.addEventListener('click', () => {
                this.cambiarImagen(indice);
            });
        });

        // Botones de navegación
        const btnAnterior = document.getElementById('btn-imagen-anterior');
        const btnSiguiente = document.getElementById('btn-imagen-siguiente');

        if (btnAnterior) {
            btnAnterior.addEventListener('click', () => this.imagenAnterior());
        }

        if (btnSiguiente) {
            btnSiguiente.addEventListener('click', () => this.imagenSiguiente());
        }

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.imagenAnterior();
            if (e.key === 'ArrowRight') this.imagenSiguiente();
        });
    }

    inicializarZoom() {
        const imagenPrincipal = document.getElementById('imagen-principal');
        if (!imagenPrincipal) return;

        imagenPrincipal.addEventListener('mousemove', (e) => {
            this.aplicarZoom(e, imagenPrincipal);
        });

        imagenPrincipal.addEventListener('mouseleave', () => {
            this.quitarZoom(imagenPrincipal);
        });
    }

    aplicarZoom(e, imagen) {
        const rect = imagen.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        imagen.style.transformOrigin = `${x}px ${y}px`;
        imagen.style.transform = 'scale(2)';
    }

    quitarZoom(imagen) {
        imagen.style.transformOrigin = 'center center';
        imagen.style.transform = 'scale(1)';
    }

    cambiarImagen(indice) {
        if (indice < 0 || indice >= this.imagenes.length) return;

        this.indiceImagenActual = indice;
        const imagenPrincipal = document.getElementById('imagen-principal');
        
        if (imagenPrincipal) {
            imagenPrincipal.style.opacity = '0';
            setTimeout(() => {
                imagenPrincipal.src = this.imagenes[indice];
                imagenPrincipal.style.opacity = '1';
            }, 200);
        }

        // Actualizar thumbnails
        document.querySelectorAll('.thumbnail-imagen').forEach((thumb, i) => {
            if (i === indice) {
                thumb.classList.add('activo');
            } else {
                thumb.classList.remove('activo');
            }
        });
    }

    imagenAnterior() {
        const nuevoIndice = this.indiceImagenActual - 1;
        if (nuevoIndice < 0) {
            this.cambiarImagen(this.imagenes.length - 1);
        } else {
            this.cambiarImagen(nuevoIndice);
        }
    }

    imagenSiguiente() {
        const nuevoIndice = this.indiceImagenActual + 1;
        if (nuevoIndice >= this.imagenes.length) {
            this.cambiarImagen(0);
        } else {
            this.cambiarImagen(nuevoIndice);
        }
    }

    async cargarProductosRelacionados() {
        if (!this.productoId) return;

        try {
            const response = await fetch(`/api/productos/${this.productoId}/relacionados`);
            if (response.ok) {
                const data = await response.json();
                this.renderizarProductosRelacionados(data.productos);
            }
        } catch (error) {
            console.error('Error cargando productos relacionados:', error);
        }
    }

    renderizarProductosRelacionados(productos) {
        const contenedor = document.getElementById('contenedor-relacionados');
        if (!contenedor) return;

        if (productos.length === 0) {
            contenedor.innerHTML = '<p class="sin-resultados">No hay productos relacionados</p>';
            return;
        }

        let html = '<div class="grid-relacionados">';
        
        productos.forEach(p => {
            html += `
                <div class="card-producto-relacionado">
                    <a href="/producto/${p.id}">
                        <img src="${p.imagen}" alt="${p.nombre}" class="imagen-relacionado">
                        <div class="info-relacionado">
                            <h4>${p.nombre}</h4>
                            <div class="precio">S/ ${p.precio.toFixed(2)}</div>
                            <div class="eco-score">Eco Score: ${p.ecoScore}/10</div>
                        </div>
                    </a>
                </div>
            `;
        });
        
        html += '</div>';
        contenedor.innerHTML = html;
    }

    async cargarResenasDestacadas() {
        if (!this.productoId) return;

        try {
            const response = await fetch(`/api/productos/${this.productoId}/resenas?destacadas=true`);
            if (response.ok) {
                const data = await response.json();
                this.renderizarResenasDestacadas(data.resenas);
            }
        } catch (error) {
            console.error('Error cargando reseñas destacadas:', error);
        }
    }

    renderizarResenasDestacadas(resenas) {
        const contenedor = document.getElementById('contenedor-resenas-destacadas');
        if (!contenedor) return;

        if (resenas.length === 0) {
            contenedor.innerHTML = '<p class="sin-resultados">No hay reseñas destacadas</p>';
            return;
        }

        let html = '<div class="lista-resenas-destacadas">';
        
        resenas.forEach(r => {
            const estrellas = this.generarEstrellas(r.rating);
            html += `
                <div class="resena-destacada">
                    <div class="encabezado-resena">
                        <img src="${r.usuario.avatar || '/static/assets/avatar-default.png'}" alt="${r.usuario.nombre}" class="avatar-resena">
                        <div>
                            <div class="nombre-resena">${r.usuario.nombre}</div>
                            <div class="estrellas-resena">${estrellas}</div>
                        </div>
                        <div class="fecha-resena">${this.formatearFecha(r.fecha)}</div>
                    </div>
                    <div class="texto-resena">${r.comentario}</div>
                    ${r.respuesta ? `
                        <div class="respuesta-vendedor-destacada">
                            <div class="badge-vendedor">Vendedor</div>
                            <div class="texto-respuesta">${r.respuesta}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        contenedor.innerHTML = html;
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
            month: 'long',
            day: 'numeric'
        });
    }

    inicializarEventListeners() {
        // Botón agregar al carrito
        const btnAgregarCarrito = document.getElementById('btn-agregar-carrito');
        if (btnAgregarCarrito) {
            btnAgregarCarrito.addEventListener('click', () => {
                this.agregarAlCarrito();
            });
        }

        // Botón agregar a favoritos
        const btnFavoritos = document.getElementById('btn-favoritos');
        if (btnFavoritos) {
            btnFavoritos.addEventListener('click', () => {
                this.agregarAFavoritos();
            });
        }

        // Selector de cantidad
        const selectCantidad = document.getElementById('cantidad-producto');
        if (selectCantidad) {
            selectCantidad.addEventListener('change', () => {
                this.actualizarPrecioTotal();
            });
        }

        // Botón comprar ahora
        const btnComprarAhora = document.getElementById('btn-comprar-ahora');
        if (btnComprarAhora) {
            btnComprarAhora.addEventListener('click', () => {
                this.comprarAhora();
            });
        }

        // Botón compartir
        const btnCompartir = document.getElementById('btn-compartir');
        if (btnCompartir) {
            btnCompartir.addEventListener('click', () => {
                this.compartirProducto();
            });
        }
    }

    async agregarAlCarrito() {
        const cantidad = parseInt(document.getElementById('cantidad-producto')?.value || 1);
        
        try {
            const response = await fetch('/api/carrito', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    producto_id: this.productoId,
                    cantidad: cantidad
                })
            });

            if (response.ok) {
                this.mostrarExito('Producto agregado al carrito');
                this.actualizarContadorCarrito();
            } else {
                this.mostrarError('Error al agregar al carrito');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    async agregarAFavoritos() {
        try {
            const response = await fetch('/api/favoritos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    producto_id: this.productoId
                })
            });

            if (response.ok) {
                this.mostrarExito('Producto agregado a favoritos');
                const btnFavoritos = document.getElementById('btn-favoritos');
                if (btnFavoritos) {
                    btnFavoritos.classList.add('activo');
                    btnFavoritos.innerHTML = '<i class="bi bi-heart-fill"></i> En favoritos';
                }
            } else {
                this.mostrarError('Error al agregar a favoritos');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    actualizarPrecioTotal() {
        const cantidad = parseInt(document.getElementById('cantidad-producto')?.value || 1);
        const precio = parseFloat(document.getElementById('precio-unitario')?.dataset.precio || 0);
        const total = cantidad * precio;

        const precioTotal = document.getElementById('precio-total');
        if (precioTotal) {
            precioTotal.textContent = `S/ ${total.toFixed(2)}`;
        }
    }

    comprarAhora() {
        this.agregarAlCarrito().then(() => {
            window.location.href = '/carrito';
        });
    }

    compartirProducto() {
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: document.title,
                url: url
            });
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(url).then(() => {
                this.mostrarExito('Enlace copiado al portapapeles');
            });
        }
    }

    actualizarContadorCarrito() {
        const contador = document.getElementById('cartCount');
        if (contador) {
            const actual = parseInt(contador.textContent || 0);
            contador.textContent = actual + 1;
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
    if (document.querySelector('.pagina-producto')) {
        window.paginaProducto = new PaginaProductoMejorada();
    }
});