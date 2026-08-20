#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test e2e integral en vivo (EcoMarket) - valida todas las mecanicas.

Nota: el primer usuario registrado es admin (bootstrap). Para validar el
bloqueo de admin y el follow entre usuarios distintos, se registra un
segundo usuario (no-admin) y se usa su sesion.
"""
import re, time, requests, sys
BASE = 'https://ecomarket-19.onrender.com'
results = []
def check(name, ok, extra=''):
    results.append((name, ok, extra)); print(('PASS' if ok else 'FAIL'), name, extra)
def get_csrf(sess, path):
    r = sess.get(BASE + path, timeout=40)
    m = re.search(r'name="csrf_token" value="([^"]+)"', r.text)
    return r, (m.group(1) if m else None)
def registrar(sess):
    email = f'mech{int(time.time()*1000)}@ecomarket.test'
    r, tok = get_csrf(sess, '/registro')
    reg = sess.post(BASE + '/registro', data={'csrf_token': tok, 'nombre': 'Cliente', 'apellidos': 'Prueba', 'email': email,
        'password': 'Clave12345x', 'password2': 'Clave12345x', 'telefono': '+51 999 999 999', 'ciudad': 'Lima'},
        allow_redirects=True, timeout=40)
    return sess, email, reg

# === Usuario 1 (admin por bootstrap) ===
s, email1, reg1 = requests.Session(), None, None
s, email1, reg1 = registrar(requests.Session())
s.headers['User-Agent'] = 'EcoMarket-E2E/1.0'
check('registro U1 (admin bootstrap)', reg1.status_code == 200 and '/registro' not in reg1.url, reg1.url[-40:])

pid = 11
check('detalle producto', s.get(f'{BASE}/producto/{pid}', timeout=40).status_code == 200)
f = s.post(f'{BASE}/api/producto/{pid}/favorito', json={}, timeout=40)
check('favorito add', f.status_code == 200 and f.json().get('favorito') is True, f.text[:80])
df = s.delete(f'{BASE}/api/favorito/{pid}', timeout=40)
check('favorito delete', df.status_code == 200 and df.json().get('success') is True, df.text[:80])

rv = s.post(f'{BASE}/api/producto/{pid}/resena', json={'rating': 5, 'comentario': 'Producto genial'}, timeout=40)
rid = (rv.json() or {}).get('resena_id')
check('crear reseña', rv.status_code == 200 and rid is not None, rv.text[:80])

if rid:
    v = s.post(f'{BASE}/api/reviews/vote', json={'review_id': rid, 'vote_type': 'up'}, timeout=40)
    lst = s.get(f'{BASE}/api/reviews?producto_id={pid}', timeout=40).json()
    voted = any(x.get('id') == rid and x.get('votes_helpful', 0) >= 1 for x in lst.get('reviews', []))
    check('votar reseña + reflejado', v.status_code == 200 and v.json().get('success') and voted, v.text[:80])
    vv = s.post(f'{BASE}/api/reviews/vote', json={'review_id': 999999, 'vote_type': 'up'}, timeout=40)
    check('voto inexistente 404', vv.status_code == 404, vv.text[:80])
else:
    check('votar reseña', False, 'sin resena_id')

check('GET reviews list', s.get(f'{BASE}/api/reviews?producto_id={pid}', timeout=40).status_code == 200)

_, tok2 = get_csrf(s, '/perfil')
pu = s.post(BASE + '/perfil/actualizar', data={'csrf_token': tok2 or '', 'nombre': 'Cliente2', 'bio': 'bio'}, allow_redirects=False, timeout=40)
check('perfil actualizar', pu.status_code in (301, 302), str(pu.status_code))
_, tok3 = get_csrf(s, '/perfil')
cp = s.post(BASE + '/perfil/cambiar_password', data={'csrf_token': tok3 or '', 'password_actual': 'Clave12345x', 'password_nueva': 'Nueva12345x', 'password_confirmar': 'Nueva12345x'}, allow_redirects=False, timeout=40)
check('cambiar password', cp.status_code in (301, 302), str(cp.status_code))

cd = s.get(BASE + '/api/cupones/disponibles', timeout=40)
check('cupones disponibles', cd.status_code == 200 and isinstance(cd.json(), list), str(cd.text[:80]))
ga = s.post(BASE + '/auth/google', json={'credential': 'token.falso'}, timeout=40)
check('google auth 401', ga.status_code == 401, ga.text[:80])
_, tok4 = get_csrf(s, '/contacto')
ct = s.post(BASE + '/contacto', data={'csrf_token': tok4 or '', 'nombre': 'E2E', 'email': email1, 'mensaje': 'prueba'}, allow_redirects=False, timeout=40)
check('contacto mensaje', ct.status_code in (200, 301, 302), str(ct.status_code))
cp2 = s.post(BASE + '/api/compare', json={'ids': [1, 2]}, timeout=40)
check('compare API', cp2.status_code == 200 and len(cp2.json().get('products', [])) > 0, str(cp2.text[:80]))
wl = s.get(BASE + '/api/recomendaciones/wishlist', timeout=40)
check('wishlist smart API', wl.status_code == 200, str(wl.text[:80]))

# === Usuario 2 (no-admin) ===
s2 = requests.Session(); s2.headers['User-Agent'] = 'EcoMarket-E2E/2.0'
s2, email2, reg2 = registrar(s2)
check('registro U2 (no-admin)', reg2.status_code == 200 and '/registro' not in reg2.url, reg2.url[-40:])
# admin bloqueado para no-admin
adm = s2.get(BASE + '/admin', allow_redirects=False, timeout=40)
check('admin bloqueado no-admin', adm.status_code in (301, 302), str(adm.status_code))
# follow del admin (id 1)
seg = s2.post(BASE + '/api/usuario/1/seguir', json={}, timeout=40)
check('seguir usuario 1', seg.status_code == 200 and seg.json().get('siguiendo') is True, seg.text[:80])
# self follow bloqueado
# id de s2 desconocido; usar /perfil para obtener? intentar seguir id 1 de nuevo -> toggle off
seg2 = s2.post(BASE + '/api/usuario/1/seguir', json={}, timeout=40)
check('dejar de seguir usuario 1', seg2.status_code == 200 and seg2.json().get('siguiendo') is False, seg2.text[:80])

check('logout', s.get(BASE + '/logout', allow_redirects=False, timeout=40).status_code in (301, 302))

print('\n=== RESUMEN ===')
fails = [x for x in results if not x[1]]
print(f'Total: {len(results)}  PASS: {len(results)-len(fails)}  FAIL: {len(fails)}')
for n, ok, ex in results:
    if not ok: print('  FAIL:', n, ex)
sys.exit(1 if fails else 0)
