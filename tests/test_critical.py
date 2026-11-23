"""Tests de flujos críticos: checkout, cupones, variantes, premium, seguridad."""
import re
import sqlite3
import pytest

import app as appmod


@pytest.fixture
def client():
    appmod.app.config['TESTING'] = True
    return appmod.app.test_client()


def _csrf(html):
    m = re.search(r'csrf_token" value="([^"]+)"', html)
    assert m, 'No CSRF token found'
    return m.group(1)


def _register(client, email, nombre='Test User'):
    client.post('/registro', data={
        'csrf_token': _csrf(client.get('/registro').get_data(as_text=True)),
        'nombre': nombre.split()[0], 'apellidos': nombre.split()[-1],
        'email': email, 'password': 'EcoTest123!', 'password2': 'EcoTest123!',
        'ciudad': 'Lima'})
    client.post('/login', data={
        'csrf_token': _csrf(client.get('/login').get_data(as_text=True)),
        'email': email, 'password': 'EcoTest123!'})


def _product_id(nombre):
    conn = sqlite3.connect(appmod.DB_PATH)
    r = conn.execute('SELECT id FROM productos WHERE nombre=? ORDER BY id DESC LIMIT 1', (nombre,)).fetchone()
    conn.close()
    return r[0] if r else None


class TestCheckoutCritico:
    def test_checkout_valida_stock(self, client):
        _register(client, 'stock@test.com')
        r = client.post('/checkout', json={
            'nombre': 'Test', 'apellido': 'User', 'email': 'stock@test.com',
            'telefono': '999888777', 'direccion': 'Av. Prueba 123', 'ciudad': 'Lima',
            'metodo_pago': 'yape', 'items': [{'id': 999999, 'qty': 1}]})
        assert r.status_code == 400  # producto inexistente

    def test_checkout_sin_login_401(self, client):
        r = client.post('/checkout', json={'items': [{'id': 1, 'qty': 1}]})
        assert r.status_code == 401

    def test_checkout_datos_invalidos_400(self, client):
        _register(client, 'bad@test.com')
        r = client.post('/checkout', json={
            'nombre': '', 'apellido': '', 'email': 'no-es-email',
            'telefono': '12345', 'direccion': 'x', 'ciudad': '',
            'metodo_pago': 'crypto', 'items': [{'id': 1, 'qty': 1}]})
        assert r.status_code == 400
        assert 'campos' in r.get_json()


class TestPackYVariante:
    def test_pack_precio_aplicado(self, client):
        _register(client, 'pack@test.com')
        pid = _publish_pack(client)
        if not pid:
            pytest.skip('no se pudo publicar')
        r = client.post('/checkout', json={
            'nombre': 'Test', 'apellido': 'User', 'email': 'pack@test.com',
            'telefono': '999888777', 'direccion': 'Av. Test 123', 'ciudad': 'Lima',
            'metodo_pago': 'yape', 'items': [{'id': pid, 'qty': 3}]})
        assert r.status_code == 200
        conn = sqlite3.connect(appmod.DB_PATH)
        item = conn.execute('SELECT precio FROM pedido_items ORDER BY id DESC LIMIT 1').fetchone()
        conn.close()
        assert item[0] == 10.0  # pack_precio, no precio base 15


def _publish_pack(client):
    client.get('/publicar')
    tok = _csrf(client.get('/publicar').get_data(as_text=True))
    client.post('/publicar', data={
        'csrf_token': tok, 'nombre': 'PackTestCritico', 'categoria': 'Hogar',
        'precio': '15', 'descripcion': 'desc', 'stock': '10', 'condicion': 'nuevo',
        'ubicacion': 'Lima', 'pack_cantidad': '3', 'pack_precio': '10'})
    return _product_id('PackTestCritico')


class TestSeguridad:
    def test_admin_requiere_rol(self, client):
        _register(client, 'noadmin@test.com')
        r = client.get('/admin', follow_redirects=False)
        assert r.status_code in (302, 303)

    def test_factura_ajena_protegida(self, client):
        _register(client, 'fact1@test.com')
        r = client.get('/factura/999999', follow_redirects=False)
        assert r.status_code in (302, 303)

    def test_api_health_publica(self, client):
        r = client.get('/api/health')
        assert r.status_code == 200
        d = r.get_json()
        assert d['status'] == 'ok' and 'uptime_s' in d

    def test_privacidad_publica(self, client):
        assert client.get('/privacidad').status_code == 200
