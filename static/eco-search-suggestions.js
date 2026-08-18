// Search Suggestions - Sugerencias de búsqueda
class EcoSearchSuggestions {
    constructor() {
        this.init();
    }

    init() {
        this.createSearchBox();
        this.addSuggestions();
    }

    createSearchBox() {
        const searchBox = document.createElement('div');
        searchBox.className = 'search-suggestions';
        searchBox.innerHTML = `
            <input type="text" placeholder="Buscar productos..." class="search-input">
            <div class="suggestions-list"></div>
        `;
        document.body.appendChild(searchBox);

        const input = searchBox.querySelector('.search-input');
        input.addEventListener('input', (e) => {
            this.showSuggestions(e.target.value);
        });
    }

    showSuggestions(query) {
        const suggestions = [
            'Botella reutilizable',
            'Cepillo de bambú',
            'Jabón natural',
            'Bolsa ecológica',
            'Shampoo sólido',
            'Maceta reciclada',
            'Kit compostaje',
            'Popotes de acero'
        ];

        const filtered = suggestions.filter(s => 
            s.toLowerCase().includes(query.toLowerCase())
        );

        const list = document.querySelector('.suggestions-list');
        list.innerHTML = '';

        if (query.length > 0 && filtered.length > 0) {
            filtered.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = suggestion;
                item.addEventListener('click', () => {
                    document.querySelector('.search-input').value = suggestion;
                    list.innerHTML = '';
                });
                list.appendChild(item);
            });
        }
    }

    addSuggestions() {
        // Sugerencias populares que se muestran al cargar
        const popular = document.createElement('div');
        popular.className = 'popular-searches';
        popular.innerHTML = `
            <h4>🔥 Búsquedas populares</h4>
            <div class="popular-tags">
                <span class="tag">Botella</span>
                <span class="tag">Bambú</span>
                <span class="tag">Jabón</span>
                <span class="tag">Bolsa</span>
                <span class="tag">Shampoo</span>
            </div>
        `;
        document.body.appendChild(popular);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoSearchSuggestions();
});