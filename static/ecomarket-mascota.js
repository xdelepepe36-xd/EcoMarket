// EcoHamster - Mascota de EcoMarket con consejos ecológicos

class EcoMascota {
    constructor() {
        this.consejos = {
            general: [
                "¡Cada producto reciclado es un paso hacia un planeta más limpio! 🌱",
                "Reutilizar es mejor que reciclar. ¡Da una segunda vida a tus cosas! ♻️",
                "Elige productos con menos envases para reducir residuos. 📦",
                "Apoya a vendedores locales que usan materiales sostenibles. 🌍",
                "Comprar menos pero mejor es la clave del consumo responsable. 🎯",
                "Tu compra ecológica inspira a otros a hacer lo mismo. 💚",
                "Los productos biodegradables se descomponen naturalmente. 🍃",
                "El agua es vida. Elige productos que ahorren agua. 💧"
            ],
            productos: [
                "¡Mira bien las etiquetas! Busca certificaciones ecológicas. 🏷️",
                "Compara precios pero también el impacto ambiental. ⚖️",
                "Los productos usados tienen historias únicas. ¡Descúbrelas! 📖",
                "Filtrar por categoría te ayuda a encontrar exactamente lo que necesitas. 🔍",
                "Guarda tus favoritos para volver más tarde sin olvidar. ⭐",
                "Lee las reseñas de otros compradores antes de decidir. 📝"
            ],
            registro: [
                "¡Bienvenido a la comunidad ecológica! 🌿",
                "Tu perfil te ayudará a rastrear tu impacto ambiental. 📊",
                "Completar tu perfil aumenta la confianza de otros usuarios. ✅",
                "¡Cada cuenta nueva es más fuerza para el cambio! 💪"
            ],
            login: [
                "¡Hola de nuevo! ¡Qué bueno verte cuidando el planeta! 👋",
                "Tus favoritos y historial están esperándote. 📂",
                "Continúa tu viaje ecológico donde lo dejaste. 🚀"
            ],
            impacto: [
                "¡Mira cómo tu comunidad hace la diferencia! 🌟",
                "Cada número aquí representa un impacto real. 📈",
                "Comparte estas estadísticas para inspirar a más personas. 📢",
                "Tu participación suma al total. ¡Gracias! 🙏"
            ],
            carrito: [
                "¡Estás a un paso de una compra ecológica! 🛒",
                "Revisa que realmente necesites todo antes de pagar. 💭",
                "Productos similares se pueden comprar juntos para ahorrar envíos. 📦",
                "¡Tu carrito ecológico está listo para generar impacto! ✨"
            ],
            publicar: [
                "¡Sube fotos claras para mostrar la calidad de tu producto! 📸",
                "Describe bien el material y origen del producto. 📝",
                "Precio justo = más ventas e impacto social. ⚖️",
                "Productos bien categorizados se encuentran más fácil. 🏷️"
            ]
        };
        
        this.currentContext = 'general';
        this.init();
    }
    
    init() {
        this.createMascota();
        this.detectContext();
        this.setupEventListeners();
    }
    
    createMascota() {
        const container = document.createElement('div');
        container.className = 'eco-mascota-container show';
        container.innerHTML = `
            <div class="eco-consejo-bubble" id="ecoConsejoBubble">
                <button class="eco-consejo-close" onclick="ecoMascota.hideBubble()">×</button>
                <div class="eco-consejo-header">
                    <div class="eco-consejo-icon">🐹</div>
                    <span class="eco-consejo-title">EcoHamster</span>
                </div>
                <p class="eco-consejo-text" id="ecoConsejoText"></p>
            </div>
            <div class="eco-mascota" onclick="ecoMascota.showConsejo()">
                <img src="https://cdn-icons-png.flaticon.com/512/616/616558.png" 
                     alt="EcoHamster" 
                     class="eco-mascota-img"
                     style="background: linear-gradient(135deg, #f5e6d3 0%, #e8d4be 100%); border-radius: 50%; padding: 10px;">
            </div>
        `;
        document.body.appendChild(container);
    }
    
    detectContext() {
        const path = window.location.pathname;
        
        if (path.includes('productos')) {
            this.currentContext = 'productos';
        } else if (path.includes('registro')) {
            this.currentContext = 'registro';
        } else if (path.includes('login')) {
            this.currentContext = 'login';
        } else if (path.includes('impacto')) {
            this.currentContext = 'impacto';
        } else if (path.includes('carrito')) {
            this.currentContext = 'carrito';
        } else if (path.includes('publicar')) {
            this.currentContext = 'publicar';
        } else {
            this.currentContext = 'general';
        }
    }
    
    setupEventListeners() {
        // Mostrar consejo automáticamente después de 3 segundos
        setTimeout(() => {
            this.showConsejo();
        }, 3000);
        
        // Cambiar consejo cada 30 segundos
        setInterval(() => {
            this.showConsejo();
        }, 30000);
    }
    
    getRandomConsejo() {
        const consejos = this.consejos[this.currentContext] || this.consejos.general;
        const randomIndex = Math.floor(Math.random() * consejos.length);
        return consejos[randomIndex];
    }
    
    showConsejo() {
        const bubble = document.getElementById('ecoConsejoBubble');
        const text = document.getElementById('ecoConsejoText');
        
        if (bubble && text) {
            text.textContent = this.getRandomConsejo();
            bubble.classList.add('active');
            
            // Ocultar automáticamente después de 8 segundos
            setTimeout(() => {
                this.hideBubble();
            }, 8000);
        }
    }
    
    hideBubble() {
        const bubble = document.getElementById('ecoConsejoBubble');
        if (bubble) {
            bubble.classList.remove('active');
        }
    }
    
    changeContext(context) {
        this.currentContext = context;
        this.showConsejo();
    }
}

// Inicializar cuando el DOM esté listo
let ecoMascota;
document.addEventListener('DOMContentLoaded', () => {
    ecoMascota = new EcoMascota();
});
