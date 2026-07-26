document.addEventListener('DOMContentLoaded', function () {
    const favoritesKey = 'EcoMarketFavorites';

    function getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(favoritesKey) || '[]');
        } catch (error) {
            return [];
        }
    }

    function saveFavorites(ids) {
        localStorage.setItem(favoritesKey, JSON.stringify(ids));
    }

    function toggleFavorite(productoId) {
        const favorites = getFavorites();
        const index = favorites.indexOf(productoId);
        if (index >= 0) {
            favorites.splice(index, 1);
        } else {
            favorites.push(productoId);
        }
        saveFavorites(favorites);
        updateFavoriteButtons();
        updateFavoritesPage();
    }

    function updateFavoriteButtons() {
        const favorites = getFavorites();
        document.querySelectorAll('.favorite-btn').forEach((button) => {
            const productoId = button.dataset.productoId;
            if (!productoId) return;
            if (favorites.includes(productoId)) {
                button.classList.add('favorito');
                button.setAttribute('aria-label', 'Eliminar de favoritos');
            } else {
                button.classList.remove('favorito');
                button.setAttribute('aria-label', 'Agregar a favoritos');
            }
        });
    }

    function updateFavoritesPage() {
        const favoritesPage = document.querySelector('.favoritos-page');
        if (!favoritesPage) return;

        const favorites = getFavorites();
        const cards = document.querySelectorAll('.favoritos-page .producto-card');
        const noFavorites = document.getElementById('noFavoritesMessage');
        let hasFavorite = false;

        cards.forEach((card) => {
            const productoId = card.dataset.productoId;
            if (favorites.includes(productoId)) {
                card.style.display = '';
                hasFavorite = true;
            } else {
                card.style.display = 'none';
            }
        });

        if (noFavorites) {
            noFavorites.hidden = hasFavorite;
        }
    }

    document.querySelectorAll('.favorite-btn').forEach((button) => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const productoId = button.dataset.productoId;
            if (!productoId) return;
            toggleFavorite(productoId);
        });
    });

    updateFavoriteButtons();
    updateFavoritesPage();
});
