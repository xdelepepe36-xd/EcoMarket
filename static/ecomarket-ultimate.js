/**
 * EcoMarket - Funcionalidades Ultimate
 * Últimas mejoras y características premium
 */

const EcoUltimate = {
    // Sistema de chat en tiempo real
    chat: {
        mensajes: [],
        conectado: false,

        init() {
            this.cargarHistorial();
            this.renderChat();
            this.inicializarWebSocket();
        },

        cargarHistorial() {
            const saved = localStorage.getItem('ecomarket-chat-historial');
            if (saved) {
                this.mensajes = JSON.parse(saved);
            }
        },

        guardarHistorial() {
            localStorage.setItem('ecomarket-chat-historial', JSON.stringify(this.mensajes));
        },

        enviarMensaje(texto, tipo = 'usuario') {
            const mensaje = {
                id: Date.now(),
                texto: texto,
                tipo: tipo,
                fecha: new Date().toISOString(),
                leido: false
            };
            
            this.mensajes.push(mensaje);
            this.guardarHistorial();
            this.renderChat();
            
            // Simular respuesta del bot
            if (tipo === 'usuario') {
                setTimeout(() => {
                    this.responderBot(texto);
                }, 1000);
            }
        },

        responderBot(textoUsuario) {
            const respuestas = {
                'hola': '¡Hola! ¿En qué puedo ayudarte hoy?',
                'ayuda': 'Puedo ayudarte a encontrar productos, resolver dudas sobre pedidos, o darte consejos ecológicos.',
                'productos': 'Tenemos más de 79 productos ecológicos. ¿Qué categoría te interesa?',
                'envio': 'El envío es gratis en pedidos mayores a S/ 100. Para pedidos menores, el costo es S/ 15.',
                'default': 'Gracias por tu mensaje. Un agente te responderá pronto.'
            };
            
            const texto = textoUsuario.toLowerCase();
            let respuesta = respuestas.default;
            
            for (const [clave, valor] of Object.entries(respuestas)) {
                if (texto.includes(clave)) {
                    respuesta = valor;
                    break;
                }
            }
            
            this.enviarMensaje(respuesta, 'bot');
        },

        renderChat() {
            const container = document.getElementById('chatContainer');
            if (!container) return;

            container.innerHTML = `
                <div class="chat-mensajes">
                    ${this.mensajes.map(msg => `
                        <div class="chat-mensaje ${msg.tipo}">
                            <div class="chat-contenido">
                                <p>${msg.texto}</p>
                                <span class="chat-hora">${new Date(msg.fecha).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="chat-input">
                    <input type="text" id="chatInput" placeholder="Escribe un mensaje..." />
                    <button id="chatEnviar">Enviar</button>
                </div>
            `;

            const input = container.querySelector('#chatInput');
            const btn = container.querySelector('#chatEnviar');

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.enviarMensaje(input.value);
                    input.value = '';
                }
            });

            btn.addEventListener('click', () => {
                this.enviarMensaje(input.value);
                input.value = '';
            });
        },

        inicializarWebSocket() {
            // Placeholder para WebSocket real
            console.log('WebSocket inicializado');
        }
    },

    // Sistema de geolocalización
    geolocalizacion: {
        posicion: null,

        init() {
            this.solicitarPermiso();
        },

        solicitarPermiso() {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (posicion) => {
                        this.posicion = posicion;
                        this.mostrarUbicacion();
                    },
                    (error) => {
                        console.log('Geolocalización no disponible');
                    }
                );
            }
        },

        mostrarUbicacion() {
            const container = document.getElementById('ubicacionUsuario');
            if (!container || !this.posicion) return;

            const { latitude, longitude } = this.posicion;
            container.innerHTML = `
                <div class="ubicacion-info">
                    <i class="bi bi-geo-alt"></i>
                    <span>Ubicación detectada</span>
                </div>
            `;
        },

        obtenerDistancia(lat1, lon1, lat2, lon2) {
            const R = 6371; // Radio de la Tierra en km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }
    },

    // Sistema de caché inteligente
    cache: {
        datos: {},

        init() {
            this.cargarCache();
            this.inicializarServiceWorker();
        },

        cargarCache() {
            const saved = localStorage.getItem('ecomarket-cache');
            if (saved) {
                this.datos = JSON.parse(saved);
            }
        },

        guardarCache() {
            localStorage.setItem('ecomarket-cache', JSON.stringify(this.datos));
        },

        obtener(clave) {
            if (this.datos[clave]) {
                const ahora = Date.now();
                if (ahora - this.datos[clave].timestamp < 3600000) { // 1 hora
                    return this.datos[clave].valor;
                }
            }
            return null;
        },

        guardar(clave, valor) {
            this.datos[clave] = {
                valor: valor,
                timestamp: Date.now()
            };
            this.guardarCache();
        },

        inicializarServiceWorker() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/static/sw.js')
                    .then(reg => console.log('Service Worker registrado'))
                    .catch(err => console.log('Service Worker error:', err));
            }
        }
    },

    // Sistema de analítica básica
    analitica: {
        eventos: [],

        init() {
            this.rastrearEventos();
            this.enviarAnalitica();
        },

        rastrearEventos() {
            // Rastrear clics en productos
            document.addEventListener('click', (e) => {
                const productoCard = e.target.closest('[data-producto-id]');
                if (productoCard) {
                    this.registrarEvento('producto_click', {
                        producto_id: productoCard.dataset.productoId
                    });
                }
            });

            // Rastrear vistas de página
            this.registrarEvento('page_view', {
                url: window.location.href,
                titulo: document.title
            });
        },

        registrarEvento(tipo, datos) {
            this.eventos.push({
                tipo: tipo,
                datos: datos,
                timestamp: new Date().toISOString()
            });
        },

        enviarAnalitica() {
            // Enviar a servidor cada 30 segundos
            setInterval(() => {
                if (this.eventos.length > 0) {
                    fetch('/api/analitica', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ eventos: this.eventos })
                    });
                    this.eventos = [];
                }
            }, 30000);
        }
    },

    // Sistema de breadcrumbs mejorado
    breadcrumbs: {
        init() {
            this.renderBreadcrumbs();
        },

        renderBreadcrumbs() {
            const container = document.getElementById('breadcrumbsContainer');
            if (!container) return;

            const path = window.location.pathname.split('/').filter(p => p);
            const breadcrumbs = [
                { nombre: 'Inicio', url: '/' }
            ];

            let urlAcumulada = '';
            path.forEach((segmento, index) => {
                urlAcumulada += '/' + segmento;
                breadcrumbs.push({
                    nombre: segmento.charAt(0).toUpperCase() + segmento.slice(1),
                    url: urlAcumulada
                });
            });

            container.innerHTML = `
                <nav class="breadcrumbs" aria-label="Navegación">
                    ${breadcrumbs.map((crumb, index) => `
                        ${index > 0 ? '<span class="breadcrumb-separator">/</span>' : ''}
                        ${index === breadcrumbs.length - 1 
                            ? `<span class="breadcrumb-actual">${crumb.nombre}</span>`
                            : `<a href="${crumb.url}" class="breadcrumb-link">${crumb.nombre}</a>`
                        }
                    `).join('')}
                </nav>
            `;
        }
    },

    // Sistema de impresión ecológica
    impresion: {
        init() {
            this.agregarBotonImprimir();
        },

        agregarBotonImprimir() {
            const btn = document.createElement('button');
            btn.className = 'btn-imprimir-eco';
            btn.innerHTML = '<i class="bi bi-printer"></i> Imprimir Eco';
            btn.setAttribute('aria-label', 'Imprimir versión ecológica');
            
            btn.addEventListener('click', () => this.imprimirEco());
            
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                headerActions.appendChild(btn);
            }
        },

        imprimirEco() {
            // Modificar estilos para impresión ecológica
            const style = document.createElement('style');
            style.textContent = `
                @media print {
                    @page { margin: 0; }
                    body { background: white !important; color: black !important; }
                    .header, .footer, .btn-imprimir-eco { display: none !important; }
                    .producto-card { break-inside: avoid; }
                img { max-width: 50% !important; }
                * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `;
            document.head.appendChild(style);
            
            window.print();
            
            setTimeout(() => style.remove(), 1000);
        }
    },

    // Sistema de modo ahorro de energía
    ahorroEnergia: {
        activo: false,

        init() {
            this.verificarBateria();
            this.agregarToggle();
        },

        verificarBateria() {
            if ('getBattery' in navigator) {
                navigator.getBattery().then(battery => {
                    if (battery.level < 0.2) {
                        this.activar();
                    }
                });
            }
        },

        agregarToggle() {
            const btn = document.createElement('button');
            btn.className = 'btn-ahorro-energia';
            btn.innerHTML = '<i class="bi bi-lightning"></i>';
            btn.setAttribute('aria-label', 'Modo ahorro de energía');
            
            btn.addEventListener('click', () => this.toggle());
            
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                headerActions.appendChild(btn);
            }
        },

        toggle() {
            this.activo = !this.activo;
            document.body.classList.toggle('modo-ahorro', this.activo);
            
            if (this.activo) {
                // Reducir animaciones
                document.documentElement.style.setProperty('--trans-fast', '0s');
                document.documentElement.style.setProperty('--trans-base', '0s');
                document.documentElement.style.setProperty('--trans-slow', '0s');
                
                // Reducir calidad de imágenes
                document.querySelectorAll('img').forEach(img => {
                    img.style.imageRendering = 'pixelated';
                });
            } else {
                // Restaurar animaciones
                document.documentElement.style.removeProperty('--trans-fast');
                document.documentElement.style.removeProperty('--trans-base');
                document.documentElement.style.removeProperty('--trans-slow');
                
                // Restaurar calidad de imágenes
                document.querySelectorAll('img').forEach(img => {
                    img.style.imageRendering = 'auto';
                });
            }
        }
    },

    // Sistema de favoritos mejorado
    favoritosMejorado: {
        favoritos: [],
        listas: {
            'general': [],
            'deseos': [],
            'regalos': []
        },

        init() {
            this.cargarFavoritos();
            this.crearListas();
        },

        cargarFavoritos() {
            const saved = localStorage.getItem('ecomarket-favoritos');
            if (saved) {
                this.favoritos = JSON.parse(saved);
            }
        },

        guardarFavoritos() {
            localStorage.setItem('ecomarket-favoritos', JSON.stringify(this.favoritos));
        },

        agregar(productoId, lista = 'general') {
            if (!this.listas[lista].includes(productoId)) {
                this.listas[lista].push(productoId);
                this.guardarListas();
                
                if (window.EcoToast) {
                    EcoToast.show('Agregado', 'Producto agregado a favoritos', 'success');
                }
            }
        },

        eliminar(productoId, lista = 'general') {
            this.listas[lista] = this.listas[lista].filter(id => id !== productoId);
            this.guardarListas();
        },

        guardarListas() {
            localStorage.setItem('ecomarket-listas', JSON.stringify(this.listas));
        },

        crearListas() {
            const container = document.getElementById('favoritosListasContainer');
            if (!container) return;

            container.innerHTML = `
                <div class="favoritos-listas">
                    <button class="lista-btn active" data-lista="general">Todos</button>
                    <button class="lista-btn" data-lista="deseos">Deseos</button>
                    <button class="lista-btn" data-lista="regalos">Regalos</button>
                </div>
            `;

            container.querySelectorAll('.lista-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    container.querySelectorAll('.lista-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.renderLista(btn.dataset.lista);
                });
            });
        },

        renderLista(lista) {
            const container = document.getElementById('favoritosGrid');
            if (!container) return;

            const productos = this.listas[lista];
            if (productos.length === 0) {
                container.innerHTML = '<p class="sin-favoritos">No hay productos en esta lista</p>';
                return;
            }

            // Renderizar productos de la lista
        }
    },

    // Sistema de calificación de vendedores
    calificacionVendedor: {
        calificaciones: {},

        init() {
            this.cargarCalificaciones();
            this.renderFormulario();
        },

        cargarCalificaciones() {
            const saved = localStorage.getItem('ecomarket-calificaciones');
            if (saved) {
                this.calificaciones = JSON.parse(saved);
            }
        },

        guardarCalificaciones() {
            localStorage.setItem('ecomarket-calificaciones', JSON.stringify(this.calificaciones));
        },

        calificar(vendedorId, calificacion, comentario) {
            if (!this.calificaciones[vendedorId]) {
                this.calificaciones[vendedorId] = [];
            }
            
            this.calificaciones[vendedorId].push({
                calificacion: calificacion,
                comentario: comentario,
                fecha: new Date().toISOString()
            });
            
            this.guardarCalificaciones();
            
            if (window.EcoToast) {
                EcoToast.show('Calificación enviada', 'Gracias por tu opinión', 'success');
            }
        },

        renderFormulario() {
            const container = document.getElementById('calificacionVendedorForm');
            if (!container) return;

            container.innerHTML = `
                <div class="calificacion-form">
                    <h3>Calificar Vendedor</h3>
                    <div class="estrellas-calificacion">
                        ${[1, 2, 3, 4, 5].map(estrella => `
                            <button class="estrella-btn" data-estrella="${estrella}">
                                <i class="bi bi-star"></i>
                            </button>
                        `).join('')}
                    </div>
                    <textarea id="comentarioCalificacion" placeholder="Deja un comentario (opcional)"></textarea>
                    <button id="enviarCalificacion">Enviar Calificación</button>
                </div>
            `;

            // Manejar selección de estrellas
            const estrellas = container.querySelectorAll('.estrella-btn');
            estrellas.forEach(estrella => {
                estrella.addEventListener('click', () => {
                    const valor = parseInt(estrella.dataset.estrella);
                    estrellas.forEach((s, i) => {
                        const icono = s.querySelector('i');
                        if (i < valor) {
                            icono.classList.remove('bi-star');
                            icono.classList.add('bi-star-fill');
                        } else {
                            icono.classList.remove('bi-star-fill');
                            icono.classList.add('bi-star');
                        }
                    });
                });
            });

            // Enviar calificación
            const btn = container.querySelector('#enviarCalificacion');
            if (btn) {
                btn.addEventListener('click', () => {
                    const estrellaActiva = container.querySelector('.estrella-btn .bi-star-fill');
                    const valor = estrellaActiva ? parseInt(estrellaActiva.parentElement.dataset.estrella) : 0;
                    const comentario = container.querySelector('#comentarioCalificacion').value;
                    
                    const vendedorId = container.dataset.vendedorId;
                    if (vendedorId) {
                        this.calificar(vendedorId, valor, comentario);
                    }
                });
            }
        }
    },

    // Sistema de suscripciones
    suscripciones: {
        activas: [],

        init() {
            this.cargarSuscripciones();
            this.renderPanel();
        },

        cargarSuscripciones() {
            const saved = localStorage.getItem('ecomarket-suscripciones');
            if (saved) {
                this.activas = JSON.parse(saved);
            }
        },

        guardarSuscripciones() {
            localStorage.setItem('ecomarket-suscripciones', JSON.stringify(this.activas));
        },

        suscribir(tipo) {
            if (!this.activas.includes(tipo)) {
                this.activas.push(tipo);
                this.guardarSuscripciones();
                
                if (window.EcoToast) {
                    EcoToast.show('Suscrito', `Te has suscrito a ${tipo}`, 'success');
                }
            }
        },

        desuscribir(tipo) {
            this.activas = this.activas.filter(t => t !== tipo);
            this.guardarSuscripciones();
            
            if (window.EcoToast) {
                EcoToast.show('Desuscrito', `Ya no estás suscrito a ${tipo}`, 'info');
            }
        },

        renderPanel() {
            const container = document.getElementById('suscripcionesPanel');
            if (!container) return;

            const opciones = [
                { id: 'newsletter', nombre: 'Newsletter', descripcion: 'Recibe noticias y ofertas' },
                { id: 'productos', nombre: 'Nuevos Productos', descripcion: 'Alertas de nuevos productos' },
                { id: 'ofertas', nombre: 'Ofertas Flash', descripcion: 'Notificaciones de ofertas' },
                { id: 'comunidad', nombre: 'Comunidad', descripcion: 'Actualizaciones de la comunidad' }
            ];

            container.innerHTML = `
                <h3>Suscripciones</h3>
                <div class="suscripciones-lista">
                    ${opciones.map(op => `
                        <div class="suscripcion-item">
                            <div class="suscripcion-info">
                                <h4>${op.nombre}</h4>
                                <p>${op.descripcion}</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.activas.includes(op.id) ? 'checked' : ''} 
                                       onchange="EcoUltimate.suscripciones.${this.activas.includes(op.id) ? 'desuscribir' : 'suscribir'}('${op.id}')">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    },

    // Inicializar todo
    init() {
        this.chat.init();
        this.geolocalizacion.init();
        this.cache.init();
        this.analitica.init();
        this.breadcrumbs.init();
        this.impresion.init();
        this.ahorroEnergia.init();
        this.favoritosMejorado.init();
        this.calificacionVendedor.init();
        this.suscripciones.init();
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EcoUltimate.init());
} else {
    EcoUltimate.init();
}

// Exponer globalmente
window.EcoUltimate = EcoUltimate;
