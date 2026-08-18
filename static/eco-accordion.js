// Accordion - Acordeón
class EcoAccordion {
    constructor() {
        this.init();
    }

    init() {
        this.createAccordion();
        this.addEventListeners();
    }

    createAccordion() {
        const accordion = document.createElement('div');
        accordion.className = 'eco-accordion';
        accordion.innerHTML = `
            <div class="accordion-item">
                <button class="accordion-header">
                    <span>¿Cómo funciona EcoMarket?</span>
                    <span class="accordion-icon">+</span>
                </button>
                <div class="accordion-content">
                    <p>EcoMarket es un marketplace donde puedes comprar y vender productos ecológicos. Conectamos vendedores comprometidos con el medio ambiente con compradores conscientes.</p>
                </div>
            </div>
            <div class="accordion-item">
                <button class="accordion-header">
                    <span>¿Cuáles son los métodos de pago?</span>
                    <span class="accordion-icon">+</span>
                </button>
                <div class="accordion-content">
                    <p>Aceptamos tarjetas de crédito/débito, PayPal, Yape, Plin y transferencias bancarias. Todos los pagos son seguros y encriptados.</p>
                </div>
            </div>
            <div class="accordion-item">
                <button class="accordion-header">
                    <span>¿Tienen política de devoluciones?</span>
                    <span class="accordion-icon">+</span>
                </button>
                <div class="accordion-content">
                    <p>Sí, aceptamos devoluciones dentro de los 30 días posteriores a la compra. El producto debe estar en su estado original y con embalaje.</p>
                </div>
            </div>
            <div class="accordion-item">
                <button class="accordion-header">
                    <span>¿Cuánto tarda el envío?</span>
                    <span class="accordion-icon">+</span>
                </button>
                <div class="accordion-content">
                    <p>El tiempo de envío varía según tu ubicación. En Lima es de 1-2 días hábiles, en provincias 3-5 días hábiles. Envío gratis en pedidos mayores a S/. 100.</p>
                </div>
            </div>
        `;
        document.body.appendChild(accordion);
    }

    addEventListeners() {
        const headers = document.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const content = item.querySelector('.accordion-content');
                const icon = header.querySelector('.accordion-icon');

                const isOpen = item.classList.contains('active');

                // Cerrar todos
                document.querySelectorAll('.accordion-item').forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.accordion-content').style.maxHeight = '0';
                    i.querySelector('.accordion-icon').textContent = '+';
                });

                // Abrir el actual si estaba cerrado
                if (!isOpen) {
                    item.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.textContent = '-';
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoAccordion();
});