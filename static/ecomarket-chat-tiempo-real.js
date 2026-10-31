/*
   EcoMarket - Chat en Tiempo Real con Vendedor
   Chat WebSocket entre comprador y vendedor
   Author: EcoMarket Team
   Version: 4.0
*/

class ChatTiempoReal {
    constructor() {
        this.conexion = null;
        this.vendedorId = null;
        this.productoId = null;
        this.mensajes = [];
        this.reconectando = false;
        this.init();
    }

    init() {
        this.obtenerIds();
        this.inicializarEventListeners();
        this.conectarWebSocket();
    }

    obtenerIds() {
        this.vendedorId = document.body.dataset.vendedorId;
        this.productoId = document.body.dataset.productoId;
    }

    conectarWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/chat`;

        try {
            this.conexion = new WebSocket(wsUrl);
            
            this.conexion.onopen = () => {
                console.log('WebSocket conectado');
                this.reconectando = false;
                this.mostrarEstado('conectado');
            };

            this.conexion.onmessage = (event) => {
                const mensaje = JSON.parse(event.data);
                this.recibirMensaje(mensaje);
            };

            this.conexion.onclose = () => {
                console.log('WebSocket desconectado');
                this.mostrarEstado('desconectado');
                this.reconectar();
            };

            this.conexion.onerror = (error) => {
                console.error('Error WebSocket:', error);
                this.mostrarEstado('error');
            };
        } catch (error) {
            console.error('Error creando WebSocket:', error);
            this.mostrarEstado('error');
        }
    }

    reconectar() {
        if (this.reconectando) return;
        
        this.reconectando = true;
        this.mostrarEstado('reconectando');
        
        setTimeout(() => {
            this.conectarWebSocket();
        }, 5000);
    }

    inicializarEventListeners() {
        // Input de mensaje
        const inputMensaje = document.getElementById('input-mensaje-chat');
        const btnEnviar = document.getElementById('btn-enviar-mensaje');
        
        if (inputMensaje && btnEnviar) {
            btnEnviar.addEventListener('click', () => {
                this.enviarMensaje(inputMensaje.value);
            });
            
            inputMensaje.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.enviarMensaje(inputMensaje.value);
                }
            });
        }

        // Botón adjuntar archivo
        const btnAdjuntar = document.getElementById('btn-adjuntar-archivo');
        if (btnAdjuntar) {
            btnAdjuntar.addEventListener('click', () => {
                document.getElementById('input-archivo-chat').click();
            });
        }

        // Input de archivo
        const inputArchivo = document.getElementById('input-archivo-chat');
        if (inputArchivo) {
            inputArchivo.addEventListener('change', (e) => {
                this.enviarArchivo(e.target.files[0]);
            });
        }
    }

    enviarMensaje(texto) {
        if (!texto || !texto.trim()) return;
        
        if (!this.conexion || this.conexion.readyState !== WebSocket.OPEN) {
            this.mostrarError('No hay conexión. Reconectando...');
            return;
        }

        const mensaje = {
            tipo: 'texto',
            contenido: texto.trim(),
            vendedor_id: this.vendedorId,
            producto_id: this.productoId,
            timestamp: new Date().toISOString()
        };

        this.conexion.send(JSON.stringify(mensaje));
        
        // Agregar mensaje localmente
        this.agregarMensajeLocal(mensaje, 'enviado');
        
        // Limpiar input
        const input = document.getElementById('input-mensaje-chat');
        if (input) input.value = '';
    }

    async enviarArchivo(archivo) {
        if (!archivo) return;

        // Convertir archivo a base64
        const reader = new FileReader();
        reader.onload = () => {
            const mensaje = {
                tipo: 'archivo',
                contenido: reader.result,
                nombre: archivo.name,
                tipo_mime: archivo.type,
                vendedor_id: this.vendedorId,
                producto_id: this.productoId,
                timestamp: new Date().toISOString()
            };

            this.conexion.send(JSON.stringify(mensaje));
            this.agregarMensajeLocal(mensaje, 'enviado');
        };
        reader.readAsDataURL(archivo);
    }

    recibirMensaje(mensaje) {
        this.mensajes.push(mensaje);
        this.renderizarMensaje(mensaje, 'recibido');
        this.actualizarScroll();
        this.reproducirSonido();
    }

    agregarMensajeLocal(mensaje, direccion) {
        this.mensajes.push(mensaje);
        this.renderizarMensaje(mensaje, direccion);
        this.actualizarScroll();
    }

    renderizarMensaje(mensaje, direccion) {
        const contenedor = document.getElementById('contenedor-mensajes-chat');
        if (!contenedor) return;

        const esEnviado = direccion === 'enviado';
        const fecha = this.formatearHora(mensaje.timestamp);

        let contenido = '';
        
        if (mensaje.tipo === 'texto') {
            contenido = `
                <div class="mensaje-texto">${this.escaparHTML(mensaje.contenido)}</div>
            `;
        } else if (mensaje.tipo === 'archivo') {
            if (mensaje.tipo_mime?.startsWith('image/')) {
                contenido = `
                    <img src="${mensaje.contenido}" alt="${mensaje.nombre}" class="mensaje-imagen">
                    <div class="archivo-nombre">${mensaje.nombre}</div>
                `;
            } else {
                contenido = `
                    <div class="mensaje-archivo">
                        <i class="bi bi-file-earmark"></i>
                        <span>${mensaje.nombre}</span>
                    </div>
                `;
            }
        }

        const mensajeHtml = `
            <div class="mensaje-wrapper ${esEnviado ? 'enviado' : 'recibido'}">
                <div class="mensaje">
                    ${contenido}
                    <div class="mensaje-meta">
                        <span class="mensaje-hora">${fecha}</span>
                        ${esEnviado ? '<i class="bi bi-check2-all mensaje-check"></i>' : ''}
                    </div>
                </div>
            </div>
        `;

        contenedor.insertAdjacentHTML('beforeend', mensajeHtml);
    }

    actualizarScroll() {
        const contenedor = document.getElementById('contenedor-mensajes-chat');
        if (contenedor) {
            contenedor.scrollTop = contenedor.scrollHeight;
        }
    }

    reproducirSonido() {
        const audio = new Audio('/static/sounds/notificacion.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
            // Ignore error si autoplay está bloqueado
        });
    }

    mostrarEstado(estado) {
        const indicador = document.getElementById('estado-chat');
        if (!indicador) return;

        const estados = {
            conectado: { texto: 'Conectado', clase: 'conectado' },
            desconectado: { texto: 'Desconectado', clase: 'desconectado' },
            reconectando: { texto: 'Reconectando...', clase: 'reconectando' },
            error: { texto: 'Error', clase: 'error' }
        };

        const info = estados[estado] || estados.error;
        indicador.textContent = info.texto;
        indicador.className = `estado-chat ${info.clase}`;
    }

    formatearHora(fechaIso) {
        const fecha = new Date(fechaIso);
        return fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escaparHTML(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
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

    desconectar() {
        if (this.conexion) {
            this.conexion.close();
            this.conexion = null;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.chat-tiempo-real')) {
        window.chatTiempoReal = new ChatTiempoReal();
    }
});
