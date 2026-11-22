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

    // CLICK: la hoja hace "pop" + estalla en mini-hojas (estilo toy factory)
    document.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        cur.classList.add('eco-cursor-pop');
        setTimeout(function () { cur.classList.remove('eco-cursor-pop'); }, 260);
        spawnBurst(e.clientX, e.clientY);
    });

    function spawnBurst(bx, by) {
        var burst = document.createElement('div');
        burst.className = 'eco-click-burst';
        burst.style.left = bx + 'px'; burst.style.top = by + 'px';
        for (var i = 0; i < 6; i++) {
            var p = document.createElement('i');
            var ang = (Math.PI * 2 * i) / 6 + Math.random() * 0.6;
            var dist = 26 + Math.random() * 22;
            p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
            p.style.setProperty('--dy', (Math.sin(ang) * dist - 14) + 'px');
            p.style.animationDelay = (i * 0.015) + 's';
            p.style.background = i % 2 ? '#22C55E' : '#F59E0B';
            burst.appendChild(p);
        }
        document.body.appendChild(burst);
        setTimeout(function () { burst.remove(); }, 700);
    }

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
