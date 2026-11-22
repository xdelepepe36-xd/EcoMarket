/* EcoMarket WOW — lluvia de hojas/florecitas (canvas) */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'leaf-rain';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0, leaves = [], raf = null;

    const COLORS = [
        'rgba(102,187,106,',   // verde medio
        'rgba(76,175,80,',     // verde
        'rgba(129,199,132,',   // verde claro
        'rgba(255,213,79,',    // dorado (pétalos)
        'rgba(165,214,167,'    // menta
    ];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function makeLeaf() {
        const depth = Math.random(); // 0 lejano, 1 cercano
        return {
            x: rand(-40, W + 40),
            y: rand(-H, -20),
            size: rand(6, 16) + depth * 10,
            vy: rand(0.4, 1.4) + depth * 1.2,
            swayAmp: rand(15, 55),
            swayFreq: rand(0.4, 1.1),
            swayPhase: rand(0, Math.PI * 2),
            rot: rand(0, Math.PI * 2),
            rotSpeed: rand(-0.02, 0.02),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: 0.25 + depth * 0.45,
            petal: Math.random() < 0.3, // algunas son pétalos redondos
            flutter: rand(0, Math.PI * 2)
        };
    }

    function count() {
        // densidad según ancho; tope para no sobrecargar móviles
        return Math.min(42, Math.floor(W / 34));
    }

    function seed() {
        leaves = [];
        const n = count();
        for (let i = 0; i < n; i++) {
            const l = makeLeaf();
            l.y = rand(0, H); // pre-llenar para que no espere al inicio
            leaves.push(l);
        }
    }

    function drawLeaf(l, t) {
        const swayX = Math.sin(t * 0.001 * l.swayFreq + l.swayPhase) * l.swayAmp;
        const flutter = Math.sin(t * 0.002 + l.flutter) * 0.6;
        ctx.save();
        ctx.translate(l.x + swayX, l.y);
        ctx.rotate(l.rot + flutter);
        ctx.globalAlpha = l.alpha;
        ctx.fillStyle = l.color + '1)';
        const s = l.size;
        ctx.beginPath();
        if (l.petal) {
            // pétalo: ovalo con muesca
            ctx.moveTo(0, -s);
            ctx.bezierCurveTo(s * 0.9, -s * 0.5, s * 0.7, s * 0.6, 0, s);
            ctx.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.9, -s * 0.5, 0, -s);
        } else {
            // hoja: punta + base
            ctx.moveTo(0, -s);
            ctx.bezierCurveTo(s * 0.8, -s * 0.3, s * 0.7, s * 0.5, 0, s);
            ctx.bezierCurveTo(-s * 0.7, s * 0.5, -s * 0.8, -s * 0.3, 0, -s);
        }
        ctx.fill();
        // vena central
        ctx.strokeStyle = l.color + '0.5)';
        ctx.lineWidth = Math.max(0.6, s * 0.06);
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.8);
        ctx.lineTo(0, s * 0.8);
        ctx.stroke();
        ctx.restore();
    }

    function tick(t) {
        ctx.clearRect(0, 0, W, H);
        for (const l of leaves) {
            l.y += l.vy;
            l.x += Math.sin(t * 0.001 * l.swayFreq + l.swayPhase) * 0.4;
            l.rot += l.rotSpeed;
            if (l.y > H + 30 || l.x < -60 || l.x > W + 60) {
                Object.assign(l, makeLeaf());
                l.y = -20;
            }
            drawLeaf(l, t);
        }
        raf = requestAnimationFrame(tick);
    }

    function start() {
        if (raf) return;
        resize();
        seed();
        raf = requestAnimationFrame(tick);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); seed(); }, 200);
    });

    // pausar cuando la pestaña no es visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (raf) { cancelAnimationFrame(raf); raf = null; }
        } else {
            start();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();

/* Contadores animados de impacto (cuentan al entrar en pantalla) */
(function () {
    'use strict';
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    function animateCount(el) {
        const raw = el.textContent.trim();
        const match = raw.match(/[\d.,]+/);
        if (!match) return;
        const target = parseFloat(match[0].replace(/,/g, ''));
        if (isNaN(target) || target === 0) return;
        const decimals = (match[0].split('.')[1] || '').length;
        const hasComma = match[0].includes(',');
        const duration = 1600;
        const start = performance.now();
        function frame(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            let txt = decimals ? val.toFixed(decimals) : Math.round(val).toString();
            if (hasComma) txt = Number(txt).toLocaleString('en-US');
            el.textContent = txt;
            if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    const els = document.querySelectorAll('.impacto-valor');
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                animateCount(en.target);
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.4 });
    els.forEach(el => io.observe(el));
})();

/* Toggle ver/ocultar contraseña (delegado, funciona en login/registro) */
document.addEventListener('click', function (e) {
    const btn = e.target.closest('.pw-toggle');
    if (!btn) return;
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.querySelector('i').className = show ? 'bi bi-eye-slash' : 'bi bi-eye';
    btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
});
