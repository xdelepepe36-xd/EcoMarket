/**
 * EcoMarket - Sistema de Verificación de Vendedores
 * Gestiona badges de verificación y niveles de confianza
 */

const VerificacionVendedores = {
    // Niveles de verificación
    niveles: {
        BASICO: {
            id: 'basico',
            nombre: 'Básico',
            badge: '📝',
            color: '#6c757d',
            requisitos: ['Email verificado'],
            confianza: 1
        },
        CONFIRMADO: {
            id: 'confirmado',
            nombre: 'Confirmado',
            badge: '✓',
            color: '#28a745',
            requisitos: ['Email verificado', 'Teléfono verificado'],
            confianza: 2
        },
        VERIFICADO: {
            id: 'verificado',
            nombre: 'Verificado',
            badge: '✓✓',
            color: '#007bff',
            requisitos: ['Email verificado', 'Teléfono verificado', 'Documento verificado'],
            confianza: 3
        },
        PREMIUM: {
            id: 'premium',
            nombre: 'Premium',
            badge: '⭐',
            color: '#ffc107',
            requisitos: ['Email verificado', 'Teléfono verificado', 'Documento verificado', '+50 ventas exitosas'],
            confianza: 4
        },
        TOP_SELLER: {
            id: 'top_seller',
            nombre: 'Top Seller',
            badge: '🏆',
            color: '#17a2b8',
            requisitos: ['Email verificado', 'Teléfono verificado', 'Documento verificado', '+100 ventas exitosas', 'Rating 4.5+'],
            confianza: 5
        }
    },

    // Estado de verificación
    estado: {
        email_verificado: false,
        telefono_verificado: false,
        documento_verificado: false,
        ventas_totales: 0,
        rating_promedio: 0
    },

    /**
     * Inicializa el sistema de verificación
     */
    init: function() {
        this.cargarEstado();
        this.renderizarBadge();
        this.renderizarPanelVerificacion();
        this.inicializarEventos();
    },

    /**
     * Carga el estado de verificación del usuario
     */
    cargarEstado: function() {
        const stored = localStorage.getItem('verificacion_estado');
        if (stored) {
            this.estado = JSON.parse(stored);
        }
    },

    /**
     * Guarda el estado de verificación
     */
    guardarEstado: function() {
        localStorage.setItem('verificacion_estado', JSON.stringify(this.estado));
    },

    /**
     * Obtiene el nivel actual de verificación
     */
    obtenerNivelActual: function() {
        const { email_verificado, telefono_verificado, documento_verificado, ventas_totales, rating_promedio } = this.estado;

        if (ventas_totales >= 100 && rating_promedio >= 4.5 && email_verificado && telefono_verificado && documento_verificado) {
            return this.niveles.TOP_SELLER;
        }
        if (ventas_totales >= 50 && email_verificado && telefono_verificado && documento_verificado) {
            return this.niveles.PREMIUM;
        }
        if (email_verificado && telefono_verificado && documento_verificado) {
            return this.niveles.VERIFICADO;
        }
        if (email_verificado && telefono_verificado) {
            return this.niveles.CONFIRMADO;
        }
        if (email_verificado) {
            return this.niveles.BASICO;
        }
        return null;
    },

    /**
     * Renderiza el badge de verificación
     */
    renderizarBadge: function() {
        const nivel = this.obtenerNivelActual();
        const badgeContainer = document.querySelector('.verificacion-badge');
        
        if (badgeContainer && nivel) {
            badgeContainer.innerHTML = `
                <span class="badge badge-verificado" style="background-color: ${nivel.color};">
                    ${nivel.badge} ${nivel.nombre}
                </span>
            `;
        }
    },

    /**
     * Renderiza el panel de verificación
     */
    renderizarPanelVerificacion: function() {
        const panel = document.getElementById('panel-verificacion');
        if (!panel) return;

        const nivel = this.obtenerNivelActual();
        const siguienteNivel = this.obtenerSiguienteNivel();

        panel.innerHTML = `
            <div class="verificacion-header">
                <h3>Estado de Verificación</h3>
                ${nivel ? `
                    <div class="nivel-actual" style="background-color: ${nivel.color};">
                        ${nivel.badge} ${nivel.nombre}
                    </div>
                ` : '<div class="nivel-actual sin-verificar">Sin verificar</div>'}
            </div>

            <div class="verificacion-progreso">
                <h4>Progreso de Verificación</h4>
                ${this.renderizarItemsVerificacion()}
            </div>

            ${siguienteNivel ? `
                <div class="siguiente-nivel">
                    <h4>Siguiente Nivel: ${siguienteNivel.nombre}</h4>
                    <p>Requisitos:</p>
                    <ul>
                        ${siguienteNivel.requisitos.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="acciones-verificacion">
                ${this.renderizarAcciones()}
            </div>
        `;
    },

    /**
     * Renderiza los items de verificación
     */
    renderizarItemsVerificacion: function() {
        const items = [
            { key: 'email_verificado', label: 'Email Verificado', icon: '📧' },
            { key: 'telefono_verificado', label: 'Teléfono Verificado', icon: '📱' },
            { key: 'documento_verificado', label: 'Documento Verificado', icon: '🆔' }
        ];

        return items.map(item => `
            <div class="verificacion-item ${this.estado[item.key] ? 'completado' : 'pendiente'}">
                <span class="icono">${item.icon}</span>
                <span class="label">${item.label}</span>
                <span class="estado">${this.estado[item.key] ? '✓' : '○'}</span>
            </div>
        `).join('');
    },

    /**
     * Renderiza las acciones de verificación
     */
    renderizarAcciones: function() {
        const acciones = [];

        if (!this.estado.email_verificado) {
            acciones.push(`
                <button class="btn btn-verificar" data-tipo="email">
                    📧 Verificar Email
                </button>
            `);
        }

        if (!this.estado.telefono_verificado) {
            acciones.push(`
                <button class="btn btn-verificar" data-tipo="telefono">
                    📱 Verificar Teléfono
                </button>
            `);
        }

        if (!this.estado.documento_verificado) {
            acciones.push(`
                <button class="btn btn-verificar" data-tipo="documento">
                    🆔 Verificar Documento
                </button>
            `);
        }

        return acciones.join('');
    },

    /**
     * Obtiene el siguiente nivel a alcanzar
     */
    obtenerSiguienteNivel: function() {
        const nivelActual = this.obtenerNivelActual();
        const niveles = Object.values(this.niveles);

        if (!nivelActual) return niveles[0];

        const currentIndex = niveles.findIndex(n => n.id === nivelActual.id);
        return niveles[currentIndex + 1] || null;
    },

    /**
     * Inicializa los eventos
     */
    inicializarEventos: function() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-verificar')) {
                const tipo = e.target.dataset.tipo;
                this.iniciarVerificacion(tipo);
            }
        });
    },

    /**
     * Inicia el proceso de verificación
     */
    iniciarVerificacion: function(tipo) {
        switch(tipo) {
            case 'email':
                this.verificarEmail();
                break;
            case 'telefono':
                this.verificarTelefono();
                break;
            case 'documento':
                this.verificarDocumento();
                break;
        }
    },

    /**
     * Verifica el email
     */
    verificarEmail: function() {
        const email = prompt('Ingresa tu email para verificar:');
        if (!email) return;

        // Simulación de envío de código
        alert(`Código de verificación enviado a ${email}`);
        
        const codigo = prompt('Ingresa el código de verificación:');
        if (codigo === '123456') { // Código de prueba
            this.estado.email_verificado = true;
            this.guardarEstado();
            this.renderizarBadge();
            this.renderizarPanelVerificacion();
            this.mostrarNotificacion('Email verificado exitosamente', 'success');
        } else {
            this.mostrarNotificacion('Código incorrecto', 'error');
        }
    },

    /**
     * Verifica el teléfono
     */
    verificarTelefono: function() {
        const telefono = prompt('Ingresa tu número de teléfono:');
        if (!telefono) return;

        // Simulación de envío de SMS
        alert(`Código SMS enviado al ${telefono}`);
        
        const codigo = prompt('Ingresa el código SMS:');
        if (codigo === '123456') { // Código de prueba
            this.estado.telefono_verificado = true;
            this.guardarEstado();
            this.renderizarBadge();
            this.renderizarPanelVerificacion();
            this.mostrarNotificación('Teléfono verificado exitosamente', 'success');
        } else {
            this.mostrarNotificación('Código incorrecto', 'error');
        }
    },

    /**
     * Verifica el documento
     */
    verificarDocumento: function() {
        const tipo = prompt('Tipo de documento (DNI, Carnet, Pasaporte):');
        const numero = prompt('Número de documento:');
        
        if (!tipo || !numero) return;

        // Simulación de verificación
        this.estado.documento_verificado = true;
        this.guardarEstado();
        this.renderizarBadge();
        this.renderizarPanelVerificacion();
        this.mostrarNotificación('Documento verificado exitosamente', 'success');
    },

    /**
     * Muestra una notificación
     */
    mostrarNotificacion: function(mensaje, tipo) {
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);

        setTimeout(() => {
            notificacion.remove();
        }, 3000);
    },

    /**
     * Actualiza las estadísticas del vendedor
     */
    actualizarEstadisticas: function(ventas, rating) {
        this.estado.ventas_totales = ventas;
        this.estado.rating_promedio = rating;
        this.guardarEstado();
        this.renderizarBadge();
        this.renderizarPanelVerificacion();
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => VerificacionVendedores.init());
} else {
    VerificacionVendedores.init();
}
