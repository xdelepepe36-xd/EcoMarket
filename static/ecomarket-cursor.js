/* EcoMarket — cursor personalizado animado (hojita) */
(function () {
    'use strict';
    if (!window.matchMedia('(pointer: fine)').matches) return;
    var cur = document.createElement('div');
    cur.className = 'eco-cursor';
    cur.innerHTML = '<svg viewBox="0 0 32 32" width="30" height="30"><path d="M16 3 C 24 6 28 14 28 21 C 28 26 23 29 16 30 C 9 29 4 26 4 21 C 4 14 8 6 16 3 Z" fill="#22C55E" stroke="#14532D" stroke-width="1.5"/><path d="M16 6 L 16 28" stroke="#14532D" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="15" r="1.6" fill="#14532D"/><circle cx="20" cy="15" r="1.6" fill="#14532D"/><path d="M12.5 19 Q 16 22 19.5 19" stroke="#14532D" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>';
    document.body.appendChild(cur);
    document.documentElement.classList.add('eco-has-cursor');

    var x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, visible = false;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; if (!visible) { visible = true; cur.style.opacity = '1'; } });
    document.addEventListener('mouseleave', function () { cur.style.opacity = '0'; });

    (function loop() {
        x += (tx - x) * 0.22; y += (ty - y) * 0.22;
        cur.style.transform = 'translate(' + (x - 15) + 'px,' + (y - 15) + 'px) rotate(' + ((tx - x) * 0.6) + 'deg)';
        requestAnimationFrame(loop);
    })();

    // hover en links/botones -> la hoja crece y gira
    document.addEventListener('mouseover', function (e) {
        var t = e.target.closest('a,button,input,textarea,select,[role="button"],.product-card');
        cur.classList.toggle('eco-cursor-hover', !!t);
    });
})();
