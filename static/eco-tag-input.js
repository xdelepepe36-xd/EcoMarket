// Tag Input - Input de etiquetas
class EcoTagInput {
    constructor() {
        this.init();
    }

    init() {
        this.createTagInput();
        this.addTagHandlers();
    }

    createTagInput() {
        const container = document.createElement('div');
        container.className = 'tag-input-container';
        container.innerHTML = `
            <h3🏷️ Input de etiquetas</h3>
            <div class="tag-input">
                <div class="tags-container" id="tagsContainer">
                    <span class="tag-example">Ejemplo: ecológico, sostenible, orgánico</span>
                </div>
                <input type="text" class="tag-input-field" id="tagInput" placeholder="Escribe y presiona Enter...">
            </div>
            <div class="tag-suggestions">
                <span class="suggestion-label">Sugerencias:</span>
                <div class="suggestion-tags">
                    <span class="suggestion-tag">ecológico</span>
                    <span class="suggestion-tag">sostenible</span>
                    <span class="suggestion-tag">orgánico</span>
                    <span class="suggestion-tag">natural</span>
                    <span class="suggestion-tag">reciclado</span>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addTagHandlers() {
        const input = document.getElementById('tagInput');
        const container = document.getElementById('tagsContainer');
        const suggestions = document.querySelectorAll('.suggestion-tag');

        const addTag = (text) => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerHTML = `${text} <span class="remove-tag">×</span>`;
            tag.querySelector('.remove-tag').addEventListener('click', () => {
                tag.remove();
            });
            container.appendChild(tag);
        };

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const text = input.value.trim();
                if (text) {
                    addTag(text);
                    input.value = '';
                }
            }
        });

        suggestions.forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                addTag(suggestion.textContent);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoTagInput();
});