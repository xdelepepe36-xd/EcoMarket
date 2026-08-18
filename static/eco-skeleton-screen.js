// Skeleton Screen - Pantalla de carga skeleton
class EcoSkeletonScreen {
    constructor() {
        this.init();
    }

    init() {
        this.createSkeleton();
        this.hideAfterDelay();
    }

    createSkeleton() {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-screen';
        skeleton.innerHTML = `
            <div class="skeleton-header">
                <div class="skeleton-title"></div>
                <div class="skeleton-subtitle"></div>
            </div>
            <div class="skeleton-grid">
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                </div>
            </div>
        `;
        document.body.appendChild(skeleton);
    }

    hideAfterDelay() {
        setTimeout(() => {
            const skeleton = document.querySelector('.skeleton-screen');
            if (skeleton) {
                skeleton.style.opacity = '0';
                setTimeout(() => skeleton.remove(), 500);
            }
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoSkeletonScreen();
});