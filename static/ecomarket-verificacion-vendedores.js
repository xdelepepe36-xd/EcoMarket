/**
 * EcoMarket - Verificación de Vendedores (backend real)
 * Nivel calculado en servidor según email, teléfono, actividad y rating.
 */
(function () {
    'use strict';

    var NIVELES = [
        { n: 1, nombre: 'Básico',    badge: '📝', color: '#6c757d', req: 'Email verificado' },
        { n: 2, nombre: 'Confirmado',badge: '✓',  color: '#28a745', req: 'Email + teléfono' },
        { n: 3, nombre: 'Verificado',badge: '✓✓', color: '#007bff', req: '3+ productos publicados' },
        { n: 4, nombre: 'Premium',   badge: '⭐', color: '#ffc107', req: '10+ ventas concretadas' },
        { n: 5, nombre: 'Top Seller',badge: '🏆', color: '#17a2b8', req: '25+ ventas + rating 4.5' }
    ];

    function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

    function cargarYRenderizar() {
        var panel = document.getElementById('panel-verificacion');
        if (!panel) return;
        fetch('/api/verificacion/estado').then(function (r) { return r.json(); }).then(function (d) {
            if (d.error) { panel.innerHTML = '<p style="color:#b91c1c">' + esc(d.error) + '</p>'; return; }
            var nivel = NIVELES[d.nivel - 1] || null;
            var stats = d.stats || {};
            var checks = d.checks || {};

            var items = [
                { ok: checks.email,        icon: '📧', label: 'Email verificado' },
                { ok: checks.telefono,     icon: '📱', label: 'Teléfono registrado' },
                { ok: checks.publicaciones,icon: '📦', label: '3+ productos publicados' },
                { ok: checks.ventas,       icon: '🛒', label: '10+ ventas concretadas' },
                { ok: checks.top,          icon: '🏆', label: '25+ ventas + rating 4.5' }
            ];

            var sig = NIVELES[d.nivel]; // siguiente nivel (index = nivel actual)
            var html = '<div class="verificacion-header">' +
                '<h3>Estado de Verificación</h3>' +
                (nivel ? '<div class="nivel-actual" style="background-color:' + nivel.color + '">' + nivel.badge + ' ' + esc(d.nombre || nivel.nombre) + '</div>'
                       : '<div class="nivel-actual sin-verificar">Sin verificar</div>') +
                '</div>' +
                '<div class="verificacion-progreso"><h4>Tu actividad</h4>' +
                '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px">' +
                '<div style="text-align:center;padding:10px;background:rgba(46,125,50,.06);border-radius:10px"><strong>' + (stats.publicados || 0) + '</strong><br><small style="color:var(--texto-sec)">Productos</small></div>' +
                '<div style="text-align:center;padding:10px;background:rgba(46,125,50,.06);border-radius:10px"><strong>' + (stats.ventas || 0) + '</strong><br><small style="color:var(--texto-sec)">Ventas</small></div>' +
                '<div style="text-align:center;padding:10px;background:rgba(46,125,50,.06);border-radius:10px"><strong>' + (stats.rating || '—') + '★</strong><br><small style="color:var(--texto-sec)">Rating</small></div>' +
                '</div>' +
                items.map(function (it) {
                    return '<div class="verificacion-item ' + (it.ok ? 'completado' : 'pendiente') + '">' +
                        '<span class="icono">' + it.icon + '</span><span class="label">' + it.label + '</span>' +
                        '<span class="estado">' + (it.ok ? '✓' : '○') + '</span></div>';
                }).join('') + '</div>';

            if (sig) {
                html += '<div class="siguiente-nivel"><h4>Siguiente nivel: ' + sig.badge + ' ' + sig.nombre + '</h4>' +
                    '<p style="margin:6px 0">Requisito: <strong>' + sig.req + '</strong></p>' +
                    '<div style="height:8px;background:rgba(0,0,0,.08);border-radius:99px;overflow:hidden">' +
                    '<div style="height:100%;width:' + Math.round((d.nivel / 5) * 100) + '%;background:' + sig.color + '"></div></div>' +
                    '<p style="font-size:.8rem;color:var(--texto-sec);margin-top:6px">Progreso: nivel ' + d.nivel + ' de 5</p></div>';
            } else {
                html += '<div class="siguiente-nivel" style="background:#d4edda"><h4>🏆 ¡Nivel máximo alcanzado!</h4><p>Eres Top Seller — la comunidad confía en ti.</p></div>';
            }

            html += '<div class="acciones-verificacion">' +
                (checks.email ? '' : '<a class="btn-verificar" style="text-decoration:none;display:inline-block" href="/perfil">📧 Verificar email en perfil</a>') +
                (!stats.telefono ? '<a class="btn-verificar" style="text-decoration:none;display:inline-block;background:#007bff" href="/perfil">📱 Agregar teléfono en perfil</a>' : '') +
                '<a class="btn-verificar" style="text-decoration:none;display:inline-block;background:#6c757d" href="/publicar">📦 Publicar producto</a>' +
                '</div>';

            panel.innerHTML = html;
        }).catch(function () {
            panel.innerHTML = '<p style="color:var(--texto-sec)">No se pudo cargar el estado de verificación.</p>';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cargarYRenderizar);
    } else {
        cargarYRenderizar();
    }
})();
