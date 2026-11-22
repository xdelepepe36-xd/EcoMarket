/* EcoMarket — Autocompletado de búsqueda con productos reales */
(function () {
    'use strict';
    const input = document.querySelector('.search-bar .search-input, input[name="q"].search-input');
    if (!input) return;
    const form = input.closest('form');
    const wrap = document.createElement('div');
    wrap.className = 'search-ac-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    const box = document.createElement('div');
    box.className = 'search-ac-box';
    box.style.display = 'none';
    wrap.appendChild(box);

    let timer = null, ctrl = null, items = [];

    function imgUrl(imagen) {
        if (!imagen) return '';
        if (imagen.startsWith('http') || imagen.startsWith('/')) return imagen;
        return '/static/' + imagen;
    }

    function hide() { box.style.display = 'none'; items = []; }

    function render() {
        if (!items.length) { hide(); return; }
        box.innerHTML = items.map((p, i) => `
            <a class="search-ac-item" href="/producto/${p.id}" data-i="${i}">
                ${p.imagen ? `<img src="${imgUrl(p.imagen)}" alt="" loading="lazy" onerror="this.style.display='none'">` : '<span class="search-ac-ico">📦</span>'}
                <span class="search-ac-info">
                    <strong>${p.nombre}</strong>
                    <small>${p.categoria || ''} · S/. ${Number(p.precio || 0).toFixed(2)}</small>
                </span>
            </a>`).join('') + `<a class="search-ac-all" href="${form ? form.action + '?q=' + encodeURIComponent(input.value) : '/productos'}">Ver todos los resultados →</a>`;
        box.style.display = 'block';
        box.querySelectorAll('.search-ac-item').forEach(a => a.addEventListener('mousedown', e => { e.preventDefault(); window.location.href = a.href; }));
    }

    input.addEventListener('input', () => {
        clearTimeout(timer);
        const q = input.value.trim();
        if (q.length < 2) { hide(); return; }
        timer = setTimeout(async () => {
            if (ctrl) ctrl.abort();
            ctrl = new AbortController();
            try {
                const r = await fetch('/api/buscar?q=' + encodeURIComponent(q), { signal: ctrl.signal });
                items = await r.json();
                render();
            } catch (e) { /* abort o error de red */ }
        }, 220);
    });
    input.addEventListener('focus', () => { if (items.length) render(); });
    input.addEventListener('blur', () => setTimeout(hide, 180));
    input.addEventListener('keydown', e => {
        if (e.key === 'Escape') hide();
        if (e.key === 'ArrowDown' && box.style.display === 'block') {
            const first = box.querySelector('.search-ac-item');
            if (first) { e.preventDefault(); first.focus(); }
        }
    });
})();
