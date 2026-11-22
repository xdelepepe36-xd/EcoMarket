/**
 * EcoMarket Pro — partículas por tema, estela del cursor,
 * simulador de impacto, leaderboard ecológico y modo presentación.
 */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ═══════════ 1. PARTÍCULAS POR TEMA ═══════════ */
    var THEMES = {
        light:    { n: 14, color: '46,125,50',  shape: 'leaf',  speed: 0.25 },
        dark:     { n: 22, color: '134,239,172', shape: 'firefly', speed: 0.4 },
        nature:   { n: 26, color: '76,175,80',  shape: 'leaf',  speed: 0.55 },
        ocean:    { n: 24, color: '100,181,246', shape: 'bubble', speed: 0.5 },
        midnight: { n: 40, color: '165,180,252', shape: 'star',  speed: 0.3 },
        rose:     { n: 18, color: '240,98,146', shape: 'petal', speed: 0.45 }
    };

    var canvas = null, ctx = null, parts = [], rafId = null, themeKey = '';

    function particleCfg() {
        var t = document.documentElement.getAttribute('data-theme') || 'light';
        return THEMES[t] || THEMES.light;
    }

    function spawn(p, cfg, W, H) {
        p.x = Math.random() * W;
        p.y = cfg.shape === 'bubble' ? H + 10 : -10;
        if (cfg.shape === 'star') { p.y = Math.random() * H; p.x = Math.random() * W; }
        p.vx = (Math.random() - 0.5) * cfg.speed * 2;
        p.vy = cfg.speed * (0.6 + Math.random() * 0.8);
        p.size = cfg.shape === 'bubble' ? 2 + Math.random() * 5
              : cfg.shape === 'star'  ? 1 + Math.random() * 2
              : 4 + Math.random() * 6;
        p.rot = Math.random() * Math.PI * 2;
        p.vr = (Math.random() - 0.5) * 0.03;
        p.alpha = cfg.shape === 'firefly' ? 0.3 + Math.random() * 0.5 : 0.35 + Math.random() * 0.4;
        p.ph = Math.random() * Math.PI * 2;
    }

    function drawShape(p, cfg) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = 'rgba(' + cfg.color + ',1)';
        if (cfg.shape === 'bubble') {
            ctx.strokeStyle = 'rgba(' + cfg.color + ',.7)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.stroke();
        } else if (cfg.shape === 'star') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
            // hoja/pétalo: dos arcos
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.quadraticCurveTo(p.size * 0.9, -p.size * 0.2, 0, p.size);
            ctx.quadraticCurveTo(-p.size * 0.9, -p.size * 0.2, 0, -p.size);
            ctx.fill();
        }
        ctx.restore();
    }

    function frame() {
        var cfg = particleCfg();
        var W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            p.x += p.vx + Math.sin(p.ph + p.y * 0.01) * 0.4;
            p.y += p.vy;
            p.rot += p.vr;
            p.ph += 0.02;
            if (cfg.shape === 'firefly') p.alpha = 0.25 + Math.abs(Math.sin(p.ph * 2)) * 0.55;
            if (p.y > H + 20 || p.x < -30 || p.x > W + 30) spawn(p, cfg, W, H);
            drawShape(p, cfg);
        }
        rafId = requestAnimationFrame(frame);
    }

    function initParticles() {
        if (reduceMotion) return;
        canvas = document.createElement('canvas');
        canvas.id = 'ecoParticles';
        canvas.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            var cfg = particleCfg();
            parts = [];
            for (var i = 0; i < cfg.n; i++) {
                var p = {};
                spawn(p, cfg, canvas.width, canvas.height);
                p.y = Math.random() * canvas.height;
                parts.push(p);
            }
        }
        resize();
        window.addEventListener('resize', resize);
        // re-sembrar al cambiar de tema
        new MutationObserver(function () {
            var t = document.documentElement.getAttribute('data-theme') || '';
            if (t !== themeKey) { themeKey = t; resize(); }
        }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        themeKey = document.documentElement.getAttribute('data-theme') || '';
        rafId = requestAnimationFrame(frame);
    }

    /* ═══════════ 2. ESTELA DEL CURSOR ═══════════ */
    function initCursorTrail() {
        if (reduceMotion || !window.matchMedia('(pointer:fine)').matches) return;
        var last = 0, pool = [];
        document.addEventListener('pointermove', function (e) {
            var now = performance.now();
            if (now - last < 55) return;
            last = now;
            var s = document.createElement('span');
            s.className = 'eco-trail';
            s.textContent = '✿';
            s.style.left = e.clientX + 'px';
            s.style.top = e.clientY + 'px';
            document.body.appendChild(s);
            pool.push(s);
            if (pool.length > 40) pool.shift().remove();
            requestAnimationFrame(function () {
                s.style.transition = 'transform .7s ease-out, opacity .7s ease-out';
                s.style.transform = 'translateY(-26px) rotate(40deg) scale(.4)';
                s.style.opacity = '0';
            });
            setTimeout(function () { s.remove(); }, 750);
        }, { passive: true });
    }

    /* ═══════════ 3. SIMULADOR DE IMPACTO ═══════════ */
    var IMPACTO = {
        co2: 2.7,        // kg CO2e evitado por compra de segunda mano (estimado)
        plastico: 0.4,   // botellas plásticas equivalentes
        arboles: 0.05    // árboles-año de absorción
    };

    function initSimulator() {
        var host = document.querySelector('.impacto-stats');
        if (!host) return;
        var wrap = document.createElement('div');
        wrap.className = 'eco-simulator';
        wrap.innerHTML =
            '<div class="eco-sim-card">' +
            '  <h3>🌱 Simulador de impacto</h3>' +
            '  <p class="eco-sim-sub">¿Cuántos productos comprarías este mes en EcoMarket?</p>' +
            '  <div class="eco-sim-controls">' +
            '    <input type="range" id="ecoSimRange" min="1" max="30" value="5">' +
            '    <strong id="ecoSimCount">5</strong>' +
            '  </div>' +
            '  <div class="eco-sim-results">' +
            '    <div><b id="ecoSimCo2">13.5</b><span>kg CO₂ evitados</span></div>' +
            '    <div><b id="ecoSimPlast">2.0</b><span>botellas plásticas menos</span></div>' +
            '    <div><b id="ecoSimTrees">0.25</b><span>árboles equivalentes</span></div>' +
            '  </div>' +
            '</div>';
        host.parentElement.appendChild(wrap);

        var range = wrap.querySelector('#ecoSimRange');
        var count = wrap.querySelector('#ecoSimCount');
        function upd() {
            var n = +range.value;
            count.textContent = n;
            wrap.querySelector('#ecoSimCo2').textContent = (n * IMPACTO.co2).toFixed(1);
            wrap.querySelector('#ecoSimPlast').textContent = (n * IMPACTO.plastico).toFixed(1);
            wrap.querySelector('#ecoSimTrees').textContent = (n * IMPACTO.arboles).toFixed(2);
        }
        range.addEventListener('input', upd);
        upd();
    }

    /* ═══════════ 4. LEADERBOARD ECOLÓGICO ═══════════ */
    function initLeaderboard() {
        if (!document.body.classList.contains('page-home') && location.pathname !== '/') return;
        var host = document.querySelector('.impacto-stats');
        if (!host) return;
        fetch('/api/leaderboard')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data || !data.top || !data.top.length) return;
                var medals = ['🥇', '🥈', '🥉'];
                var rows = data.top.slice(0, 5).map(function (u, i) {
                    var name = (u.nombre || 'EcoUsuario').split(' ')[0];
                    return '<li><span class="lb-medal">' + (medals[i] || (i + 1) + 'º') + '</span>' +
                           '<strong>' + name + '</strong>' +
                           '<em>' + u.puntos + ' pts · ' + u.productos + ' productos · ' + u.ventas + ' ventas</em></li>';
                }).join('');
                var card = document.createElement('div');
                card.className = 'eco-simulator';
                card.innerHTML = '<div class="eco-sim-card eco-lb-card"><h3>🏆 Héroes del planeta</h3>' +
                    '<p class="eco-sim-sub">Los que más venden y reutilizan en EcoMarket</p>' +
                    '<ul class="eco-lb-list">' + rows + '</ul></div>';
                host.parentElement.appendChild(card);
            })
            .catch(function () {});
    }

    /* ═══════════ 5. MODO PRESENTACIÓN — GUION AUTOMÁTICO ═══════════ */
    var SCRIPT = [
        '🤖 IA con memoria: busca, pagina y recuerda lo que le pides',
        '📊 Comparador visual: hasta 4 productos lado a lado',
        '💰 Historial de precios + alerta cuando baja un favorito',
        '🎨 6 temas + partículas que cambian con cada uno',
        '🖼️ Fotos reales únicas para cada producto',
        '🔒 Registro seguro, validado y con CSRF',
        '🌍 6 idiomas: ES · EN · PT · FR · DE · IT',
        '💾 Backups automáticos + restauración en 1 clic'
    ];
    var scriptIdx = 0, scriptTimer = null, scriptBox = null;

    function initPresentation() {
        var obs = new MutationObserver(function () {
            var on = document.body.classList.contains('eco-kiosk');
            if (on && !scriptBox) showScript();
            if (!on && scriptBox) hideScript();
        });
        obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    function showScript() {
        scriptBox = document.createElement('div');
        scriptBox.className = 'eco-script-box';
        scriptBox.innerHTML = '<div class="eco-script-text"></div><div class="eco-script-dots"></div>';
        document.body.appendChild(scriptBox);
        tickScript();
        scriptTimer = setInterval(tickScript, 6000);
    }

    function hideScript() {
        clearInterval(scriptTimer);
        if (scriptBox) { scriptBox.remove(); scriptBox = null; }
    }

    function tickScript() {
        if (!scriptBox) return;
        scriptIdx = (scriptIdx + 1) % SCRIPT.length;
        scriptBox.querySelector('.eco-script-text').textContent = SCRIPT[scriptIdx];
        scriptBox.querySelector('.eco-script-dots').innerHTML = SCRIPT.map(function (_, i) {
            return '<i class="' + (i === scriptIdx ? 'on' : '') + '"></i>';
        }).join('');
    }

    /* ═══════════ INIT ═══════════ */
    document.addEventListener('DOMContentLoaded', function () {
        initParticles();
        initCursorTrail();
        initSimulator();
        initLeaderboard();
        initPresentation();
    });
})();
