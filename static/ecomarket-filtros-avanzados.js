/*
   EcoMarket - Sistema de Filtros Avanzados
   Filtrado de productos con múltiples criterios
   Author: EcoMarket Team
   Version: 4.0
*/

class SistemaFiltros {
    constructor() {
        this.filtrosActivos = {
            categoria: null,
            precioMin: null,
            precioMax: null,
            ecoScore: null,
            condicion: null,
            orden: 'relevancia'
        };
        this.productos = [];
        this.init();
    }

    init() {
        this.obtenerProductos();
        this.inicializarEventListeners();
        this.inicializarSliders();
        this.inicializarBotonesRapidos();
    }

    obtenerProductos() {
        // Obtener productos del DOM o API
        const elementos = document.querySelectorAll('.producto-card');
        this.productos = Array.from(elementos).map(el => {
            return {
                id: el.dataset.id,
                nombre: el.dataset.nombre,
                categoria: el.dataset.categoria,
                precio: parseFloat(el.dataset.precio),
                ecoScore: parseInt(el.dataset.ecoScore),
                condicion: el.dataset.condicion,
                stock: parseInt(el.dataset.stock),
                vistas: parseInt(el.dataset.vistas || 0),
                elemento: el
            };
        });
    }

    inicializarEventListeners() {
        // Filtro por categoría
        const selectCategoria = document.getElementById('filtro-categoria');
        if (selectCategoria) {
            selectCategoria.addEventListener('change', (e) => {
                this.filtrosActivos.categoria = e.target.value || null;
                this.aplicarFiltros();
            });
        }

        // Filtro por eco score
        const selectEcoScore = document.getElementById('filtro-eco-score');
        if (selectEcoScore) {
            selectEcoScore.addEventListener('change', (e) => {
                this.filtrosActivos.ecoScore = parseInt(e.target.value) || null;
                this.aplicarFiltros();
            });
        }

        // Filtro por condición
        const selectCondicion = document.getElementById('filtro-condicion');
        if (selectCondicion) {
            selectCondicion.addEventListener('change', (e) => {
                this.filtrosActivos.condicion = e.target.value || null;
                this.aplicarFiltros();
            });
        }

        // Ordenamiento
        const selectOrden = document.getElementById('filtro-orden');
        if (selectOrden) {
            selectOrden.addEventListener('change', (e) => {
                this.filtrosActivos.orden = e.target.value;
                this.aplicarFiltros();
            });
        }

        // Botón limpiar filtros
        const btnLimpiar = document.getElementById('btn-limpiar-filtros');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => {
                this.limpiarFiltros();
            });
        }

        // Botón aplicar filtros
        const btnAplicar = document.getElementById('btn-aplicar-filtros');
        if (btnAplicar) {
            btnAplicar.addEventListener('click', () => {
                this.aplicarFiltros();
            });
        }
    }

    inicializarSliders() {
        // Slider de precio mínimo
        const sliderPrecioMin = document.getElementById('slider-precio-min');
        const valorPrecioMin = document.getElementById('valor-precio-min');
        
        if (sliderPrecioMin && valorPrecioMin) {
            sliderPrecioMin.addEventListener('input', (e) => {
                valorPrecioMin.textContent = `S/ ${e.target.value}`;
                this.filtrosActivos.precioMin = parseFloat(e.target.value);
            });
        }

        // Slider de precio máximo
        const sliderPrecioMax = document.getElementById('slider-precio-max');
        const valorPrecioMax = document.getElementById('valor-precio-max');
        
        if (sliderPrecioMax && valorPrecioMax) {
            sliderPrecioMax.addEventListener('input', (e) => {
                valorPrecioMax.textContent = `S/ ${e.target.value}`;
                this.filtrosActivos.precioMax = parseFloat(e.target.value);
            });
        }
    }

    inicializarBotonesRapidos() {
        // Botones de eco score rápido
        const botonesEcoScore = document.querySelectorAll('.btn-eco-score');
        botonesEcoScore.forEach(btn => {
            btn.addEventListener('click', () => {
                const score = parseInt(btn.dataset.score);
                this.filtrosActivos.ecoScore = score;
                this.actualizarBotonesEcoScore(score);
                this.aplicarFiltros();
            });
        });

        // Botones de precio rápido
        const botonesPrecio = document.querySelectorAll('.btn-precio-rapido');
        botonesPrecio.forEach(btn => {
            btn.addEventListener('click', () => {
                const min = parseFloat(btn.dataset.min);
                const max = parseFloat(btn.dataset.max);
                this.filtrosActivos.precioMin = min;
                this.filtrosActivos.precioMax = max;
                this.actualizarSlidersPrecio(min, max);
                this.aplicarFiltros();
            });
        });
    }

    actualizarBotonesEcoScore(score) {
        const botones = document.querySelectorAll('.btn-eco-score');
        botones.forEach(btn => {
            const btnScore = parseInt(btn.dataset.score);
            if (btnScore === score) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    actualizarSlidersPrecio(min, max) {
        const sliderMin = document.getElementById('slider-precio-min');
        const sliderMax = document.getElementById('slider-precio-max');
        const valorMin = document.getElementById('valor-precio-min');
        const valorMax = document.getElementById('valor-precio-max');

        if (sliderMin) sliderMin.value = min;
        if (sliderMax) sliderMax.value = max;
        if (valorMin) valorMin.textContent = `S/ ${min}`;
        if (valorMax) valorMax.textContent = `S/ ${max}`;
    }

    aplicarFiltros() {
        let productosFiltrados = [...this.productos];

        // Filtro por categoría
        if (this.filtrosActivos.categoria) {
            productosFiltrados = productosFiltrados.filter(p => 
                p.categoria === this.filtrosActivos.categoria
            );
        }

        // Filtro por precio
        if (this.filtrosActivos.precioMin !== null) {
            productosFiltrados = productosFiltrados.filter(p => 
                p.precio >= this.filtrosActivos.precioMin
            );
        }

        if (this.filtrosActivos.precioMax !== null) {
            productosFiltrados = productosFiltrados.filter(p => 
                p.precio <= this.filtrosActivos.precioMax
            );
        }

        // Filtro por eco score
        if (this.filtrosActivos.ecoScore !== null) {
            productosFiltrados = productosFiltrados.filter(p => 
                p.ecoScore >= this.filtrosActivos.ecoScore
            );
        }

        // Filtro por condición
        if (this.filtrosActivos.condicion) {
            productosFiltrados = productosFiltrados.filter(p => 
                p.condicion === this.filtrosActivos.condicion
            );
        }

        // Filtro por stock (solo productos disponibles)
        productosFiltrados = productosFiltrados.filter(p => p.stock > 0);

        // Ordenamiento
        productosFiltrados = this.ordenarProductos(productosFiltrados);

        // Actualizar UI
        this.actualizarProductos(productosFiltrados);
        this.actualizarContador(productosFiltrados.length);
    }

    ordenarProductos(productos) {
        const orden = this.filtrosActivos.orden;

        switch (orden) {
            case 'precio-asc':
                return productos.sort((a, b) => a.precio - b.precio);
            case 'precio-desc':
                return productos.sort((a, b) => b.precio - a.precio);
            case 'eco-score':
                return productos.sort((a, b) => b.ecoScore - a.ecoScore);
            case 'novedad':
                return productos.sort((a, b) => b.id - a.id);
            case 'popular':
                return productos.sort((a, b) => b.vistas - a.vistas);
            case 'relevancia':
            default:
                return productos;
        }
    }

    actualizarProductos(productos) {
        // Ocultar todos los productos
        this.productos.forEach(p => {
            p.elemento.style.display = 'none';
        });

        // Mostrar productos filtrados
        productos.forEach(p => {
            p.elemento.style.display = 'block';
        });

        // Animación de entrada
        productos.forEach((p, index) => {
            p.elemento.style.opacity = '0';
            p.elemento.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                p.elemento.style.transition = 'all 0.3s ease';
                p.elemento.style.opacity = '1';
                p.elemento.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    actualizarContador(cantidad) {
        const contador = document.getElementById('contador-productos');
        if (contador) {
            contador.textContent = `${cantidad} productos encontrados`;
        }
    }

    limpiarFiltros() {
        this.filtrosActivos = {
            categoria: null,
            precioMin: null,
            precioMax: null,
            ecoScore: null,
            condicion: null,
            orden: 'relevancia'
        };

        // Resetear UI
        const selectCategoria = document.getElementById('filtro-categoria');
        if (selectCategoria) selectCategoria.value = '';

        const selectEcoScore = document.getElementById('filtro-eco-score');
        if (selectEcoScore) selectEcoScore.value = '';

        const selectCondicion = document.getElementById('filtro-condicion');
        if (selectCondicion) selectCondicion.value = '';

        const selectOrden = document.getElementById('filtro-orden');
        if (selectOrden) selectOrden.value = 'relevancia';

        const sliderMin = document.getElementById('slider-precio-min');
        const sliderMax = document.getElementById('slider-precio-max');
        const valorMin = document.getElementById('valor-precio-min');
        const valorMax = document.getElementById('valor-precio-max');

        if (sliderMin) sliderMin.value = 0;
        if (sliderMax) sliderMax.value = 500;
        if (valorMin) valorMin.textContent = 'S/ 0';
        if (valorMax) valorMax.textContent = 'S/ 500';

        this.actualizarBotonesEcoScore(null);
        this.aplicarFiltros();
    }

    obtenerFiltrosActivos() {
        return this.filtrosActivos;
    }

    obtenerURLConFiltros() {
        const params = new URLSearchParams();
        
        if (this.filtrosActivos.categoria) {
            params.set('categoria', this.filtrosActivos.categoria);
        }
        if (this.filtrosActivos.precioMin !== null) {
            params.set('precio_min', this.filtrosActivos.precioMin);
        }
        if (this.filtrosActivos.precioMax !== null) {
            params.set('precio_max', this.filtrosActivos.precioMax);
        }
        if (this.filtrosActivos.ecoScore !== null) {
            params.set('eco_score', this.filtrosActivos.ecoScore);
        }
        if (this.filtrosActivos.condicion) {
            params.set('condicion', this.filtrosActivos.condicion);
        }
        if (this.filtrosActivos.orden !== 'relevancia') {
            params.set('orden', this.filtrosActivos.orden);
        }

        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.contenedor-filtros')) {
        window.sistemaFiltros = new SistemaFiltros();
    }
});