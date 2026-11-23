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
        rose:     { n: 18, color: '240,98,146', shape: 'petal', speed: 0.45 },
        autumn:   { n: 24, color: '245,124,0',  shape: 'leaf',  speed: 0.6 },
        christmas:{ n: 46, color: '255,255,255', shape: 'snow',  speed: 0.9 }
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
              : cfg.shape === 'snow'  ? 2 + Math.random() * 4
              : 4 + Math.random() * 6;
        p.rot = Math.random() * Math.PI * 2;
        p.vr = (Math.random() - 0.5) * 0.03;
        p.alpha = cfg.shape === 'firefly' ? 0.3 + Math.random() * 0.5
                : cfg.shape === 'snow' ? 0.7 + Math.random() * 0.3
                : 0.35 + Math.random() * 0.4;
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
        } else if (cfg.shape === 'snow') {
            ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
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

    /* ═══════════ 13. CAMPANA DE NOTIFICACIONES ═══════════ */
    function initNotificaciones() {
        if (!document.body.dataset.userId) return;
        var wrap = document.querySelector('.header-container');
        if (!wrap) return;
        var anchor = wrap.querySelector('.theme-switcher') || wrap.lastElementChild;
        anchor.insertAdjacentHTML('beforebegin',
            '<div class="eco-bell-wrap">' +
            '<button class="eco-bell-btn" id="ecoBellBtn" aria-label="Notificaciones"><i class="bi bi-bell"></i><span class="eco-bell-badge" id="ecoBellBadge" style="display:none">0</span></button>' +
            '<div class="eco-bell-panel" id="ecoBellPanel">' +
            '<div class="eco-bell-head"><span>🔔 Notificaciones</span><button id="ecoBellLeer">Marcar todas</button></div>' +
            '<div id="ecoBellList"><p class="eco-bell-empty">Cargando…</p></div>' +
            '</div></div>');
        var badge = document.getElementById('ecoBellBadge');
        var list = document.getElementById('ecoBellList');
        var panel = document.getElementById('ecoBellPanel');
        var ICONOS = { success: '✅', info: 'ℹ️', warning: '⚠️', danger: '🚨' };
        function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
        function timeAgo(ts) {
            try {
                var d = new Date((ts || '').replace(' ', 'T'));
                var s = Math.floor((Date.now() - d.getTime()) / 1000);
                if (s < 60) return 'ahora';
                if (s < 3600) return Math.floor(s / 60) + 'm';
                if (s < 86400) return Math.floor(s / 3600) + 'h';
                return Math.floor(s / 86400) + 'd';
            } catch (e) { return ''; }
        }
        function render(notifs) {
            if (!notifs.length) { list.innerHTML = '<p class="eco-bell-empty">Sin notificaciones 🎉</p>'; return; }
            list.innerHTML = notifs.map(function (n) {
                return '<div class="eco-bell-item' + (n.leida ? '' : ' no-leida') + '" data-nid="' + n.id + '">' +
                    '<span class="t-icon">' + (ICONOS[n.tipo] || '🔔') + '</span>' +
                    '<div class="t-txt"><strong>' + esc(n.titulo) + '</strong><span>' + esc(n.mensaje) + '</span></div>' +
                    '<span class="t-time">' + timeAgo(n.created_at) + '</span></div>';
            }).join('');
            list.querySelectorAll('.eco-bell-item').forEach(function (el) {
                el.addEventListener('click', function () {
                    fetch('/notificaciones/leer/' + el.dataset.nid, { method: 'POST' }).catch(function () {});
                    el.classList.remove('no-leida');
                });
            });
        }
        function load() {
            fetch('/api/notificaciones').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
                if (!d) return;
                render(d.notificaciones || []);
                badge.textContent = d.no_leidas || 0;
                badge.style.display = d.no_leidas ? 'flex' : 'none';
            }).catch(function () {});
        }
        document.getElementById('ecoBellBtn').addEventListener('click', function (e) {
            e.stopPropagation();
            panel.classList.toggle('open');
            if (panel.classList.contains('open')) load();
        });
        document.addEventListener('click', function (e) {
            if (!panel.contains(e.target)) panel.classList.remove('open');
        });
        document.getElementById('ecoBellLeer').addEventListener('click', function () {
            fetch('/notificaciones/leer-todas', { method: 'POST' }).then(function () { load(); });
        });
        load();
        setInterval(load, 60000);
    }

    /* ═══════════ 14. CARD DE REFERIDOS en perfil ═══════════ */
    function initReferidos() {
        if (location.pathname !== '/perfil') return;
        var host = document.querySelector('.tab-content, .perfil-grid, .container');
        if (!host || document.getElementById('ecoRefCard')) return;
        fetch('/api/referido').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
            if (!d) return;
            var card = document.createElement('div');
            card.id = 'ecoRefCard';
            card.className = 'eco-ref-card';
            card.innerHTML = '<h3>🎁 Programa de referidos</h3>' +
                '<p>Comparte tu código — si alguien se registra con él, <b>ambos ganan 100 pts eco</b> 🌱</p>' +
                '<div class="eco-ref-row"><span class="eco-ref-code" id="ecoRefCode">' + d.codigo + '</span>' +
                '<button class="eco-ref-btn" id="ecoRefCopy">📋 Copiar enlace</button>' +
                '<a class="eco-ref-btn ghost" href="/registro?ref=' + d.codigo + '" style="text-decoration:none;display:inline-flex;align-items:center">Ver registro</a></div>' +
                '<div class="eco-ref-stats"><div><b>' + d.total + '</b>amigos unidos</div><div><b>' + d.puntos + '</b>tus pts eco</div></div>';
            host.insertBefore(card, host.firstChild);
            document.getElementById('ecoRefCopy').addEventListener('click', function () {
                var link = location.origin + '/registro?ref=' + d.codigo;
                if (navigator.clipboard) navigator.clipboard.writeText(link);
                if (window.EcoToast) EcoToast.show('📋 Copiado', 'Tu link de referido está en el portapapeles', 'success');
            });
        }).catch(function () {});
    }

    /* ═══════════ 15. MONEDERO ECOCOINS en perfil ═══════════ */
    function initMonedero() {
        if (location.pathname !== '/perfil') return;
        var host = document.querySelector('.tab-content, .perfil-grid, .container');
        if (!host || document.getElementById('ecoWallet')) return;
        fetch('/api/mis-cupones').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
            if (!d) return;
            var card = document.createElement('div');
            card.id = 'ecoWallet';
            card.className = 'eco-ref-card';
            card.style.background = 'linear-gradient(135deg,#fffbeb,#fef3c7)';
            card.style.borderColor = '#f59e0b88';
            var canjes = Object.keys(d.canjes || {}).map(function (p) {
                return '<button class="eco-ref-btn" style="background:linear-gradient(135deg,#b45309,#f59e0b)" onclick="canjearEco(' + p + ')">🎟️ ' + p + ' pts → -' + d.canjes[p] + '%</button>';
            }).join('');
            card.innerHTML = '<h3 style="color:#92400e">🪙 Monedero EcoCoins</h3>' +
                '<p style="color:#92400ecc">Tienes <b>' + d.puntos + ' pts eco</b> — canjéalos por cupones de descuento:</p>' +
                '<div class="eco-ref-row">' + canjes + '</div>' +
                '<div id="ecoMisCupones" style="margin-top:14px"></div>';
            host.insertBefore(card, host.firstChild);
            pintarCupones(d.cupones || []);
        }).catch(function () {});
    }
    function pintarCupones(cupones) {
        var host = document.getElementById('ecoMisCupones');
        if (!host) return;
        if (!cupones.length) { host.innerHTML = '<p style="font-size:.82rem;color:#92400e99">Aún no tienes cupones canjeados.</p>'; return; }
        host.innerHTML = '<p style="font-size:.8rem;font-weight:700;color:#92400e;margin-bottom:8px">Tus cupones:</p>' + cupones.map(function (c) {
            var vivo = !c.expira || new Date(c.expira.replace(' ', 'T')) > new Date();
            return '<div style="display:flex;align-items:center;gap:10px;background:#fff;border:1.5px dashed #f59e0b;border-radius:12px;padding:10px 14px;margin-bottom:8px">' +
                '<span style="font-family:monospace;font-weight:800;color:#b45309">' + c.codigo + '</span>' +
                '<span style="font-size:.85rem;color:#166534;font-weight:700">-' + c.descuento + c.tipo + '</span>' +
                '<span style="font-size:.72rem;color:#92400e99;margin-left:auto">' + (vivo ? 'válido hasta ' + (c.expira || '').slice(0, 10) : 'vencido') + '</span>' +
                '<button class="eco-ref-btn ghost" style="padding:5px 12px;font-size:.75rem" onclick="copiarCupon(\'' + c.codigo + '\')">📋</button></div>';
        }).join('');
    }
    window.canjearEco = function (puntos) {
        fetch('/api/canjear-cupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ puntos: puntos }) })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (d.success) {
                    if (window.EcoToast) EcoToast.show('🎟️ ¡Cupón listo!', d.codigo + ' (-' + d.descuento + '%) — cópialo en tu monedero', 'success', 6000);
                    initMonederoRefresh();
                } else { alert(d.error || 'No se pudo canjear'); }
            }).catch(function () { alert('Error de conexión'); });
    };
    function initMonederoRefresh() {
        var old = document.getElementById('ecoWallet');
        if (old) old.remove();
        initMonedero();
    }
    window.copiarCupon = function (codigo) {
        if (navigator.clipboard) navigator.clipboard.writeText(codigo);
        if (window.EcoToast) EcoToast.show('📋 Copiado', codigo, 'success', 2000);
    };

    /* ═══════════ 16. BÚSQUEDAS RECIENTES chips ═══════════ */
    function initBusquedasRecientes() {
        if (location.pathname !== '/productos' || !document.body.dataset.userId) return;
        var input = document.querySelector('#busquedaInput, input[name="q"], .search-input input, form[action*="productos"] input[type="text"], form[action*="productos"] input[type="search"]');
        if (!input || document.getElementById('ecoRecentSearches')) return;
        fetch('/api/busquedas-recientes').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
            if (!d || !d.busquedas.length) return;
            var bar = document.createElement('div');
            bar.id = 'ecoRecentSearches';
            bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0 4px';
            bar.innerHTML = '<span style="font-size:.78rem;color:var(--texto-sec,#666)">🕘 Recientes:</span>' +
                d.busquedas.map(function (t) {
                    return '<a href="/productos?q=' + encodeURIComponent(t) + '" class="filter-pill" style="font-size:.78rem;padding:5px 14px">' + t + '</a>';
                }).join('');
            var form = input.closest('form') || input.parentElement;
            form.parentNode.insertBefore(bar, form.nextSibling);
        }).catch(function () {});
    }

    /* ═══════════ 17. MURO DE AGRADECIMIENTOS ═══════════ */
    function initAgradecimientos() {
        if (location.pathname !== '/') return;
        if (document.getElementById('ecoThanks')) return;
        var section = document.createElement('section');
        section.id = 'ecoThanks';
        section.className = 'section';
        section.innerHTML = '<div class="container"><div class="section-title"><h2>💛 Muro de agradecimientos</h2><p>Lo que dice la comunidad de EcoMarket</p></div>' +
            '<div class="eco-thanks-grid" id="ecoThanksGrid"><p style="color:var(--texto-sec)">Cargando…</p></div>' +
            (document.body.dataset.userId ? '<div class="eco-thanks-form"><input id="ecoThanksInput" maxlength="280" placeholder="Escribe un agradecimiento…" style="flex:1;padding:12px 16px;border:1.5px solid rgba(46,125,50,.2);border-radius:12px;font-family:inherit"><button class="btn-principal" id="ecoThanksSend" style="padding:12px 22px">Enviar 💌</button></div>' : '') +
            '</div>';
        var footer = document.querySelector('footer');
        if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer);
        else document.body.appendChild(section);
        function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
        function load() {
            fetch('/api/agradecimientos').then(function (r) { return r.json(); }).then(function (d) {
                var msgs = d.mensajes || [];
                var grid = document.getElementById('ecoThanksGrid');
                if (!msgs.length) { grid.innerHTML = '<p style="text-align:center;color:var(--texto-sec)">Sé el primero en agradecer 💚</p>'; return; }
                grid.innerHTML = msgs.map(function (m) {
                    return '<div class="eco-thanks-card"><p>“' + esc(m.mensaje) + '”</p><span>— ' + esc((m.nombre || 'Anónimo').split(' ')[0]) + '</span></div>';
                }).join('');
            }).catch(function () {});
        }
        var send = document.getElementById('ecoThanksSend');
        if (send) send.addEventListener('click', function () {
            var inp = document.getElementById('ecoThanksInput');
            var msg = inp.value.trim();
            if (msg.length < 5) return;
            fetch('/api/agradecimientos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mensaje: msg }) })
                .then(function (r) { return r.json(); }).then(function (d) {
                    if (d.success) { inp.value = ''; load(); if (window.EcoToast) EcoToast.show('💌 ¡Gracias!', 'Tu mensaje ya está en el muro', 'success'); }
                    else alert(d.error || 'Error');
                }).catch(function () { alert('Error de conexión'); });
        });
        load();
    }

    /* ═══════════ OFERTAS FLASH (home) ═══════════ */
    function initFlashOffers() {
        if (location.pathname !== '/') return;
        var sec = document.getElementById('flashSection');
        if (!sec) return;
        function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
        fetch('/api/ofertas-flash').then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) {
                var strip = document.getElementById('flashStrip');
                if (!d || !d.ofertas || !d.ofertas.length) { sec.style.display = 'none'; return; }
                strip.innerHTML = d.ofertas.map(function (p) {
                    var pct = p.precio_original ? Math.round((1 - p.precio / p.precio_original) * 100) : 0;
                    var img = (p.imagen || '').startsWith('assets/') ? '/static/' + p.imagen
                        : (p.imagen && p.imagen.indexOf('http') === 0 ? p.imagen : '/static/assets/product-placeholder.svg');
                    return '<a href="/producto/' + p.id + '" class="eco-flash-card">' +
                        '<span class="eco-flash-badge">-' + pct + '%</span>' +
                        '<img src="' + img + '" alt="' + esc(p.nombre) + '" loading="lazy" onerror="this.src=\'/static/assets/product-placeholder.svg\'">' +
                        '<div class="eco-flash-info"><strong>' + esc(String(p.nombre).slice(0, 30)) + '</strong>' +
                        '<span class="eco-flash-price">S/. ' + (+p.precio).toFixed(2) + ' <s>S/. ' + (+p.precio_original).toFixed(2) + '</s></span></div></a>';
                }).join('');
                sec.style.display = 'block';
                // Countdown a medianoche: "nuevas ofertas pronto"
                var cd = document.createElement('span');
                cd.className = 'eco-flash-countdown';
                sec.querySelector('.section-title p').appendChild(document.createTextNode(' · ⏰ '));
                sec.querySelector('.section-title p').appendChild(cd);
                (function tick() {
                    var now = new Date(), mid = new Date(now); mid.setHours(24, 0, 0, 0);
                    var s = Math.max(0, Math.floor((mid - now) / 1000));
                    cd.textContent = 'ofertas del día · reset en ' + String(Math.floor(s/3600)).padStart(2,'0') + ':' + String(Math.floor(s%3600/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
                    setTimeout(tick, 1000);
                })();
            }).catch(function () { sec.style.display = 'none'; });
    }

    /* ═══════════ QUIZ SEMANAL (home) ═══════════ */
    function initQuiz() {
        if (location.pathname !== '/') return;
        var card = document.getElementById('quizCard');
        if (!card) return;
        var sec = document.getElementById('quizSection');
        function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
        sec.style.display = 'block';
        if (!window.__ECOMARKET_AUTH__) {
            card.innerHTML = '<div class="quiz-login"><p>🔒 Inicia sesión para participar y ganar pts eco.</p><a href="/login" class="btn-principal">Entrar</a></div>';
            return;
        }
        fetch('/api/quiz').then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) {
                if (!d || !d.preguntas || !d.preguntas.length) { sec.style.display = 'none'; return; }
                var html = '';
                d.preguntas.forEach(function (q, i) {
                    html += '<div class="quiz-q" data-idx="' + i + '"><p class="quiz-p"><b>' + (i + 1) + '.</b> ' + esc(q.p) + '</p><div class="quiz-opts">';
                    q.o.forEach(function (op, j) {
                        html += '<label class="quiz-opt"><input type="radio" name="quiz' + i + '" value="' + j + '"><span>' + esc(op) + '</span></label>';
                    });
                    html += '</div></div>';
                });
                html += '<button class="btn-principal quiz-submit" id="quizSubmit">Responder y ganar pts</button><div id="quizResult"></div>';
                card.innerHTML = html;
                document.getElementById('quizSubmit').addEventListener('click', function () {
                    var resp = [], faltan = false;
                    d.preguntas.forEach(function (_, i) {
                        var sel = card.querySelector('input[name="quiz' + i + '"]:checked');
                        if (!sel) faltan = true;
                        resp.push(sel ? parseInt(sel.value, 10) : -1);
                    });
                    if (faltan) { if (window.EcoToast) EcoToast.show('⚠️', 'Responde las 5 preguntas', 'warning'); return; }
                    var btn = this; btn.disabled = true; btn.textContent = 'Calificando…';
                    fetch('/api/quiz/responder', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ respuestas: resp, ids: d.ids })
                    }).then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
                        .then(function (res) {
                            var out = document.getElementById('quizResult');
                            if (res.j.success) {
                                out.innerHTML = '<div class="quiz-result-ok">🎉 Acertaste <b>' + res.j.correctas + '/5</b> — ganaste <b>' + res.j.premio + ' pts eco</b> 🌱</div>';
                                if (res.j.correctas >= 4 && window.ecoConfetti) window.ecoConfetti(innerWidth / 2, innerHeight / 3, 80);
                            } else {
                                out.innerHTML = '<div class="quiz-result-err">' + esc(res.j.error || 'Error') + '</div>';
                            }
                        }).catch(function () { document.getElementById('quizResult').innerHTML = '<div class="quiz-result-err">Error de conexión</div>'; });
                });
            }).catch(function () { sec.style.display = 'none'; });
    }

    /* ═══════════ DESTACADO DEL DÍA (home) ═══════════ */
    function initDestacado() {
        if (location.pathname !== '/') return;
        var hero = document.querySelector('.hero-section-enhanced');
        if (!hero) return;
        function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
        fetch('/api/destacado').then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) {
                if (!d || !d.producto) return;
                var p = d.producto;
                var img = (p.imagen || '').startsWith('assets/') ? '/static/' + p.imagen
                    : (p.imagen && p.imagen.indexOf('http') === 0 ? p.imagen : '/static/assets/product-placeholder.svg');
                var banner = document.createElement('div');
                banner.className = 'eco-destacado';
                banner.innerHTML = '<a href="/producto/' + p.id + '" class="eco-destacado-link">' +
                    '<img src="' + img + '" alt="' + esc(p.nombre) + '" onerror="this.src=\'/static/assets/product-placeholder.svg\'">' +
                    '<div class="eco-destacado-info"><span class="eco-destacado-tag">⭐ Destacado del día</span>' +
                    '<strong>' + esc(p.nombre) + '</strong>' +
                    '<span class="eco-destacado-price">S/. ' + (+p.precio).toFixed(2) + '</span></div>' +
                    '<span class="eco-destacado-arrow">→</span></a>';
                hero.parentNode.insertBefore(banner, hero.nextSibling);
            }).catch(function () {});
    }

    /* ═══════════ WISHLIST COMPARTIBLE ═══════════ */
    function initWishlistShare() {
        var btn = document.getElementById('btnShareWishlist');
        if (!btn) return;
        btn.addEventListener('click', function () {
            fetch('/api/wishlist/compartir', { method: 'POST' }).then(function (r) { return r.json(); })
                .then(function (d) {
                    if (d.url) {
                        if (navigator.clipboard) navigator.clipboard.writeText(d.url).catch(function () {});
                        if (window.EcoToast) EcoToast.show('🔗 Link copiado', 'Comparte tu wishlist con quien quieras', 'success');
                        else prompt('Tu link de wishlist:', d.url);
                    } else if (window.EcoToast) EcoToast.show('⚠️', d.error || 'Error', 'warning');
                }).catch(function () { if (window.EcoToast) EcoToast.show('⚠️', 'Error de conexión', 'warning'); });
        });
    }

    /* ═══════════ LOGROS: check automático + panel en perfil ═══════════ */
    function initLogrosCheck() {
        if (!window.__ECOMARKET_AUTH__) return;
        fetch('/api/logros/check', { method: 'POST' }).then(function (r) { return r.json(); })
            .then(function (d) {
                if (d && d.nuevos && d.nuevos.length && window.EcoToast) {
                    EcoToast.show('🏅 ¡Logro desbloqueado!', 'Revisa tu perfil para ver tus insignias', 'success');
                    if (window.ecoConfetti) setTimeout(function () { window.ecoConfetti(innerWidth / 2, innerHeight / 3, 60); }, 400);
                }
            }).catch(function () {});
    }

    function initLogrosPanel() {
        if (location.pathname.indexOf('/perfil') !== 0) return;
        var box = document.getElementById('logrosGrid');
        if (!box) return;
        function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
        fetch('/api/logros').then(function (r) { return r.json(); }).then(function (d) {
            if (!d || !d.logros) return;
            box.innerHTML = d.logros.map(function (l) {
                return '<div class="logro-card ' + (l.desbloqueado ? 'logro-on' : 'logro-off') + '">' +
                    '<span class="logro-emoji">' + l.emoji + '</span>' +
                    '<strong>' + esc(l.nombre) + '</strong>' +
                    '<small>' + esc(l.desc) + '</small>' +
                    (l.desbloqueado ? '<em>✓ ' + (l.fecha || '').slice(0, 10) + '</em>' : '<em>🔒 bloqueado</em>') +
                    '</div>';
            }).join('');
        }).catch(function () {});
    }

    /* ═══════════ PWA: prompt de instalación ═══════════ */
    function initPWAInstall() {
        var deferred = null;
        window.addEventListener('beforeinstallprompt', function (e) {
            e.preventDefault();
            deferred = e;
            if (document.getElementById('pwaInstallBtn')) return;
            var btn = document.createElement('button');
            btn.id = 'pwaInstallBtn';
            btn.className = 'pwa-install-btn';
            btn.innerHTML = '📲 Instalar app';
            btn.addEventListener('click', function () {
                if (!deferred) return;
                deferred.prompt();
                deferred.userChoice.then(function () { deferred = null; btn.remove(); });
            });
            document.body.appendChild(btn);
        });
    }

    /* ═══════════ MODO TEXTO GRANDE ═══════════ */
    function initTextoGrande() {
        if (localStorage.getItem('ecomarket-texto-grande') === '1') {
            document.documentElement.classList.add('texto-grande');
        }
        var btn = document.createElement('button');
        btn.id = 'textoGrandeBtn';
        btn.className = 'texto-grande-btn';
        btn.textContent = 'Aa';
        btn.title = 'Alternar texto grande';
        btn.setAttribute('aria-label', 'Alternar texto grande');
        btn.addEventListener('click', function () {
            var on = document.documentElement.classList.toggle('texto-grande');
            localStorage.setItem('ecomarket-texto-grande', on ? '1' : '0');
        });
        document.body.appendChild(btn);
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
        initNotificaciones();
        initReferidos();
        initMonedero();
        initBusquedasRecientes();
        initAgradecimientos();
        initFlashOffers();
        initQuiz();
        initLogrosCheck();
        initLogrosPanel();
        initDestacado();
        initWishlistShare();
        initPWAInstall();
        initTextoGrande();
    });
})();
