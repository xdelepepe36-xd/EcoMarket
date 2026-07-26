document.addEventListener('DOMContentLoaded', function () {
    const hasSeenModal = localStorage.getItem('ecoModalSeen');
    if (hasSeenModal) {
        return;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop visible';

    const modal = document.createElement('div');
    modal.className = 'modal-window';
    modal.innerHTML = `
        <button class="modal-close" aria-label="Cerrar">×</button>
        <h2>Bienvenido a EcoMarket</h2>
        <p>Explora productos ecológicos, guarda favoritos y usa el carrito para disfrutar de una experiencia de compra más suave.</p>
        <div class="modal-actions">
            <button class="btn-secundario" id="dismissModal">Entendido</button>
            <button class="btn-principal" id="exploreModal">Ver catálogo</button>
        </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    function closeModal() {
        backdrop.classList.remove('visible');
        setTimeout(() => backdrop.remove(), 400);
        localStorage.setItem('ecoModalSeen', 'true');
    }

    backdrop.querySelector('.modal-close')?.addEventListener('click', closeModal);
    backdrop.querySelector('#dismissModal')?.addEventListener('click', closeModal);
    backdrop.querySelector('#exploreModal')?.addEventListener('click', function () {
        closeModal();
        window.location.href = '/productos';
    });
});
