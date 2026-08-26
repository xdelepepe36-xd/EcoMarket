/**
 * EcoMarket - Funcionalidades Extra
 * Funcionalidades adicionales útiles
 */

const EcoExtra = {
    // Sistema de cupones y descuentos
    cupones: {
        activos: [],
        cuponesDisponibles: [
            { codigo: 'ECO10', descuento: 10, tipo: 'porcentaje', descripcion: '10% de descuento', minimo: 50 },
            { codigo: 'VERDE20', descuento: 20, tipo: 'porcentaje', descripcion: '20% de descuento', minimo: 100 },
            { codigo: 'ENVIOGRATIS', descuento: 15, tipo: 'fijo', descripcion: 'S/. 15 de descuento en envío', minimo: 0 },
            { codigo: 'BIENVENIDA', descuento: 25, tipo: 'porcentaje', descripcion: '25% primera compra', minimo: 30, primera_compra: true }
        ],

        init() {
            this.cargarCupones();
            this.renderInputCupon();
        },

        cargarCupones() {
            const saved = localStorage.getItem('ecomarket-cupones');
            if (saved) {
                this.activos = JSON.parse(saved);
            }
        },

        guardarCupones() {
            localStorage.setItem('ecomarket-cupones', JSON.stringify(this.activos));
        },

        aplicarCupon(codigo) {
            const cupon = this.cuponesDisponibles.find(c => c.codigo === codigo.toUpperCase());
            
            if (!cupon) {
                if (window.EcoToast) {
                    EcoToast.show('Cupón inválido', 'Este código no existe', 'error');
                }
                return false;
            }

            if (this.activos.includes(codigo)) {
                if (window.EcoToast) {
                    EcoToast.show('Ya aplicado', 'Este cupón ya está activo', 'warning');
                }
                return false;
            }

            if (cupon.primera_compra) {
                const usado = localStorage.getItem('ecomarket-cupon-usado-' + codigo);
                if (usado) {
                    if (window.EcoToast) {
                        EcoToast.show('Ya usado', 'Este cupón es solo para primera compra', 'warning');
                    }
                    return false;
                }
            }

            this.activos.push(codigo);
            this.guardarCupones();
            
            if (window.EcoToast) {
                EcoToast.show('¡Cupón aplicado!', `${cupon.descripcion}`, 'success');
            }
            
            return true;
        },

        renderInputCupon() {
            const container = document.getElementById('cuponInputContainer');
            if (!container) return;

            container.innerHTML = `
                <div class="cupon-input-wrapper">
                    <input type="text" id="cuponInput" placeholder="Ingresa código de cupón" />
                    <button id="aplicarCupon">Aplicar</button>
                </div>
                <div class="cupones-disponibles">
                    <h4>Cupones disponibles:</h4>
                    ${this.cuponesDisponibles.map(cupon => `
                        <div class="cupon-card">
                            <div class="cupon-codigo">${cupon.codigo}</div>
                            <div class="cupon-info">
                                <p>${cupon.descripcion}</p>
                                <small>Mínimo: S/. ${cupon.minimo}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            const input = container.querySelector('#cuponInput');
            const btn = container.querySelector('#aplicarCupon');

            btn.addEventListener('click', () => {
                this.aplicarCupon(input.value);
                input.value = '';
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.aplicarCupon(input.value);
                    input.value = '';
                }
            });
        },

        calcularDescuento(total) {
            let descuentoTotal = 0;
            this.activos.forEach(codigo => {
                const cupon = this.cuponesDisponibles.find(c => c.codigo === codigo);
                if (cupon) {
                    if (total >= cupon.minimo) {
                        if (cupon.tipo === 'porcentaje') {
                            descuentoTotal += total * (cupon.descuento / 100);
                        } else {
                            descuentoTotal += cupon.descuento;
                        }
                    }
                }
            });
            return descuentoTotal;
        }
    },

    // Sistema de cálculo de impacto ambiental
    impactoAmbiental: {
        factores: {
            plastico: 0.5, // kg CO2 por kg de plástico
            transporte: 0.2, // kg CO2 por km
            embalaje: 0.1, // kg CO2 por kg de embalaje
            produccion: 1.5 // kg CO2 promedio por producto
        },

        init() {
            this.renderCalculadora();
        },

        calcularImpacto(producto) {
            let impacto = 0;
            
            // Factor de producción
            impacto += this.factores.produccion;
            
            // Factor de plástico ahorrado
            if (producto.sin_plastico) {
                impacto += this.factores.plastico * 2;
            }
            
            // Factor de transporte (basado en ubicación)
            if (producto.ubicacion) {
                // Distancia promedio 50km
                impacto += this.factores.transporte * 50;
            }
            
            // Factor de embalaje
            if (producto.embalaje_ecologico) {
                impacto -= this.factores.embalaje;
            }
            
            return Math.round(impacto * 10) / 10;
        },

        renderCalculadora() {
            const container = document.getElementById('impactoCalculadora');
            if (!container) return;

            container.innerHTML = `
                <div class="impacto-calculadora">
                    <h3>Calculadora de Impacto Ambiental</h3>
                    <div class="impacto-inputs">
                        <label>
                            <span>Productos comprados:</span>
                            <input type="number" id="impactoProductos" value="10" min="1" />
                        </label>
                        <label>
                            <span>Productos sin plástico:</span>
                            <input type="number" id="impactoSinPlastico" value="5" min="0" />
                        </label>
                        <label>
                            <span>Productos locales:</span>
                            <input type="number" id="impactoLocales" value="3" min="0" />
                        </label>
                    </div>
                    <button id="calcularImpacto">Calcular Impacto</button>
                    <div id="impactoResultado" class="impacto-resultado"></div>
                </div>
            `;

            const btn = container.querySelector('#calcularImpacto');
            btn.addEventListener('click', () => this.calcular());
        },

        calcular() {
            const productos = parseInt(document.getElementById('impactoProductos').value) || 0;
            const sinPlastico = parseInt(document.getElementById('impactoSinPlastico').value) || 0;
            const locales = parseInt(document.getElementById('impactoLocales').value) || 0;

            const impacto = (productos * this.factores.produccion) + 
                           (sinPlastico * this.factores.plastico * 2) +
                           (locales * this.factores.transporte * -50);

            const resultado = document.getElementById('impactoResultado');
            resultado.innerHTML = `
                <div class="impacto-item">
                    <span class="impacto-valor">${Math.abs(impacto).toFixed(1)} kg</span>
                    <span class="impacto-label">CO2 ${impacto > 0 ? 'ahorrado' : 'emitido'}</span>
                </div>
                <div class="impacto-equivalencias">
                    <p>🌳 Equivale a ${Math.abs(impacto / 20).toFixed(1)} árboles plantados</p>
                    <p>🚗 Equivale a ${Math.abs(impacto / 0.2).toFixed(1)} km sin conducir</p>
                </div>
            `;
        }
    },

    // Sistema de QR codes para productos
    qrCodes: {
        init() {
            this.generarQRParaProductos();
        },

        generarQRParaProductos() {
            const productos = document.querySelectorAll('[data-producto-id]');
            
            productos.forEach(producto => {
                const id = producto.dataset.productoId;
                const url = `${window.location.origin}/producto/${id}`;
                
                // Generar QR usando API gratuita
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
                
                const qrContainer = producto.querySelector('.qr-container');
                if (qrContainer) {
                    qrContainer.innerHTML = `
                        <img src="${qrUrl}" alt="QR Code" class="qr-code" />
                        <span class="qr-label">Escanea para compartir</span>
                    `;
                }
            });
        },

        generarQRPersonalizado(texto, tamaño = 150) {
            return `https://api.qrserver.com/v1/create-qr-code/?size=${tamaño}x${tamaño}&data=${encodeURIComponent(texto)}`;
        }
    },

    // Sistema de backup de datos
    backup: {
        init() {
            this.crearBotonBackup();
        },

        crearBotonBackup() {
            const btn = document.createElement('button');
            btn.className = 'btn-backup';
            btn.innerHTML = '<i class="bi bi-download"></i> Backup';
            btn.setAttribute('aria-label', 'Descargar backup de datos');
            
            btn.addEventListener('click', () => this.descargarBackup());
            
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                headerActions.appendChild(btn);
            }
        },

        descargarBackup() {
            const datos = {
                fecha: new Date().toISOString(),
                usuario: window.EcoDashboard?.datos?.usuario || null,
                favoritos: localStorage.getItem('ecomarket-favoritos'),
                cupones: localStorage.getItem('ecomarket-cupones'),
                tema: localStorage.getItem('ecomarket-theme'),
                gamificacion: localStorage.getItem('ecomarket-gamification'),
                recientes: localStorage.getItem('ecomarket-recientes'),
                busqueda: localStorage.getItem('ecomarket-busqueda-historial')
            };

            const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `ecomarket-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (window.EcoToast) {
                EcoToast.show('Backup descargado', 'Tus datos han sido guardados', 'success');
            }
        },

        restaurarBackup(archivo) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const datos = JSON.parse(e.target.result);
                    
                    // Restaurar datos
                    if (datos.favoritos) localStorage.setItem('ecomarket-favoritos', datos.favoritos);
                    if (datos.cupones) localStorage.setItem('ecomarket-cupones', datos.cupones);
                    if (datos.tema) localStorage.setItem('ecomarket-theme', datos.tema);
                    if (datos.gamificacion) localStorage.setItem('ecomarket-gamification', datos.gamificacion);
                    if (datos.recientes) localStorage.setItem('ecomarket-recientes', datos.recientes);
                    if (datos.busqueda) localStorage.setItem('ecomarket-busqueda-historial', datos.busqueda);

                    if (window.EcoToast) {
                        EcoToast.show('Backup restaurado', 'Tus datos han sido recuperados', 'success');
                    }
                    
                    // Recargar página
                    setTimeout(() => location.reload(), 1500);
                } catch (error) {
                    if (window.EcoToast) {
                        EcoToast.show('Error', 'Archivo de backup inválido', 'error');
                    }
                }
            };
            reader.readAsText(archivo);
        }
    },

    // Sistema de notificaciones de precio
    alertasPrecio: {
        alertas: [],

        init() {
            this.cargarAlertas();
            this.renderPanel();
        },

        cargarAlertas() {
            const saved = localStorage.getItem('ecomarket-alertas-precio');
            if (saved) {
                this.alertas = JSON.parse(saved);
            }
        },

        guardarAlertas() {
            localStorage.setItem('ecomarket-alertas-precio', JSON.stringify(this.alertas));
        },

        crearAlerta(productoId, precioDeseado) {
            this.alertas.push({
                productoId: productoId,
                precioDeseado: precioDeseado,
                fecha: new Date().toISOString(),
                activa: true
            });
            this.guardarAlertas();
            
            if (window.EcoToast) {
                EcoToast.show('Alerta creada', 'Te notificaremos cuando el precio baje', 'success');
            }
        },

        verificarAlertas(precioActual, productoId) {
            this.alertas.forEach(alerta => {
                if (alerta.productoId === productoId && alerta.activa) {
                    if (precioActual <= alerta.precioDeseado) {
                        this.enviarNotificacion(alerta);
                        alerta.activa = false;
                        this.guardarAlertas();
                    }
                }
            });
        },

        enviarNotificacion(alerta) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('¡Precio bajado!', {
                    body: `El producto que sigues ahora cuesta S/. ${alerta.precioDeseado}`,
                    icon: '/static/icon-192.png'
                });
            }
            
            if (window.EcoToast) {
                EcoToast.show('¡Precio bajado!', 'Un producto en tu lista de alertas bajó de precio', 'success');
            }
        },

        renderPanel() {
            const container = document.getElementById('alertasPrecioPanel');
            if (!container) return;

            container.innerHTML = `
                <h3>Alertas de Precio</h3>
                <div class="alertas-lista">
                    ${this.alertas.length === 0 
                        ? '<p class="sin-alertas">No tienes alertas activas</p>'
                        : this.alertas.map(alerta => `
                            <div class="alerta-item ${alerta.activa ? 'activa' : 'inactiva'}">
                                <div class="alerta-info">
                                    <p>Producto ID: ${alerta.productoId}</p>
                                    <p>Precio deseado: S/. ${alerta.precioDeseado}</p>
                                </div>
                                <button onclick="EcoExtra.alertas.eliminar('${alerta.productoId}')">Eliminar</button>
                            </div>
                        `).join('')
                    }
                </div>
            `;
        },

        eliminar(productoId) {
            this.alertas = this.alertas.filter(a => a.productoId !== productoId);
            this.guardarAlertas();
            this.renderPanel();
        }
    },

    // Sistema de comparación visual
    comparacionVisual: {
        productos: [],

        init() {
            this.renderPanel();
        },

        agregarProducto(productoId) {
            if (this.productos.length >= 3) {
                if (window.EcoToast) {
                    EcoToast.show('Límite alcanzado', 'Máximo 3 productos para comparar', 'warning');
                }
                return;
            }
            
            if (!this.productos.includes(productoId)) {
                this.productos.push(productoId);
                this.renderPanel();
                
                if (window.EcoToast) {
                    EcoToast.show('Agregado', 'Producto agregado a comparación', 'success');
                }
            }
        },

        renderPanel() {
            const container = document.getElementById('comparacionVisualPanel');
            if (!container) return;

            if (this.productos.length === 0) {
                container.innerHTML = '<p class="sin-comparacion">Selecciona productos para comparar</p>';
                return;
            }

            container.innerHTML = `
                <div class="comparacion-grid">
                    ${this.productos.map(id => `
                        <div class="comparacion-item">
                            <div class="comparacion-header">
                                <h4>Producto ${id}</h4>
                                <button onclick="EcoExtra.comparacionVisual.eliminar('${id}')">✕</button>
                            </div>
                            <div class="comparacion-body">
                                <!-- Se llenaría con datos del producto -->
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        eliminar(productoId) {
            this.productos = this.productos.filter(id => id !== productoId);
            this.renderPanel();
        }
    },

    // Sistema de filtros avanzados
    filtrosAvanzados: {
        filtros: {
            precioMin: 0,
            precioMax: 1000,
            ecoScoreMin: 0,
            categorias: [],
            ubicaciones: [],
            condicion: []
        },

        init() {
            this.renderFiltros();
        },

        renderFiltros() {
            const container = document.getElementById('filtrosAvanzadosContainer');
            if (!container) return;

            container.innerHTML = `
                <div class="filtros-avanzados">
                    <h3>Filtros Avanzados</h3>
                    
                    <div class="filtro-grupo">
                        <label>Precio</label>
                        <div class="rango-precio">
                            <input type="number" id="precioMin" placeholder="Mín" value="${this.filtros.precioMin}" />
                            <span>-</span>
                            <input type="number" id="precioMax" placeholder="Máx" value="${this.filtros.precioMax}" />
                        </div>
                    </div>
                    
                    <div class="filtro-grupo">
                        <label>Eco-Score Mínimo</label>
                        <input type="range" id="ecoScoreMin" min="0" max="100" value="${this.filtros.ecoScoreMin}" />
                        <span id="ecoScoreValor">${this.filtros.ecoScoreMin}</span>
                    </div>
                    
                    <div class="filtro-grupo">
                        <label>Categorías</label>
                        <div class="checkbox-grupo">
                            <label><input type="checkbox" value="Hogar"> Hogar</label>
                            <label><input type="checkbox" value="Jardín"> Jardín</label>
                            <label><input type="checkbox" value="Higiene"> Higiene</label>
                            <label><input type="checkbox" value="Ropa"> Ropa</label>
                        </div>
                    </div>
                    
                    <div class="filtro-grupo">
                        <label>Condición</label>
                        <div class="checkbox-grupo">
                            <label><input type="checkbox" value="nuevo"> Nuevo</label>
                            <label><input type="checkbox" value="usado"> Usado</label>
                        </div>
                    </div>
                    
                    <div class="filtro-acciones">
                        <button id="aplicarFiltros">Aplicar Filtros</button>
                        <button id="limpiarFiltros">Limpiar</button>
                    </div>
                </div>
            `;

            // Event listeners
            const ecoScore = container.querySelector('#ecoScoreMin');
            const ecoScoreValor = container.querySelector('#ecoScoreValor');
            
            ecoScore.addEventListener('input', (e) => {
                ecoScoreValor.textContent = e.target.value;
            });

            container.querySelector('#aplicarFiltros').addEventListener('click', () => this.aplicar());
            container.querySelector('#limpiarFiltros').addEventListener('click', () => this.limpiar());
        },

        aplicar() {
            const precioMin = parseInt(document.getElementById('precioMin').value) || 0;
            const precioMax = parseInt(document.getElementById('precioMax').value) || 1000;
            const ecoScoreMin = parseInt(document.getElementById('ecoScoreMin').value) || 0;
            
            this.filtros = { precioMin, precioMax, ecoScoreMin };
            
            // Aplicar filtros a productos
            this.filtrarProductos();
            
            if (window.EcoToast) {
                EcoToast.show('Filtros aplicados', 'Mostrando resultados filtrados', 'success');
            }
        },

        limpiar() {
            this.filtros = { precioMin: 0, precioMax: 1000, ecoScoreMin: 0, categorias: [], ubicaciones: [], condicion: [] };
            this.renderFiltros();
            
            // Mostrar todos los productos
            this.filtrarProductos();
        },

        filtrarProductos() {
            const productos = document.querySelectorAll('.producto-card');
            
            productos.forEach(producto => {
                const precio = parseFloat(producto.dataset.precio) || 0;
                const ecoScore = parseInt(producto.dataset.ecoScore) || 0;
                
                const cumplePrecio = precio >= this.filtros.precioMin && precio <= this.filtros.precioMax;
                const cumpleEcoScore = ecoScore >= this.filtros.ecoScoreMin;
                
                if (cumplePrecio && cumpleEcoScore) {
                    producto.style.display = 'block';
                } else {
                    producto.style.display = 'none';
                }
            });
        }
    },

    // Inicializar todo
    init() {
        this.cupones.init();
        this.impactoAmbiental.init();
        this.qrCodes.init();
        this.backup.init();
        this.alertasPrecio.init();
        this.comparacionVisual.init();
        this.filtrosAvanzados.init();
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoExtra.init());
} else {
    EcoExtra.init();
}

// Exponer globalmente
window.EcoExtra = EcoExtra;
