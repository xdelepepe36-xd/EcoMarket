/* EcoMarket — Tour guiado de presentación */
(function () {
    'use strict';
    var PASOS = [
        { sel: '.hero-title, .hero-title h1, h1', t: 'Bienvenida', txt: 'EcoMarket: el marketplace ecológico de Perú. Compra y vende productos de segunda vida.' },
        { sel: '.search-bar', t: 'Búsqueda inteligente', txt: 'Autocompletado con productos reales: foto, precio y categoría mientras escribes.' },
        { sel: '.prod-marquee', t: 'Catálogo en vivo', txt: 'Marquesina de productos reales en movimiento continuo.' },
        { sel: '.productos-grid .product-card', t: 'Productos destacados', txt: 'Cards con foto, precio, badges de descuento y eco-score.' },
        { sel: '.hero-mascot', t: 'Eco, la asistente', txt: 'La mascota tiene chat propio: pídele productos, cupones, envíos o consejos ecológicos.' },
        { sel: '.lang-switcher', t: '6 idiomas + modo oscuro', txt: 'Todo el sitio traducido y con tema oscuro cinematográfico.' },
        { sel: '.footer, footer', t: 'Todo incluido', txt: 'Pagos, envíos, mensajería privada, cupones, XP y panel de vendedor.' }
    ];
    var overlay, hole, tip, idx = 0, btn;

    function build() {
        overlay = document.createElement('div'); overlay.className = 'tour-overlay';
        hole = document.createElement('div'); hole.className = 'tour-hole';
        tip = document.createElement('div'); tip.className = 'tour-tip';
        overlay.appendChild(hole); overlay.appendChild(tip);
        document.body.appendChild(overlay);
    }

    function show(i) {
        idx = i;
        var p = PASOS[i];
        var el = document.querySelector(p.sel);
        if (!el) { next(); return; }
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
        setTimeout(function () {
            var r = el.getBoundingClientRect();
            hole.style.cssText = 'position:fixed;left:' + (r.left - 8) + 'px;top:' + (r.top - 8) +
                'px;width:' + (r.width + 16) + 'px;height:' + (r.height + 16) + 'px;' +
                'border-radius:16px;box-shadow:0 0 0 9999px rgba(8,20,12,.72), 0 0 0 3px #22C55E, 0 0 30px rgba(34,197,94,.6);pointer-events:none;z-index:99998;transition:all .4s ease;';
            var dots = PASOS.map(function(_,k){return '<span class="tour-dot'+(k===i?' on':'')+'"></span>';}).join('');
            tip.innerHTML = '<div class="tour-head"><strong>' + p.t + '</strong><span>' + (i + 1) + '/' + PASOS.length + '</span></div>' +
                '<p>' + p.txt + '</p><div class="tour-dots">' + dots + '</div>' +
                '<div class="tour-btns"><button class="tour-btn tour-prev">← Atrás</button>' +
                '<button class="tour-btn tour-skip">Saltar</button>' +
                '<button class="tour-btn tour-next">' + (i === PASOS.length - 1 ? '¡Listo!' : 'Siguiente →') + '</button></div>';
            tip.querySelector('.tour-skip').onclick = stop;
            tip.querySelector('.tour-prev').onclick = function(){ if(i>0) show(i-1); };
            tip.querySelector('.tour-next').onclick = function () { i === PASOS.length - 1 ? stop() : show(i + 1); };
            var tw = 320, th = tip.offsetHeight || 120;
            var tx = Math.min(Math.max(r.left + r.width / 2 - tw / 2, 12), innerWidth - tw - 12);
            var ty = r.bottom + 14 + th > innerHeight ? r.top - th - 14 : r.bottom + 14;
            tip.style.cssText = 'position:fixed;left:' + tx + 'px;top:' + Math.max(ty, 12) + 'px;width:' + tw + 'px;z-index:99999;';
        }, 450);
    }
    function start() { if (!overlay) build(); document.body.classList.add('tour-active'); overlay.style.display = 'block'; show(0); }
    function stop() { document.body.classList.remove('tour-active'); overlay.style.display = 'none'; }
    function next() { if (idx < PASOS.length - 1) show(idx + 1); else stop(); }

    window.EcoTour = { start: start, stop: stop };
    document.addEventListener('keydown', function(e){
        if(!overlay || overlay.style.display==='none') return;
        if(e.key==='Escape') stop();
        if(e.key==='ArrowRight') next();
        if(e.key==='ArrowLeft' && idx>0) show(idx-1);
    });

    document.addEventListener('DOMContentLoaded', function () {
        btn = document.createElement('button');
        btn.className = 'tour-fab';
        btn.innerHTML = '▶ Presentación';
        btn.title = 'Ver presentación guiada';
        btn.onclick = start;
        document.body.appendChild(btn);
    });
})();
