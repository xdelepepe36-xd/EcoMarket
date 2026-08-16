// eco-compare.js - comparison script loaded from template
(async function(){
  const sel = document.getElementById('compareSelect');
  const addBtn = document.getElementById('addCompareBtn');
  const clearBtn = document.getElementById('clearCompareBtn');
  const container = document.getElementById('compareContainer');
  const modeSel = document.getElementById('compareMode');

  let allProducts = [];
  let selected = [];

  async function loadProducts(){
    try{
      const res = await fetch('/api/recommendations');
      const j = await res.json();
      const list = j.products || [];
      allProducts = list;
      sel.innerHTML = '<option value="">-- Selecciona producto --</option>' + allProducts.map(p=>`<option value="${p.id}">${p.nombre} — S/.${Number(p.precio).toFixed(2)}</option>`).join('');
    }catch(e){
      if (window.productos_json) {
        allProducts = window.productos_json;
        sel.innerHTML = '<option value="">-- Selecciona producto --</option>' + allProducts.map(p=>`<option value="${p.id}">${p.nombre} — S/.${Number(p.precio).toFixed(2)}</option>`).join('');
      }
    }
  }

  function render(){
    container.innerHTML = '';
    if (selected.length === 0) {
      container.innerHTML = '<div class="no-results" style="padding:20px;border-radius:12px">No hay productos seleccionados.</div>';
      return;
    }
    if (modeSel.value === 'score') {
      const sorted = selected.slice().sort((a,b)=> (b.eco_score||0) - (a.eco_score||0) || a.precio - b.precio);
      container.innerHTML = sorted.map(p=>`<div class="card" style="padding:12px">\
        <h4 style="margin:0">${p.nombre}</h4>\
        <p style="margin:6px 0">Categoria: ${p.categoria} — S/.${Number(p.precio).toFixed(2)}</p>\
        <p style="margin:6px 0">EcoScore: <strong>${p.eco_score||0}</strong></p>\
        <p style="margin:6px 0;color:var(--texto-sec)">${(p.descripcion||'').slice(0,140)}...</p>\
      </div>`).join('');
      return;
    }

    const cols = Math.min(selected.length, 4);
    container.style.gridTemplateColumns = `repeat(${cols},1fr)`;
    container.innerHTML = selected.map(p=>`<div class="card producto-card" style="padding:12px">\
      <div style="height:160px;background:#f6faf6;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden">\
        <img src="${p.imagen_thumb||p.imagen||'/static/uploads/placeholder.svg'}" style="max-width:100%;max-height:160px;object-fit:cover">\
      </div>\
      <h4 style="margin-top:10px">${p.nombre}</h4>\
      <p style="margin:6px 0">S/.${Number(p.precio).toFixed(2)} • ${p.categoria}</p>\
      <p style="margin:6px 0;color:var(--texto-sec)">${(p.descripcion||'').slice(0,140)}...</p>\
      <div style="margin-top:8px;display:flex;gap:8px">\
        <button class="btn-secundario" onclick="window.location='/producto/${p.id}'">Ver</button>\
      </div>\
    </div>`).join('');
  }

  addBtn.addEventListener('click', async ()=>{
    const id = parseInt(sel.value);
    if (!id) return;
    if (selected.find(s=>s.id===id)) return;
    if (selected.length >= 4) { alert('Máximo 4 productos.'); return; }
    try{
      const res = await fetch('/api/compare', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ids:[id]})});
      const j = await res.json();
      if (j && j.products && j.products.length) {
        selected.push(j.products[0]);
        render();
      }
    }catch(e){
      const p = allProducts.find(x=>x.id===id);
      if (p) { selected.push(p); render(); }
    }
  });

  clearBtn.addEventListener('click', ()=>{ selected = []; render(); });
  modeSel.addEventListener('change', render);

  await loadProducts();
  render();
})();