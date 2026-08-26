/**
 * EcoMarket - Megaplan Implementation
 * Funcionalidades avanzadas del megaplan
 */

const EcoMegaplan = {
    // Sistema de gamificación mejorado
    gamification: {
        niveles: [
            { nivel: 1, nombre: 'Semilla 🌱', xp: 0 },
            { nivel: 2, nombre: 'Brote 🌿', xp: 100 },
            { nivel: 3, nombre: 'Planta 🪴', xp: 300 },
            { nivel: 4, nombre: 'Árbol 🌳', xp: 600 },
            { nivel: 5, nombre: 'Bosque 🌲', xp: 1000 },
            { nivel: 6, nombre: 'Ecosistema 🌍', xp: 2000 },
            { nivel: 7, nombre: 'Guardián 🛡️', xp: 3500 },
            { nivel: 8, nombre: 'Maestro 🏆', xp: 5000 },
            { nivel: 9, nombre: 'Leyenda ⭐', xp: 10000 },
            { nivel: 10, nombre: 'EcoHéroe 🦸', xp: 20000 }
        ],

        logros: [
            { id: 'primera_compra', nombre: 'Primer paso', descripcion: 'Realiza tu primera compra', icono: '🛒', xp: 50 },
            { id: 'eco_warrior', nombre: 'Guerrero Eco', descripcion: 'Compra 10 productos ecológicos', icono: '⚔️', xp: 200 },
            { id: 'review_master', nombre: 'Crítico Maestro', descripcion: 'Escribe 20 reseñas', icono: '✍️', xp: 150 },
            { id: 'social_butterfly', nombre: 'Mariposa Social', descripcion: 'Comparte 5 productos', icono: '🦋', xp: 100 },
            { id: 'referral_king', nombre: 'Rey del Referido', descripcion: 'Refiere 10 amigos', icono: '👑', xp: 500 },
            { id: 'green_thumb', nombre: 'Pulgar Verde', descripcion: 'Compra 5 productos de jardín', icono: '🌱', xp: 150 },
            { id: 'saver', nombre: 'Ahorrador', descripcion: 'Usa 5 cupones', icono: '💰', xp: 100 },
            { id: 'loyal', nombre: 'Leal', descripcion: 'Compra por 12 meses consecutivos', icono: '💎', xp: 300 }
        ],

        desafios: [
            { id: 'compra_local', descripcion: 'Compra de un vendedor local', recompensa: { xp: 50, puntos: 100 } },
            { id: 'reseña_producto', descripcion: 'Deja una reseña con foto', recompensa: { xp: 30, puntos: 50 } },
            { id: 'compartir_eco', descripcion: 'Comparte un producto ecológico', recompensa: { xp: 20, puntos: 30 } },
            { id: 'wishlist_complete', descripcion: 'Completa tu wishlist', recompensa: { xp: 40, puntos: 60 } }
        ],

        init() {
            this.cargarProgreso();
            this.renderNivel();
            this.renderLogros();
            this.renderDesafios();
        },

        cargarProgreso() {
            const saved = localStorage.getItem('ecomarket-gamification');
            if (saved) {
                this.progreso = JSON.parse(saved);
            } else {
                this.progreso = {
                    xp: 0,
                    nivel: 1,
                    logros: [],
                    desafios_completados: [],
                    puntos: 0,
                    compras: 0,
                    reseñas: 0,
                    compartidos: 0
                };
            }
        },

        guardarProgreso() {
            localStorage.setItem('ecomarket-gamification', JSON.stringify(this.progreso));
        },

        agregarXP(cantidad) {
            this.progreso.xp += cantidad;
            this.verificarSubidaNivel();
            this.guardarProgreso();
            this.renderNivel();
        },

        verificarSubidaNivel() {
            const nivelActual = this.niveles.find(n => n.nivel === this.progreso.nivel);
            const siguienteNivel = this.niveles.find(n => n.nivel === this.progreso.nivel + 1);
            
            if (siguienteNivel && this.progreso.xp >= siguienteNivel.xp) {
                this.progreso.nivel++;
                this.mostrarNotificacionSubidaNivel(siguienteNivel);
            }
        },

        mostrarNotificacionSubidaNivel(nivel) {
            if (window.EcoToast) {
                EcoToast.show('¡Nivel Subido!', `Has alcanzado el nivel ${nivel.nivel}: ${nivel.nombre}`, 'success');
            }
        },

        desbloquearLogro(logroId) {
            if (!this.progreso.logros.includes(logroId)) {
                const logro = this.logros.find(l => l.id === logroId);
                if (logro) {
                    this.progreso.logros.push(logroId);
                    this.agregarXP(logro.xp);
                    this.mostrarNotificacionLogro(logro);
                    this.guardarProgreso();
                    this.renderLogros();
                }
            }
        },

        mostrarNotificacionLogro(logro) {
            if (window.EcoToast) {
                EcoToast.show('¡Logro Desbloqueado!', `${logro.icono} ${logro.nombre}`, 'success');
            }
        },

        renderNivel() {
            const nivelInfo = this.niveles.find(n => n.nivel === this.progreso.nivel);
            const siguienteNivel = this.niveles.find(n => n.nivel === this.progreso.nivel + 1);
            
            const nivelElement = document.getElementById('userNivel');
            const xpElement = document.getElementById('userXP');
            const barraProgreso = document.getElementById('barraProgreso');
            
            if (nivelElement) nivelElement.textContent = nivelInfo.nombre;
            if (xpElement) xpElement.textContent = `${this.progreso.xp} XP`;
            
            if (barraProgreso && siguienteNivel) {
                const progreso = (this.progreso.xp / siguienteNivel.xp) * 100;
                barraProgreso.style.width = `${Math.min(progreso, 100)}%`;
            }
        },

        renderLogros() {
            const container = document.getElementById('logrosContainer');
            if (!container) return;
            
            container.innerHTML = this.logros.map(logro => {
                const desbloqueado = this.progreso.logros.includes(logro.id);
                return `
                    <div class="logro-item ${desbloqueado ? 'desbloqueado' : 'bloqueado'}">
                        <span class="logro-icono">${logro.icono}</span>
                        <div class="logro-info">
                            <h4>${logro.nombre}</h4>
                            <p>${logro.descripcion}</p>
                        </div>
                        ${desbloqueado ? '<span class="logro-check">✓</span>' : ''}
                    </div>
                `;
            }).join('');
        },

        renderDesafios() {
            const container = document.getElementById('desafiosContainer');
            if (!container) return;
            
            container.innerHTML = this.desafios.map(desafio => {
                const completado = this.progreso.desafios_completados.includes(desafio.id);
                return `
                    <div class="desafio-item ${completado ? 'completado' : 'pendiente'}">
                        <div class="desafio-info">
                            <h4>${desafio.descripcion}</h4>
                            <p>Recompensa: ${desafio.recompensa.xp} XP, ${desafio.recompensa.puntos} puntos</p>
                        </div>
                        ${completado ? '<span class="desafio-check">✓</span>' : ''}
                    </div>
                `;
            }).join('');
        }
    },

    // Sistema de notificaciones avanzado
    notificaciones: {
        init() {
            this.requestPermission();
            this.mostrarBienvenida();
        },

        requestPermission() {
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        },

        mostrarBienvenida() {
            const visto = localStorage.getItem('ecomarket-bienvenida-visto');
            if (!visto) {
                setTimeout(() => {
                    if (window.EcoToast) {
                        EcoToast.show('¡Bienvenido a EcoMarket!', 'Tu marketplace ecológico favorito', 'info');
                    }
                    localStorage.setItem('ecomarket-bienvenida-visto', 'true');
                }, 2000);
            }
        },

        enviarNotificacion(titulo, cuerpo, icono) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(titulo, {
                    body: cuerpo,
                    icon: icono || '/static/icon-192.png'
                });
            }
        }
    },

    // Sistema de comparación de productos
    comparacion: {
        productos: [],
        maximo: 4,

        init() {
            this.renderContador();
            this.renderPanel();
        },

        agregar(productoId) {
            if (this.productos.length >= this.maximo) {
                if (window.EcoToast) {
                    EcoToast.show('Límite alcanzado', 'Máximo 4 productos para comparar', 'warning');
                }
                return;
            }
            
            if (!this.productos.includes(productoId)) {
                this.productos.push(productoId);
                this.guardar();
                this.renderContador();
                this.renderPanel();
                
                if (window.EcoToast) {
                    EcoToast.show('Agregado', 'Producto agregado a comparación', 'success');
                }
            }
        },

        eliminar(productoId) {
            this.productos = this.productos.filter(id => id !== productoId);
            this.guardar();
            this.renderContador();
            this.renderPanel();
        },

        limpiar() {
            this.productos = [];
            this.guardar();
            this.renderContador();
            this.renderPanel();
        },

        guardar() {
            localStorage.setItem('ecomarket-comparacion', JSON.stringify(this.productos));
        },

        cargar() {
            const saved = localStorage.getItem('ecomarket-comparacion');
            if (saved) {
                this.productos = JSON.parse(saved);
            }
        },

        renderContador() {
            const contador = document.getElementById('comparacionContador');
            if (contador) {
                contador.textContent = this.productos.length;
                contador.style.display = this.productos.length > 0 ? 'flex' : 'none';
            }
        },

        renderPanel() {
            const panel = document.getElementById('comparacionPanel');
            if (!panel) return;
            
            if (this.productos.length === 0) {
                panel.style.display = 'none';
                return;
            }
            
            panel.style.display = 'block';
            // Aquí se renderizarían los productos a comparar
        }
    },

    // Sistema de ofertas flash
    ofertasFlash: {
        ofertas: [],
        intervalo: null,

        init() {
            this.cargarOfertas();
            this.iniciarTemporizador();
        },

        cargarOfertas() {
            // Simular carga de ofertas
            this.ofertas = [
                {
                    id: 1,
                    producto_id: 5,
                    descuento: 50,
                    precio_original: 45,
                    precio_oferta: 22.50,
                    cantidad_limite: 20,
                    vendidos: 15,
                    fecha_fin: new Date(Date.now() + 3600000) // 1 hora
                }
            ];
            this.renderOfertas();
        },

        iniciarTemporizador() {
            this.intervalo = setInterval(() => {
                this.actualizarTemporizadores();
            }, 1000);
        },

        actualizarTemporizadores() {
            document.querySelectorAll('.oferta-tiempo').forEach(element => {
                const fechaFin = new Date(element.dataset.fechaFin);
                const ahora = new Date();
                const diferencia = fechaFin - ahora;
                
                if (diferencia > 0) {
                    const horas = Math.floor(diferencia / 3600000);
                    const minutos = Math.floor((diferencia % 3600000) / 60000);
                    const segundos = Math.floor((diferencia % 60000) / 1000);
                    element.textContent = `${horas}:${minutos}:${segundos}`;
                } else {
                    element.textContent = 'Terminado';
                }
            });
        },

        renderOfertas() {
            const container = document.getElementById('ofertasFlashContainer');
            if (!container) return;
            
            container.innerHTML = this.ofertas.map(oferta => `
                <div class="oferta-flash">
                    <div class="oferta-descuento">-${oferta.descuento}%</div>
                    <div class="oferta-info">
                        <h4>Oferta Flash</h4>
                        <p>S/. ${oferta.precio_oferta} <span class="precio-original">S/. ${oferta.precio_original}</span></p>
                    </div>
                    <div class="oferta-tiempo" data-fecha-fin="${oferta.fecha_fin.toISOString()}">Cargando...</div>
                    <div class="oferta-stock">
                        ${oferta.vendidos}/${oferta.cantidad_limite} vendidos
                    </div>
                </div>
            `).join('');
        }
    },

    // Inicializar todo el megaplan
    init() {
        this.gamification.init();
        this.notificaciones.init();
        this.comparacion.init();
        this.comparacion.cargar();
        this.ofertasFlash.init();
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoMegaplan.init());
} else {
    EcoMegaplan.init();
}

// Exponer globalmente
window.EcoMegaplan = EcoMegaplan;
