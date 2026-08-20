// File Upload - Subida de archivos
class EcoFileUpload {
    constructor() {
        this.init();
    }

    init() {
        this.createFileUpload();
        this.addDragDropHandlers();
        this.addFileHandlers();
    }

    createFileUpload() {
        const container = document.createElement('div');
        container.className = 'file-upload-container';
        container.innerHTML = `
            <h3>📁 Subir archivos</h3>
            <div class="file-upload-area" id="dropZone">
                <div class="upload-icon">📤</div>
                <p class="upload-text">Arrastra archivos aquí o haz clic para seleccionar</p>
                <p class="upload-subtext">PDF, JPG, PNG (Máximo 10MB)</p>
                <input type="file" class="file-input" multiple accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                <button class="select-files-btn">Seleccionar archivos</button>
            </div>
            <div class="file-list" id="fileList"></div>
        `;
        document.body.appendChild(container);
    }

    addDragDropHandlers() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.querySelector('.file-input');
        const selectBtn = document.querySelector('.select-files-btn');

        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        selectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    handleFiles(files) {
        const fileList = document.getElementById('fileList');
        
        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`);
                return;
            }

            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <span class="file-icon">📄</span>
                    <div class="file-details">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                    </div>
                </div>
                <button class="remove-file">×</button>
            `;
            
            fileItem.querySelector('.remove-file').addEventListener('click', () => {
                fileItem.remove();
            });
            
            fileList.appendChild(fileItem);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    addFileHandlers() {
        // Additional file handling logic
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoFileUpload();
});