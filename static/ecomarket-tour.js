/* EcoMarket — Tour guiado de presentación */
(function () {
    'use strict';
    var PASOS = [
        { sel: '.hero-title, .hero-title h1, h1', txt: 'Marketplace ecológico: vende y compra productos de segunda vida.' },
        { sel: '.search-bar', txt: 'Búsqueda inteligente con autocompletado de productos reales.' },
        { sel: '.prod-marquee', txt: 'Marquesina de productos en movimiento.' },
        { sel: '.productos-grid .product-card', txt: 'Catálogo con fotos, precios, descuentos y badges ecológicos.' },
        { sel: '.hero-mascot', txt: 'Eco, la mascota: ábrela y conversa — busca productos, cupones y consejos.' },
        { sel: '.lang-switcher', txt: 'Disponible en 6 idiomas y modo oscuro.' },
        { sel: '.footer, footer', txt: 'Pagos, envíos, mensajería privada y panel de vendedor incluidos.' }
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
            tip.innerHTML = '<div class="tour-count">' + (i + 1) + ' / ' + PASOS.length + '</div>' +
                '<p>' + p.txt + '</p>' +
                '<div class="tour-btns"><button class="tour-btn tour-skip">Saltar</button>' +
                '<button class="tour-btn tour-next">' + (i === PASOS.length - 1 ? '¡Listo!' : 'Siguiente →') + '</button></div>';
            tip.querySelector('.tour-skip').onclick = stop;
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

    document.addEventListener('DOMContentLoaded', function () {
        btn = document.createElement('button');
        btn.className = 'tour-fab';
        btn.innerHTML = '▶ Demo guiada';
        btn.title = 'Ver presentación guiada';
        btn.onclick = start;
        document.body.appendChild(btn);
    });
})();
