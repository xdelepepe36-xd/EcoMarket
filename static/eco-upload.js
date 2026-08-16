(function(){
  // Simple upload widget: drag/drop, preview, and multipart upload with progress
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const preview = document.getElementById('preview');
  const status = document.getElementById('uploadStatus');
  const form = document.getElementById('uploadForm');
  if(!dropZone || !fileInput || !uploadBtn) return;

  let files = [];

  function renderPreview(){
    preview.innerHTML = '';
    files.forEach((f, idx)=>{
      const url = URL.createObjectURL(f);
      const el = document.createElement('div');
      el.className = 'preview-item';
      el.innerHTML = `<img src="${url}" alt="thumb"><div class="preview-meta">${f.name}</div>`;
      preview.appendChild(el);
    });
  }

  dropZone.addEventListener('click', ()=> fileInput.click());
  dropZone.addEventListener('dragover', (e)=>{ e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', ()=> dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e)=>{
    e.preventDefault(); dropZone.classList.remove('dragover');
    const dt = e.dataTransfer;
    if(!dt) return;
    for(const f of dt.files){ if(f && f.type && f.type.startsWith('image/')) files.push(f); }
    renderPreview();
  });

  fileInput.addEventListener('change', (e)=>{
    for(const f of e.target.files){ if(f && f.type && f.type.startsWith('image/')) files.push(f); }
    renderPreview();
  });

  uploadBtn.addEventListener('click', async ()=>{
    if(files.length === 0){ status.textContent = 'Selecciona al menos una imagen.'; return; }
    uploadBtn.disabled = true; status.textContent = 'Subiendo...';
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    try{
      const action = form.getAttribute('action');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', action, true);
      xhr.upload.onprogress = function(e){ if(e.lengthComputable){ const p = Math.round((e.loaded/e.total)*100); status.textContent = `Subiendo... ${p}%`; } };
      xhr.onload = function(){
        uploadBtn.disabled = false;
        if(xhr.status >= 200 && xhr.status < 300){
          status.textContent = 'Subida completada.';
          try{ const j = JSON.parse(xhr.responseText); if(j.added){
            // añadir thumbs a la galería en la página
            j.added.slice(0,6).forEach(it => {
              const b = document.createElement('button'); b.className='gallery-thumb'; b.onclick = ()=>{ cambiarImagen(b, it.imagen_thumb || it.imagen); };
              const img = document.createElement('img'); img.src = it.imagen_thumb || it.imagen; img.loading='lazy'; b.appendChild(img);
              const thumbs = document.querySelector('.detalle-gallery-thumbs');
              if(thumbs) thumbs.appendChild(b);
            }); }
          }catch(err){}
          files = []; renderPreview();
        } else {
          status.textContent = `Error en subida: ${xhr.status}`;
        }
      };
      xhr.onerror = function(){ uploadBtn.disabled = false; status.textContent = 'Error de red durante la subida.'; };
      xhr.send(formData);
    }catch(e){ uploadBtn.disabled = false; status.textContent = 'Error: '+e.message; }
  });
})();
