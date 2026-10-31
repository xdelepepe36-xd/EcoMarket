/*
   EcoMarket - Sistema de Comparación de Productos
   Comparación lateral de múltiples productos
   Author: EcoMarket Team
   Version: 4.0
*/

class SistemaComparacion {
    constructor() {
        this.productosComparando = [];
        this.maxProductos = 4;
        this.init();
    }

    init() {
        this.cargarDesdeLocalStorage();
        this.inicializarEventListeners();
        this.actualizarUI();
    }

    inicializarEventListeners() {
        // Botones de agregar a comparación
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-comparar')) {
                const productoId = e.target.dataset.id;
                this.agregarProducto(productoId);
            }
        });

        // Botón de abrir comparación
        const btnAbrirComparacion = document.getElementById('btn-abrir-comparacion');
        if (btnAbrirComparacion) {
            btnAbrirComparacion.addEventListener('click', () => {
                this.abrirModalComparacion();
            });
        }

        // Botón de eliminar de comparación
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-eliminar-comparacion')) {
                const productoId = e.target.dataset.id;
                this.eliminarProducto(productoId);
            }
        });

        // Botón de limpiar comparación
        const btnLimpiar = document.getElementById('btn-limpiar-comparacion');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => {
                this.limpiarComparacion();
            });
        }

        // Cerrar modal
        const btnCerrar = document.getElementById('btn-cerrar-comparacion');
        if (btnCerrar) {
            btnCerrar.addEventListener('click', () => {
                this.cerrarModalComparacion();
            });
        }
    }

    agregarProducto(productoId) {
        // Verificar si ya está en comparación
        if (this.productosComparando.find(p => p.id === productoId)) {
            this.mostrarNotificacion('El producto ya está en comparación', 'warning');
            return;
        }

        // Verificar límite máximo
        if (this.productosComparando.length >= this.maxProductos) {
            this.mostrarNotificacion(`Máximo ${this.maxProductos} productos para comparar`, 'error');
            return;
        }

        // Obtener datos del producto
        const producto = this.obtenerDatosProducto(productoId);
        if (!producto) {
            this.mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }

        // Agregar a comparación
        this.productosComparando.push(producto);
        this.guardarEnLocalStorage();
        this.actualizarUI();
        this.mostrarNotificacion('Producto agregado a comparación', 'success');
    }

    eliminarProducto(productoId) {
        this.productosComparando = this.productosComparando.filter(p => p.id !== productoId);
        this.guardarEnLocalStorage();
        this.actualizarUI();
        this.actualizarModalComparacion();
        this.mostrarNotificacion('Producto eliminado de comparación', 'info');
    }

    limpiarComparacion() {
        this.productosComparando = [];
        this.guardarEnLocalStorage();
        this.actualizarUI();
        this.cerrarModalComparacion();
        this.mostrarNotificacion('Comparación limpiada', 'info');
    }

    obtenerDatosProducto(productoId) {
        // Intentar obtener del DOM
        const elemento = document.querySelector(`[data-id="${productoId}"]`);
        if (elemento) {
            return {
                id: productoId,
                nombre: elemento.dataset.nombre,
                categoria: elemento.dataset.categoria,
                precio: parseFloat(elemento.dataset.precio),
                ecoScore: parseInt(elemento.dataset.ecoScore),
                condicion: elemento.dataset.condicion,
                stock: parseInt(elemento.dataset.stock),
                imagen: elemento.dataset.imagen,
                descripcion: elemento.dataset.descripcion || ''
            };
        }

        // Si no está en el DOM, intentar obtener de localStorage
        const productosGuardados = JSON.parse(localStorage.getItem('ecomarket_productos') || '[]');
        return productosGuardados.find(p => p.id === productoId);
    }

    abrirModalComparacion() {
        if (this.productosComparando.length < 2) {
            this.mostrarNotificacion('Agrega al menos 2 productos para comparar', 'warning');
            return;
        }

        const modal = document.getElementById('modal-comparacion');
        if (modal) {
            this.actualizarModalComparacion();
            modal.style.display = 'flex';
        }
    }

    cerrarModalComparacion() {
        const modal = document.getElementById('modal-comparacion');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    actualizarModalComparacion() {
        const contenedor = document.getElementById('contenedor-comparacion');
        if (!contenedor) return;

        // Generar tabla de comparación
        let html = '<div class="tabla-comparacion">';
        
        // Header con nombres
        html += '<div class="fila-comparacion header">';
        html += '<div class="celda-etiqueta">Característica</div>';
        this.productosComparando.forEach(p => {
            html += `
                <div class="celda-producto">
                    <img src="${p.imagen}" alt="${p.nombre}" class="imagen-producto-comparacion">
                    <h3>${p.nombre}</h3>
                    <button class="btn-eliminar-comparacion" data-id="${p.id}">✕</button>
                </div>
            `;
        });
        html += '</div>';

        // Categoría
        html += '<div class="fila-comparacion">';
        html += '<div class="celda-etiqueta">Categoría</div>';
        this.productosComparando.forEach(p => {
            html += `<div class="celda-valor">${p.categoria}</div>`;
        });
        html += '</div>';

        // Precio
        html += '<div class="fila-comparacion">';
        html += '<div class="celda-etiqueta">Precio</div>';
        this.productosComparando.forEach(p => {
            const mejorPrecio = Math.min(...this.productosComparando.map(prod => prod.precio));
            const esMejor = p.precio === mejorPrecio;
            html += `<div class="celda-valor ${esMejor ? 'mejor' : ''}">S/ ${p.precio.toFixed(2)}</div>`;
        });
        html += '</div>';

        // Eco Score
        html += '<div class="fila-comparacion">';
        html += '<div class="celda-etiqueta">Eco Score</div>';
        this.productosComparando.forEach(p => {
            const mejorScore = Math.max(...this.productosComparando.map(prod => prod.ecoScore));
            const esMejor = p.ecoScore === mejorScore;
            html += `<div class="celda-valor ${esMejor ? 'mejor' : ''}">${p.ecoScore}/10</div>`;
        });
        html += '</div>';

        // Condición
        html += '<div class="fila-comparacion">';
        html += '<div class="celda-etiqueta">Condición</div>';
        this.productosComparando.forEach(p => {
            html += `<div class="celda-valor">${p.condicion}</div>`;
        });
        html += '</div>';

        // Stock
        html += '<div class="fila-comparacion">';
        html += '<div class="celda-etiqueta">Stock</div>';
        this.productosComparando.forEach(p => {
            const enStock = p.stock > 0;
            html += `<div class="celda-valor ${enStock ? 'disponible' : 'agotado'}">${p.stock} unidades</div>`;
        });
        html += '</div>';

        // Descripción
        html += '<div class="fila-comparacion">';
        html += '<div class="celda-etiqueta">Descripción</div>';
        this.productosComparando.forEach(p => {
            html += `<div class="celda-valor descripcion">${p.descripcion.substring(0, 100)}...</div>`;
        });
        html += '</div>';

        // Botones de acción
        html += '<div class="fila-comparacion">';
        html += '<div class="celda-etiqueta">Acción</div>';
        this.productosComparando.forEach(p => {
            html += `
                <div class="celda-valor">
                    <a href="/producto/${p.id}" class="btn btn-ver-producto">Ver Producto</a>
                </div>
            `;
        });
        html += '</div>';

        html += '</div>';

        contenedor.innerHTML = html;
    }

    actualizarUI() {
        // Actualizar contador de productos en comparación
        const contador = document.getElementById('contador-comparacion');
        if (contador) {
            contador.textContent = this.productosComparando.length;
        }

        // Mostrar/ocultar botón de abrir comparación
        const btnAbrir = document.getElementById('btn-abrir-comparacion');
        if (btnAbrir) {
            btnAbrir.style.display = this.productosComparando.length >= 2 ? 'block' : 'none';
        }

        // Actualizar estado de botones de comparación
        document.querySelectorAll('.btn-comparar').forEach(btn => {
            const productoId = btn.dataset.id;
            const estaComparando = this.productosComparando.find(p => p.id === productoId);
            
            if (estaComparando) {
                btn.classList.add('active');
                btn.textContent = 'Comparando';
            } else {
                btn.classList.remove('active');
                btn.textContent = 'Comparar';
            }
        });
    }

    guardarEnLocalStorage() {
        localStorage.setItem('ecomarket_comparacion', JSON.stringify(this.productosComparando));
    }

    cargarDesdeLocalStorage() {
        const guardado = localStorage.getItem('ecomarket_comparacion');
        if (guardado) {
            this.productosComparando = JSON.parse(guardado);
        }
    }

    mostrarNotificacion(mensaje, tipo) {
        // Crear elemento de notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.textContent = mensaje;
        
        document.body.appendChild(notificacion);
        
        // Animación de entrada
        setTimeout(() => {
            notificacion.classList.add('visible');
        }, 10);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }

    obtenerProductosComparando() {
        return this.productosComparando;
    }

    obtenerCantidad() {
        return this.productosComparando.length;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaComparacion = new SistemaComparacion();
});