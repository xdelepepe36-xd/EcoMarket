"""
Tests unitarios para la aplicación EcoMarket
"""
import pytest
import unittest
from unittest.mock import Mock, patch, MagicMock
import json
import os
import sys

# Agregar el directorio padre al path para importar app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


class TestEcoMarketApp(unittest.TestCase):
    """Tests para la aplicación principal de EcoMarket"""

    def setUp(self):
        """Configuración inicial para cada test"""
        # Importar app después de configurar el path
        from app import app
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        """Limpieza después de cada test"""
        self.app_context.pop()

    def test_index_route(self):
        """Test de la ruta principal"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'EcoMarket', response.data)

    def test_productos_route(self):
        """Test de la ruta de productos"""
        response = self.client.get('/productos')
        self.assertEqual(response.status_code, 200)

    def test_login_route(self):
        """Test de la ruta de login"""
        response = self.client.get('/login')
        self.assertEqual(response.status_code, 200)

    def test_registro_route(self):
        """Test de la ruta de registro"""
        response = self.client.get('/registro')
        self.assertEqual(response.status_code, 200)

    def test_api_route(self):
        """Test de ruta API"""
        response = self.client.get('/api/productos')
        self.assertEqual(response.status_code, 200)


class TestSecurityFunctions(unittest.TestCase):
    """Tests para funciones de seguridad"""

    def setUp(self):
        """Configuración inicial"""
        from app import sanitize_string, validate_email, validate_password
        self.sanitize_string = sanitize_string
        self.validate_email = validate_email
        self.validate_password = validate_password

    def test_sanitize_string(self):
        """Test de sanitización de strings"""
        # Test de HTML injection
        malicious = "<script>alert('xss')</script>"
        sanitized = self.sanitize_string(malicious)
        self.assertNotIn('<script>', sanitized)
        self.assertNotIn('alert', sanitized)

        # Test de SQL injection
        sql_injection = "'; DROP TABLE users; --"
        sanitized = self.sanitize_string(sql_injection)
        self.assertNotIn('DROP TABLE', sanitized)

    def test_validate_email(self):
        """Test de validación de email"""
        # Emails válidos
        self.assertTrue(self.validate_email('test@example.com'))
        self.assertTrue(self.validate_email('user.name+tag@example.co.uk'))

        # Emails inválidos
        self.assertFalse(self.validate_email('invalid'))
        self.assertFalse(self.validate_email('test@'))
        self.assertFalse(self.validate_email('@example.com'))

    def test_validate_password(self):
        """Test de validación de contraseña"""
        # Contraseñas válidas
        self.assertTrue(self.validate_password('SecurePass123!'))
        self.assertTrue(self.validate_password('Another#456Pass'))

        # Contraseñas inválidas
        self.assertFalse(self.validate_password('short'))
        self.assertFalse(self.validate_password('nouppercase123!'))
        self.assertFalse(self.validate_password('NOLOWERCASE123!'))
        self.assertFalse(self.validate_password('NoNumbers!'))
        self.assertFalse(self.validate_password('NoSpecialChars123'))


class TestDatabaseFunctions(unittest.TestCase):
    """Tests para funciones de base de datos"""

    def setUp(self):
        """Configuración inicial"""
        from app import get_db_connection, get_categorias
        self.get_db_connection = get_db_connection
        self.get_categorias = get_categorias

    @patch('app.get_db_connection')
    def test_get_categorias(self, mock_get_db_connection):
        """Test de obtención de categorías"""
        # Mock de la conexión a la base de datos
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_cursor.fetchall.return_value = [
            (1, 'Electrónica'),
            (2, 'Ropa'),
            (3, 'Hogar')
        ]
        mock_get_db_connection.return_value = mock_connection

        categorias = self.get_categorias()
        self.assertEqual(len(categorias), 3)
        self.assertEqual(categorias[0]['nombre'], 'Electrónica')


class TestAPIEndpoints(unittest.TestCase):
    """Tests para endpoints de API"""

    def setUp(self):
        """Configuración inicial"""
        from app import app
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_api_productos(self):
        """Test de endpoint de productos"""
        response = self.client.get('/api/productos')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('productos', data)

    def test_api_categorias(self):
        """Test de endpoint de categorías"""
        response = self.client.get('/api/categorias')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('categorias', data)

    def test_api_search(self):
        """Test de endpoint de búsqueda"""
        response = self.client.get('/api/search?q=test')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('productos', data)


class TestUserAuthentication(unittest.TestCase):
    """Tests para autenticación de usuarios"""

    def setUp(self):
        """Configuración inicial"""
        from app import app
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_registro_usuario(self):
        """Test de registro de usuario"""
        response = self.client.post('/registro', data={
            'nombre': 'Test User',
            'email': 'test@example.com',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!'
        })
        # La respuesta puede ser redirect u otra cosa dependiendo de la implementación
        self.assertIn(response.status_code, [200, 302])

    def test_login_usuario(self):
        """Test de login de usuario"""
        response = self.client.post('/login', data={
            'email': 'test@example.com',
            'password': 'SecurePass123!'
        })
        self.assertIn(response.status_code, [200, 302])


class TestProductOperations(unittest.TestCase):
    """Tests para operaciones de productos"""

    def setUp(self):
        """Configuración inicial"""
        from app import app
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_publicar_producto(self):
        """Test de publicación de producto"""
        response = self.client.post('/publicar', data={
            'nombre': 'Test Product',
            'descripcion': 'Test Description',
            'precio': 100.50,
            'categoria': '1',
            'stock': 10,
            'condicion': 'nuevo'
        })
        self.assertIn(response.status_code, [200, 302])


class TestCartOperations(unittest.TestCase):
    """Tests para operaciones del carrito"""

    def setUp(self):
        """Configuración inicial"""
        from app import app
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_agregar_carrito(self):
        """Test de agregar al carrito"""
        response = self.client.post('/agregar_carrito', data={
            'producto_id': 1,
            'cantidad': 2
        })
        self.assertIn(response.status_code, [200, 302])

    def test_ver_carrito(self):
        """Test de ver carrito"""
        response = self.client.get('/carrito')
        self.assertEqual(response.status_code, 200)


class TestPerformanceMetrics(unittest.TestCase):
    """Tests para métricas de rendimiento"""

    def test_response_time(self):
        """Test de tiempo de respuesta"""
        from app import app
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

        import time
        start_time = time.time()
        response = self.client.get('/')
        end_time = time.time()

        response_time = end_time - start_time
        self.assertLess(response_time, 2.0)  # Menos de 2 segundos


if __name__ == '__main__':
    unittest.main()