// Rich Text Editor - Editor de texto enriquecido
class EcoRichTextEditor {
    constructor() {
        this.init();
    }

    init() {
        this.createEditor();
        this.addToolbarHandlers();
    }

    createEditor() {
        const container = document.createElement('div');
        container.className = 'rich-editor-container';
        container.innerHTML = `
            <h3>✏️ Editor de texto</h3>
            <div class="rich-editor">
                <div class="editor-toolbar">
                    <button class="toolbar-btn" data-command="bold" title="Negrita"><b>B</b></button>
                    <button class="toolbar-btn" data-command="italic" title="Cursiva"><i>I</i></button>
                    <button class="toolbar-btn" data-command="underline" title="Subrayado"><u>U</u></button>
                    <button class="toolbar-btn" data-command="strikeThrough" title="Tachado"><s>S</s></button>
                    <div class="toolbar-divider"></div>
                    <button class="toolbar-btn" data-command="justifyLeft" title="Alinear izquierda">⇤</button>
                    <button class="toolbar-btn" data-command="justifyCenter" title="Centrar">⇥</button>
                    <button class="toolbar-btn" data-command="justifyRight" title="Alinear derecha">⇤</button>
                    <div class="toolbar-divider"></div>
                    <button class="toolbar-btn" data-command="insertUnorderedList" title="Lista">•</button>
                    <button class="toolbar-btn" data-command="insertOrderedList" title="Lista numerada">1.</button>
                    <div class="toolbar-divider"></div>
                    <select class="toolbar-select" data-command="fontSize">
                        <option value="3">Normal</option>
                        <option value="1">Pequeño</option>
                        <option value="5">Grande</option>
                        <option value="7">Muy grande</option>
                    </select>
                    <select class="toolbar-select" data-command="foreColor">
                        <option value="black">Negro</option>
                        <option value="red">Rojo</option>
                        <option value="blue">Azul</option>
                        <option value="green">Verde</option>
                    </select>
                </div>
                <div class="editor-content" contenteditable="true">
                    <p>Escribe tu texto aquí...</p>
                </div>
                <div class="editor-actions">
                    <button class="action-btn clear">Limpiar</button>
                    <button class="action-btn save">Guardar</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addToolbarHandlers() {
        const toolbarBtns = document.querySelectorAll('.toolbar-btn');
        const toolbarSelects = document.querySelectorAll('.toolbar-select');
        const editor = document.querySelector('.editor-content');

        toolbarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.command;
                document.execCommand(command, false, null);
                editor.focus();
            });
        });

        toolbarSelects.forEach(select => {
            select.addEventListener('change', () => {
                const command = select.dataset.command;
                const value = select.value;
                document.execCommand(command, false, value);
                editor.focus();
            });
        });

        document.querySelector('.action-btn.clear').addEventListener('click', () => {
            editor.innerHTML = '<p>Escribe tu texto aquí...</p>';
        });

        document.querySelector('.action-btn.save').addEventListener('click', () => {
            const content = editor.innerHTML;
            alert('Contenido guardado:\n\n' + content);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoRichTextEditor();
});