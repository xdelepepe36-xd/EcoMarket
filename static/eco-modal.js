// Modal - Sistema de modales
class EcoModal {
    constructor() {
        this.init();
    }

    init() {
        this.createModal();
        this.addModalTriggers();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'eco-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">Título del Modal</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Contenido del modal...</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn primary">Aceptar</button>
                    <button class="modal-btn secondary">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            this.closeModal();
        });
    }

    addModalTriggers() {
        const triggerBtn = document.createElement('button');
        triggerBtn.className = 'modal-trigger';
        triggerBtn.textContent = 'Abrir Modal';
        triggerBtn.addEventListener('click', () => {
            this.openModal({
                title: '¡Bienvenido a EcoMarket!',
                content: 'Este es un ejemplo de modal. Puedes usarlo para mostrar información importante.',
                primaryBtn: 'Entendido',
                secondaryBtn: 'Cerrar'
            });
        });
        document.body.appendChild(triggerBtn);
    }

    openModal(options) {
        const modal = document.querySelector('.eco-modal');
        modal.querySelector('.modal-title').textContent = options.title;
        modal.querySelector('.modal-body p').textContent = options.content;
        modal.querySelector('.modal-btn.primary').textContent = options.primaryBtn;
        modal.querySelector('.modal-btn.secondary').textContent = options.secondaryBtn;
        modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.querySelector('.eco-modal');
        modal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoModal();
});