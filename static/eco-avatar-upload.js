// Avatar Upload - Subida de avatar
class EcoAvatarUpload {
    constructor() {
        this.init();
    }

    init() {
        this.createAvatarUpload();
        this.addUploadHandler();
    }

    createAvatarUpload() {
        const container = document.createElement('div');
        container.className = 'avatar-upload-container';
        container.innerHTML = `
            <h3>👤 Subir avatar</h3>
            <div class="avatar-upload">
                <div class="avatar-preview">
                    <div class="avatar-placeholder">
                        <span class="avatar-icon">👤</span>
                        <span class="avatar-text">Subir foto</span>
                    </div>
                </div>
                <input type="file" class="avatar-input" accept="image/*" style="display: none;">
                <button class="upload-btn">Seleccionar imagen</button>
                <div class="upload-info">
                    <p class="file-name">Ningún archivo seleccionado</p>
                    <p class="file-size">Máximo 5MB</p>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    addUploadHandler() {
        const uploadBtn = document.querySelector('.upload-btn');
        const fileInput = document.querySelector('.avatar-input');
        const fileName = document.querySelector('.file-name');
        const preview = document.querySelector('.avatar-preview');

        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;
                
                if (file.size > 5 * 1024 * 1024) {
                    alert('El archivo es demasiado grande. Máximo 5MB.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="Avatar" class="avatar-image">
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoAvatarUpload();
});