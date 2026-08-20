// Toast Notification - Notificaciones toast
class EcoToastNotification {
    constructor() {
        this.init();
    }

    init() {
        this.createToastButton();
        this.showToast('🎉 ¡Bienvenido a EcoMarket!', 'success');
    }

    createToastButton() {
        const button = document.createElement('button');
        button.className = 'toast-demo-btn';
        button.textContent = 'Mostrar notificación';
        button.addEventListener('click', () => {
            this.showToast('📢 Nueva notificación', 'info');
        });
        document.body.appendChild(button);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <span class="toast-close">&times;</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoToastNotification();
});