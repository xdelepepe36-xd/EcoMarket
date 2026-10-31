/*
   EcoMarket - Wishlist Compartido
   Sistema de wishlist compartido para listas de regalos con amigos
   Author: EcoMarket Team
   Version: 4.0
*/

class WishlistCompartido {
    constructor() {
        this.wishlist = [];
        this.listaCompartida = null;
        this.init();
    }

    init() {
        this.cargarWishlist();
        this.inicializarEventListeners();
        this.verificarListaCompartida();
    }

    async cargarWishlist() {
        try {
            const response = await fetch('/api/wishlist');
            if (response.ok) {
                const data = await response.json();
                this.wishlist = data.productos;
                this.renderizarWishlist();
            }
        } catch (error) {
            console.error('Error cargando wishlist:', error);
        }
    }

    inicializarEventListeners() {
        // Botón agregar a wishlist
        const btnAgregar = document.getElementById('btn-agregar-wishlist');
        if (btnAgregar) {
            btnAgregar.addEventListener('click', () => {
                this.agregarAWishlist();
            });
        }

        // Botón compartir wishlist
        const btnCompartir = document.getElementById('btn-compartir-wishlist');
        if (btnCompartir) {
            btnCompartir.addEventListener('click', () => {
                this.compartirWishlist();
            });
        }

        // Botón crear lista compartida
        const btnCrearLista = document.getElementById('btn-crear-lista-compartida');
        if (btnCrearLista) {
            btnCrearLista.addEventListener('click', () => {
                this.crearListaCompartida();
            });
        }

        // Botón eliminar de wishlist
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-eliminar-wishlist')) {
                const productoId = e.target.dataset.productoId;
                this.eliminarDeWishlist(productoId);
            }
        });

        // Input de URL compartida
        const inputUrl = document.getElementById('input-url-compartida');
        const btnCargar = document.getElementById('btn-cargar-lista-compartida');
        
        if (btnCargar) {
            btnCargar.addEventListener('click', () => {
                this.cargarListaCompartidaDesdeUrl(inputUrl?.value);
            });
        }
    }

    async agregarAWishlist() {
        const productoId = document.getElementById('wishlist-producto-id')?.value;
        
        if (!productoId) {
            this.mostrarError('Por favor selecciona un producto');
            return;
        }

        try {
            const response = await fetch('/api/wishlist/agregar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ producto_id: productoId })
            });

            if (response.ok) {
                const data = await response.json();
                this.wishlist.push(data.producto);
                this.renderizarWishlist();
                this.mostrarExito('Producto agregado a wishlist');
            } else {
                this.mostrarError('Error al agregar a wishlist');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    async eliminarDeWishlist(productoId) {
        try {
            const response = await fetch('/api/wishlist/eliminar', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ producto_id: productoId })
            });

            if (response.ok) {
                this.wishlist = this.wishlist.filter(p => p.id !== parseInt(productoId));
                this.renderizarWishlist();
                this.mostrarExito('Producto eliminado de wishlist');
            } else {
                this.mostrarError('Error al eliminar de wishlist');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    async crearListaCompartida() {
        const nombre = document.getElementById('nombre-lista-compartida')?.value.trim();
        const descripcion = document.getElementById('descripcion-lista-compartida')?.value.trim();

        if (!nombre) {
            this.mostrarError('Por favor ingresa un nombre para la lista');
            return;
        }

        try {
            const response = await fetch('/api/wishlist/compartir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: nombre,
                    descripcion: descripcion,
                    productos: this.wishlist.map(p => p.id)
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.listaCompartida = data.lista;
                this.mostrarURLCompartida(data.url);
                this.mostrarExito('Lista compartida creada');
            } else {
                this.mostrarError('Error al crear lista compartida');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    async compartirWishlist() {
        if (this.wishlist.length === 0) {
            this.mostrarError('Tu wishlist está vacía');
            return;
        }

        const nombre = prompt('Nombre de la lista de regalos:', 'Mi lista de regalos');
        if (!nombre) return;

        try {
            const response = await fetch('/api/wishlist/compartir', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: nombre,
                    descripcion: 'Lista de regalos compartida',
                    productos: this.wishlist.map(p => p.id)
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.mostrarURLCompartida(data.url);
                this.mostrarExito('Lista compartida');
            } else {
                this.mostrarError('Error al compartir wishlist');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    async cargarListaCompartidaDesdeUrl(url) {
        try {
            const response = await fetch(`/api/wishlist/cargar?url=${encodeURIComponent(url)}`);
            if (response.ok) {
                const data = await response.json();
                this.wishlist = data.productos;
                this.listaCompartida = data.lista;
                this.renderizarWishlist();
                this.renderizarInfoLista();
                this.mostrarExito('Lista cargada exitosamente');
            } else {
                this.mostrarError('Error al cargar lista compartida');
            }
        } catch (error) {
            this.mostrarError('Error de conexión');
        }
    }

    verificarListaCompartida() {
        const params = new URLSearchParams(window.location.search);
        const listaId = params.get('lista');

        if (listaId) {
            this.cargarListaCompartidaDesdeUrl(window.location.href);
        }
    }

    renderizarWishlist() {
        const contenedor = document.getElementById('contenedor-wishlist');
        if (!contenedor) return;

        if (this.wishlist.length === 0) {
            contenedor.innerHTML = '<p class="sin-wishlist">Tu wishlist está vacía</p>';
            return;
        }

        let html = '<div class="grid-wishlist">';
        
        this.wishlist.forEach(producto => {
            html += `
                <div class="card-wishlist">
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-wishlist">
                    <div class="info-wishlist">
                        <h4>${producto.nombre}</h4>
                        <div class="precio-wishlist">S/ ${producto.precio.toFixed(2)}</div>
                        <div class="acciones-wishlist">
                            <a href="/producto/${producto.id}" class="btn-ver-producto">Ver</a>
                            <button class="btn-eliminar-wishlist" data-producto-id="${producto.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        contenedor.innerHTML = html;
    }

    renderizarInfoLista() {
        const info = document.getElementById('info-lista-compartida');
        if (!info || !this.listaCompartida) return;

        info.innerHTML = `
            <div class="info-compartida">
                <div class="lista-nombre">${this.listaCompartida.nombre}</div>
                <div class="lista-descripcion">${this.listaCompartida.descripcion}</div>
                <div class="lista-productos">${this.wishlist.length} productos</div>
                <div class="lista-creador">Por: ${this.listaCompartida.creador}</div>
            </div>
        `;
    }

    mostrarURLCompartida(url) {
        const modal = document.getElementById('modal-url-compartida');
        if (modal) {
            const inputUrl = modal.querySelector('#url-compartida-generada');
            if (inputUrl) {
                inputUrl.value = url;
            }
            modal.style.display = 'flex';
        }
    }

    copiarURLCompartida() {
        const inputUrl = document.getElementById('url-compartida-generada');
        if (inputUrl) {
            inputUrl.select();
            document.execCommand('copy');
            this.mostrarExito('URL copiada al portapapeles');
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
    if (document.querySelector('.sistema-wishlist')) {
        window.wishlistCompartido = new WishlistCompartido();
    }
});
