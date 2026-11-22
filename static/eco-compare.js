/* EcoMarket — Comparador visual de productos (lado a lado + puntuación) */
(function () {
    'use strict';
    var productos = window.productos_json || [];
    var seleccion = [];
    var MAX = 4;

    var sel = document.getElementById('compareSelect');
    var cont = document.getElementById('compareContainer');
    var modeSel = document.getElementById('compareMode');

    productos.forEach(function (p) {
        var o = document.createElement('option');
        o.value = p.id;
        o.textContent = p.nombre + ' — S/.' + (+p.precio).toFixed(2);
        sel.appendChild(o);
    });

    function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
    function img(p) { return p.imagen ? '/static/' + p.imagen.replace(/^\/+/, '') : '/static/assets/product-placeholder.svg'; }
    function fmt(n) { return 'S/.' + (+n).toFixed(2); }
    function descPct(p) {
        if (!p.precio_original || p.precio_original <= p.precio) return null;
        return Math.round((1 - p.precio / p.precio_original) * 100);
    }
    function stars(score) {
        var n = Math.round((score || 0) / 20);
        n = Math.max(0, Math.min(5, n));
        return '★'.repeat(n) + '☆'.repeat(5 - n) + ' <small>(' + (score || 0) + '/100)</small>';
    }

    function add() {
        var id = parseInt(sel.value, 10);
        var p = productos.find(function (x) { return x.id === id; });
        if (!p) return;
        if (seleccion.length >= MAX) { alert('Máximo ' + MAX + ' productos'); return; }
        if (seleccion.some(function (x) { return x.id === id; })) { alert('Ya está en la comparación'); return; }
        seleccion.push(p);
        render();
    }
    function clearAll() { seleccion = []; render(); }

    document.getElementById('addCompareBtn').addEventListener('click', add);
    document.getElementById('clearCompareBtn').addEventListener('click', clearAll);
    if (modeSel) modeSel.addEventListener('change', render);

    function row(label, vals, bestIdx) {
        var html = '<div class="cmp-row"><div class="cmp-label">' + label + '</div>';
        vals.forEach(function (v, i) {
            var cls = (bestIdx === i && vals.length > 1) ? ' cmp-best' : '';
            html += '<div class="cmp-cell' + cls + '">' + v + '</div>';
        });
        return html + '</div>';
    }

    function renderSide() {
        if (!seleccion.length) { cont.innerHTML = '<p style="color:#888">Agrega productos para compararlos.</p>'; return; }
        var minPrecio = Math.min.apply(null, seleccion.map(function (p) { return p.precio; }));
        var maxEco = Math.max.apply(null, seleccion.map(function (p) { return p.eco_score || 0; }));
        var maxVistas = Math.max.apply(null, seleccion.map(function (p) { return p.vistas || 0; }));
        var html = '';
        // encabezado con imagen+nombre
        html += '<div class="cmp-row"><div class="cmp-label"></div>';
        seleccion.forEach(function (p) {
            html += '<div class="cmp-cell cmp-head"><img src="' + esc(img(p)) + '" alt=""><div class="cmp-name">' + esc(p.nombre) + '</div>' +
                    '<a class="btn-principal" style="font-size:.8rem;padding:8px 14px" href="/producto/' + p.id + '">Ver producto</a></div>';
        });
        html += '</div>';
        html += row('Precio', seleccion.map(function (p) {
            var d = descPct(p);
            return '<b' + (p.precio === minPrecio ? ' style="color:#16a34a"' : '') + '>' + fmt(p.precio) + '</b>' +
                   (d ? '<br><small style="color:#dc2626;font-weight:700">-' + d + '%</small>' : '');
        }), seleccion.findIndex(function (p) { return p.precio === minPrecio; }));
        html += row('Precio original', seleccion.map(function (p) { return p.precio_original ? fmt(p.precio_original) : '—'; }), -1);
        html += row('Categoría', seleccion.map(function (p) { return esc(p.categoria || '—'); }), -1);
        html += row('Condición', seleccion.map(function (p) { return esc(p.condicion || '—'); }), -1);
        html += row('Stock', seleccion.map(function (p) { return p.stock > 0 ? '✅ ' + p.stock + ' disp.' : '❌ agotado'; }),
                    seleccion.findIndex(function (p) { return p.stock > 0; }));
        html += row('Eco-score', seleccion.map(function (p) { return stars(p.eco_score); }),
                    seleccion.findIndex(function (p) { return (p.eco_score || 0) === maxEco; }));
        html += row('Vistas', seleccion.map(function (p) { return (p.vistas || 0).toLocaleString('es'); }),
                    seleccion.findIndex(function (p) { return (p.vistas || 0) === maxVistas; }));
        html += row('Ubicación', seleccion.map(function (p) { return esc(p.ubicacion || '—'); }), -1);
        html += row('Descripción', seleccion.map(function (p) { return '<small>' + esc(p.descripcion || '—') + '</small>'; }), -1);
        cont.innerHTML = '<div class="cmp-table" style="grid-template-columns:130px repeat(' + seleccion.length + ',1fr)">' + html + '</div>';
    }

    function renderScore() {
        if (!seleccion.length) { cont.innerHTML = '<p style="color:#888">Agrega productos para ver la puntuación.</p>'; return; }
        var criterios = [
            { label: 'Precio (menor gana)', val: function (p) { return -p.precio; }, peso: 3 },
            { label: 'Descuento', val: function (p) { return descPct(p) || 0; }, peso: 2 },
            { label: 'Eco-score', val: function (p) { return p.eco_score || 0; }, peso: 3 },
            { label: 'Stock disponible', val: function (p) { return Math.min(p.stock || 0, 50); }, peso: 1 },
            { label: 'Popularidad (vistas)', val: function (p) { return p.vistas || 0; }, peso: 1 }
        ];
        var scores = seleccion.map(function () { return 0; });
        criterios.forEach(function (c) {
            var vals = seleccion.map(c.val);
            var max = Math.max.apply(null, vals);
            seleccion.forEach(function (p, i) {
                if (max > 0 && vals[i] === max) scores[i] += c.peso;
                else if (max > 0) scores[i] += c.peso * (vals[i] / max) * 0.5;
            });
        });
        var orden = seleccion.map(function (p, i) { return { p: p, s: scores[i] }; })
            .sort(function (a, b) { return b.s - a.s; });
        var maxS = orden[0].s || 1;
        var html = '<div class="cmp-score-list">';
        orden.forEach(function (o, rank) {
            var pct = Math.round((o.s / maxS) * 100);
            html += '<div class="cmp-score-card" style="border-left:6px solid ' + (rank === 0 ? '#22C55E' : '#cbd5e1') + '">' +
                    '<div class="cmp-score-rank">#' + (rank + 1) + (rank === 0 ? ' 🏆 Mejor opción' : '') + '</div>' +
                    '<img src="' + esc(img(o.p)) + '" alt="">' +
                    '<div class="cmp-score-info"><b>' + esc(o.p.nombre) + '</b><br><small>' + esc(o.p.categoria) + ' · ' + fmt(o.p.precio) + '</small></div>' +
                    '<div class="cmp-score-bar"><div style="width:' + pct + '%"></div><span>' + Math.round(o.s * 10) / 10 + '</span></div>' +
                    '<a class="btn-principal" style="font-size:.8rem;padding:8px 14px" href="/producto/' + o.p.id + '">Ver</a></div>';
        });
        html += '</div>';
        cont.innerHTML = html;
    }

    function render() {
        var mode = modeSel ? modeSel.value : 'side';
        if (mode === 'score') renderScore(); else renderSide();
    }
    render();
})();
