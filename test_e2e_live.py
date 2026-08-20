"""Test e2e en produccion (EcoMarket) - datos de prueba claramente marcados."""
import re, time, requests

BASE = 'https://ecomarket-19.onrender.com'
s = requests.Session()
s.headers['User-Agent'] = 'EcoMarket-E2E-Test/1.0'

uniq = str(int(time.time()))
email = f'teste2e.{uniq}@ecomarket.test'
nombre = 'TestE2E'
pw = 'Clave12345x'

# 1) Obtener pagina de registro para leer CSRF (genera cookie de sesion)
r = s.get(BASE + '/registro')
print('[registro GET]', r.status_code)
m = r.text
import re
tok = None
mm = re.search(r'name="csrf_token" value="([^"]+)"', m)
if mm: tok = mm.group(1)
print('csrf obtenido:', bool(tok))
assert tok, 'No se pudo obtener CSRF'

# 2) Registrar nuevo usuario de prueba
data_reg = {
    'csrf_token': tok,
    'nombre': 'Cliente',
    'apellidos': 'Prueba',
    'email': email,
    'password': pw,
    'password2': pw,
    'telefono': '+51 999 999 999',
    'ciudad': 'Lima',
}
r = s.post(BASE + '/registro', data=data_reg, allow_redirects=True)
print('POST /registro', r.status_code, '->', r.url[-40:])
assert r.status_code == 200

# 3) Checkout con cupon ECO10 y un producto real
pid = None
rr = s.get(BASE + '/api/recommendations').json()
if rr.get('products'): pid = rr['products'][0]['id']
nombre_item = 'Producto de prueba (E2E)'
items = [{'id': pid, 'nombre': nombre_item, 'precio': 6, 'cantidad': 6}]
check = {
    'nombre': 'Cliente', 'apellido': 'Prueba', 'email': email,
    'telefono': '+51 999 999 999', 'direccion': 'Av Prueba 123, Lima',
    'ciudad': 'Lima', 'items': items, 'metodo_pago': 'card', 'coupon': 'ECO10',
}
r = s.post(BASE + '/checkout', json=check, allow_redirects=False)
print('POST /checkout', r.status_code, r.text[:200])
try:
    chk = r.json()
    print('checkout json:', chk)
except Exception:
    chk = {}
assert chk.get('success')

pid2 = chk['pedido_id']
# 4) Confirmacion
r = s.get(BASE + f'/confirmacion?pedido_id={pid2}')
body = r.text
print('GET /confirmacion', r.status_code, 'contiene #ECO->', f'#ECO-{pid2}' in body or 'ECO-' in body)
# 5) Admin estado bloqueado para no-admin
r = s.post(BASE + f'/admin/pedido/{pid2}/estado', data={'estado': 'entregado'}, allow_redirects=False)
print('POST admin/estado (no-admin)', r.status_code, '->', r.url[-30:])
print('EMAIL_TEST:', email)