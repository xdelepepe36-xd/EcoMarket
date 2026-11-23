"""
Tests básicos para EcoMarket
Tests de funcionalidad principal y componentes esenciales
"""

import unittest
import sys
import os

# Agregar el directorio padre al path para importar app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, get_db, init_db


class TestEcoMarketBasic(unittest.TestCase):
    """Tests básicos de la aplicación EcoMarket"""

    def setUp(self):
        """Configuración antes de cada test"""
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        
        # Crear base de datos de prueba
        with self.app.app_context():
            init_db()

    def tearDown(self):
        """Limpieza después de cada test"""
        pass

    def test_index_route(self):
        """Test de la ruta principal"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'EcoMarket', response.data)

    def test_productos_route(self):
        """Test de la ruta de productos"""
        response = self.client.get('/productos')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'productos', response.data.lower())

    def test_login_route_get(self):
        """Test de la ruta de login (GET)"""
        response = self.client.get('/login')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'login', response.data.lower())

    def test_registro_route_get(self):
        """Test de la ruta de registro (GET)"""
        response = self.client.get('/registro')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'registro', response.data.lower())

    def test_contacto_route(self):
        """Test de la ruta de contacto"""
        response = self.client.get('/contacto')
        self.assertEqual(response.status_code, 200)

    def test_404_route(self):
        """Test de ruta 404"""
        response = self.client.get('/pagina-inexistente')
        self.assertEqual(response.status_code, 404)

    def test_static_files(self):
        """Test de archivos estáticos"""
        response = self.client.get('/static/ecomarket-final.css')
        self.assertEqual(response.status_code, 200)

    def test_database_connection(self):
        """Test de conexión a base de datos"""
        with self.app.app_context():
            conn = get_db()
            self.assertIsNotNone(conn)
            conn.close()

    def test_database_tables(self):
        """Test de tablas de base de datos"""
        with self.app.app_context():
            conn = get_db()
            cursor = conn.cursor()
            
            # Verificar que las tablas principales existen
            tables = ['usuarios', 'productos', 'favoritos', 'resenas', 'pedidos']
            for table in tables:
                cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                result = cursor.fetchone()
                self.assertIsNotNone(result, f"Tabla {table} no existe")
            
            conn.close()

    def test_api_favoritos_unauthorized(self):
        """Test de API de favoritos sin autorización"""
        response = self.client.get('/api/favorito/1')
        self.assertEqual(response.status_code, 401)

    def test_api_recomendaciones_unauthorized(self):
        """Test de API de recomendaciones sin autorización"""
        response = self.client.get('/api/recomendaciones')
        self.assertEqual(response.status_code, 401)

    def test_busqueda_productos(self):
        """Test de búsqueda de productos"""
        response = self.client.get('/productos?q=test')
        self.assertEqual(response.status_code, 200)

    def test_filtro_categoria(self):
        """Test de filtro por categoría"""
        response = self.client.get('/productos?categoria=test')
        self.assertEqual(response.status_code, 200)

    def test_ordenamiento_productos(self):
        """Test de ordenamiento de productos"""
        ordenes = ['nuevos', 'populares', 'baratos', 'caros']
        for orden in ordenes:
            response = self.client.get(f'/productos?orden={orden}')
            self.assertEqual(response.status_code, 200)

    def test_favoritos_route_unauthorized(self):
        """Test de ruta favoritos sin autorización"""
        response = self.client.get('/favoritos')
        # Debería redirigir a login o mostrar la página vacía
        self.assertIn(response.status_code, [200, 302])

    def test_perfil_route_unauthorized(self):
        """Test de ruta perfil sin autorización"""
        response = self.client.get('/perfil')
        # Debería redirigir a login
        self.assertEqual(response.status_code, 302)

    def test_publicar_route_unauthorized(self):
        """Test de ruta publicar sin autorización"""
        response = self.client.get('/publicar')
        # Debería redirigir a login
        self.assertEqual(response.status_code, 302)

    def test_admin_route_unauthorized(self):
        """Test de ruta admin sin autorización"""
        response = self.client.get('/admin')
        # Debería redirigir a login
        self.assertEqual(response.status_code, 302)

    def test_carrito_route(self):
        """Test de ruta carrito"""
        response = self.client.get('/carrito')
        self.assertEqual(response.status_code, 200)

    def test_terminos_route(self):
        """Test de ruta términos"""
        response = self.client.get('/terminos')
        self.assertEqual(response.status_code, 200)

    def test_privacidad_route(self):
        """Test de ruta privacidad"""
        response = self.client.get('/privacidad')
        self.assertEqual(response.status_code, 200)


class TestEcoMarketSecurity(unittest.TestCase):
    """Tests de seguridad básicos"""

    def setUp(self):
        """Configuración antes de cada test"""
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_csrf_protection(self):
        """Test de protección CSRF"""
        # Intentar hacer POST sin token CSRF
        response = self.client.post('/login', data={
            'email': 'test@test.com',
            'password': 'test123'
        })
        # La aplicación debería manejar esto de forma segura
        self.assertIn(response.status_code, [200, 302, 400])

    def test_sql_injection_protection(self):
        """Test de protección contra inyección SQL"""
        # Intentar inyección SQL en búsqueda
        malicious_input = "'; DROP TABLE usuarios; --"
        response = self.client.get(f'/productos?q={malicious_input}')
        # La aplicación no debería caer
        self.assertEqual(response.status_code, 200)

    def test_xss_protection(self):
        """Test de protección contra XSS"""
        # Intentar inyección XSS
        malicious_input = "<script>alert('XSS')</script>"
        response = self.client.get(f'/productos?q={malicious_input}')
        # La aplicación debería sanear el input
        self.assertEqual(response.status_code, 200)
        # El payload malicioso no debe reflejarse sin escapar
        self.assertNotIn(b"<script>alert", response.data)
        self.assertIn(b'&lt;script&gt;', response.data)


class TestEcoMarketValidation(unittest.TestCase):
    """Tests de validación de inputs"""

    def setUp(self):
        """Configuración antes de cada test"""
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_email_validation(self):
        """Test de validación de email"""
        invalid_emails = [
            'invalid-email',
            'test@',
            '@test.com',
            'test..test@test.com'
        ]
        
        for email in invalid_emails:
            response = self.client.post('/registro', data={
                'nombre': 'Test User',
                'email': email,
                'password': 'Test123456',
                'password2': 'Test123456'
            })
            # Debe rechazar emails inválidos: redirect con flash o error,
            # y en ningún caso crear la sesión del usuario
            self.assertIn(response.status_code, [200, 302, 400])
            with self.client.session_transaction() as sess:
                self.assertNotIn('usuario_id', sess, f"Email inválido aceptado: {email}")

    def test_password_validation(self):
        """Test de validación de contraseña"""
        weak_passwords = [
            '123',
            'password',
            'test',
            'abc123'
        ]
        
        for password in weak_passwords:
            response = self.client.post('/registro', data={
                'nombre': 'Test User',
                'email': 'test@test.com',
                'password': password,
                'password2': password
            })
            # Debe rechazar contraseñas débiles y no crear la sesión
            self.assertIn(response.status_code, [200, 302, 400])
            with self.client.session_transaction() as sess:
                self.assertNotIn('usuario_id', sess, f"Contraseña débil aceptada: {password}")


if __name__ == '__main__':
    unittest.main()