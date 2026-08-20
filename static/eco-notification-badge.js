// Notification Badge - Badge de notificación
class EcoNotificationBadge {
    constructor() {
        this.init();
    }

    init() {
        this.createNotificationBadge();
        this.addBadgeHandlers();
    }

    createNotificationBadge() {
        const container = document.createElement('div');
        container.className = 'notification-badge-container';
        container.innerHTML = `
            <h3>🔔 Badge de notificación</h3>
            <div class="badge-demo">
                <button class="notification-btn">
                    <span class="btn-icon">🔔</span>
                    <span class="notification-badge">5</span>
                </button>
                <button class="notification-btn">
                    <span class="btn-icon">💬</span>
                    <span class="notification-badge">12</span>
                </button>
                <button class="notification-btn">
                    <span class="btn-icon">🛒</span>
                    <span class="notification-badge">3</span>
                </button>
                <button class="notification-btn">
                    <span class="btn-icon">❤️</span>
                    <span class="notification-badge badge-large">99+</span>
                </button>
            </div>
        `;
        document.body.appendChild(container);
    }

    addBadgeHandlers() {
        const buttons = document.querySelectorAll('.notification-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const badge = btn.querySelector('.notification-badge');
                const count = parseInt(badge.textContent);
                if (count > 0) {
                    badge.textContent = count - 1;
                    if (count - 1 === 0) {
                        badge.style.display = 'none';
                    }
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoNotificationBadge();
});