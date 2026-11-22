/* EcoMarket — efectos extra: confetti, scroll progress, back-to-top, ripples, theme fade */
(function () {
    'use strict';

    /* ── 1. Confetti de hojas al completar acción (compra, registro, agregar favorito) ── */
    window.ecoConfetti = function (x, y, count) {
        count = count || 14;
        var colors = ['#22C55E', '#14532D', '#F59E0B', '#4ADE80', '#FBBF24'];
        for (var i = 0; i < count; i++) {
            var p = document.createElement('i');
            p.className = 'eco-confetti';
            var ang = Math.random() * Math.PI * 2;
            var dist = 60 + Math.random() * 120;
            p.style.left = (x || innerWidth / 2) + 'px';
            p.style.top = (y || innerHeight / 2) + 'px';
            p.style.background = colors[i % colors.length];
            p.style.setProperty('--cx', Math.cos(ang) * dist + 'px');
            p.style.setProperty('--cy', (Math.sin(ang) * dist - 60) + 'px');
            p.style.animationDelay = (Math.random() * 0.15) + 's';
            p.style.width = (6 + Math.random() * 6) + 'px';
            p.style.height = (8 + Math.random() * 6) + 'px';
            p.style.borderRadius = Math.random() > 0.5 ? '60% 60% 60% 0' : '50%';
            document.body.appendChild(p);
            setTimeout(function (el) { el.remove(); }, 1200, p);
        }
    };
    // disparar en eventos clave
    document.addEventListener('submit', function (e) {
        if (e.target && e.target.matches('form[action*="carrito"], form[action*="checkout"], form[action*="registro"], form[action*="pedido"]')) {
            setTimeout(function () { window.ecoConfetti(innerWidth / 2, innerHeight / 3, 24); }, 600);
        }
    });
    document.addEventListener('click', function (e) {
        var fav = e.target.closest('.btn-favorito, [data-action="favorito"], .favorite-btn, .btn-fav');
        if (fav) setTimeout(function () { window.ecoConfetti(e.clientX, e.clientY, 12); }, 120);
    });

    /* ── 2. Barra de progreso de scroll ── */
    var bar = document.createElement('div');
    bar.className = 'eco-scroll-progress';
    document.body.appendChild(bar);
    var ticking = false;
    window.addEventListener('scroll', function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
            var h = document.documentElement;
            var p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
            bar.style.transform = 'scaleX(' + p + ')';
            ticking = false;
        });
    }, { passive: true });

    /* ── 3. Back-to-top con la hoja ── */
    var top = document.createElement('button');
    top.className = 'eco-back-top';
    top.innerHTML = '<svg viewBox="0 0 32 32" width="22" height="22"><path d="M16 4 C 22 7 25 13 25 18 C 25 22 21 25 16 26 C 11 25 7 22 7 18 C 7 13 10 7 16 4 Z" fill="#fff"/></svg>';
    top.setAttribute('aria-label', 'Volver arriba');
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(top);
    window.addEventListener('scroll', function () {
        top.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    /* ── 4. Ripples en botones ── */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.btn-principal, .btn-secundario, button[type="submit"], .btn-hero, .theme-switcher');
        if (!btn) return;
        var r = btn.getBoundingClientRect();
        var rip = document.createElement('span');
        rip.className = 'eco-ripple';
        var size = Math.max(r.width, r.height);
        rip.style.width = rip.style.height = size + 'px';
        rip.style.left = (e.clientX - r.left - size / 2) + 'px';
        rip.style.top = (e.clientY - r.top - size / 2) + 'px';
        btn.appendChild(rip);
        setTimeout(function () { rip.remove(); }, 650);
    });

    /* ── 5. Transición suave al cambiar de tema ── */
    var style = document.createElement('style');
    style.textContent = 'html.theme-fading, html.theme-fading * { transition: background-color .35s ease, color .35s ease, border-color .35s ease !important; }';
    document.head.appendChild(style);
    document.addEventListener('themeChanged', function () {
        document.documentElement.classList.add('theme-fading');
        setTimeout(function () { document.documentElement.classList.remove('theme-fading'); }, 400);
    });
})();
