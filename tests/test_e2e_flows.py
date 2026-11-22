"""Tests E2E de flujos completos: registro → login → compra."""
import sqlite3
import unittest
import uuid


class TestFlujoCompraCompleto(unittest.TestCase):
    def setUp(self):
        from app import app
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.email = f'e2e_{uuid.uuid4().hex[:10]}@test.com'

    def _csrf(self, url):
        import re
        html = self.client.get(url).get_data(as_text=True)
        m = re.search(r'name="csrf_token"[^>]*value="([^"]+)"', html)
        return m.group(1) if m else ''

    def _registrar_y_login(self):
        tok = self._csrf('/registro')
        r = self.client.post('/registro', data={
            'csrf_token': tok,
            'nombre': 'Comprador',
            'apellidos': 'Prueba',
            'email': self.email,
            'password': 'ClaveSegura123',
            'password2': 'ClaveSegura123',
            'telefono': '999888777',
            'ciudad': 'Lima',
        })
        self.assertIn(r.status_code, [200, 302])
        with self.client.session_transaction() as s:
            self.assertIn('usuario_id', s)

    def test_login_con_cuenta_creada(self):
        """Login con credenciales válidas tras cerrar sesión."""
        self._registrar_y_login()
        self.client.get('/logout')
        tok = self._csrf('/login')
        r = self.client.post('/login', data={
            'csrf_token': tok,
            'email': self.email,
            'password': 'ClaveSegura123',
        })
        self.assertIn(r.status_code, [200, 302])
        with self.client.session_transaction() as s:
            self.assertIn('usuario_id', s)

    def test_registro_login_checkout(self):
        """Flujo completo: registro → login → checkout → pedido en BD."""
        self._registrar_y_login()

        # producto válido desde la BD
        conn = sqlite3.connect('data/ecomarket.db')
        conn.row_factory = sqlite3.Row
        prod = conn.execute(
            "SELECT id, precio FROM productos WHERE COALESCE(vendido,0)=0 AND stock > 0 LIMIT 1"
        ).fetchone()
        conn.close()
        if not prod:
            self.skipTest('Sin productos disponibles')

        r = self.client.post('/checkout', json={
            'nombre': 'Comprador',
            'apellido': 'Prueba',
            'email': self.email,
            'telefono': '999888777',
            'direccion': 'Av. Prueba 123',
            'ciudad': 'Lima',
            'metodo_pago': 'yape',
            'items': [{'id': prod['id'], 'cantidad': 1}],
        })
        self.assertEqual(r.status_code, 200)
        data = r.get_json()
        self.assertTrue(data.get('success'), data)
        pedido_id = data['pedido_id']

        # verificar pedido persistido
        conn = sqlite3.connect('data/ecomarket.db')
        conn.row_factory = sqlite3.Row
        p = conn.execute('SELECT * FROM pedidos WHERE id = ?', (pedido_id,)).fetchone()
        item = conn.execute('SELECT * FROM pedido_items WHERE pedido_id = ?', (pedido_id,)).fetchone()
        conn.close()
        self.assertIsNotNone(p)
        self.assertIsNotNone(item)
        self.assertEqual(item['producto_id'], prod['id'])

    def test_checkout_sin_login_falla(self):
        """Checkout sin sesión debe rechazarse."""
        r = self.client.post('/checkout', json={
            'nombre': 'X', 'apellido': 'Y', 'email': 'x@x.com',
            'telefono': '123456789', 'direccion': 'Calle 1', 'ciudad': 'Lima',
            'metodo_pago': 'yape', 'items': [{'id': 1, 'cantidad': 1}],
        })
        self.assertEqual(r.status_code, 401)

    def test_chat_memoria(self):
        """La IA recuerda contexto: búsqueda → 'el primero' → 'otros'."""
        with self.client.session_transaction() as s:
            s['lang'] = 'es'
        r1 = self.client.post('/api/chat', json={'message': 'dame productos de accesorios'})
        self.assertEqual(r1.status_code, 200)
        r2 = self.client.post('/api/chat', json={'message': 'el primero'})
        d2 = r2.get_json()
        self.assertIn('producto', (d2.get('reply') or '').lower())
        r3 = self.client.post('/api/chat', json={'message': 'otros'})
        self.assertEqual(r3.status_code, 200)


if __name__ == '__main__':
    unittest.main()
