import os, tempfile, re, traceback
os.environ['DATABASE_URL'] = tempfile.mktemp(suffix='.db')
import app
app.app.config['TESTING'] = True
c = app.app.test_client()

r = c.get('/registro')
tok = re.search(r'name="csrf_token" value="([^"]+)"', r.get_data(as_text=True)).group(1)
email = 'prueba.local@test.com'
rr = c.post('/registro', data={
    'csrf_token': tok, 'nombre': 'Ana', 'apellidos': 'Perez', 'email': email,
    'password': 'Prueba12345', 'password2': 'Prueba12345',
    'telefono': '51999999999', 'ciudad': 'Lima',
}, follow_redirects=False)
print('registro status', rr.status_code, 'loc', rr.headers.get('Location'))
print('registro body tail:', rr.get_data(as_text=True)[-400:])

# Inspeccionar estado de la BD y la sesión
import sqlite3
tdb = os.environ['DATABASE_URL']
db = sqlite3.connect(tdb)
print('usuarios:', db.execute('SELECT COUNT(*) FROM usuarios').fetchall())
db.close()
with c.session_transaction() as sess:
    print('session user:', sess.get('usuario_id'), sess.get('email'))
prod = c.get('/api/recommendations').get_json()['products'][0]
print('producto', prod['id'], prod['precio'])
try:
    rr = c.post('/checkout', json={
        'nombre': 'Ana', 'apellido': 'Perez', 'email': email,
        'telefono': '+51 999 999 999', 'direccion': 'Av Prueba 123, Lima',
        'ciudad': 'Lima',
        'items': [{'id': prod['id'], 'nombre': prod['nombre'], 'precio': prod['precio'], 'cantidad': 6}],
        'metodo_pago': 'card', 'coupon': 'ECO10',
    })
    print('checkout', rr.status_code, rr.get_data(as_text=True)[:300])
except Exception:
    traceback.print_exc()