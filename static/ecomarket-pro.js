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

    /* ═══════════ 5. EASTER EGG: clic x5 en la mascota → fiesta ═══════════ */
    function initMascotEgg() {
        var clicks = 0, timer = null;
        document.addEventListener('click', function (e) {
            var m = e.target.closest('.hero-mascot, .auth-mascot, .auth-brand-mascot');
            if (!m) return;
            clicks++;
            clearTimeout(timer);
            timer = setTimeout(function () { clicks = 0; }, 2500);
            if (clicks >= 5) {
                clicks = 0;
                var r = m.getBoundingClientRect();
                for (var i = 0; i < 5; i++) {
                    setTimeout(function () {
                        if (window.ecoConfetti) window.ecoConfetti(r.left + r.width / 2, r.top + r.height / 2, 30);
                    }, i * 180);
                }
            }
        });
    }

    /* ═══════════ 6. VIBRACIÓN HÁPTICA al agregar al carrito ═══════════ */
    function initVibrate() {
        document.addEventListener('click', function (e) {
            if (e.target.closest('.add-cart')) {
                try { if (navigator.vibrate) navigator.vibrate(18); } catch (err) {}
            }
        });
    }

    /* ═══════════ 7. TICKER DE ACTIVIDAD EN VIVO ═══════════ */
    function initActivityTicker() {
        if (location.pathname !== '/') return;
        var box = document.createElement('div');
        box.className = 'eco-activity-ticker';
        box.innerHTML = '<span class="eco-tick-dot"></span><span class="eco-tick-text">EcoMarket está de fiesta 🌱</span>';
        document.body.appendChild(box);
        var idx = 0, events = [];
        function show() {
            if (!events.length) return;
            var ev = events[idx % events.length];
            idx++;
            box.querySelector('.eco-tick-text').textContent = ev.texto;
            box.classList.add('eco-tick-pop');
            setTimeout(function () { box.classList.remove('eco-tick-pop'); }, 400);
        }
        function load() {
            fetch('/api/actividad').then(function (r) { return r.ok ? r.json() : null; })
                .then(function (d) { if (d && d.eventos && d.eventos.length) { events = d.eventos; } })
                .catch(function () {});
        }
        load();
        setInterval(load, 60000);
        setInterval(show, 5000);
        setTimeout(show, 3000);
    }

    /* ═══════════ 8. TENDENCIAS: strip de productos más vistos ═══════════ */
    function initTendencias() {
        if (location.pathname !== '/') return;
        var anchor = document.querySelector('.productos-section .productos-grid, .productos-grid');
        if (!anchor) return;
        var section = document.createElement('section');
        section.className = 'section eco-tendencias';
        section.innerHTML = '<div class="container"><div class="section-title"><h2>🔥 Tendencias de la semana</h2><p>Lo que más está viendo la comunidad</p></div><div class="eco-tend-row" id="ecoTendRow"><p style="color:var(--texto-sec)">Cargando…</p></div></div>';
        anchor.closest('section').parentNode.insertBefore(section, anchor.closest('section'));
        fetch('/api/tendencias').then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) {
                var row = section.querySelector('#ecoTendRow');
                if (!d || !d.tendencias || !d.tendencias.length) { row.innerHTML = ''; section.remove(); return; }
                row.innerHTML = d.tendencias.map(function (p) {
                    var img = (p.imagen || '').startsWith('assets/') ? '/static/' + p.imagen : (p.imagen || '/static/assets/product-placeholder.svg');
                    return '<a href="/producto/' + p.id + '" class="eco-tend-card">' +
                        '<img src="' + img + '" alt="' + p.nombre + '" loading="lazy" onerror="this.src=\'/static/assets/product-placeholder.svg\'">' +
                        '<div><strong>' + p.nombre.slice(0, 28) + '</strong><span>S/. ' + (+p.precio).toFixed(2) + '</span></div></a>';
                }).join('');
            }).catch(function () { section.remove(); });
    }

    /* ═══════════ 9. MINI-JUEGO 404: atrapa la hoja ═══════════ */
    function init404Game() {
        if (!document.querySelector('h1') || !document.body.textContent.includes('404')) return;
        var game = document.createElement('div');
        game.className = 'eco-game404';
        game.innerHTML = '<p class="eco-game-title">🍃 ¡Atrapa a Eco!</p>' +
            '<div class="eco-game-field" id="ecoGameField"><div class="eco-game-leaf" id="ecoGameLeaf">🍃</div></div>' +
            '<div class="eco-game-bar"><span>Puntos: <b id="ecoGameScore">0</b></span><button class="eco-game-btn" id="ecoGameStart">Jugar</button></div>';
        var mascot = document.querySelector('.hero-mascot, img[alt="Eco"]');
        if (mascot && mascot.parentElement) mascot.parentElement.appendChild(game);
        else document.querySelector('section .container') && document.querySelector('section .container').appendChild(game);
        if (!game.parentElement) return;

        var leaf = game.querySelector('#ecoGameLeaf'), scoreEl = game.querySelector('#ecoGameScore');
        var score = 0, playing = false, timer = null, x = 0, y = 0, vx = 0, vy = 0;
        var field = game.querySelector('#ecoGameField');
        function loop() {
            if (!playing) return;
            x += vx; y += vy;
            if (x < 0 || x > field.clientWidth - 46) vx *= -1;
            if (y < 0 || y > field.clientHeight - 46) vy *= -1;
            leaf.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + (x * 2) + 'deg)';
            requestAnimationFrame(loop);
        }
        leaf.addEventListener('pointerdown', function () {
            if (!playing) return;
            score++; scoreEl.textContent = score;
            if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
            if (score % 5 === 0 && window.ecoConfetti) window.ecoConfetti(innerWidth / 2, innerHeight / 2, 20);
        });
        game.querySelector('#ecoGameStart').addEventListener('click', function () {
            playing = !playing;
            this.textContent = playing ? 'Pausar' : 'Jugar';
            if (playing) {
                score = 0; scoreEl.textContent = '0';
                x = Math.random() * (field.clientWidth - 60); y = Math.random() * (field.clientHeight - 60);
                vx = (Math.random() - 0.5) * 4; vy = (Math.random() - 0.5) * 4;
                if (!vx) vx = 2; if (!vy) vy = 2;
                loop();
            }
        });
    }

    /* ═══════════ 10. ALERTAS DE BAJADA DE PRECIO ═══════════ */
    function initPriceAlerts() {
        var KEY = 'ecomarket-alertas';
        function getAll() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
        function setAll(a) { localStorage.setItem(KEY, JSON.stringify(a)); }
        // Botón 🔔 en página de detalle
        if (location.pathname.indexOf('/producto/') === 0) {
            var match = location.pathname.match(/\/producto\/(\d+)/);
            var id = match ? parseInt(match[1], 10) : null;
            var precioEl = document.querySelector('.detalle-precio, .producto-precio, [class*="precio"] strong, h2 + div');
            var nombreEl = document.querySelector('h1');
            var priceText = document.body.textContent.match(/S\/\.\s*([\d.,]+)/);
            if (!id || !priceText) return;
            var precio = parseFloat(priceText[1].replace(',', '.'));
            var nombre = nombreEl ? nombreEl.textContent.trim() : 'Producto';
            var host = document.querySelector('.detalle-acciones, .add-cart') &&
                (document.querySelector('.add-cart').closest('div') || document.body);
            var btn = document.createElement('button');
            btn.className = 'btn-secundario eco-price-alert-btn';
            btn.style.cssText = 'width:100%;margin-top:8px';
            function paint() {
                var on = getAll().some(function (a) { return a.id === id; });
                btn.innerHTML = on ? '🔔 <span data-i18n="pd.alert_on">Avisándote si baja</span>' : '🔕 <span data-i18n="pd.alert_off">Avisarme si baja el precio</span>';
                btn.style.background = on ? '#fff8e1' : '';
                btn.style.borderColor = on ? '#F59E0B' : '';
            }
            btn.addEventListener('click', function () {
                var all = getAll();
                var i = all.findIndex(function (a) { return a.id === id; });
                if (i >= 0) { all.splice(i, 1); }
                else { all.push({ id: id, nombre: nombre, precio: precio, url: location.pathname }); }
                setAll(all); paint();
                if (window.EcoToast) EcoToast.show(i >= 0 ? 'Alerta eliminada' : '🔔 Alerta activada', i >= 0 ? 'Ya no te avisaremos' : 'Te avisaremos si ' + nombre.slice(0, 20) + ' baja de S/. ' + precio.toFixed(2), 'success', 3500);
                else alert(i >= 0 ? 'Alerta eliminada' : 'Alerta activada');
            });
            paint();
            var anchor = document.querySelector('#favBtn');
            if (anchor && anchor.parentElement) anchor.parentElement.appendChild(btn);
            else if (host) host.appendChild(btn);
        }
        // Verificador periódico de precios
        function check() {
            var all = getAll();
            if (!all.length) return;
            fetch('/api/precios').then(function (r) { return r.json(); }).then(function (d) {
                var map = d.precios || {};
                var changed = false, cur = getAll();
                cur.forEach(function (a) {
                    var precio = map[String(a.id)];
                    if (precio !== undefined && +precio < a.precio - 0.004) {
                        a.precio = +precio; changed = true;
                        if (window.EcoToast) EcoToast.show('📉 ¡Bajó de precio!', a.nombre.slice(0, 30) + ' ahora S/. ' + (+precio).toFixed(2), 'success', 8000);
                        if (window.ecoConfetti) ecoConfetti(innerWidth / 2, innerHeight / 3, 24);
                    }
                });
                if (changed) setAll(cur);
            }).catch(function () {});
        }
        setTimeout(check, 8000);
        setInterval(check, 120000);
    }

    /* ═══════════ 11. BADGE "ÚLTIMAS UNIDADES" ═══════════ */
    function initLowStock() {
        document.querySelectorAll('.producto-card[data-stock]').forEach(function (card) {
            var stock = parseInt(card.getAttribute('data-stock'), 10);
            if (stock > 0 && stock <= 5) {
                var badges = card.querySelector('.card-badges');
                if (!badges) { badges = document.createElement('div'); badges.className = 'card-badges'; card.prepend(badges); }
                var b = document.createElement('span');
                b.className = 'card-badge badge-stock';
                b.textContent = '🔥 ¡Quedan ' + stock + '!';
                badges.appendChild(b);
            } else if (stock === 0) {
                card.style.opacity = '.75';
            }
        });
    }

    /* ═══════════ 12. ANALYTICS: scroll depth + tiempo en página ═══════════ */
    function initEngagementAnalytics() {
        var fired = {};
        function track(ev, props) {
            try {
                fetch('/api/analytics/track', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event: ev, properties: props || {} }), keepalive: true
                }).catch(function () {});
            } catch (e) {}
        }
        var marks = [25, 50, 75, 100];
        window.addEventListener('scroll', function () {
            var h = document.documentElement;
            var pct = Math.round((window.scrollY / (h.scrollHeight - h.clientHeight || 1)) * 100);
            marks.forEach(function (m) {
                if (pct >= m && !fired[m]) { fired[m] = true; track('scroll_depth', { depth: m, path: location.pathname }); }
            });
        }, { passive: true });
        var t0 = Date.now(), sent = false;
        function sendTime() {
            if (sent) return; sent = true;
            track('time_on_page', { seconds: Math.round((Date.now() - t0) / 1000), path: location.pathname });
        }
        document.addEventListener('visibilitychange', function () { if (document.hidden) sendTime(); });
        window.addEventListener('pagehide', sendTime);
    }

    /* ═══════════ INIT ═══════════ */
    document.addEventListener('DOMContentLoaded', function () {
        initParticles();
        initCursorTrail();
        initSimulator();
        initLeaderboard();
        initMascotEgg();
        initVibrate();
        initActivityTicker();
        initTendencias();
        init404Game();
        initPriceAlerts();
        initLowStock();
        initEngagementAnalytics();
    });
})();
