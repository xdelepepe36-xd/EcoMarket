import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import app as app_mod
from app import app, get_db

# ── Limpieza de datos de prueba previos ──
_conn = get_db()
for _r in _conn.execute("SELECT id FROM usuarios WHERE email='juan@eco.com'").fetchall():
    _uid = _r['id']
    _conn.execute('DELETE FROM pedido_items WHERE pedido_id IN (SELECT id FROM pedidos WHERE usuario_id=?)', (_uid,))
    _conn.execute('DELETE FROM pedidos WHERE usuario_id=?', (_uid,))
    for _t in ('notificaciones', 'xp', 'seguidores', 'logros', 'insignias', 'historial_busquedas'):
        try:
            _conn.execute('DELETE FROM {} WHERE usuario_id=?'.format(_t), (_uid,))
        except Exception:
            pass
    _conn.execute('DELETE FROM seguidores WHERE seguidor_id=? OR seguido_id=?', (_uid, _uid))
    _conn.execute('DELETE FROM usuarios WHERE id=?', (_uid,))
_conn.execute('DELETE FROM pedido_items')
_conn.execute('DELETE FROM pedidos')
_conn.commit()
_conn.close()

app.config['TESTING'] = True
app.config['WTF_CSRF_ENABLED'] = False
app.config['SERVER_NAME'] = 'localhost'

ok = []
def check(name, cond, extra=''):
    ok.append((name, bool(cond), extra))
    print(('PASS' if cond else 'FAIL'), name, extra)

with app.test_client() as c:
    # 1) Productos en BD tras seed aditivo
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    check('productos_en_db == 65', total == 65, f'-> {total}')
    conn.close()

    # 2) Checkout sin sesión -> 401
    r = c.post('/checkout', json={
        'nombre':'Juan','email':'juan@eco.com','direccion':'Av Los Alamos 123','ciudad':'Lima',
        'metodo_pago':'card','items':[{'nombre':'X','precio':10,'cantidad':1}]
    })
    check('checkout_sin_sesion_401', r.status_code == 401, f'-> {r.status_code}')

    # 3) Registro con datos inválidos -> no crea usuario
    antes = get_db().execute('SELECT COUNT(*) FROM usuarios').fetchone()[0]
    r = c.post('/registro', data={
        'nombre': 'A', 'email': 'mal', 'password': '123',
        'password2': '456', 'telefono': '12', 'ciudad': 'x'
    }, follow_redirects=True)
    despues = get_db().execute('SELECT COUNT(*) FROM usuarios').fetchone()[0]
    check('registro_invalido_rechazado', despues == antes, f'antes={antes} despues={despues} status={r.status_code}')

    # 4) Registro válido -> crea usuario
    c.post('/registro', data={
        'nombre': 'Juan', 'apellidos': 'Perez', 'email': 'juan@eco.com',
        'password': 'Clave1234', 'password2': 'Clave1234', 'telefono': '+51 999 888 777', 'ciudad': 'Lima'
    }, follow_redirects=True)
    creado = get_db().execute("SELECT id FROM usuarios WHERE email='juan@eco.com'").fetchone()
    check('registro_valido_crea_usuario', creado is not None)

    # 5) Checkout con dirección inválida -> 400 con campos
    r = c.post('/checkout', json={
        'nombre':'Juan','email':'juan@eco.com','direccion':'abc','ciudad':'Lima',
        'metodo_pago':'card','items':[{'nombre':'X','precio':10,'cantidad':1}]
    })
    js = r.get_json() or {}
    check('checkout_direccion_invalida_400', r.status_code == 400 and 'direccion' in (js.get('campos') or {}), f'-> {r.status_code} {js}')

    # 6) Checkout con datos válidos -> success y crea pedido
    r = c.post('/checkout', json={
        'nombre':'Juan','apellido':'Perez','email':'juan@eco.com','telefono':'999888777',
        'direccion':'Av Los Alamos 123','ciudad':'Lima','metodo_pago':'yape',
        'items':[{'nombre':'X','precio':10,'cantidad':2}]
    })
    check('checkout_valido_crea_pedido', r.status_code == 200 and r.get_json().get('success'), f'-> {r.status_code}')

    # 7) set_lang EN -> el siguiente error de checkout debe venir en inglés
    r = c.post('/api/set_lang', json={'lang':'en'})
    check('set_lang_en', r.status_code == 200 and r.get_json().get('lang') == 'en', f'-> {r.status_code}')
    r = c.post('/checkout', json={
        'nombre':'Juan','email':'juan@eco.com','direccion':'abc','ciudad':'Lima',
        'metodo_pago':'card','items':[{'nombre':'X','precio':10,'cantidad':1}]
    })
    js = r.get_json() or {}
    campo_dir = (js.get('campos') or {}).get('direccion', '')
    check('checkout_error_en_ingles', 'address' in campo_dir.lower(), f'-> {campo_dir}')

    # 8) Google auth con token inválido -> 401
    r = c.post('/auth/google', json={'credential':'token.falso'})
    check('google_token_invalido_401', r.status_code == 401, f'-> {r.status_code}')

print('\nRESUMEN:', sum(1 for _, b, _ in ok if b), '/', len(ok))