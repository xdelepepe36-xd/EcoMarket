/**
 * EcoMarket - Mecánicas Ecológicas Adicionales
 * Sistema de gamificación, logros y cálculo de impacto ambiental
 */

const EcoMechanics = {
    // Sistema de Puntos Ecológicos
    puntos: {
        calcularPuntosProducto(producto) {
            let puntos = 0;
            
            // Puntos por material ecológico
            if (producto.etiquetas && producto.etiquetas.includes('bambu')) puntos += 10;
            if (producto.etiquetas && producto.etiquetas.includes('reciclado')) puntos += 15;
            if (producto.etiquetas && producto.etiquetas.includes('organico')) puntos += 12;
            if (producto.etiquetas && producto.etiquetas.includes('biodegradable')) puntos += 8;
            if (producto.etiquetas && producto.etiquetas.includes('cero-plastico')) puntos += 20;
            
            // Puntos por eco_score
            puntos += (producto.eco_score || 0) * 0.5;
            
            // Puntos por categoría
            const categoriaPuntos = {
                'Jardín': 15,
                'Hogar': 10,
                'Higiene': 12,
                'Ropa': 8,
                'Accesorios': 7,
                'Alimentación': 18
            };
            puntos += categoriaPuntos[producto.categoria] || 5;
            
            return Math.round(puntos);
        },
        
        calcularImpactoCompra(producto) {
            const impacto = {
                plastico_evitado: 0,
                co2_ahorrado: 0,
                agua_ahorrada: 0,
                arboles_salvados: 0
            };
            
            // Cálculos basados en tipo de producto
            if (producto.etiquetas && producto.etiquetas.includes('bambu')) {
                impacto.arboles_salvados = 1;
                impacto.co2_ahorrado = 2.5;
            }
            
            if (producto.etiquetas && producto.etiquetas.includes('reciclado')) {
                impacto.plastico_evitado = 0.5;
                impacto.co2_ahorrado = 1.8;
            }
            
            if (producto.etiquetas && producto.etiquetas.includes('reutilizable')) {
                impacto.plastico_evitado = 1.2;
                impacto.co2_ahorrado = 3.0;
            }
            
            if (producto.etiquetas && producto.etiquetas.includes('organico')) {
                impacto.agua_ahorrada = 50;
                impacto.co2_ahorrado += 1.5;
            }
            
            return impacto;
        }
    },
    
    // Sistema de Logros Ecológicos
    logros: {
        lista: [
            {
                id: 'primera_compra',
                nombre: 'Primera Compra Ecológica',
                descripcion: 'Realiza tu primera compra en EcoMarket',
                icono: '🌱',
                puntos: 50,
                condicion: (usuario) => usuario.total_compras >= 1
            },
            {
                id: 'eco_warrior',
                nombre: 'Eco Warrior',
                descripcion: 'Compra 10 productos ecológicos',
                icono: '⚔️',
                puntos: 200,
                condicion: (usuario) => usuario.total_compras >= 10
            },
            {
                id: 'plastico_zero',
                nombre: 'Cero Plástico',
                descripcion: 'Compra 5 productos sin plástico',
                icono: '🚫',
                puntos: 150,
                condicion: (usuario) => usuario.productos_sin_plastico >= 5
            },
            {
                id: 'bambu_master',
                nombre: 'Maestro del Bambú',
                descripcion: 'Compra 3 productos de bambú',
                icono: '🎋',
                puntos: 100,
                condicion: (usuario) => usuario.productos_bambu >= 3
            },
            {
                id: 'reciclaje_pro',
                nombre: 'Pro del Reciclaje',
                descripcion: 'Compra 5 productos reciclados',
                icono: '♻️',
                puntos: 180,
                condicion: (usuario) => usuario.productos_reciclados >= 5
            },
            {
                id: 'green_influencer',
                nombre: 'Influencer Verde',
                descripcion: 'Refiere 5 amigos a EcoMarket',
                icono: '📢',
                puntos: 250,
                condicion: (usuario) => usuario.referidos >= 5
            },
            {
                id: 'review_master',
                nombre: 'Maestro de Reseñas',
                descripcion: 'Escribe 10 reseñas de productos',
                icono: '⭐',
                puntos: 120,
                condicion: (usuario) => usuario.total_resenas >= 10
            },
            {
                id: 'organic_addict',
                nombre: 'Adicto Orgánico',
                descripcion: 'Compra 8 productos orgánicos',
                icono: '🥬',
                puntos: 160,
                condicion: (usuario) => usuario.productos_organicos >= 8
            }
        ],
        
        verificarLogros(usuario) {
            const logrosDesbloqueados = [];
            
            this.lista.forEach(logro => {
                if (!usuario.logros_desbloqueados.includes(logro.id) && logro.condicion(usuario)) {
                    logrosDesbloqueados.push(logro);
                }
            });
            
            return logrosDesbloqueados;
        },
        
        mostrarNotificacionLogro(logro) {
            if (typeof showToast === 'function') {
                showToast(`🏆 ¡Logro desbloqueado: ${logro.nombre}! +${logro.puntos} puntos`, 'success');
            }
        }
    },
    
    // Calculadora de Huella de Carbono
    huellaCarbono: {
        calcularProducto(producto) {
            let huella = 0;
            
            // Base por categoría
            const huellaBase = {
                'Hogar': 2.5,
                'Jardín': 1.8,
                'Higiene': 1.2,
                'Ropa': 3.5,
                'Accesorios': 2.8,
                'Alimentación': 0.8
            };
            
            huella = huellaBase[producto.categoria] || 2.0;
            
            // Reducciones por características ecológicas
            if (producto.etiquetas && producto.etiquetas.includes('local')) hu *= 0.7;
            if (producto.etiquetas && producto.etiquetas.includes('reciclado')) hu *= 0.5;
            if (producto.etiquetas && producto.etiquetas.includes('organico')) hu *= 0.6;
            if (producto.etiquetas && producto.etiquetas.includes('bambu')) hu *= 0.4;
            
            return parseFloat(hu.toFixed(2));
        },
        
        calcularTotalCompra(productos) {
            return productos.reduce((total, producto) => {
                return total + (this.calcularProducto(producto) * producto.cantidad);
            }, 0);
        },
        
        compararConPromedio(huella) {
            const promedioComercio = 15.5; // kg CO2 por compra promedio
            const ahorro = promedioComercio - huella;
            const porcentaje = ((ahorro / promedioComercio) * 100).toFixed(1);
            
            return {
                ahorro: ahorro > 0 ? ahorro : 0,
                porcentaje: porcentaje > 0 ? porcentaje : 0,
                mensaje: ahorro > 0 
                    ? `¡Ahorraste ${ahorro.toFixed(1)} kg de CO2 (${porcentaje}% menos que el promedio)!`
                    : 'Tu huella está dentro del promedio'
            };
        }
    },
    
    // Sistema de Niveles Ecológicos
    niveles: {
        lista: [
            { nivel: 1, nombre: 'Semilla', puntos_min: 0, icono: '🌱', color: '#90EE90' },
            { nivel: 2, nombre: 'Brote', puntos_min: 100, icono: '🌿', color: '#32CD32' },
            { nivel: 3, nombre: 'Planta', puntos_min: 300, icono: '🪴', color: '#228B22' },
            { nivel: 4, nombre: 'Árbol', puntos_min: 600, icono: '🌳', color: '#006400' },
            { nivel: 5, nombre: 'Bosque', puntos_min: 1000, icono: '🌲', color: '#004d00' },
            { nivel: 6, nombre: 'Eco Maestro', puntos_min: 2000, icono: '🏆', color: '#FFD700' }
        ],
        
        obtenerNivel(puntos) {
            let nivelActual = this.lista[0];
            
            this.lista.forEach(nivel => {
                if (puntos >= nivel.puntos_min) {
                    nivelActual = nivel;
                }
            });
            
            return nivelActual;
        },
        
        progresoSiguienteNivel(puntos) {
            const nivelActual = this.obtenerNivel(puntos);
            const siguienteNivel = this.lista.find(n => n.nivel === nivelActual.nivel + 1);
            
            if (!siguienteNivel) {
                return { progreso: 100, puntos_faltantes: 0 };
            }
            
            const puntosEnNivel = puntos - nivelActual.puntos_min;
            const puntosParaSiguiente = siguienteNivel.puntos_min - nivelActual.puntos_min;
            const progreso = ((puntosEnNivel / puntosParaSiguiente) * 100).toFixed(1);
            const puntosFaltantes = siguienteNivel.puntos_min - puntos;
            
            return {
                progreso: parseFloat(progreso),
                puntos_faltantes: puntosFaltantes
            };
        }
    },
    
    // Sistema de Recompensas Ecológicas
    recompensas: {
        disponibles: [
            {
                id: 'cupon_verde',
                nombre: 'Cupón Verde',
                descripcion: '10% de descuento en productos ecológicos',
                puntos_requeridos: 200,
                tipo: 'descuento',
                valor: 0.10
            },
            {
                id: 'envio_gratis',
                nombre: 'Envío Gratis',
                descripcion: 'Envío gratuito en tu próxima compra',
                puntos_requeridos: 150,
                tipo: 'envio',
                valor: 0
            },
            {
                id: 'producto_exclusivo',
                nombre: 'Producto Exclusivo',
                descripcion: 'Acceso a productos eco exclusivos',
                puntos_requeridos: 500,
                tipo: 'acceso',
                valor: 'exclusivo'
            }
        ],
        
        canjearRecompensa(recompensaId, puntosUsuario) {
            const recompensa = this.disponibles.find(r => r.id === recompensaId);
            
            if (!recompensa) {
                return { exito: false, mensaje: 'Recompensa no encontrada' };
            }
            
            if (puntosUsuario < recompensa.puntos_requeridos) {
                return { 
                    exito: false, 
                    mensaje: `Necesitas ${recompensa.puntos_requeridos - puntosUsuario} puntos más` 
                };
            }
            
            return { 
                exito: true, 
                mensaje: `¡Recompensa "${recompensa.nombre}" canjeada exitosamente!`,
                puntos_gastados: recompensa.puntos_requeridos
            };
        }
    },
    
    // Inicialización
    init() {
        // Cargar datos del usuario si existen
        this.cargarDatosUsuario();
        
        // Inicializar UI de mecánicas ecológicas
        this.inicializarUI();
    },
    
    cargarDatosUsuario() {
        const datosGuardados = localStorage.getItem('ecomarket_mecanicas_usuario');
        if (datosGuardados) {
            this.usuario = JSON.parse(datosGuardados);
        } else {
            this.usuario = {
                puntos: 0,
                nivel: 1,
                total_compras: 0,
                productos_sin_plastico: 0,
                productos_bambu: 0,
                productos_reciclados: 0,
                productos_organicos: 0,
                referidos: 0,
                total_resenas: 0,
                logros_desbloqueados: [],
                recompensas_canjeadas: []
            };
        }
    },
    
    guardarDatosUsuario() {
        localStorage.setItem('ecomarket_mecanicas_usuario', JSON.stringify(this.usuario));
    },
    
    inicializarUI() {
        // Agregar indicador de nivel ecológico al perfil si existe
        const perfilContainer = document.querySelector('.perfil-header');
        if (perfilContainer) {
            this.mostrarNivelEco();
        }
        
        // Agregar calculadora de impacto en carrito
        const carritoContainer = document.querySelector('.carrito-container');
        if (carritoContainer) {
            this.mostrarImpactoCarrito();
        }
    },
    
    mostrarNivelEco() {
        const nivel = this.niveles.obtenerNivel(this.usuario.puntos);
        const progreso = this.niveles.progresoSiguienteNivel(this.usuario.puntos);
        
        const nivelHTML = `
            <div class="eco-nivel-indicator" style="margin-top: 16px; padding: 12px; background: ${nivel.color}20; border-radius: 12px; border: 2px solid ${nivel.color};">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 1.5rem;">${nivel.icono}</span>
                    <div>
                        <strong style="color: ${nivel.color};">Nivel ${nivel.nivel}: ${nivel.nombre}</strong>
                        <div style="font-size: 0.8rem; color: var(--texto-sec);">${this.usuario.puntos} puntos ecológicos</div>
                    </div>
                </div>
                <div style="background: ${nivel.color}40; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${progreso.progreso}%; background: ${nivel.color}; height: 100%; transition: width 0.3s;"></div>
                </div>
                <div style="font-size: 0.75rem; color: var(--texto-sec); margin-top: 4px;">
                    ${progreso.puntos_faltantes > 0 ? `${progreso.puntos_faltantes} puntos para el siguiente nivel` : '¡Nivel máximo alcanzado!'}
                </div>
            </div>
        `;
        
        // Insertar después del header del perfil
        const headerSection = document.querySelector('.perfil-header');
        if (headerSection) {
            headerSection.insertAdjacentHTML('afterend', nivelHTML);
        }
    },
    
    mostrarImpactoCarrito() {
        // Esta función se implementaría cuando se tengan los productos del carrito
        // Por ahora es un placeholder
        console.log('Calculadora de impacto de carrito inicializada');
    },
    
    // Método para registrar una compra y actualizar puntos
    registrarCompra(producto) {
        const puntosGanados = this.puntos.calcularPuntosProducto(producto);
        const impacto = this.puntos.calcularImpactoCompra(producto);
        
        this.usuario.puntos += puntosGanados;
        this.usuario.total_compras += 1;
        
        // Actualizar contadores específicos
        if (producto.etiquetas && producto.etiquetas.includes('cero-plastico')) {
            this.usuario.productos_sin_plastico += 1;
        }
        if (producto.etiquetas && producto.etiquetas.includes('bambu')) {
            this.usuario.productos_bambu += 1;
        }
        if (producto.etiquetas && producto.etiquetas.includes('reciclado')) {
            this.usuario.productos_reciclados += 1;
        }
        if (producto.etiquetas && producto.etiquetas.includes('organico')) {
            this.usuario.productos_organicos += 1;
        }
        
        // Verificar logros
        const nuevosLogros = this.logros.verificarLogros(this.usuario);
        nuevosLogros.forEach(logro => {
            this.usuario.logros_desbloqueados.push(logro.id);
            this.logros.mostrarNotificacionLogro(logro);
            this.usuario.puntos += logro.puntos;
        });
        
        // Actualizar nivel
        const nuevoNivel = this.niveles.obtenerNivel(this.usuario.puntos);
        if (nuevoNivel.nivel > this.usuario.nivel) {
            this.usuario.nivel = nuevoNivel.nivel;
            if (typeof showToast === 'function') {
                showToast(`🎉 ¡Subiste al nivel ${nuevoNivel.nivel}: ${nuevoNivel.nombre}!`, 'success');
            }
        }
        
        this.guardarDatosUsuario();
        
        return {
            puntos_ganados: puntosGanados,
            impacto: impacto,
            nuevo_nivel: nuevoNivel
        };
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    if (typeof EcoMechanics !== 'undefined') {
        EcoMechanics.init();
    }
});

// Exportar para uso global
window.EcoMechanics = EcoMechanics;