"""
EcoMarket - Marketplace Ecológico v3.2
Backend completo con SQLite, subida de imágenes, API REST, dashboard y más.
Optimizado con mejor manejo de errores, caching, seguridad y accesibilidad.
"""
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory, send_file, Response
from whitenoise import WhiteNoise
import sqlite3
import os
import json
from functools import wraps
from datetime import datetime, timedelta, timezone
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import hashlib
import secrets
import re
import unicodedata
import hmac
import time
from PIL import Image
import logging
from functools import lru_cache

# Importar sistemas de mejoras adicionales
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'mejoras-adicionales'))
try:
    from quality_control import QualityControlSystem
    from inventory_system import InventorySystem
    from geolocation_system import GeolocationSystem
    from ai_description_generator import AIDescriptionGenerator
    from support_system import SupportSystem
    from newsletter_system import NewsletterSystem
    SISTEMAS_ADICIONALES = True
except ImportError:
    SISTEMAS_ADICIONALES = False

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get('DATABASE_URL', os.path.join(BASE_DIR, 'data', 'ecomarket.db'))
UPLOAD_FOLDER = os.environ.get('UPLOADS_DIR', os.path.join(BASE_DIR, 'static', 'uploads'))

# Inicializar sistemas adicionales
if SISTEMAS_ADICIONALES:
    quality_control = QualityControlSystem()
    inventory_system = InventorySystem()
    geolocation_system = GeolocationSystem()
    ai_generator = AIDescriptionGenerator()
    support_system = SupportSystem()
    newsletter_system = NewsletterSystem()
else:
    quality_control = None
    inventory_system = None
    geolocation_system = None
    ai_generator = None
    support_system = None
    newsletter_system = None

# Headers de seguridad HTTP profesionales
@app.after_request
def add_security_headers(response):
    """Agrega headers de seguridad a todas las respuestas."""
    # Protección contra XSS
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # HSTS (solo en producción con HTTPS)
    if os.environ.get('FLASK_ENV') == 'production':
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    # CSP básico
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https:;"
    
    # Referrer Policy
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # Permissions Policy
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=(), payment=(self)'
    
    return response

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(BASE_DIR, 'ecomarket.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Logging de debug para producción
logger.info(f"BASE_DIR: {BASE_DIR}")
logger.info(f"Static folder exists: {os.path.exists(os.path.join(BASE_DIR, 'static'))}")
logger.info(f"Static folder path: {os.path.join(BASE_DIR, 'static')}")
if os.path.exists(os.path.join(BASE_DIR, 'static')):
    logger.info(f"Static files: {os.listdir(os.path.join(BASE_DIR, 'static'))}")

# Configurar WhiteNoise para servir archivos estáticos eficientemente en producción
try:
    app.wsgi_app = WhiteNoise(
        app.wsgi_app, 
        root=os.path.join(BASE_DIR, 'static'),
        autorefresh=True,
        max_age=3600  # 1 hora de caché en navegador
    )
    logger.info("WhiteNoise configurado exitosamente")
except Exception as e:
    logger.error(f"Error configurando WhiteNoise: {e}")


# ── Sistema de Caché Simple Optimizado ─────────────────────────────────────────────────

class SimpleCache:
    """Sistema de caché en memoria con expiración automática."""
    
    def __init__(self):
        self.cache = {}
        self.timestamps = {}
        self.default_ttl = 300  # 5 minutos por defecto
        self.max_size = 1000  # Máximo de entradas para no sobrecargar
        self.last_cleanup = time.time()
    
    def get(self, key):
        """Obtiene un valor del caché si existe y no ha expirado."""
        # Limpieza automática cada 5 minutos
        if time.time() - self.last_cleanup > 300:
            self._auto_cleanup()
        
        if key not in self.cache:
            return None
        
        # Verificar si ha expirado
        if key in self.timestamps:
            if time.time() - self.timestamps[key] > self.default_ttl:
                del self.cache[key]
                del self.timestamps[key]
                return None
        
        return self.cache[key]
    
    def set(self, key, value, ttl=None):
        """Guarda un valor en el caché con TTL opcional."""
        # No cachear si está lleno para no sobrecargar
        if len(self.cache) >= self.max_size:
            self._evict_oldest()
        
        self.cache[key] = value
        self.timestamps[key] = time.time()
    
    def delete(self, key):
        """Elimina un valor del caché."""
        if key in self.cache:
            del self.cache[key]
        if key in self.timestamps:
            del self.timestamps[key]
    
    def clear(self):
        """Limpia todo el caché."""
        self.cache.clear()
        self.timestamps.clear()
    
    def cleanup_expired(self):
        """Limpia entradas expiradas."""
        current_time = time.time()
        expired_keys = [
            key for key, timestamp in self.timestamps.items()
            if current_time - timestamp > self.default_ttl
        ]
        
        for key in expired_keys:
            self.delete(key)
        
        return len(expired_keys)
    
    def _auto_cleanup(self):
        """Limpieza automática periódica."""
        self.last_cleanup = time.time()
        self.cleanup_expired()
        
        # Si todavía hay muchas entradas, eliminar las más viejas
        if len(self.cache) > self.max_size * 0.8:
            self._evict_oldest(int(self.max_size * 0.5))
    
    def _evict_oldest(self, count=1):
        """Elimina las entradas más viejas."""
        if len(self.timestamps) <= count:
            self.clear()
            return
        
        # Ordenar por timestamp y eliminar las más viejas
        sorted_keys = sorted(self.timestamps.items(), key=lambda x: x[1])[:count]
        for key, _ in sorted_keys:
            self.delete(key)
    
    def get_stats(self):
        """Obtiene estadísticas del caché."""
        return {
            'size': len(self.cache),
            'max_size': self.max_size,
            'usage_percent': (len(self.cache) / self.max_size) * 100,
            'last_cleanup': self.last_cleanup
        }


# Instancia global del caché
cache = SimpleCache()


def cached(ttl=300, key_prefix=''):
    """Decorator para cachear resultados de funciones."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generar clave del caché
            cache_key = f"{key_prefix}{func.__name__}_{str(args)}_{str(sorted(kwargs.items()))}"
            
            # Intentar obtener del caché
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Ejecutar función y cachear resultado
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator


# ── Filtros Jinja2 personalizados ────────────────────────────────────────────

@app.template_filter('fromjson')
def fromjson_filter(value):
    """Convierte una cadena JSON a un objeto Python."""
    if not value:
        return {}
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return {}

# Configuración de subida de imágenes
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}  # SVG excluido (riesgo XSS)
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
ITEMS_PER_PAGE = 12
ITEMS_PER_PAGE_SMALL = 6  # Para móviles y carga rápida


@app.context_processor
def inject_globals():
    """Variables disponibles en todas las plantillas."""
    no_leidas = 0
    if session.get('usuario_id'):
        try:
            conn = get_db()
            no_leidas = conn.execute(
                'SELECT COUNT(*) FROM notificaciones WHERE usuario_id = ? AND leida = 0',
                (session['usuario_id'],)
            ).fetchone()[0]
            conn.close()
        except Exception:
            pass
    return {
        'google_client_id': os.environ.get('GOOGLE_CLIENT_ID', ''),
        'SITIO_NOMBRE': 'EcoMarket',
        'ANIO_ACTUAL': datetime.now().year,
        'notificaciones_no_leidas': no_leidas,
    }

# Imágenes por defecto para productos (Unsplash)
PRODUCT_IMAGES = {
    'Hogar': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    'Accesorios': 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=300&fit=crop',
    'Higiene': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop',
    'Jardín': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop',
    'Alimentación': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    'Ropa': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'
}

# Asegurar que la carpeta de uploads existe
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_product_image(categoria):
    return PRODUCT_IMAGES.get(categoria, PRODUCT_IMAGES['default'])


def create_thumbnail(image_path, size=(300, 300)):
    """Crea un thumbnail de una imagen de manera optimizada."""
    try:
        img = Image.open(image_path)
        img.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Generar nombre del thumbnail
        base, ext = os.path.splitext(image_path)
        thumb_path = f"{base}_thumb{ext}"
        
        # Optimizar imagen
        img.save(thumb_path, optimize=True, quality=85, progressive=True)
        logger.info(f"Thumbnail creado: {thumb_path}")
        return thumb_path
    except Exception as e:
        logger.error(f"Error creando thumbnail: {e}")
        return image_path


# ── Validaciones reutilizables ──────────────────────────────────────────────

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]{2,}$')


def is_valid_email(email):
    if not email or '..' in email.split('@')[0]:
        return False
    return bool(EMAIL_RE.match(email))


def sanitize_string(input_string, max_length=1000, allow_html=False):
    """Sanitiza strings para prevenir XSS y otros ataques."""
    if not input_string:
        return ""
    
    if not isinstance(input_string, str):
        input_string = str(input_string)
    
    # Truncar si es muy largo
    if len(input_string) > max_length:
        input_string = input_string[:max_length]
    
    if not allow_html:
        # Eliminar etiquetas HTML básicas
        input_string = re.sub(r'<[^>]+>', '', input_string)
        
        # Eliminar caracteres peligrosos
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00', '\x1a']
        for char in dangerous_chars:
            input_string = input_string.replace(char, '')
    
    # Eliminar espacios excesivos
    input_string = ' '.join(input_string.split())
    
    return input_string.strip()


def validate_url(url):
    """Valida que una URL sea segura."""
    if not url:
        return False
    
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        
        # Solo permitir http y https
        if parsed.scheme not in ['http', 'https']:
            return False
        
        # No permitir URLs vacías
        if not parsed.netloc:
            return False
        
        return True
    except:
        return False


def validate_file_upload(file):
    """Valida que un archivo subido sea seguro."""
    if not file:
        return False, "No se proporcionó archivo"
    
    # Verificar nombre de archivo
    filename = file.filename
    if not filename:
        return False, "Nombre de archivo vacío"
    
    # Verificar extensión
    if not allowed_file(filename):
        return False, "Tipo de archivo no permitido"
    
    # Verificar tamaño
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_CONTENT_LENGTH:
        return False, f"Archivo demasiado grande (máximo {MAX_CONTENT_LENGTH // (1024*1024)}MB)"
    
    if file_size == 0:
        return False, "Archivo vacío"
    
    return True, "Archivo válido"


def is_valid_nombre(nombre):
    """Valida un nombre: 2-80 caracteres, solo letras, espacios y apóstrofes."""
    if not nombre or len(nombre) < 2 or len(nombre) > 80:
        return False
    return bool(re.match(r"^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' ]+$", nombre or ''))


def password_strength(password):
    """Devuelve (valida, puntuacion 0-4, lista de errores)."""
    errores = []
    if not password:
        errores.append('La contraseña es obligatoria.')
    else:
        if len(password) < 8:
            errores.append('Debe tener al menos 8 caracteres.')
        if not re.search(r'[A-Za-z]', password):
            errores.append('Debe contener letras.')
        if not re.search(r'\d', password):
            errores.append('Debe contener al menos un número.')
        if re.search(r'\s', password):
            errores.append('No debe contener espacios.')
    fuerte = len(errores) == 0 and password
    score = 0
    if password:
        score += min(len(password) >= 8, True)
        score += bool(re.search(r'[A-Z]', password) and re.search(r'[a-z]', password))
        score += bool(re.search(r'\d', password))
        score += bool(re.search(r'[^A-Za-z0-9]', password))
    return fuerte, score, errores


def is_valid_direccion(direccion):
    """Dirección válida: 8-120 caracteres, debe incluir un número y letras (calle)."""
    if not direccion or len(direccion) < 8 or len(direccion) > 120:
        return False
    if not re.search(r'\d', direccion):
        return False
    if not re.search(r'[A-Za-zÁÉÍÓÚáéíóúÑñ]', direccion):
        return False
    return True


def is_valid_telefono(telefono):
    """Teléfono válido: 7-15 dígitos con separadores opcionales (+ - espacio)."""
    if not telefono:
        return True  # opcional
    limpio = re.sub(r'[\s\-()+]', '', telefono)
    return 7 <= len(limpio) <= 15 and limpio.isdigit()


def normalizar_telefono(telefono):
    if not telefono:
        return ''
    return re.sub(r'[\s\-()]', '', telefono).strip()


# ── Traducción server-side (mensajes flash y errores API) ──────────────────

FLASH_MSGS = {
    'correo_invalido': {'es': 'Ingresa un correo electrónico válido.', 'en': 'Enter a valid email address.'},
    'credenciales_invalidas': {'es': 'Correo o contraseña incorrectos.', 'en': 'Incorrect email or password.'},
    'bienvenido': {'es': '¡Bienvenido de nuevo, {nombre}!', 'en': 'Welcome back, {nombre}!'},
    'cuenta_creada': {'es': '¡Cuenta creada! Bienvenido, {nombre}.', 'en': 'Account created! Welcome, {nombre}.'},
    'google_bienvenido': {'es': '¡Bienvenido, {nombre}! (cuenta de Google)', 'en': 'Welcome, {nombre}! (Google account)'},
    'sesion_cerrada': {'es': 'Sesión cerrada correctamente.', 'en': 'Logged out successfully.'},
    'correo_existe': {'es': 'Ya existe una cuenta con ese correo.', 'en': 'An account with that email already exists.'},
    'nombre_invalido': {'es': 'El nombre debe tener al menos 2 caracteres y solo letras.', 'en': 'Name must be at least 2 characters and contain only letters.'},
    'apellidos_invalido': {'es': 'Los apellidos solo pueden contener letras y espacios.', 'en': 'Last name may only contain letters and spaces.'},
    'telefono_invalido': {'es': 'Ingresa un teléfono válido (7 a 15 dígitos).', 'en': 'Enter a valid phone number (7 to 15 digits).'},
    'ciudad_invalida': {'es': 'Ingresa una ciudad válida.', 'en': 'Enter a valid city.'},
    'password_no_coincide': {'es': 'Las contraseñas no coinciden.', 'en': 'Passwords do not match.'},
    'pw_reqs': {'es': 'La contraseña debe tener al menos 8 caracteres, incluir letras y números.', 'en': 'Password must be at least 8 characters and include letters and numbers.'},
    'err_nombre': {'es': 'Ingresa un nombre válido (solo letras, mínimo 2 caracteres).', 'en': 'Enter a valid name (letters only, min 2 chars).'},
    'err_apellido': {'es': 'Ingresa un apellido válido (solo letras).', 'en': 'Enter a valid last name (letters only).'},
    'err_email': {'es': 'Ingresa un correo electrónico válido.', 'en': 'Enter a valid email address.'},
    'err_direccion': {'es': 'Ingresa una dirección completa (calle y número, mínimo 8 caracteres).', 'en': 'Enter a full address (street and number, min 8 chars).'},
    'err_telefono': {'es': 'Ingresa un teléfono válido (7 a 15 dígitos).', 'en': 'Enter a valid phone number (7 to 15 digits).'},
    'err_ciudad': {'es': 'Ingresa tu ciudad.', 'en': 'Enter your city.'},
    'err_metodo_pago': {'es': 'Selecciona un método de pago válido.', 'en': 'Select a valid payment method.'},
    'err_items': {'es': 'Tu carrito está vacío.', 'en': 'Your cart is empty.'},
    'err_datos': {'es': 'Los datos del carrito son inválidos.', 'en': 'Cart data is invalid.'},
    'err_revisar': {'es': 'Revisa los datos ingresados.', 'en': 'Please review the entered data.'},
    'debes_iniciar_sesion': {'es': 'Debes iniciar sesión', 'en': 'You must be logged in'},
    'mensaje_enviado': {'es': 'Mensaje enviado. Te responderemos pronto.', 'en': 'Message sent. We will reply soon.'},
    'producto_no_encontrado': {'es': 'Producto no encontrado.', 'en': 'Product not found.'},
    'acceso_restringido': {'es': 'Acceso restringido. Se requieren permisos de administrador.', 'en': 'Restricted access. Administrator permissions required.'},
    'google_invalido': {'es': 'Token de Google inválido o expirado.', 'en': 'Invalid or expired Google token.'},
    'google_sin_email': {'es': 'No se pudo obtener el correo de Google.', 'en': 'Could not obtain email from Google.'},
    'google_error': {'es': 'No se pudo verificar la credencial en este momento.', 'en': 'Could not verify the credential right now.'},
    'espera_minutos': {'es': 'Demasiados intentos fallidos. Espera {minutos} minuto(s).', 'en': 'Too many failed attempts. Wait {minutos} minute(s).'},
    'bloqueado_15': {'es': 'Demasiados intentos fallidos. Acceso bloqueado por 15 minutos.', 'en': 'Too many failed attempts. Access blocked for 15 minutes.'},
    'login_restantes': {'es': 'Correo o contraseña incorrectos. Te quedan {restantes} intento(s).', 'en': 'Incorrect email or password. You have {restantes} attempt(s) left.'},
    'perfil_actualizado': {'es': 'Perfil actualizado.', 'en': 'Profile updated.'},
    'contrasena_actualizada': {'es': 'Contraseña actualizada correctamente.', 'en': 'Password updated successfully.'},
    'contrasena_actual_incorrecta': {'es': 'Contraseña actual incorrecta.', 'en': 'Current password is incorrect.'},
    'campos_incompletos': {'es': 'Completa todos los campos.', 'en': 'Complete all the fields.'},
    'password_corta': {'es': 'La contraseña debe tener al menos 8 caracteres.', 'en': 'Password must be at least 8 characters.'},
    'password_actualizada': {'es': 'Contraseña actualizada. Ya puedes iniciar sesión.', 'en': 'Password updated. You can now log in.'},
    'producto_publicado': {'es': '¡Producto publicado con éxito!', 'en': 'Product published successfully!'},
    'producto_actualizado': {'es': 'Producto actualizado.', 'en': 'Product updated.'},
    'producto_eliminado': {'es': 'Producto eliminado.', 'en': 'Product deleted.'},
    'usuario_eliminado': {'es': 'Usuario eliminado.', 'en': 'User deleted.'},
    'datos_invalidos_pub': {'es': 'Precio o stock inválido.', 'en': 'Invalid price or stock.'},
    'campos_obligatorios': {'es': 'Completa todos los campos obligatorios.', 'en': 'Complete all required fields.'},
}


def tr(key, **kwargs):
    """Traduce una clave según el idioma de la sesión."""
    lang = session.get('lang', 'es')
    msg = FLASH_MSGS.get(key, {}).get(lang, FLASH_MSGS.get(key, {}).get('es', key))
    try:
        return msg.format(**kwargs)
    except (KeyError, IndexError):
        return msg


def flash_t(key, category='success', **kwargs):
    flash(tr(key, **kwargs), category)


# ── Seguridad global ─────────────────────────────────────────────────────────

# Cabeceras de seguridad en todas las respuestas
@app.after_request
def set_security_headers(resp):
    resp.headers['X-Content-Type-Options'] = 'nosniff'
    resp.headers['X-Frame-Options'] = 'SAMEORIGIN'
    resp.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return resp


# Token CSRF por sesión (disponible en plantillas como {{ csrf_token() }})
@app.context_processor
def inject_csrf_token():
    def csrf_token():
        if '_csrf_token' not in session:
            session['_csrf_token'] = secrets.token_hex(32)
        return session['_csrf_token']
    return {'csrf_token': csrf_token}


# Validación CSRF para POST de formularios HTML (no para endpoints JSON ni body vacío)
@app.before_request
def csrf_protect():
    if request.method == 'POST' and request.form:
        token = session.get('_csrf_token', '')
        sent = request.form.get('csrf_token', '')
        if not token or not sent or not hmac.compare_digest(token, sent):
            flash('Error de seguridad (CSRF). Vuelve a intentarlo.', 'danger')
            return redirect(request.referrer or url_for('index'))


# Rate limiting de credenciales por IP (en memoria; mejor protección en multi-worker con Redis)
_login_ip_attempts = {}


def _tb_cuenta_ip(ip):
    ahora = time.time()
    _login_ip_attempts[ip] = [t for t in _login_ip_attempts.get(ip, []) if t > ahora - 900]
    return _login_ip_attempts[ip]


def _limpiar_intentos_caducados():
    ahora = time.time()
    expirados = [ip for ip, t in _login_ip_attempts.items()
                 if not t or max(t) < ahora - 900]
    for ip in expirados:
        _login_ip_attempts.pop(ip, None)




def _create_thumbnail(saved_path, thumb_path, max_size=800):
    """Genera una miniatura del archivo guardado en saved_path y la escribe en thumb_path.
    No procesa SVGs; en caso de error, elimina cualquier intento parcial.
    """
    try:
        ext = os.path.splitext(saved_path)[1].lower().lstrip('.')
        if ext == 'svg':
            return False
        with Image.open(saved_path) as img:
            img.convert('RGB')
            img.thumbnail((max_size, max_size), Image.LANCZOS)
            # Asegurar carpeta
            os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
            img.save(thumb_path, optimize=True, quality=85)
        return True
    except Exception:
        try:
            if os.path.exists(thumb_path):
                os.remove(thumb_path)
        except Exception:
            pass
        return False


# ── DB ──────────────────────────────────────────────────────────────────────

def get_db():
    """Obtiene una conexión a la base de datos SQLite con configuración optimizada.
    
    Returns:
        sqlite3.Connection: Conexión con row_factory configurado y PRAGMAs aplicados.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA cache_size=-8000")
    return conn


def init_db():
    """Inicializa la base de datos creando todas las tablas, seeds e índices.
    
    Crea las tablas si no existen, inserta productos y cupones de ejemplo
    si están vacías, aplica migraciones y crea índices para optimizar búsquedas.
    """
    # Asegurar que el directorio de la base de datos existe
    db_dir = os.path.dirname(DB_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            avatar TEXT DEFAULT '',
            avatar_color TEXT DEFAULT '#2e7d32',
            banner TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            rol TEXT DEFAULT 'comprador',
            xp INTEGER DEFAULT 0,
            nivel INTEGER DEFAULT 1,
            rango TEXT DEFAULT 'Semilla 🌱',
            eco_puntos INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
         CREATE TABLE IF NOT EXISTS productos (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             nombre TEXT NOT NULL,
             categoria TEXT NOT NULL,
             precio REAL NOT NULL,
             precio_original REAL,
             descripcion TEXT NOT NULL,
             imagen TEXT DEFAULT '',
             imagen_thumb TEXT DEFAULT '',
             stock INTEGER DEFAULT 10,
             condicion TEXT DEFAULT 'nuevo',
             etiquetas TEXT DEFAULT '',
             eco_score INTEGER DEFAULT 0,
             especificaciones TEXT DEFAULT '',
             usuario_id INTEGER,
             ubicacion TEXT DEFAULT '',
             vistas INTEGER DEFAULT 0,
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
         );
         
         CREATE TABLE IF NOT EXISTS producto_imagenes (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             producto_id INTEGER NOT NULL,
             imagen TEXT NOT NULL,
             imagen_thumb TEXT DEFAULT '',
             titulo TEXT DEFAULT '',
             orden INTEGER DEFAULT 0,
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
         );
        
        CREATE TABLE IF NOT EXISTS favoritos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(usuario_id, producto_id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS historial_precios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            precio REAL NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS referidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            referente_id INTEGER NOT NULL,
            referido_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(referido_id),
            FOREIGN KEY (referente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (referido_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS trueques (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            producto_mio INTEGER NOT NULL,
            propuesto_por INTEGER NOT NULL,
            mensaje TEXT DEFAULT '',
            estado TEXT DEFAULT 'pendiente',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
            FOREIGN KEY (producto_mio) REFERENCES productos(id) ON DELETE CASCADE,
            FOREIGN KEY (propuesto_por) REFERENCES usuarios(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS resenas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            usuario_id INTEGER,
            nombre TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comentario TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS resena_votos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resena_id INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,
            voto INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(resena_id, usuario_id),
            FOREIGN KEY (resena_id) REFERENCES resenas(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        );
        
        CREATE TABLE IF NOT EXISTS resena_respuestas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resena_id INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,
            comentario TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (resena_id) REFERENCES resenas(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            direccion TEXT NOT NULL,
            total REAL NOT NULL,
            estado TEXT DEFAULT 'confirmado',
            metodo_pago TEXT DEFAULT '',
            ciudad TEXT DEFAULT '',
            telefono TEXT DEFAULT '',
            envio REAL DEFAULT 0,
            descuento REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        );
        
        CREATE TABLE IF NOT EXISTS pedido_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            producto_id INTEGER,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            cantidad INTEGER DEFAULT 1,
            FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS notificaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            titulo TEXT NOT NULL,
            mensaje TEXT NOT NULL,
            tipo TEXT DEFAULT 'info',
            leida INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS visitas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pagina TEXT NOT NULL,
            usuario_id INTEGER,
            ip TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS seguidores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seguidor_id INTEGER NOT NULL,
            seguido_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(seguidor_id, seguido_id),
            FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (seguido_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS logros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            logro_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(usuario_id, logro_id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS insignias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            insignia_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(usuario_id, insignia_id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS historial_busquedas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            termino TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS cupones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE NOT NULL,
            descuento REAL NOT NULL,
            tipo TEXT DEFAULT '%',
            minimo REAL DEFAULT 0,
            usos_maximos INTEGER DEFAULT 100,
            usos_actuales INTEGER DEFAULT 0,
            expira TIMESTAMP,
            activo INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS preguntas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,
            pregunta TEXT NOT NULL,
            respuesta TEXT,
            helpful INTEGER DEFAULT 0,
            fecha_respuesta TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (producto_id) REFERENCES productos(id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );
        CREATE INDEX IF NOT EXISTS idx_preguntas_producto ON preguntas(producto_id);

        CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            used INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );
        CREATE INDEX IF NOT EXISTS idx_resets_token ON password_resets(token_hash);

        CREATE TABLE IF NOT EXISTS mensajes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER,
            de_id INTEGER NOT NULL,
            para_id INTEGER NOT NULL,
            mensaje TEXT NOT NULL,
            leido INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL,
            FOREIGN KEY (de_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (para_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_mensajes_para ON mensajes(para_id, leido);
        CREATE INDEX IF NOT EXISTS idx_mensajes_hilo ON mensajes(de_id, para_id, producto_id);

        CREATE TABLE IF NOT EXISTS reportes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,
            motivo TEXT NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);
    ''')

    # Seed productos si la tabla está vacía
    if conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0] == 0:
        seed_path = os.path.join(os.path.dirname(__file__), 'data', 'products.json')
        if os.path.exists(seed_path):
            with open(seed_path, 'r', encoding='utf-8') as f:
                try:
                    productos = json.load(f)
                    for p in productos:
                        imagen = p.get('imagen', '')
                        if not imagen or imagen == 'uploads/placeholder.svg':
                            imagen = get_product_image(p.get('categoria', 'default'))
                        conn.execute(
                            'INSERT INTO productos (nombre, categoria, precio, precio_original, descripcion, imagen, stock, condicion, vistas) VALUES (?,?,?,?,?,?,?,?,?)',
                            (p['nombre'], p['categoria'], p['precio'], p.get('precio_original', p['precio']),
                             p['descripcion'], imagen,
                             p.get('stock', 10), p.get('condicion', 'nuevo'), p.get('vistas', 0))
                        )
                except json.JSONDecodeError:
                    pass

    # ── Seed aditivo: agregar productos nuevos a BD existentes ──
    # Permite ampliar el catálogo sin borrar productos creados por usuarios.
    seed_path = os.path.join(os.path.dirname(__file__), 'data', 'products.json')
    if os.path.exists(seed_path):
        try:
            with open(seed_path, 'r', encoding='utf-8') as f:
                productos = json.load(f)
            # Nombres ya presentes
            existentes = {row[0] for row in conn.execute('SELECT nombre FROM productos').fetchall()}
            añadidos = 0
            for p in productos:
                if p['nombre'] in existentes:
                    continue
                imagen = p.get('imagen', '')
                if not imagen or imagen == 'uploads/placeholder.svg':
                    imagen = get_product_image(p.get('categoria', 'default'))
                conn.execute(
                    'INSERT INTO productos (nombre, categoria, precio, precio_original, descripcion, imagen, stock, condicion, vistas) VALUES (?,?,?,?,?,?,?,?,?)',
                    (p['nombre'], p['categoria'], p['precio'], p.get('precio_original', p['precio']),
                     p['descripcion'], imagen,
                     p.get('stock', 10), p.get('condicion', 'nuevo'), p.get('vistas', 0))
                )
                existentes.add(p['nombre'])
                añadidos += 1
            if añadidos:
                conn.commit()
        except (json.JSONDecodeError, OSError, sqlite3.Error):
            pass

    # Seed cupones (idempotente: INSERT OR IGNORE para no duplicar códigos existentes)
    cupones = [
        ('ECO10', 10, '%', 30, 100, '2026-12-31'),
        ('ECO20', 20, '%', 80, 100, '2026-12-31'),
        ('ECO50', 50, 'fixed', 200, 100, '2026-12-31'),
        ('ENVIOFREE', 100, 'shipping', 0, 100, '2026-12-31'),
        ('BIENVENIDO', 15, 'fixed', 0, 200, '2026-12-31'),
    ]
    for c in cupones:
        conn.execute(
            'INSERT OR IGNORE INTO cupones (codigo, descuento, tipo, minimo, usos_maximos, expira) VALUES (?,?,?,?,?,?)',
            c
        )
    conn.commit()

    # ── Migraciones para BD existentes ─────────────────────────
    # Agregar columna especificaciones si no existe
    try:
        conn.execute('ALTER TABLE productos ADD COLUMN especificaciones TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass  # La columna ya existe

    # Agregar columna ubicacion a productos si no existe
    try:
        conn.execute('ALTER TABLE productos ADD COLUMN ubicacion TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Agregar columna vendido a productos si no existe
    try:
        conn.execute('ALTER TABLE productos ADD COLUMN vendido INTEGER DEFAULT 0')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Columna foto en resenas (fotos de compradores)
    try:
        conn.execute('ALTER TABLE resenas ADD COLUMN foto TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Agregar columnas envio y descuento a pedidos si no existen
    try:
        conn.execute('ALTER TABLE pedidos ADD COLUMN envio REAL DEFAULT 0')
        conn.commit()
    except sqlite3.OperationalError:
        pass
    
    try:
        conn.execute('ALTER TABLE pedidos ADD COLUMN descuento REAL DEFAULT 0')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # ── Crear índices para optimizar consultas ─────────────────────────
    try:
        # Índices simples para productos
        conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(precio)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_usuario ON productos(usuario_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_created ON productos(created_at)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock)')
        
        # Índices compuestos optimizados para consultas frecuentes
        conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_categoria_precio ON productos(categoria, precio)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_usuario_created ON productos(usuario_id, created_at)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_eco_score_vistas ON productos(eco_score DESC, vistas DESC)')
        
        # Índices para usuarios
        conn.execute('CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol)')
        
        # Índices para pedidos
        conn.execute('CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_estado ON pedidos(usuario_id, estado)')
        
        # Índices para favoritos
        conn.execute('CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_favoritos_producto ON favoritos(producto_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_favoritos_usuario_producto ON favoritos(usuario_id, producto_id)')
        
        # Índices para reseñas
        conn.execute('CREATE INDEX IF NOT EXISTS idx_resenas_producto ON resenas(producto_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_resenas_rating ON resenas(rating)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_resenas_producto_rating ON resenas(producto_id, rating DESC)')
        
        # Índices para notificaciones
        conn.execute('CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_leida ON notificaciones(usuario_id, leida)')
        
        # Índices para visitas
        conn.execute('CREATE INDEX IF NOT EXISTS idx_visitas_pagina ON visitas(pagina)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_visitas_usuario ON visitas(usuario_id)')
        
        # Índices para cupones
        conn.execute('CREATE INDEX IF NOT EXISTS idx_cupones_codigo ON cupones(codigo)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_cupones_activo ON cupones(activo)')
        
        conn.commit()
        logger.info("Índices de base de datos creados/verificados exitosamente")
    except Exception as e:
        logger.error(f"Error creando índices: {e}")
        conn.rollback()
        pass  # La columna ya existe

    # Agregar columna imagen_thumb a productos si no existe
    try:
        conn.execute('ALTER TABLE productos ADD COLUMN imagen_thumb TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Reserva temporal 24h en productos
    try:
        conn.execute('ALTER TABLE productos ADD COLUMN reservado_hasta TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    try:
        conn.execute('ALTER TABLE productos ADD COLUMN reservado_por INTEGER DEFAULT 0')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Cupones personales (canje de puntos eco)
    try:
        conn.execute('ALTER TABLE cupones ADD COLUMN propietario_id INTEGER DEFAULT 0')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Productos digitales (PDF, guías, plantillas descargables)
    try:
        conn.execute('ALTER TABLE productos ADD COLUMN es_digital INTEGER DEFAULT 0')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Mensaje de regalo en pedidos
    try:
        conn.execute('ALTER TABLE pedidos ADD COLUMN regalo_mensaje TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Muro de agradecimientos
    try:
        conn.execute('''CREATE TABLE IF NOT EXISTS agradecimientos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            mensaje TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        )''')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Agregar columna imagen_thumb a producto_imagenes si no existe
    try:
        conn.execute('ALTER TABLE producto_imagenes ADD COLUMN imagen_thumb TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Crear tabla producto_imagenes si no existe
    conn.execute('''
        CREATE TABLE IF NOT EXISTS producto_imagenes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            imagen TEXT NOT NULL,
            imagen_thumb TEXT DEFAULT "",
            orden INTEGER DEFAULT 0,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
        )
    ''')
    conn.commit()

    # Newsletter: suscriptores
    try:
        conn.execute('''CREATE TABLE IF NOT EXISTS suscriptores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            nombre TEXT DEFAULT "",
            preferencias TEXT DEFAULT "[]",
            activo INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Wishlist compartible por link público
    try:
        conn.execute('''CREATE TABLE IF NOT EXISTS wishlist_share (
            token TEXT PRIMARY KEY,
            usuario_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Analytics persistente (eventos de engagement)
    try:
        conn.execute('''CREATE TABLE IF NOT EXISTS analytics_eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evento TEXT NOT NULL,
            usuario_id INTEGER,
            propiedades TEXT DEFAULT "{}",
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )''')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_ae_evento ON analytics_eventos(evento)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_ae_fecha ON analytics_eventos(created_at)')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Racha de login diario
    for col, ddl in [('ultimo_login', 'TEXT DEFAULT ""'), ('racha_dias', 'INTEGER DEFAULT 0')]:
        try:
            conn.execute(f'ALTER TABLE usuarios ADD COLUMN {col} {ddl}')
            conn.commit()
        except sqlite3.OperationalError:
            pass

    # Avisos de reposición de stock
    try:
        conn.execute('''CREATE TABLE IF NOT EXISTS avisos_stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            notificado INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(usuario_id, producto_id)
        )''')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Token público de rastreo de pedido
    try:
        conn.execute('ALTER TABLE pedidos ADD COLUMN token_rastreo TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # ── Migraciones para campos de usuario ──────────────────
    for col, ddl in [
        ('apellidos', 'TEXT DEFAULT ""'),
        ('telefono', 'TEXT DEFAULT ""'),
        ('ciudad', 'TEXT DEFAULT ""'),
        ('google_id', 'TEXT DEFAULT ""'),
        ('email_verificado', 'INTEGER DEFAULT 0'),
    ]:
        try:
            conn.execute(f'ALTER TABLE usuarios ADD COLUMN {col} {ddl}')
            conn.commit()
        except sqlite3.OperationalError:
            pass  # La columna ya existe

        # Google ID debe ser único (si está presente) para evitar cuentas duplicadas
    try:
        conn.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_google_id ON usuarios(google_id)')
        conn.commit()
    except sqlite3.OperationalError:
        pass
    # Normalizar google_id vacio ('') a NULL: los usuarios registrados con email no
    # usan Google, y con el DEFAULT '' el UNIQUE index colisionaria en el 2.º registro.
    try:
        conn.execute("UPDATE usuarios SET google_id = NULL WHERE google_id = ''")
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Migraciones para columnas de pedidos (ciudad, telefono)
    try:
        conn.execute('ALTER TABLE pedidos ADD COLUMN ciudad TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass
    try:
        conn.execute('ALTER TABLE pedidos ADD COLUMN telefono TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass
    # Migraciones para envío y descuento en pedidos (re cálculo del total)
    try:
        conn.execute('ALTER TABLE pedidos ADD COLUMN envio REAL DEFAULT 0')
        conn.commit()
    except sqlite3.OperationalError:
        pass
    try:
        conn.execute('ALTER TABLE pedidos ADD COLUMN descuento REAL DEFAULT 0')
        conn.commit()
    except sqlite3.OperationalError:
        pass
    # Migración: reseñas con "compra verificada"
    try:
        conn.execute('ALTER TABLE resenas ADD COLUMN compra_verificada INTEGER DEFAULT 0')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # ── Índices para optimizar búsquedas ──────────────────────
    conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(precio)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_usuario ON productos(usuario_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_resenas_producto ON resenas(producto_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_producto_imagenes_producto ON producto_imagenes(producto_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_imagen_thumb ON productos(imagen_thumb)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_producto_imagenes_imagen_thumb ON producto_imagenes(imagen_thumb)')

    conn.commit()
    conn.close()


# ── Decoradores ──────────────────────────────────────────────────────────────

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'usuario_id' not in session:
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({'error': tr('debes_iniciar_sesion')}), 401
            flash_t('debes_iniciar_sesion', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('rol') != 'admin':
            flash_t('acceso_restringido', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated


# ── Utilidades ───────────────────────────────────────────────────────────────

def get_productos_destacados(limit=6):
    conn = get_db()
    productos = conn.execute('''
        SELECT p.*, u.nombre as vendedor_nombre,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas
        FROM productos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN resenas r ON p.id = r.producto_id
        WHERE COALESCE(p.vendido, 0) = 0
        GROUP BY p.id
        ORDER BY p.vistas DESC, p.created_at DESC
        LIMIT ?
    ''', (limit,)).fetchall()
    conn.close()
    return productos


def get_producto_detalle(producto_id):
    conn = get_db()
    producto = conn.execute('''
        SELECT p.*, u.nombre as vendedor_nombre, u.email as vendedor_email, u.avatar as vendedor_avatar,
            (SELECT COUNT(*) FROM productos WHERE usuario_id = p.usuario_id) as total_vendedor_productos,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas
        FROM productos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN resenas r ON p.id = r.producto_id
        WHERE p.id = ?
        GROUP BY p.id
    ''', (producto_id,)).fetchone()

    if producto:
        conn.execute('UPDATE productos SET vistas = vistas + 1 WHERE id = ?', (producto_id,))
        conn.commit()

        relacionados = conn.execute('''
            SELECT p.*, COALESCE(AVG(r.rating), 0) as rating_promedio,
                COUNT(DISTINCT r.id) as total_resenas
            FROM productos p
            LEFT JOIN resenas r ON p.id = r.producto_id
            WHERE p.categoria = ? AND p.id != ?
            GROUP BY p.id
            ORDER BY RANDOM() LIMIT 4
        ''', (producto['categoria'], producto_id)).fetchall()

        similares = conn.execute('''
            SELECT p.*, COALESCE(AVG(r.rating), 0) as rating_promedio,
                COUNT(DISTINCT r.id) as total_resenas
            FROM productos p
            LEFT JOIN resenas r ON p.id = r.producto_id
            WHERE p.id != ? AND p.precio BETWEEN ? * 0.7 AND ? * 1.3
            GROUP BY p.id
            ORDER BY RANDOM() LIMIT 4
        ''', (producto_id, producto['precio'], producto['precio'])).fetchall()

        resenas = conn.execute('''
            SELECT r.*, COALESCE(u.nombre, r.nombre) as nombre_usuario
            FROM resenas r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.producto_id = ?
            ORDER BY r.created_at DESC
        ''', (producto_id,)).fetchall()

        estrellas = {}
        for i in range(1, 6):
            count = conn.execute(
                'SELECT COUNT(*) FROM resenas WHERE producto_id = ? AND rating = ?',
                (producto_id, i)
            ).fetchone()[0]
            estrellas[i] = count

        # Imágenes adicionales del producto (galería)
        imagenes_extra = conn.execute(
            'SELECT * FROM producto_imagenes WHERE producto_id = ? ORDER BY orden ASC, id ASC',
            (producto_id,)
        ).fetchall()

        # If producto.imagen_thumb exists use it for main image prefer thumb
        producto = dict(producto)
        if producto.get('imagen_thumb'):
            producto['imagen_pref'] = producto.get('imagen_thumb') or producto.get('imagen')
        else:
            producto['imagen_pref'] = producto.get('imagen')

        # Normalize imagenes_extra to dicts
        imagenes_extra = [dict(i) for i in imagenes_extra]

        # Especificaciones del producto (JSON)
        especificaciones = {}
        if producto.get('especificaciones'):
            try:
                especificaciones = json.loads(producto['especificaciones'])
            except (json.JSONDecodeError, TypeError):
                especificaciones = {}

        conn.close()
        return {
            'producto': producto,
            'relacionados': relacionados,
            'similares': similares,
            'resenas': resenas,
            'estrellas': estrellas,
            'imagenes_extra': imagenes_extra,
            'especificaciones': especificaciones
        }
    conn.close()
    return None


@cached(ttl=600, key_prefix='categorias_')
def get_categorias():
    conn = get_db()
    try:
        categorias = [r['categoria'] for r in
                      conn.execute('SELECT DISTINCT categoria FROM productos ORDER BY categoria').fetchall()]
        return categorias
    finally:
        conn.close()


def add_notificacion(usuario_id, titulo, mensaje, tipo='info'):
    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?,?,?,?)',
            (usuario_id, titulo, mensaje, tipo)
        )
        conn.commit()
    except Exception as e:
        logger.error(f"Error adding notification: {e}")
        conn.rollback()
    finally:
        conn.close()


def registrar_visita(pagina):
    try:
        conn = get_db()
        try:
            conn.execute(
                'INSERT INTO visitas (pagina, usuario_id, ip) VALUES (?,?,?)',
                (pagina, session.get('usuario_id'), request.remote_addr or '')
            )
            conn.commit()
        except Exception as e:
            logger.error(f"Error registering visit: {e}")
            conn.rollback()
        finally:
            conn.close()
    except Exception as e:
        logger.error(f"Error getting DB connection for visit: {e}")


def add_xp(usuario_id, cantidad):
    conn = get_db()
    try:
        conn.execute('UPDATE usuarios SET xp = xp + ? WHERE id = ?', (cantidad, usuario_id))
        usuario = conn.execute('SELECT xp, nivel, rango FROM usuarios WHERE id = ?', (usuario_id,)).fetchone()
        if usuario:
            xp = usuario['xp']
            nuevo_nivel = min(50, 1 + xp // 100)
            if nuevo_nivel > usuario['nivel']:
                conn.execute('UPDATE usuarios SET nivel = ? WHERE id = ?', (nuevo_nivel, usuario_id))
        conn.commit()
    except Exception as e:
        logger.error(f"Error adding XP: {e}")
        conn.rollback()
    finally:
        conn.close()


# ── Rutas principales ────────────────────────────────────────────────────────

@app.route('/')
def index():
    registrar_visita('inicio')
    productos = get_productos_destacados(6)
    categorias = get_categorias()
    conn = get_db()
    total_productos = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    total_usuarios = conn.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0]
    total_pedidos = conn.execute('SELECT COUNT(*) FROM pedidos').fetchone()[0]
    total_vendedores = conn.execute('SELECT COUNT(DISTINCT usuario_id) FROM productos WHERE usuario_id IS NOT NULL').fetchone()[0]
    total_visitas = conn.execute('SELECT COUNT(*) FROM visitas').fetchone()[0]
    # oferta relámpago: producto con mayor descuento (o aleatorio del día)
    import datetime as _dt, random as _rnd
    _hoy = _dt.date.today().timetuple().tm_yday
    _candidatos = conn.execute(
        "SELECT id, nombre, precio, precio_original, imagen FROM productos "
        "WHERE COALESCE(vendido,0)=0 AND precio > 0 ORDER BY (precio_original - precio) DESC LIMIT 20"
    ).fetchall()
    flash = None
    if _candidatos:
        con_dto = [r for r in _candidatos if r['precio_original'] and r['precio_original'] > r['precio']]
        pool = con_dto if con_dto else list(_candidatos)
        flash = dict(_rnd.Random(_hoy).choice(pool))
    conn.close()
    return render_template('index.html', productos=productos, categorias=categorias,
                           total_productos=total_productos, total_categorias=len(categorias),
                           total_usuarios=total_usuarios, total_pedidos=total_pedidos,
                           total_vendedores=total_vendedores, total_visitas=total_visitas,
                           flash_producto=flash)


@app.route('/productos')
def productos_view():
    registrar_visita('productos')
    conn = get_db()
    try:
        categoria = request.args.get('categoria', '')
        orden = request.args.get('orden', 'nuevos')
        precio_min = request.args.get('precio_min', '')
        precio_max = request.args.get('precio_max', '')
        ubicacion = request.args.get('ubicacion', '')
        busqueda = request.args.get('q', '')
        condicion = request.args.get('condicion', '')
        eco_score_min = request.args.get('eco_score_min', '')
        etiquetas = request.args.get('etiquetas', '')
        ofertas = request.args.get('ofertas', '')
        pagina = int(request.args.get('pagina', 1))

        query = '''
            SELECT p.*, u.nombre as vendedor_nombre,
                COALESCE(AVG(r.rating), 0) as rating_promedio,
                COUNT(DISTINCT r.id) as total_resenas
            FROM productos p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            LEFT JOIN resenas r ON p.id = r.producto_id
            WHERE COALESCE(p.vendido, 0) = 0
        '''
        count_query = 'SELECT COUNT(*) FROM (SELECT p.id FROM productos p WHERE COALESCE(p.vendido,0) = 0'
        params = []
        count_params = []

        if categoria and categoria != 'Todas':
            query += ' AND p.categoria = ?'
            count_query += ' AND p.categoria = ?'
            params.append(categoria)
            count_params.append(categoria)
        if busqueda:
            query += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.etiquetas LIKE ?)'
            count_query += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.etiquetas LIKE ?)'
            params.extend([f'%{busqueda}%', f'%{busqueda}%', f'%{busqueda}%'])
            count_params.extend([f'%{busqueda}%', f'%{busqueda}%', f'%{busqueda}%'])
        if precio_min:
            query += ' AND p.precio >= ?'
            count_query += ' AND p.precio >= ?'
            params.append(float(precio_min))
            count_params.append(float(precio_min))
        if precio_max:
            query += ' AND p.precio <= ?'
            count_query += ' AND p.precio <= ?'
            params.append(float(precio_max))
            count_params.append(float(precio_max))
        if ubicacion:
            query += ' AND p.ubicacion LIKE ?'
            count_query += ' AND p.ubicacion LIKE ?'
            params.extend([f'%{ubicacion}%'])
            count_params.extend([f'%{ubicacion}%'])
        if condicion:
            query += ' AND p.condicion = ?'
            count_query += ' AND p.condicion = ?'
            params.append(condicion)
            count_params.append(condicion)
        if eco_score_min:
            query += ' AND p.eco_score >= ?'
            count_query += ' AND p.eco_score >= ?'
            params.append(int(eco_score_min))
            count_params.append(int(eco_score_min))
        if etiquetas:
            query += ' AND p.etiquetas LIKE ?'
            count_query += ' AND p.etiquetas LIKE ?'
            params.extend([f'%{etiquetas}%'])
            count_params.extend([f'%{etiquetas}%'])
        if ofertas:
            query += ' AND p.precio_original IS NOT NULL AND p.precio_original > p.precio'
            count_query += ' AND p.precio_original IS NOT NULL AND p.precio_original > p.precio'

        query += ' GROUP BY p.id'
        count_query += ')'

        total_productos = conn.execute(count_query, count_params).fetchone()[0]
        total_paginas = max(1, (total_productos + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE)
        pagina = max(1, min(pagina, total_paginas))
        offset = (pagina - 1) * ITEMS_PER_PAGE

        ordenes = {
            'nuevos': 'ORDER BY p.created_at DESC',
            'populares': 'ORDER BY p.vistas DESC',
            'baratos': 'ORDER BY p.precio ASC',
            'caros': 'ORDER BY p.precio DESC',
            'mejor_valorados': 'ORDER BY rating_promedio DESC',
            'eco_score': 'ORDER BY p.eco_score DESC'
        }
        query += ' ' + ordenes.get(orden, 'ORDER BY p.created_at DESC')
        query += f' LIMIT {ITEMS_PER_PAGE} OFFSET {offset}'

        productos = [dict(row) for row in conn.execute(query, params).fetchall()]
        
        categorias = [r['categoria'] for r in
                      conn.execute('SELECT DISTINCT categoria FROM productos ORDER BY categoria').fetchall()]
    except Exception as e:
        logger.error(f"Error in productos_view: {e}")
        conn.rollback()
        productos = []
        categorias = []
        total_productos = 0
        total_paginas = 1
        pagina = 1
    finally:
        conn.close()

    return render_template('productos.html',
                           productos=productos,
                           categorias=categorias,
                           total_productos=total_productos,
                           categoria_sel=categoria,
                           orden_sel=orden,
                           busqueda=busqueda,
                           ubicacion_sel=ubicacion,
                           condicion_sel=condicion,
                           eco_score_min=eco_score_min,
                           etiquetas_sel=etiquetas,
                           pagina=pagina,
                           total_paginas=total_paginas)
    pagina = max(1, min(pagina, total_paginas))
    offset = (pagina - 1) * ITEMS_PER_PAGE

    ordenes = {
        'nuevos': 'ORDER BY p.created_at DESC',
        'populares': 'ORDER BY p.vistas DESC',
        'baratos': 'ORDER BY p.precio ASC',
        'caros': 'ORDER BY p.precio DESC',
        'mejor_valorados': 'ORDER BY rating_promedio DESC'
    }
    query += ' ' + ordenes.get(orden, 'ORDER BY p.created_at DESC')
    query += f' LIMIT {ITEMS_PER_PAGE} OFFSET {offset}'

    productos = [dict(row) for row in conn.execute(query, params).fetchall()]
    categorias = [r['categoria'] for r in
                  conn.execute('SELECT DISTINCT categoria FROM productos ORDER BY categoria').fetchall()]
    conn.close()

    return render_template('productos.html',
                           productos=productos,
                           categorias=categorias,
                           total_productos=total_productos,
                           categoria_sel=categoria,
                           orden_sel=orden,
                           busqueda=busqueda,
                           ubicacion_sel=ubicacion,
                           pagina=pagina,
                           total_paginas=total_paginas)


@app.route('/producto/<int:producto_id>')
def producto_detalle(producto_id):
    registrar_visita(f'producto_{producto_id}')
    data = get_producto_detalle(producto_id)
    if data is None:
        flash_t('producto_no_encontrado', 'warning')
        return redirect(url_for('productos_view'))

    es_favorito = False
    precio_hist = None
    conn = get_db()
    if 'usuario_id' in session:
        fav = conn.execute(
            'SELECT id FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
            (session['usuario_id'], producto_id)
        ).fetchone()
        es_favorito = fav is not None
    hist = conn.execute(
        'SELECT MIN(precio) AS min_p, MAX(precio) AS max_p, COUNT(*) AS n FROM historial_precios WHERE producto_id = ?',
        (producto_id,)
    ).fetchone()
    if hist and hist['n'] and hist['n'] > 1:
        precio_hist = {'min': hist['min_p'], 'max': hist['max_p'], 'cambios': hist['n']}

    # Si el producto volvió a tener stock, notificar a quienes pidieron aviso
    if data.get('producto', {}).get('stock', 0) > 0:
        pendientes = conn.execute(
            'SELECT usuario_id FROM avisos_stock WHERE producto_id = ? AND notificado = 0',
            (producto_id,)).fetchall()
        for av in pendientes:
            add_notificacion(av['usuario_id'],
                             f'📦 ¡{data["producto"]["nombre"]} volvió a tener stock!',
                             'El producto que querías ya está disponible.', 'success')
        if pendientes:
            conn.execute('UPDATE avisos_stock SET notificado = 1 WHERE producto_id = ?', (producto_id,))
            conn.commit()

    # Estado del aviso de stock del usuario actual
    aviso_activo = False
    if 'usuario_id' in session:
        aviso_activo = conn.execute(
            'SELECT 1 FROM avisos_stock WHERE usuario_id = ? AND producto_id = ? AND notificado = 0',
            (session['usuario_id'], producto_id)).fetchone() is not None
    conn.close()

    return render_template('detalle-producto.html',
                           **data,
                           es_favorito=es_favorito,
                           precio_historial=precio_hist,
                           aviso_stock=aviso_activo,
                           ahora=datetime.now())


@app.route('/api/producto/<int:producto_id>/favorito', methods=['POST'])
@login_required
def toggle_favorito_api(producto_id):
    conn = get_db()
    fav = conn.execute(
        'SELECT id FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
        (session['usuario_id'], producto_id)
    ).fetchone()

    if fav:
        conn.execute('DELETE FROM favoritos WHERE id = ?', (fav['id'],))
        conn.commit()
        conn.close()
        return jsonify({'favorito': False})

    conn.execute('INSERT INTO favoritos (usuario_id, producto_id) VALUES (?,?)',
                 (session['usuario_id'], producto_id))
    conn.commit()
    conn.close()
    add_xp(session['usuario_id'], 5)
    return jsonify({'favorito': True})


@app.route('/api/producto/<int:producto_id>/resena', methods=['POST'])
@login_required
def agregar_resena_api(producto_id):
    data = request.get_json()
    rating = int(data.get('rating', 5))
    comentario = data.get('comentario', '').strip()

    if rating < 1 or rating > 5:
        return jsonify({'error': 'Rating inválido'}), 400

    conn = get_db()
    compra_verificada = 0
    ya_compro = conn.execute('''
        SELECT pi.id FROM pedido_items pi
        JOIN pedidos p ON pi.pedido_id = p.id
        WHERE pi.producto_id = ? AND p.usuario_id = ?
          AND p.estado NOT IN ('cancelado') LIMIT 1
    ''', (producto_id, session['usuario_id'])).fetchone()
    if ya_compro:
        compra_verificada = 1
    cur = conn.execute(
        'INSERT INTO resenas (producto_id, usuario_id, nombre, rating, comentario, compra_verificada) VALUES (?,?,?,?,?,?)',
        (producto_id, session['usuario_id'], session['nombre'], rating, comentario, compra_verificada)
    )
    resena_id = cur.lastrowid
    conn.commit()

    vendedor = conn.execute(
        'SELECT usuario_id FROM productos WHERE id = ?',
        (producto_id,)
    ).fetchone()
    if vendedor and vendedor['usuario_id']:
        add_notificacion(
            vendedor['usuario_id'],
            '⭐ Nueva reseña',
            f'{session["nombre"]} dejó una reseña en tu producto.',
            'success'
        )
    conn.close()
    add_xp(session['usuario_id'], 10)
    return jsonify({'success': True, 'resena_id': resena_id})


@app.route('/api/resena/<int:resena_id>/foto', methods=['POST'])
@login_required
def subir_foto_resena(resena_id):
    """Adjunta una foto a una reseña propia (comprador verificado o no)."""
    conn = get_db()
    resena = conn.execute('SELECT usuario_id FROM resenas WHERE id = ?', (resena_id,)).fetchone()
    if not resena or resena['usuario_id'] != session['usuario_id']:
        conn.close()
        return jsonify({'error': 'No autorizado'}), 403
    f = request.files.get('foto')
    if not f or not f.filename:
        conn.close()
        return jsonify({'error': 'Sin archivo'}), 400
    ext = f.filename.rsplit('.', 1)[-1].lower() if '.' in f.filename else ''
    if ext not in ('jpg', 'jpeg', 'png', 'webp', 'gif'):
        conn.close()
        return jsonify({'error': 'Formato no válido (jpg, png, webp, gif)'}), 400
    import uuid as _uuid
    nombre_archivo = f'resena_{resena_id}_{_uuid.uuid4().hex[:10]}.{ext}'
    ruta = os.path.join(app.static_folder, 'uploads', nombre_archivo)
    f.save(ruta)
    conn.execute('UPDATE resenas SET foto = ? WHERE id = ?', (f'uploads/{nombre_archivo}', resena_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'foto': f'/static/uploads/{nombre_archivo}'})


@app.route('/favoritos')
@login_required
def favoritos_view():
    conn = get_db()
    productos = conn.execute('''
        SELECT p.*, u.nombre as vendedor_nombre,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas,
            f.created_at as fecha_favorito
        FROM favoritos f
        JOIN productos p ON f.producto_id = p.id
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN resenas r ON p.id = r.producto_id
        WHERE f.usuario_id = ?
        GROUP BY p.id
        ORDER BY f.created_at DESC
    ''', (session['usuario_id'],)).fetchall()
    conn.close()
    return render_template('favoritos.html', productos=productos)


@app.route('/api/favorito/<int:producto_id>', methods=['GET', 'DELETE'])
@login_required
def favorito_api(producto_id):
    conn = get_db()
    if request.method == 'GET':
        existe = conn.execute(
            'SELECT 1 FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
            (session['usuario_id'], producto_id)
        ).fetchone()
        conn.close()
        return jsonify({'favorito': bool(existe)})
    conn.execute(
        'DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
        (session['usuario_id'], producto_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})


@app.route('/carrito')
def carrito_view():
    conn = get_db()
    productos = [dict(p) for p in conn.execute(
        'SELECT p.*, COALESCE(AVG(r.rating), 0) as rating_promedio FROM productos p LEFT JOIN resenas r ON p.id = r.producto_id GROUP BY p.id ORDER BY p.created_at DESC'
    ).fetchall()]
    conn.close()
    return render_template('carrito.html', productos_json=productos)


@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    if request.method == 'POST':
        if 'usuario_id' not in session:
            return jsonify({'error': 'Debes iniciar sesión'}), 401

        data = request.get_json()
        nombre = data.get('nombre', '').strip()
        apellido = data.get('apellido', '').strip()
        email = data.get('email', '').strip()
        telefono = data.get('telefono', '').strip()
        direccion = data.get('direccion', '').strip()
        ciudad = data.get('ciudad', '').strip()
        items = data.get('items', [])
        metodo_pago = data.get('metodo_pago', '')
        regalo_mensaje = sanitize_string(data.get('regalo', ''), max_length=200).strip()

        # ── Validación robusta de datos de envío ──
        nombre_comp = f"{nombre} {apellido}".strip()
        errores = {}
        if not is_valid_nombre(nombre):
            errores['nombre'] = tr('err_nombre')
        if apellido and not is_valid_nombre(apellido):
            errores['apellido'] = tr('err_apellido')
        if not is_valid_email(email):
            errores['email'] = tr('err_email')
        if not is_valid_direccion(direccion):
            errores['direccion'] = tr('err_direccion')
        if not is_valid_telefono(telefono):
            errores['telefono'] = tr('err_telefono')
        if not ciudad or len(ciudad) < 2:
            errores['ciudad'] = tr('err_ciudad')
        if metodo_pago not in ('card', 'yape', 'transferencia', 'contrareembolso'):
            errores['metodo_pago'] = tr('err_metodo_pago')
        if not items or not isinstance(items, list) or len(items) == 0:
            errores['items'] = tr('err_items')
        if errores:
            return jsonify({'error': tr('err_revisar'), 'campos': errores}), 400

        if telefono:
            telefono = normalizar_telefono(telefono)

        if not isinstance(items, list) or not items:
            return jsonify({'error': 'El carrito está vacío'}), 400

        # ── Validación en servidor: recalcular precios desde la BD ──
        conn = get_db()
        items_validados = []
        ids = set()
        total = 0.0
        for item in items:
            if not isinstance(item, dict):
                continue
            try:
                pid = int(item.get('id') or item.get('producto_id') or 0)
                cantidad = int(item.get('cantidad') or item.get('qty') or 0)
            except (TypeError, ValueError):
                continue
            if pid <= 0 or cantidad <= 0 or pid in ids:
                continue
            ids.add(pid)
            fila = conn.execute(
                'SELECT id, nombre, precio, stock FROM productos WHERE id = ?', (pid,)
            ).fetchone()
            if not fila:
                continue
            if cantidad > fila['stock']:
                conn.close()
                return jsonify({'error': f'Stock insuficiente de "{fila["nombre"]}"'}), 400
            items_validados.append((pid, fila['nombre'], fila['precio'], cantidad))
            total += fila['precio'] * cantidad
        conn.close()

        if not items_validados:
            return jsonify({'error': 'No hay productos válidos en el pedido'}), 400

        subtotal = round(total, 2)

        # ── Aplicar cupón en el servidor (consistente con el frente) ──
        coupon_code = (data.get('coupon') or '').strip().upper()
        descuento = 0.0
        envio_free = False
        if coupon_code:
            cupon_conn = get_db()
            cupon = cupon_conn.execute(
                'SELECT * FROM cupones WHERE codigo = ? AND activo = 1 AND usos_actuales < usos_maximos',
                (coupon_code,)
            ).fetchone()
            if cupon:
                valido = True
                if cupon['expira']:
                    try:
                        valido = datetime.strptime(cupon['expira'], '%Y-%m-%d') >= datetime.now()
                    except (TypeError, ValueError):
                        valido = False
                if valido and subtotal >= cupon['minimo']:
                    if cupon['tipo'] == '%':
                        descuento = subtotal * cupon['descuento'] / 100
                    elif cupon['tipo'] == 'fixed':
                        descuento = float(cupon['descuento'])
                    elif cupon['tipo'] == 'shipping':
                        envio_free = True
                    if descuento > 0:
                        cupon_conn.execute(
                            'UPDATE cupones SET usos_actuales = usos_actuales + 1 WHERE id = ?',
                            (cupon['id'],)
                        )
                        cupon_conn.commit()
            cupon_conn.close()

        total_productos = round(max(subtotal - descuento, 0), 2)
        envio = 0.0
        if not envio_free and total_productos < 150:
            envio = 12.0
        total_final = round(total_productos + envio, 2)
        descuento = round(descuento, 2)

        conn = get_db()
        cursor = conn.execute(
            'INSERT INTO pedidos (usuario_id, nombre, email, direccion, total, metodo_pago, ciudad, telefono, envio, descuento, regalo_mensaje, token_rastreo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            (session['usuario_id'], nombre_comp or nombre, email, direccion, total_final, metodo_pago, ciudad, telefono, envio, descuento, regalo_mensaje, uuid.uuid4().hex[:16])
        )
        pedido_id = cursor.lastrowid

        for pid, pnombre, pp, cant in items_validados:
            conn.execute(
                'INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio, cantidad) VALUES (?,?,?,?,?)',
                (pedido_id, pid, pnombre, pp, cant)
            )

        conn.commit()
        conn.close()

        add_notificacion(session['usuario_id'], '📦 Pedido confirmado',
                         f'Tu pedido #{pedido_id} por S/.{total_final:.2f} ha sido confirmado.', 'success')
        add_xp(session['usuario_id'], 25)

        return jsonify({'success': True, 'pedido_id': pedido_id})

    conn = get_db()
    productos = [dict(p) for p in conn.execute(
        'SELECT * FROM productos ORDER BY id DESC'
    ).fetchall()]
    conn.close()
    return render_template('checkout.html', productos_json=productos)


@app.route('/confirmacion')
def confirmacion():
    pedido_id = request.args.get('pedido_id', '')
    if not pedido_id or not pedido_id.isdigit():
        flash('Pedido no encontrado.', 'warning')
        return redirect(url_for('index'))
    conn = get_db()
    pedido = conn.execute('SELECT * FROM pedidos WHERE id = ?', (int(pedido_id),)).fetchone()
    if not pedido:
        conn.close()
        flash('Pedido no encontrado.', 'warning')
        return redirect(url_for('index'))
    items = conn.execute('SELECT * FROM pedido_items WHERE pedido_id = ?', (int(pedido_id),)).fetchall()
    conn.close()
    if (pedido['usuario_id'] and session.get('usuario_id') != pedido['usuario_id']
            and session.get('rol') != 'admin'):
        flash('Este pedido no te pertenece.', 'warning')
        return redirect(url_for('index'))
    return render_template('confirmacion.html', pedido=pedido, items=items, pedido_id=pedido_id)


@app.route('/publicar', methods=['GET', 'POST'])
@login_required
def publicar():
    categorias = get_categorias()
    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        categoria = request.form.get('categoria', '').strip()
        precio = request.form.get('precio', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        stock = request.form.get('stock', '10').strip()
        condicion = request.form.get('condicion', 'nuevo').strip()
        especificaciones_raw = request.form.get('especificaciones', '').strip()
        ubicacion = request.form.get('ubicacion', '').strip()
        es_digital = 1 if request.form.get('es_digital') else 0
        imagen = get_product_image(categoria)

        # Subir imagen principal si se proporcionó
        if 'imagen' in request.files:
            file = request.files['imagen']
            if file and file.filename and allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                filename = f"{uuid.uuid4().hex}.{ext}"
                saved_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(saved_path)
                imagen = f'uploads/{filename}'

                # Generar miniatura (thumb)
                thumb_name = f"{uuid.uuid4().hex}_thumb.jpg"
                thumb_path = os.path.join(app.config['UPLOAD_FOLDER'], thumb_name)
                if _create_thumbnail(saved_path, thumb_path, max_size=800):
                    imagen_thumb = f'uploads/{thumb_name}'
                else:
                    imagen_thumb = ''
            else:
                imagen_thumb = ''
        else:
            imagen_thumb = ''

        if not all([nombre, categoria, precio, descripcion]):
            flash_t('campos_obligatorios', 'danger')
            return redirect(url_for('publicar'))

        try:
            precio_valor = float(precio)
            stock_valor = int(stock)
        except ValueError:
            flash_t('datos_invalidos_pub', 'danger')
            return redirect(url_for('publicar'))

        # Evitar duplicados accidentales: mismo usuario + mismo nombre (normalizado)
        conn = get_db()
        dup = conn.execute(
            "SELECT id FROM productos WHERE usuario_id = ? AND LOWER(TRIM(nombre)) = LOWER(TRIM(?)) LIMIT 1",
            (session['usuario_id'], nombre)
        ).fetchone()
        if dup:
            conn.close()
            flash('Ya tienes un producto con ese nombre. Edítalo en lugar de duplicarlo.', 'warning')
            return redirect(url_for('publicar'))

        # Procesar especificaciones (formato: "clave: valor" por línea)
        especificaciones_json = ''
        if especificaciones_raw:
            specs = {}
            for linea in especificaciones_raw.split('\n'):
                if ':' in linea:
                    clave, valor = linea.split(':', 1)
                    specs[clave.strip()] = valor.strip()
            if specs:
                especificaciones_json = json.dumps(specs, ensure_ascii=False)

        cursor = conn.execute(
            'INSERT INTO productos (nombre, categoria, precio, descripcion, imagen, imagen_thumb, stock, condicion, especificaciones, usuario_id, ubicacion, es_digital) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            (nombre, categoria, precio_valor, descripcion, imagen, imagen_thumb, stock_valor, condicion, especificaciones_json, session['usuario_id'], ubicacion, es_digital)
        )
        producto_id = cursor.lastrowid
        conn.execute('INSERT INTO historial_precios (producto_id, precio) VALUES (?,?)', (producto_id, precio_valor))

        # Subir imágenes adicionales (galería)
        if 'imagenes_extra' in request.files:
            files = request.files.getlist('imagenes_extra')
            orden = 0
            for file in files:
                if file and file.filename and allowed_file(file.filename):
                    ext = file.filename.rsplit('.', 1)[1].lower()
                    filename = f"{uuid.uuid4().hex}.{ext}"
                    saved_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(saved_path)
                    imagen_rel = f'uploads/{filename}'

                    # Generar miniatura para la imagen de la galería
                    thumb_name = f"{uuid.uuid4().hex}_thumb.jpg"
                    thumb_path = os.path.join(app.config['UPLOAD_FOLDER'], thumb_name)
                    imagen_thumb_rel = ''
                    if _create_thumbnail(saved_path, thumb_path, max_size=800):
                        imagen_thumb_rel = f'uploads/{thumb_name}'

                    conn.execute(
                        'INSERT INTO producto_imagenes (producto_id, imagen, imagen_thumb, titulo, orden) VALUES (?,?,?,?,?)',
                        (producto_id, imagen_rel, imagen_thumb_rel, '', orden)
                    )
                    orden += 1

        conn.commit()
        conn.close()

        add_xp(session['usuario_id'], 15)
        flash_t('producto_publicado', 'success')
        return redirect(url_for('producto_detalle', producto_id=producto_id))

    return render_template('publicar.html', categorias=categorias)


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/producto/<int:producto_id>/editar', methods=['GET', 'POST'])
@login_required
def editar_producto(producto_id):
    conn = get_db()
    producto = conn.execute('SELECT * FROM productos WHERE id = ? AND usuario_id = ?',
                            (producto_id, session['usuario_id'])).fetchone()
    if not producto:
        conn.close()
        flash_t('producto_no_encontrado', 'danger')
        return redirect(url_for('perfil'))

    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        categoria = request.form.get('categoria', '').strip()
        precio = request.form.get('precio', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        stock = request.form.get('stock', '10').strip()
        especificaciones_raw = request.form.get('especificaciones', '').strip()

        # Procesar especificaciones
        especificaciones_json = ''
        if especificaciones_raw:
            specs = {}
            for linea in especificaciones_raw.split('\n'):
                if ':' in linea:
                    clave, valor = linea.split(':', 1)
                    specs[clave.strip()] = valor.strip()
            if specs:
                especificaciones_json = json.dumps(specs, ensure_ascii=False)

        if all([nombre, categoria, precio, descripcion]):
            viejo = conn.execute('SELECT precio FROM productos WHERE id = ?', (producto_id,)).fetchone()
            conn.execute(
                'UPDATE productos SET nombre=?, categoria=?, precio=?, descripcion=?, stock=?, especificaciones=? WHERE id=?',
                (nombre, categoria, float(precio), descripcion, int(stock), especificaciones_json, producto_id)
            )
            if viejo and abs((viejo['precio'] or 0) - float(precio)) > 0.001:
                nuevo_precio = float(precio)
                conn.execute('INSERT INTO historial_precios (producto_id, precio) VALUES (?,?)', (producto_id, nuevo_precio))
                # alerta de baja de precio a quienes tienen el producto en favoritos
                if viejo['precio'] and nuevo_precio < viejo['precio']:
                    fans = conn.execute(
                        'SELECT usuario_id FROM favoritos WHERE producto_id = ? AND usuario_id != ?',
                        (producto_id, session.get('usuario_id'))
                    ).fetchall()
                    prod_nom = conn.execute('SELECT nombre FROM productos WHERE id = ?', (producto_id,)).fetchone()
                    nom = prod_nom['nombre'] if prod_nom else 'un producto'
                    for f in fans:
                        conn.execute(
                            'INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?,?,?,?)',
                            (f['usuario_id'], '¡Bajó de precio! 📉',
                             f'"{nom}" bajó de S/.{viejo["precio"]:.2f} a S/.{nuevo_precio:.2f} — está en tus favoritos.',
                             'precio')
                        )
            conn.commit()
            flash_t('producto_actualizado', 'success')
        conn.close()
        return redirect(url_for('perfil'))

    conn.close()
    return render_template('publicar.html', producto=producto, editando=True)


@app.route('/producto/<int:producto_id>/vendido', methods=['POST'])
@login_required
def toggle_vendido(producto_id):
    """Marca/desmarca un producto propio como vendido."""
    conn = get_db()
    prod = conn.execute('SELECT vendido FROM productos WHERE id = ? AND usuario_id = ?',
                        (producto_id, session['usuario_id'])).fetchone()
    if not prod:
        conn.close()
        flash_t('producto_no_encontrado', 'danger')
        return redirect(url_for('perfil'))
    nuevo = 0 if prod['vendido'] else 1
    conn.execute('UPDATE productos SET vendido = ? WHERE id = ?', (nuevo, producto_id))
    conn.commit()
    conn.close()
    flash('Producto marcado como vendido' if nuevo else 'Producto reactivado', 'success')
    return redirect(url_for('perfil'))


@app.route('/producto/<int:producto_id>/eliminar', methods=['POST'])
@login_required
def eliminar_producto(producto_id):
    conn = get_db()
    conn.execute('DELETE FROM productos WHERE id = ? AND usuario_id = ?',
                 (producto_id, session['usuario_id']))
    conn.commit()
    conn.close()
    flash_t('producto_eliminado', 'success')
    return redirect(url_for('perfil'))


@app.route('/producto/<int:producto_id>/upload_images', methods=['POST'])
@login_required
def upload_images_producto(producto_id):
    """Sube imágenes adicionales a la galería de un producto (dueño o admin)."""
    conn = get_db()
    producto = conn.execute('SELECT id, usuario_id FROM productos WHERE id = ?', (producto_id,)).fetchone()
    if not producto or (producto['usuario_id'] != session['usuario_id'] and session.get('rol') != 'admin'):
        conn.close()
        return jsonify({'error': 'No autorizado'}), 403

    files = request.files.getlist('images') or request.files.getlist('imagenes_extra')
    if not files:
        conn.close()
        return jsonify({'error': 'No se proporcionaron imágenes'}), 400

    orden = conn.execute(
        'SELECT COALESCE(MAX(orden), -1) + 1 FROM producto_imagenes WHERE producto_id = ?',
        (producto_id,)
    ).fetchone()[0]

    added = []
    for file in files:
        if not file or not file.filename or not allowed_file(file.filename):
            continue
        valido, _msg = validate_file_upload(file)
        if not valido:
            continue
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        saved_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(saved_path)
        imagen_rel = f'uploads/{filename}'

        thumb_name = f"{uuid.uuid4().hex}_thumb.jpg"
        thumb_path = os.path.join(app.config['UPLOAD_FOLDER'], thumb_name)
        imagen_thumb_rel = ''
        if _create_thumbnail(saved_path, thumb_path, max_size=800):
            imagen_thumb_rel = f'uploads/{thumb_name}'

        conn.execute(
            'INSERT INTO producto_imagenes (producto_id, imagen, imagen_thumb, titulo, orden) VALUES (?,?,?,?,?)',
            (producto_id, imagen_rel, imagen_thumb_rel, '', orden)
        )
        added.append(imagen_rel)
        orden += 1

    conn.commit()
    conn.close()
    return jsonify({'added': added, 'success': True}), 201 if added else 400


@app.route('/terminos')
def terminos():
    return render_template('terminos.html')

@app.route('/privacidad')
def privacidad():
    return render_template('privacidad.html')

@app.route('/contacto', methods=['GET', 'POST'])
def contacto():
    if request.method == 'POST':
        flash_t('mensaje_enviado', 'success')
        return redirect(url_for('contacto'))
    return render_template('contacto.html')


@app.route('/impacto')
def impacto():
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    categorias = conn.execute('SELECT COUNT(DISTINCT categoria) FROM productos').fetchone()[0]
    total_resenas = conn.execute('SELECT COUNT(*) FROM resenas').fetchone()[0]
    total_usuarios = conn.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0]
    total_visitas = conn.execute('SELECT COUNT(*) FROM visitas').fetchone()[0]
    total_pedidos = conn.execute('SELECT COUNT(*) FROM pedidos').fetchone()[0]
    # CO₂ evitado por mes (aprox: eco_score × 0.4 kg por unidad vendida)
    co2_rows = conn.execute('''
        SELECT strftime('%Y-%m', pe.created_at) AS mes, COALESCE(SUM(p.eco_score),0) AS pts
        FROM pedido_items pi
        JOIN pedidos pe ON pe.id = pi.pedido_id
        JOIN productos p ON p.id = pi.producto_id
        WHERE pe.created_at >= date('now', '-6 months')
        GROUP BY mes ORDER BY mes
    ''').fetchall()
    co2_mensual = [{'mes': r['mes'], 'co2': round(r['pts'] * 0.4, 1)} for r in co2_rows]
    co2_total = round(sum(m['co2'] for m in co2_mensual), 1)

    # Crecimiento real de la comunidad (donut de /impacto)
    nuevos = conn.execute(
        "SELECT COUNT(*) FROM usuarios WHERE created_at >= date('now', '-30 days')").fetchone()[0]
    activos = conn.execute('''SELECT COUNT(DISTINCT usuario_id) FROM pedidos
        WHERE created_at >= date('now', '-30 days') AND usuario_id IS NOT NULL''').fetchone()[0]
    base = max(1, total_usuarios)
    pct_nuevos = round(nuevos / base * 100)
    pct_activos = round(activos / base * 100)
    pct_recurrentes = max(0, 100 - pct_nuevos - pct_activos)
    conn.close()
    return render_template('impacto.html',
                           total_productos=total,
                           total_categorias=categorias,
                           total_resenas=total_resenas,
                           total_usuarios=total_usuarios,
                           total_visitas=total_visitas,
                           total_pedidos=total_pedidos,
                           co2_mensual=co2_mensual,
                           co2_total=co2_total,
                           pct_nuevos=pct_nuevos,
                           pct_activos=pct_activos,
                           pct_recurrentes=pct_recurrentes,
                           n_nuevos=nuevos, n_activos=activos)


# ── API Dashboard ────────────────────────────────────────────────────────────

@app.route('/api/dashboard')
@login_required
def api_dashboard():
    conn = get_db()
    user_id = session['usuario_id']

    mis_productos = conn.execute(
        'SELECT COUNT(*) FROM productos WHERE usuario_id = ?',
        (user_id,)
    ).fetchone()[0]

    mis_ventas = conn.execute('''
        SELECT COUNT(*) FROM pedido_items pi
        JOIN productos p ON pi.producto_id = p.id
        WHERE p.usuario_id = ?
    ''', (user_id,)).fetchone()[0]

    ingresos = conn.execute('''
        SELECT COALESCE(SUM(pi.precio * pi.cantidad), 0) FROM pedido_items pi
        JOIN productos p ON pi.producto_id = p.id
        WHERE p.usuario_id = ?
    ''', (user_id,)).fetchone()[0]

    resenas = conn.execute('''
        SELECT COUNT(*) FROM resenas r
        JOIN productos p ON r.producto_id = p.id
        WHERE p.usuario_id = ?
    ''', (user_id,)).fetchone()[0]

    seguidores = conn.execute(
        'SELECT COUNT(*) FROM seguidores WHERE seguido_id = ?',
        (user_id,)
    ).fetchone()[0]

    siguiendo = conn.execute(
        'SELECT COUNT(*) FROM seguidores WHERE seguidor_id = ?',
        (user_id,)
    ).fetchone()[0]

    ventas_mes = []
    for i in range(5, -1, -1):
        mes = (datetime.now() - timedelta(days=30 * i)).strftime('%Y-%m')
        count = conn.execute('''
            SELECT COUNT(*) FROM pedidos
            WHERE strftime('%Y-%m', created_at) = ?
        ''', (mes,)).fetchone()[0]
        ventas_mes.append({'mes': mes, 'ventas': count})

    conn.close()

    return jsonify({
        'mis_productos': mis_productos,
        'mis_ventas': mis_ventas,
        'ingresos': ingresos,
        'resenas': resenas,
        'seguidores': seguidores,
        'siguiendo': siguiendo,
        'ventas_mes': ventas_mes
    })


@app.route('/api/admin/dashboard')
@login_required
@admin_required
def api_admin_dashboard():
    conn = get_db()

    total_productos = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    total_usuarios = conn.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0]
    total_pedidos = conn.execute('SELECT COUNT(*) FROM pedidos').fetchone()[0]
    total_ingresos = conn.execute('SELECT COALESCE(SUM(total), 0) FROM pedidos').fetchone()[0]
    total_visitas = conn.execute('SELECT COUNT(*) FROM visitas').fetchone()[0]
    total_resenas = conn.execute('SELECT COUNT(*) FROM resenas').fetchone()[0]

    categorias = conn.execute(
        'SELECT categoria, COUNT(*) as count FROM productos GROUP BY categoria ORDER BY count DESC'
    ).fetchall()

    visitas_dia = []
    for i in range(6, -1, -1):
        dia = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        count = conn.execute(
            "SELECT COUNT(*) FROM visitas WHERE date(created_at) = ?",
            (dia,)
        ).fetchone()[0]
        visitas_dia.append({'dia': dia, 'visitas': count})

    conn.close()

    return jsonify({
        'total_productos': total_productos,
        'total_usuarios': total_usuarios,
        'total_pedidos': total_pedidos,
        'total_ingresos': total_ingresos,
        'total_visitas': total_visitas,
        'total_resenas': total_resenas,
        'categorias': [dict(c) for c in categorias],
        'visitas_dia': visitas_dia
    })


# ── API Cupones ──────────────────────────────────────────────────────────────

@app.route('/api/cupon/validar', methods=['POST'])
@login_required
def validar_cupon():
    data = request.get_json()
    codigo = data.get('codigo', '').strip().upper()
    total = float(data.get('total', 0))

    conn = get_db()
    cupon = conn.execute(
        'SELECT * FROM cupones WHERE codigo = ? AND activo = 1 AND usos_actuales < usos_maximos',
        (codigo,)
    ).fetchone()

    if not cupon:
        conn.close()
        return jsonify({'valido': False, 'error': 'Cupón inválido o expirado'})

    if cupon['expira']:
        expira = datetime.strptime(cupon['expira'], '%Y-%m-%d')
        if expira < datetime.now():
            conn.close()
            return jsonify({'valido': False, 'error': 'Cupón expirado'})

    if total < cupon['minimo']:
        conn.close()
        return jsonify({'valido': False, 'error': f'Mínimo S/.{cupon["minimo"]:.2f}'})

    descuento = 0
    if cupon['tipo'] == '%':
        descuento = total * cupon['descuento'] / 100
    elif cupon['tipo'] == 'fixed':
        descuento = cupon['descuento']
    elif cupon['tipo'] == 'shipping':
        descuento = float(data.get('envio', 0))

    conn.close()
    return jsonify({
        'valido': True,
        'tipo': cupon['tipo'],
        'descuento': round(descuento, 2),
        'total_final': round(total - descuento, 2),
        'codigo': cupon['codigo'],
        'label': cupon['codigo']
    })


# ── API Búsqueda ─────────────────────────────────────────────────────────────

@app.route('/api/buscar')
def api_buscar():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify([])

    conn = get_db()
    resultados = conn.execute('''
        SELECT id, nombre, precio, imagen, categoria
        FROM productos
        WHERE nombre LIKE ? OR descripcion LIKE ?
        LIMIT 10
    ''', (f'%{q}%', f'%{q}%')).fetchall()

    if 'usuario_id' in session:
        conn.execute(
            'INSERT INTO historial_busquedas (usuario_id, termino) VALUES (?,?)',
            (session['usuario_id'], q)
        )
        conn.commit()

    conn.close()
    return jsonify([dict(r) for r in resultados])


# ── API Recomendaciones, comparador, banners, cupones disponibles ─────────────

def _producto_api_json(row):
    """Convierte una fila de producto (sqlite3.Row/dict) al formato JSON de las APIs."""
    d = dict(row) if hasattr(row, 'keys') else dict(row)
    return {
        'id': d.get('id'),
        'nombre': d.get('nombre'),
        'precio': d.get('precio', 0) or 0,
        'precio_original': d.get('precio_original'),
        'categoria': d.get('categoria'),
        'descripcion': d.get('descripcion', ''),
        'imagen': d.get('imagen', ''),
        'imagen_thumb': d.get('imagen_thumb') or d.get('imagen', ''),
        'eco_score': d.get('eco_score', 0) or 0,
        'stock': d.get('stock', 0),
    }


def _productos_api_json(limit=12, exclude=()):
    conn = get_db()
    rows = conn.execute(
        'SELECT * FROM productos ORDER BY eco_score DESC, vistas DESC, id DESC LIMIT ?',
        (limit,)
    ).fetchall()
    conn.close()
    excl = set(int(x) for x in exclude if str(x).isdigit())
    return [_producto_api_json(r) for r in rows if r['id'] not in excl]


@app.route('/api/recommendations')
def api_recommendations():
    excl = request.args.get('exclude', '')
    return jsonify({'products': _productos_api_json(limit=12, exclude=excl.split(','))})


@app.route('/comparar')
def comparar_view():
    """Página del comparador visual de productos."""
    registrar_visita('comparar')
    conn = get_db()
    rows = conn.execute(
        "SELECT id, nombre, categoria, precio, precio_original, imagen, stock, condicion, eco_score, vistas, descripcion, ubicacion "
        "FROM productos WHERE COALESCE(vendido,0) = 0 ORDER BY nombre LIMIT 300"
    ).fetchall()
    conn.close()
    prods = [{
        'id': r['id'], 'nombre': r['nombre'], 'categoria': r['categoria'],
        'precio': r['precio'] or 0, 'precio_original': r['precio_original'],
        'imagen': r['imagen'] or '', 'stock': r['stock'] or 0,
        'condicion': r['condicion'] or '', 'eco_score': r['eco_score'] or 0,
        'vistas': r['vistas'] or 0, 'descripcion': (r['descripcion'] or '')[:220],
        'ubicacion': r['ubicacion'] or '',
    } for r in rows]
    return render_template('compare.html', productos_json=prods)


@app.route('/api/compare', methods=['POST'])
def api_compare():
    data = request.get_json() or {}
    ids = [int(x) for x in (data.get('ids') or []) if str(x).isdigit()]
    if not ids:
        return jsonify({'products': []})
    placeholders = ','.join('?' * len(ids))
    conn = get_db()
    filas = conn.execute(f'SELECT * FROM productos WHERE id IN ({placeholders})', ids).fetchall()
    conn.close()
    return jsonify({'products': [_producto_api_json(r) for r in filas]})


@app.route('/api/banners/activos')
def api_banners_activos():
    banners = [
        {
            'id': 1,
            'titulo': '¡Bienvenido a EcoMarket!',
            'descripcion': 'Descubre productos ecológicos de calidad.',
            'imagen': 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22300%22%3E%3Crect width=%22800%22 height=%22300%22 fill=%22%232e7d32%22/%3E%3Ctext x=%2240%22 y=%2240%22 fill=%22%23fff%22 font-size=%2236%22 font-family=%22Arial%22%3EBienvenido a EcoMarket%3C/text%3E%3C/svg%3E',
            'enlace': '/productos',
            'tipo': 'info',
            'descuento': None,
            'fecha_inicio': '2024-01-01',
            'fecha_fin': '2030-12-31',
            'activo': True,
        },
        {
            'id': 2,
            'titulo': 'Envío gratis',
            'descripcion': 'En pedidos mayores a S/. 50',
            'imagen': 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22300%22%3E%3Crect width=%22800%22 height=%22300%22 fill=%22%234caf50%22/%3E%3Ctext x=%2240%22 y=%2240%22 fill=%22%23fff%22 font-size=%2236%22 font-family=%22Arial%22%3EEnvio gratis%3C/text%3E%3C/svg%3E',
            'enlace': '/productos',
            'tipo': 'promo',
            'descuento': {'codigo': 'ENVIOFREE', 'valor': 'Envío gratis'},
            'fecha_inicio': '2024-01-01',
            'fecha_fin': '2030-12-31',
            'activo': True,
        },
        {
            'id': 3,
            'titulo': '10% de descuento',
            'descripcion': 'Usa el código ECO10',
            'imagen': 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22300%22%3E%3Crect width=%22800%22 height=%22300%22 fill=%22%23f59e0b%22/%3E%3Ctext x=%2240%22 y=%2240%22 fill=%22%23fff%22 font-size=%2236%22 font-family=%22Arial%22%3E10%% dto. con ECO10%3C/text%3E%3C/svg%3E',
            'enlace': '/productos?orden=baratos',
            'tipo': 'promo',
            'descuento': {'codigo': 'ECO10', 'valor': '10%'},
            'fecha_inicio': '2024-01-01',
            'fecha_fin': '2030-12-31',
            'activo': True,
        },
    ]
    return jsonify(banners)


@app.route('/api/cupones/disponibles')
def api_cupones_disponibles():
    conn = get_db()
    rows = conn.execute(
        'SELECT codigo, descuento, tipo, minimo FROM cupones WHERE activo = 1 AND usos_actuales < usos_maximos ORDER BY codigo'
    ).fetchall()
    conn.close()
    return jsonify([
        {
            'codigo': r['codigo'],
            'tipo': r['tipo'],
            'descuento': r['descuento'],
            'minimo': r['minimo'],
        }
        for r in rows
    ])


@app.route('/api/productos/destacados')
def api_productos_destacados():
    """Productos destacados para prefetch del cache/PWA."""
    excl = request.args.get('exclude', '')
    return jsonify({'products': _productos_api_json(limit=8, exclude=excl.split(','))})


# ── Asistente virtual de EcoMarket ───────────────────────────────────────────

_ASISTENTE_REGLAS = [
    # (patrones, respuesta, sugerencias)
    (['hola', 'buenas', 'hi', 'hello', 'hey'],
     '¡Hola! 👋 Soy el asistente de EcoMarket. Puedo ayudarte a encontrar productos, explicarte cómo comprar o vender, darte consejos ecológicos o resolver dudas sobre la plataforma.',
     ['¿Cómo funciona?', 'Quiero vender', 'Consejos ecológicos', 'Cupones']),
    (['como funciona', 'cómo funciona', 'how it works', 'que es', 'qué es'],
     'EcoMarket es un mercado de segunda mano y productos sostenibles. Para comprar: explora el catálogo, agrega al carrito y confirma tu pedido. Para vender: ve a "Publicar", completa el formulario y tu producto queda visible al instante. ¡Todo con pago y envío coordinado entre usuarios!',
     ['Quiero vender', 'Buscar productos', 'Cupones']),
    (['vender', 'publicar', 'vendo', 'quiero vender'],
     'Publicar es gratis y toma menos de 2 minutos: ve a la sección "Publicar", escribe nombre, descripción, precio y sube fotos. Te recomiendo usar el botón "Generar con IA" para crear una descripción atractiva automáticamente. ¿Ya tienes cuenta?',
     ['¿Cómo funciona?', 'Consejos para vender', 'Cupones']),
    (['cupon', 'descuento', 'oferta', 'promo'],
     '¡Tenemos cupones activos! Los encuentras en tu perfil (sección Cupones) o aplicándolos en el checkout. Ejemplos: ECO10 (10% dto), ECO20 (20% dto), BIENVENIDO (S/.15 dto) y ENVIOFREE (envío gratis). ¡Revisa tu perfil para ver todos!',
     ['Ver productos', 'Cómo comprar', 'Contacto']),
    (['envio', 'envío', 'entrega', 'delivery', 'llega'],
     'El envío lo coordinas directamente con el vendedor después de confirmar el pedido. Muchos vendedores ofrecen envío gratis en Lima y envío a todo el país. El costo aparece en el checkout antes de pagar.',
     ['Cómo comprar', 'Cupones', 'Contacto']),
    (['pago', 'pagar', 'tarjeta', 'efectivo', 'payment'],
     'Por ahora los pagos se coordinan entre comprador y vendedor (efectivo o transferencia al recibir el producto). Estamos trabajando en integrar pasarela de pagos segura para compras 100% en línea.',
     ['Cómo comprar', 'Cupones', 'Contacto']),
    (['reciclar', 'reciclaje', 'compostar', 'compost', 'separar basura', 'residuos', 'eco tips', 'consejos'],
     'Consejos ecológicos rápidos: ♻️ Separa papel, plástico, vidrio y orgánicos en contenedores distintos. 🌱 El compost casero convierte tus restos de comida en abono en 2-3 meses. 🚿 Duchas de 5 min ahorran ~75 litros de agua. 👜 Lleva tu propia bolsa siempre. ¿Quieres más tips?',
     ['Más consejos', 'Productos ecológicos', 'Cómo funciona']),
    (['mas consejos', 'más tips', 'otro consejo'],
     'Más ideas verdes: usa botellas reutilizables (ahorras ~167 botellas de plástico al año), compra a granel para evitar empaques, repara antes de tirar, y dona lo que ya no uses — en EcoMarket puedes venderlo a alguien que lo necesita.',
     ['Productos ecológicos', 'Vender mis cosas', 'Contacto']),
    (['contacto', 'soporte', 'ayuda', 'problema', 'reclamo', 'hablar con alguien'],
     'Para soporte humano puedes escribirnos desde la página de Contacto o abrir un ticket en Soporte (requiere iniciar sesión). Un equipo te responderá lo antes posible.',
     ['/contacto', 'Preguntas frecuentes', 'Inicio']),
    (['favorito', 'favoritos', 'wishlist', 'guardar producto'],
     'Puedes marcar productos como favoritos con el corazón en cada tarjeta o en la página del producto. Los encuentras luego en tu sección Favoritos del menú para no perderlos.',
     ['Ver productos', 'Cómo funciona']),
    (['carrito', 'carro', 'comprar', 'pedido'],
     'Para comprar: busca el producto, agrégalo al carrito, aplica un cupón si tienes, y confirma tus datos de envío. El vendedor coordina el pago y entrega contigo directamente.',
     ['Cupones', 'Cómo funciona', 'Contacto']),
    (['idioma', 'language', 'traducir', 'english'],
     'Puedes cambiar el idioma desde el selector en la esquina superior del menú (español, inglés, portugués, francés, alemán e italiano). ¡Toda la plataforma se traduce automáticamente!',
     ['Cómo funciona', 'Ver productos']),
]

_ASISTENTE_AYUDA = {
    'es': ('¡Hola! 👋 Soy Eco, tu asistente virtual. Puedo ayudarte con compras, ventas, cupones y consejos ecológicos. ¿En qué te ayudo?',
           ['¿Cómo funciona?', 'Quiero vender', 'Consejos ecológicos', 'Cupones']),
}


@app.route('/api/asistente', methods=['POST'])
def api_asistente():
    """Asistente virtual: intents por reglas + respuestas del sistema."""
    data = request.get_json(silent=True) or {}
    mensaje = (data.get('mensaje') or '').strip()[:500].lower()
    if not mensaje:
        return jsonify({'respuesta': 'Escribe tu pregunta y te ayudo.', 'sugerencias': []})

    # Cerebro conversacional con memoria y búsqueda real
    lang = session.get('lang', 'es')
    conn = get_db()
    try:
        resp = _chat_respuesta(mensaje, lang, conn)
    finally:
        conn.close()
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', resp)
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" class="asistente-link">\1</a>', html)
    html = html.replace('\n', '<br>')
    quick = (['productos baratos', 'Envíos', 'Cupones', 'Consejos eco', 'Mi cuenta'] if lang == 'es'
             else ['cheap products', 'Shipping', 'Coupons', 'Eco tips', 'My account'])
    return jsonify({'respuesta': html, 'sugerencias': quick})

    norm = ''.join(c for c in unicodedata.normalize('NFD', mensaje) if unicodedata.category(c) != 'Mn')

    # Búsqueda de productos por nombre/categoría
    if any(k in norm for k in ['buscar', 'encuentra', 'tienes', 'hay', 'muestra', 'quiero ver', 'venden']):
        termino = re.sub(r'(buscar|encuentra|tienes|hay|muestra|quiero ver|venden|de|del|la|el|un|una|productos?|algo)\s*', ' ', norm).strip()
        conn = get_db()
        like = f'%{termino}%' if termino else '%'
        rows = conn.execute(
            "SELECT id, nombre, precio, categoria FROM productos WHERE nombre LIKE ? OR categoria LIKE ? OR descripcion LIKE ? LIMIT 4",
            (like, like, like)
        ).fetchall()
        conn.close()
        if rows:
            items = ''.join(
                f'<a href="/producto/{r["id"]}" class="asistente-link">{r["nombre"]} <small>S/.{r["precio"]:.2f}</small></a>'
                for r in rows
            )
            return jsonify({'respuesta': f'Encontré {len(rows)} producto(s) para ti:<br>{items}', 'sugerencias': ['Más resultados', 'Otras categorías', 'Cupones']})
        return jsonify({'respuesta': f'No encontré "{termino}" todavía, pero hay 332+ productos. ¿Probamos con otra palabra o navegas el catálogo?',
                        'sugerencias': ['/productos', 'Categorías', 'Contacto']})

    for patrones, respuesta, sugerencias in _ASISTENTE_REGLAS:
        if any(p in norm for p in patrones):
            return jsonify({'respuesta': respuesta, 'sugerencias': sugerencias})

    # Sugerir categorías si menciona una
    conn = get_db()
    cats = [r['categoria'] for r in conn.execute('SELECT DISTINCT categoria FROM productos').fetchall()]
    conn.close()
    mencionada = next((c for c in cats if c.lower().replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u') in norm), None)
    if mencionada:
        return jsonify({'respuesta': f'¡Buena elección! Tenemos productos de {mencionada}. Puedes verlos todos en el catálogo filtrado.',
                        'sugerencias': [f'/productos?categoria={mencionada}', 'Ver todo', 'Cupones']})

    return jsonify({'respuesta': 'Hmm, no estoy segura de eso 🤔. Puedo ayudarte con: cómo comprar/vender, cupones, envíos, pagos, consejos ecológicos o buscar productos. ¿Qué necesitas?',
                    'sugerencias': ['¿Cómo funciona?', 'Quiero vender', 'Cupones', 'Consejos ecológicos']})


@app.route('/changelog')
def changelog_page():
    return render_template('changelog.html')


@app.route('/api/health')
def api_health():
    """Health check público para monitoreo y footer."""
    conn = get_db()
    try:
        productos = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
        usuarios = conn.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0]
    finally:
        conn.close()
    return jsonify({'status': 'ok', 'productos': productos, 'usuarios': usuarios,
                    'version': '3.2', 'time': datetime.now().isoformat()})


@app.route('/api/precios')
def api_precios():
    """Mapa id->precio de todos los productos (para alertas de bajada de precio)."""
    conn = get_db()
    rows = conn.execute('SELECT id, precio FROM productos').fetchall()
    conn.close()
    return jsonify({'precios': {str(r['id']): r['precio'] for r in rows}})


@app.route('/api/tendencias')
def api_tendencias():
    """Productos tendencia: más vistos esta semana."""
    conn = get_db()
    rows = conn.execute('''
        SELECT id, nombre, precio, imagen, categoria, eco_score, vistas
        FROM productos WHERE vendido = 0
        ORDER BY vistas DESC LIMIT 6
    ''').fetchall()
    conn.close()
    return jsonify({'tendencias': [dict(r) for r in rows]})


@app.route('/api/actividad')
def api_actividad():
    """Feed de actividad reciente para el ticker del home (solo primer nombre)."""
    conn = get_db()
    eventos = []
    prods = conn.execute('''
        SELECT p.nombre, p.categoria, u.nombre AS vendedor, p.created_at
        FROM productos p LEFT JOIN usuarios u ON u.id = p.usuario_id
        ORDER BY p.created_at DESC LIMIT 4
    ''').fetchall()
    for r in prods:
        vend = (r['vendedor'] or 'Alguien').split(' ')[0]
        eventos.append({'tipo': 'publico', 'texto': f'{vend} publicó "{r["nombre"][:30]}"', 'hora': r['created_at']})
    vendidos = conn.execute('''
        SELECT p.nombre, u.nombre AS comprador, pe.created_at AS ts
        FROM pedido_items pi
        JOIN pedidos pe ON pe.id = pi.pedido_id
        JOIN productos p ON p.id = pi.producto_id
        LEFT JOIN usuarios u ON u.id = pe.usuario_id
        ORDER BY pe.created_at DESC LIMIT 4
    ''').fetchall()
    for r in vendidos:
        comp = (r['comprador'] or 'Alguien').split(' ')[0]
        eventos.append({'tipo': 'vendo', 'texto': f'"{r["nombre"][:30]}" voló a las manos de {comp}', 'hora': r['ts']})
    conn.close()
    return jsonify({'eventos': eventos[:8]})


@app.route('/leaderboard')
def leaderboard_page():
    return render_template('leaderboard.html')


@app.route('/api/leaderboard')
def api_leaderboard():
    """Leaderboard ecológico: usuarios con más puntos + actividad de ventas."""
    conn = get_db()
    rows = conn.execute('''
        SELECT u.id, u.nombre, u.eco_puntos, u.nivel,
               (SELECT COUNT(*) FROM productos p WHERE p.usuario_id = u.id) AS productos,
               (SELECT COUNT(*) FROM productos p WHERE p.usuario_id = u.id AND p.vendido = 1) AS ventas
        FROM usuarios u
        ORDER BY u.eco_puntos DESC, productos DESC, ventas DESC
        LIMIT 10
    ''').fetchall()
    conn.close()
    return jsonify({'top': [dict(r, puntos=r['eco_puntos'] or 0) for r in rows]})


# ── Trueque, reservas y precio sugerido ──────────────────────────────

@app.route('/api/trueque', methods=['POST'])
@login_required
def api_trueque_crear():
    """Propone un trueque: ofrezco producto_mio a cambio de producto_id."""
    data = request.get_json(silent=True) or {}
    producto_id = int(data.get('producto_id') or 0)
    producto_mio = int(data.get('producto_mio') or 0)
    mensaje = sanitize_string(data.get('mensaje', ''))[:500]
    if not producto_id or not producto_mio or producto_id == producto_mio:
        return jsonify({'error': 'Selección inválida'}), 400
    conn = get_db()
    target = conn.execute('SELECT usuario_id, nombre FROM productos WHERE id = ? AND COALESCE(vendido,0)=0 AND usuario_id IS NOT NULL', (producto_id,)).fetchone()
    mio = conn.execute('SELECT usuario_id FROM productos WHERE id = ? AND usuario_id = ? AND COALESCE(vendido,0)=0',
                       (producto_mio, session['usuario_id'])).fetchone()
    if not target or not mio or target['usuario_id'] == session['usuario_id']:
        conn.close()
        return jsonify({'error': 'No puedes proponer ese trueque'}), 400
    existe = conn.execute(
        "SELECT id FROM trueques WHERE producto_id=? AND producto_mio=? AND propuesto_por=? AND estado='pendiente'",
        (producto_id, producto_mio, session['usuario_id'])).fetchone()
    if existe:
        conn.close()
        return jsonify({'error': 'Ya enviaste esa propuesta'}), 400
    cur = conn.execute(
        'INSERT INTO trueques (producto_id, producto_mio, propuesto_por, mensaje) VALUES (?,?,?,?)',
        (producto_id, producto_mio, session['usuario_id'], mensaje))
    conn.commit()
    trueque_id = cur.lastrowid
    usuario = conn.execute('SELECT nombre FROM usuarios WHERE id=?', (session['usuario_id'],)).fetchone()
    quien = (usuario['nombre'] if usuario else 'Alguien').split(' ')[0]
    if target['usuario_id']:
        add_notificacion(target['usuario_id'], '🔄 Nueva propuesta de trueque',
                         f'{quien} quiere cambiar su producto por el tuyo "{target["nombre"][:40]}"', 'success')
    conn.close()
    return jsonify({'success': True, 'id': trueque_id})


@app.route('/api/trueques')
@login_required
def api_trueques():
    """Mis trueques enviados y recibidos."""
    uid = session['usuario_id']
    conn = get_db()
    recibidas = conn.execute('''
        SELECT t.*, p.nombre AS prod_nombre, p.precio AS prod_precio,
               pm.nombre AS mio_nombre, pm.precio AS mio_precio, pm.id AS mio_id,
               u.nombre AS de_quien
        FROM trueques t
        JOIN productos p ON p.id = t.producto_id
        JOIN productos pm ON pm.id = t.producto_mio
        JOIN usuarios u ON u.id = t.propuesto_por
        WHERE p.usuario_id = ? ORDER BY t.created_at DESC LIMIT 20
    ''', (uid,)).fetchall()
    enviadas = conn.execute('''
        SELECT t.*, p.nombre AS prod_nombre, p.precio AS prod_precio,
               pm.nombre AS mio_nombre, pm.precio AS mio_precio,
               u.nombre AS dueno
        FROM trueques t
        JOIN productos p ON p.id = t.producto_id
        JOIN productos pm ON pm.id = t.producto_mio
        JOIN usuarios u ON u.id = p.usuario_id
        WHERE t.propuesto_por = ? ORDER BY t.created_at DESC LIMIT 20
    ''', (uid,)).fetchall()
    conn.close()
    return jsonify({
        'recibidas': [dict(r) for r in recibidas],
        'enviadas': [dict(r) for r in enviadas],
    })


@app.route('/api/trueque/<int:trueque_id>/estado', methods=['POST'])
@login_required
def api_trueque_estado(trueque_id):
    """Aceptar/rechazar una propuesta de trueque (solo el dueño del producto)."""
    data = request.get_json(silent=True) or {}
    estado = data.get('estado')
    if estado not in ('aceptado', 'rechazado'):
        return jsonify({'error': 'Estado inválido'}), 400
    conn = get_db()
    t = conn.execute('''
        SELECT t.*, p.usuario_id AS dueno_id, p.nombre AS prod_nombre, pm.nombre AS mio_nombre
        FROM trueques t JOIN productos p ON p.id = t.producto_id JOIN productos pm ON pm.id = t.producto_mio
        WHERE t.id = ?''', (trueque_id,)).fetchone()
    if not t or t['dueno_id'] != session['usuario_id']:
        conn.close()
        return jsonify({'error': 'No autorizado'}), 403
    conn.execute('UPDATE trueques SET estado = ? WHERE id = ?', (estado, trueque_id))
    conn.commit()
    if estado == 'aceptado':
        add_notificacion(t['propuesto_por'], '🎉 ¡Trueque aceptado!',
                         f'"{t["prod_nombre"][:35]}" es tuyo — coordina el cambio con el vendedor', 'success')
    conn.close()
    return jsonify({'success': True})


@app.route('/api/reservar/<int:producto_id>', methods=['POST'])
@login_required
def api_reservar(producto_id):
    """Reserva un producto por 24h."""
    conn = get_db()
    p = conn.execute('SELECT usuario_id, nombre, vendido, reservado_hasta, reservado_por FROM productos WHERE id=?', (producto_id,)).fetchone()
    if not p or p['vendido']:
        conn.close()
        return jsonify({'error': 'Producto no disponible'}), 404
    if p['usuario_id'] == session['usuario_id']:
        conn.close()
        return jsonify({'error': 'No puedes reservar tu propio producto'}), 400
    ahora = datetime.now()
    if p['reservado_hasta'] and p['reservado_por'] != session['usuario_id']:
        try:
            hasta = datetime.strptime(p['reservado_hasta'], '%Y-%m-%d %H:%M:%S')
            if ahora < hasta:
                conn.close()
                return jsonify({'error': 'Este producto ya está reservado'}), 409
        except ValueError:
            pass
    hasta_str = (ahora + timedelta(hours=24)).strftime('%Y-%m-%d %H:%M:%S')
    conn.execute('UPDATE productos SET reservado_hasta=?, reservado_por=? WHERE id=?',
                 (hasta_str, session['usuario_id'], producto_id))
    conn.commit()
    u = conn.execute('SELECT nombre FROM usuarios WHERE id=?', (session['usuario_id'],)).fetchone()
    quien = (u['nombre'] if u else 'Alguien').split(' ')[0]
    if p['usuario_id']:
        add_notificacion(p['usuario_id'], '📦 Producto reservado',
                         f'{quien} reservó "{p["nombre"][:40]}" por 24h', 'info')
    conn.close()
    return jsonify({'success': True, 'hasta': hasta_str})


@app.route('/api/notificaciones')
@login_required
def api_notificaciones():
    """Últimas notificaciones del usuario para la campana del header."""
    conn = get_db()
    rows = conn.execute('''
        SELECT id, titulo, mensaje, tipo, leida, created_at
        FROM notificaciones WHERE usuario_id = ?
        ORDER BY created_at DESC LIMIT 8
    ''', (session['usuario_id'],)).fetchall()
    no_leidas = conn.execute(
        'SELECT COUNT(*) FROM notificaciones WHERE usuario_id = ? AND leida = 0',
        (session['usuario_id'],)).fetchone()[0]
    conn.close()
    return jsonify({'notificaciones': [dict(r) for r in rows], 'no_leidas': no_leidas})


# ── Muro de agradecimientos ────────────────────────────────────────

@app.route('/api/agradecimientos')
def api_agradecimientos():
    """Mensajes públicos de agradecimiento a la comunidad."""
    conn = get_db()
    rows = conn.execute('''
        SELECT a.mensaje, a.created_at, u.nombre
        FROM agradecimientos a LEFT JOIN usuarios u ON u.id = a.usuario_id
        ORDER BY a.created_at DESC LIMIT 12
    ''').fetchall()
    conn.close()
    return jsonify({'mensajes': [dict(r) for r in rows]})


@app.route('/api/agradecimientos', methods=['POST'])
@login_required
def api_agradecimiento_crear():
    data = request.get_json(silent=True) or {}
    mensaje = sanitize_string(data.get('mensaje', ''), max_length=280)
    if len(mensaje.strip()) < 5:
        return jsonify({'error': 'Escribe algo (mínimo 5 caracteres)'}), 400
    conn = get_db()
    conn.execute('INSERT INTO agradecimientos (usuario_id, mensaje) VALUES (?,?)',
                 (session['usuario_id'], mensaje.strip()))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# ── Motor de logros e insignias ────────────────────────────────────

LOGROS = {
    'primera_compra':  ('🛍️', 'Primera compra', 'Completa tu primer pedido'),
    'eco_semilla':     ('🌱', 'Eco Semilla', 'Consigue 50 pts eco'),
    'eco_guardiana':   ('🌿', 'Eco Guardiana', 'Consigue 200 pts eco'),
    'vendiendo':       ('🏪', 'Ya vendo', 'Publica tu primer producto'),
    'vendedor_pro':    ('🌳', 'Vendedor Pro', 'Publica 5 productos'),
    'cliente_fiel':    ('💚', 'Cliente Fiel', 'Haz 3 compras'),
    'compartiendo':    ('🎁', 'Corazón verde', 'Invita a 3 amigos con tu código'),
    'explorador':      ('🧭', 'Explorador', 'Busca 10 productos distintos'),
}


def _evaluar_logros(conn, uid):
    """Devuelve los logro_id que el usuario YA tiene."""
    rows = conn.execute('SELECT logro_id FROM logros WHERE usuario_id=?', (uid,)).fetchall()
    return {r['logro_id'] for r in rows}


@app.route('/api/logros/check', methods=['POST'])
@login_required
def api_logros_check():
    """Evalúa condiciones y desbloquea logros nuevos."""
    uid = session['usuario_id']
    conn = get_db()
    u = conn.execute('SELECT COALESCE(eco_puntos,0) pts FROM usuarios WHERE id=?', (uid,)).fetchone()
    pts = u['pts'] if u else 0
    compras = conn.execute("SELECT COUNT(*) FROM pedidos WHERE usuario_id=?", (uid,)).fetchone()[0]
    productos = conn.execute("SELECT COUNT(*) FROM productos WHERE usuario_id=?", (uid,)).fetchone()[0]
    referidos = conn.execute("SELECT COUNT(*) FROM referidos WHERE referente_id=?", (uid,)).fetchone()[0]
    busquedas = conn.execute("SELECT COUNT(DISTINCT termino) FROM historial_busquedas WHERE usuario_id=?", (uid,)).fetchone()[0]
    ya = _evaluar_logros(conn, uid)
    nuevos = []
    condiciones = {
        'primera_compra': compras >= 1,
        'eco_semilla': pts >= 50,
        'eco_guardiana': pts >= 200,
        'vendiendo': productos >= 1,
        'vendedor_pro': productos >= 5,
        'cliente_fiel': compras >= 3,
        'compartiendo': referidos >= 3,
        'explorador': busquedas >= 10,
    }
    for lid, ok in condiciones.items():
        if ok and lid not in ya:
            conn.execute('INSERT INTO logros (usuario_id, logro_id) VALUES (?,?)', (uid, lid))
            nuevos.append(lid)
    conn.commit()
    conn.close()
    for lid in nuevos:
        emoji, nombre, desc = LOGROS[lid]
        add_notificacion(uid, f'{emoji} ¡Logro desbloqueado: {nombre}!', desc, 'success')
    return jsonify({'nuevos': nuevos, 'total': len(ya) + len(nuevos)})


@app.route('/api/logros')
@login_required
def api_logros():
    """Mis logros desbloqueados."""
    conn = get_db()
    rows = conn.execute('SELECT logro_id, created_at FROM logros WHERE usuario_id=? ORDER BY created_at',
                        (session['usuario_id'],)).fetchall()
    conn.close()
    ids = {r['logro_id'] for r in rows}
    return jsonify({'logros': [
        {'id': lid, 'emoji': v[0], 'nombre': v[1], 'desc': v[2],
         'desbloqueado': lid in ids, 'fecha': next((r['created_at'] for r in rows if r['logro_id'] == lid), None)}
        for lid, v in LOGROS.items()]})


# ── Quiz semanal ecológico ─────────────────────────────────────────

QUIZ_PREGUNTAS = [
    {'p': '¿Cuánto tarda una botella plástica en degradarse?', 'o': ['10 años', '100 años', '450 años', '1 año'], 'r': 2},
    {'p': '¿Qué material es el más reciclable?', 'o': ['Plástico', 'Vidrio', 'Teléfono móvil', 'Papel mojado'], 'r': 1},
    {'p': '¿Cuántos litros de agua se ahorran con una botella reutilizable al año?', 'o': ['50 L', '100 L', '217 L', '500 L'], 'r': 2},
    {'p': '¿Qué es el compostaje?', 'o': ['Quemar basura', 'Descomponer orgánicos en abono', 'Enterrar plástico', 'Pintar reciclaje'], 'r': 1},
    {'p': '¿Cuál es el mayor contaminante de océanos?', 'o': ['Petróleo', 'Plástico', 'Vidrio', 'Papel'], 'r': 1},
    {'p': '¿Qué significa el código ♻️?', 'o': ['Reducir, Reutilizar, Reciclar', 'Reparar, Ropa, Rueda', 'Rápido, Rico, Real', 'Raíz, Rama, Roca'], 'r': 0},
    {'p': '¿Cuántas bolsas plásticas usa una persona promedio al año?', 'o': ['10', '100', '300', '500'], 'r': 2},
    {'p': '¿Qué es la huella de carbono?', 'o': ['El peso de una persona', 'Emisiones de CO₂ de una actividad', 'La marca del zapato', 'Un tipo de energía'], 'r': 1},
    {'p': '¿Por qué el bambú es un material ecológico popular?', 'o': ['Es un metal', 'Es resistente y biodegradable', 'No se puede reciclar', 'Es un plástico'], 'r': 1},
    {'p': '¿Cada cuánto conviene revisar la presión de llantas para ahorrar gasolina?', 'o': ['Nunca', 'Cada 6 meses', 'Cada mes', 'Cada día'], 'r': 2},
]


@app.route('/api/quiz')
def api_quiz_preguntas():
    """5 preguntas aleatorias del quiz (sin respuestas)."""
    import random as _rnd
    qs = _rnd.sample(QUIZ_PREGUNTAS, 5)
    return jsonify({'preguntas': [{'p': q['p'], 'o': q['o']} for q in qs],
                    'ids': [QUIZ_PREGUNTAS.index(q) for q in qs]})


@app.route('/api/quiz/responder', methods=['POST'])
@login_required
def api_quiz_responder():
    """Califica el quiz; premio de pts eco una vez por semana ISO."""
    data = request.get_json(silent=True) or {}
    respuestas = data.get('respuestas', [])
    ids = data.get('ids', [])
    uid = session['usuario_id']
    conn = get_db()
    # Una semana por usuario (claves por año-semana en tabla logros como 'quiz_YYYY_WW')
    iso = datetime.now().isocalendar()
    clave = f'quiz_{iso[0]}_{iso[1]}'
    ya = conn.execute('SELECT 1 FROM logros WHERE usuario_id=? AND logro_id=?', (uid, clave)).fetchone()
    if ya:
        conn.close()
        return jsonify({'error': 'Ya participaste esta semana. ¡Vuelve el próximo lunes!'}), 429
    correctas = 0
    for idx, resp in zip(ids, respuestas):
        if 0 <= idx < len(QUIZ_PREGUNTAS) and resp == QUIZ_PREGUNTAS[idx]['r']:
            correctas += 1
    premio = correctas * 20  # 20 pts por acierto
    conn.execute('INSERT INTO logros (usuario_id, logro_id) VALUES (?,?)', (uid, clave))
    conn.execute('UPDATE usuarios SET eco_puntos = COALESCE(eco_puntos,0) + ? WHERE id=?', (premio, uid))
    conn.commit()
    conn.close()
    add_notificacion(uid, '🎓 ¡Quiz completado!', f'Acertaste {correctas}/5 — ganaste {premio} pts eco', 'success')
    return jsonify({'success': True, 'correctas': correctas, 'total': 5, 'premio': premio})


# ── Ofertas flash (mayor descuento del catálogo) ───────────────────

@app.route('/api/ofertas-flash')
def api_ofertas_flash():
    """Productos con mayor % de descuento."""
    conn = get_db()
    rows = conn.execute('''
        SELECT id, nombre, precio, precio_original, imagen, categoria, eco_score
        FROM productos
        WHERE COALESCE(vendido,0)=0 AND precio_original IS NOT NULL AND precio_original > precio
        ORDER BY (precio_original - precio) / precio_original DESC LIMIT 8
    ''').fetchall()
    conn.close()
    return jsonify({'ofertas': [dict(r) for r in rows]})


# ── Monedero EcoCoins: canje de puntos por cupones ─────────────────

CANJES = {500: 10, 1000: 15, 2000: 25}  # puntos -> % descuento

@app.route('/api/canjear-cupon', methods=['POST'])
@login_required
def api_canjear_cupon():
    """Canjea eco_puntos por un cupón personal de descuento."""
    data = request.get_json(silent=True) or {}
    puntos = int(data.get('puntos') or 0)
    if puntos not in CANJES:
        return jsonify({'error': 'Opción de canje inválida'}), 400
    uid = session['usuario_id']
    conn = get_db()
    u = conn.execute('SELECT COALESCE(eco_puntos,0) AS pts FROM usuarios WHERE id=?', (uid,)).fetchone()
    if not u or u['pts'] < puntos:
        conn.close()
        return jsonify({'error': f'Necesitas {puntos} pts eco (tienes {u["pts"] if u else 0})'}), 400
    codigo = 'ECOM-' + secrets.token_hex(4).upper()
    expira = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S')
    conn.execute(
        'INSERT INTO cupones (codigo, descuento, tipo, minimo, usos_maximos, usos_actuales, expira, activo, propietario_id) VALUES (?,?,?,?,?,?,?,?,?)',
        (codigo, CANJES[puntos], '%', 20, 1, 0, expira, 1, uid))
    conn.execute('UPDATE usuarios SET eco_puntos = COALESCE(eco_puntos,0) - ? WHERE id=?', (puntos, uid))
    conn.commit()
    conn.close()
    add_notificacion(uid, '🎟️ ¡Cupón canjeado!', f'Tu código {codigo} (-{CANJES[puntos]}%) ya está en tu monedero', 'success')
    return jsonify({'success': True, 'codigo': codigo, 'descuento': CANJES[puntos], 'puntos_restantes': u['pts'] - puntos})


@app.route('/api/mis-cupones')
@login_required
def api_mis_cupones():
    """Cupones personales del usuario (canjeados con puntos)."""
    conn = get_db()
    rows = conn.execute('''
        SELECT codigo, descuento, tipo, expira, usos_actuales, usos_maximos
        FROM cupones WHERE propietario_id = ? AND activo = 1 ORDER BY id DESC LIMIT 20
    ''', (session['usuario_id'],)).fetchall()
    puntos = conn.execute('SELECT COALESCE(eco_puntos,0) FROM usuarios WHERE id=?',
                          (session['usuario_id'],)).fetchone()[0]
    conn.close()
    return jsonify({'cupones': [dict(r) for r in rows], 'puntos': puntos, 'canjes': CANJES})


@app.route('/api/busquedas-recientes')
@login_required
def api_busquedas_recientes():
    """Últimas búsquedas del usuario para chips de búsqueda rápida."""
    conn = get_db()
    rows = conn.execute('''
        SELECT termino, MAX(created_at) AS ultima FROM historial_busquedas
        WHERE usuario_id = ? GROUP BY LOWER(termino) ORDER BY ultima DESC LIMIT 6
    ''', (session['usuario_id'],)).fetchall()
    conn.close()
    return jsonify({'busquedas': [r['termino'] for r in rows]})


@app.route('/usuario/<int:usuario_id>')
def perfil_publico(usuario_id):
    """Perfil público ecológico de un usuario."""
    conn = get_db()
    u = conn.execute('''
        SELECT id, nombre, avatar, avatar_color, bio, ciudad, created_at,
               COALESCE(eco_puntos,0) AS eco_puntos, COALESCE(xp,0) AS xp, nivel, rango,
               COALESCE(email_verificado,0) AS verificado
        FROM usuarios WHERE id = ?
    ''', (usuario_id,)).fetchone()
    if not u:
        conn.close()
        return render_template('404.html'), 404
    stats = {
        'productos': conn.execute('SELECT COUNT(*) FROM productos WHERE usuario_id=?', (usuario_id,)).fetchone()[0],
        'ventas': conn.execute('SELECT COUNT(*) FROM productos WHERE usuario_id=? AND vendido=1', (usuario_id,)).fetchone()[0],
        'resenas': conn.execute('SELECT COUNT(*) FROM resenas r JOIN productos p ON p.id=r.producto_id WHERE p.usuario_id=?', (usuario_id,)).fetchone()[0],
        'referidos': conn.execute('SELECT COUNT(*) FROM referidos WHERE referente_id=?', (usuario_id,)).fetchone()[0],
    }
    recientes = conn.execute('''
        SELECT id, nombre, precio, imagen, categoria FROM productos
        WHERE usuario_id=? AND COALESCE(vendido,0)=0 ORDER BY created_at DESC LIMIT 6
    ''', (usuario_id,)).fetchall()
    conn.close()
    return render_template('perfil_publico.html', u=dict(u), stats=stats, productos=[dict(r) for r in recientes])


@app.route('/api/referido')
@login_required
def api_referido():
    """Datos del programa de referidos del usuario."""
    uid = session['usuario_id']
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM referidos WHERE referente_id=?', (uid,)).fetchone()[0]
    puntos = conn.execute('SELECT COALESCE(eco_puntos,0) FROM usuarios WHERE id=?', (uid,)).fetchone()[0]
    conn.close()
    return jsonify({'codigo': f'EC{uid}', 'total': total, 'puntos': puntos})


@app.route('/api/mis-productos')
@login_required
def api_mis_productos():
    """Productos del usuario logueado (para trueque y herramientas)."""
    conn = get_db()
    rows = conn.execute('''
        SELECT id, nombre, precio, imagen, categoria FROM productos
        WHERE usuario_id = ? AND COALESCE(vendido,0)=0 ORDER BY created_at DESC LIMIT 50
    ''', (session['usuario_id'],)).fetchall()
    conn.close()
    return jsonify({'productos': [dict(r) for r in rows]})


@app.route('/api/precio-sugerido/<categoria>')
def api_precio_sugerido(categoria):
    """Precio sugerido por IA: mediana de la categoría."""
    conn = get_db()
    precios = [r[0] for r in conn.execute(
        'SELECT precio FROM productos WHERE categoria = ? AND COALESCE(vendido,0)=0 AND precio > 0',
        (categoria,)).fetchall()]
    conn.close()
    if len(precios) < 3:
        return jsonify({'sugerido': None, 'muestras': len(precios)})
    precios.sort()
    mediana = precios[len(precios) // 2]
    return jsonify({'sugerido': round(mediana, 2), 'muestras': len(precios)})


@app.route('/trueques')
@login_required
def trueques_page():
    return render_template('trueques.html')


@app.route('/api/categorias')
def api_categorias():
    """Lista de categorías para filtros y prefetch del cache/PWA."""
    conn = get_db()
    categorias = [r['categoria'] for r in
                  conn.execute('SELECT DISTINCT categoria FROM productos WHERE categoria IS NOT NULL ORDER BY categoria').fetchall()]
    conn.close()
    return jsonify(categorias)


@app.route('/api/recomendaciones/wishlist')
def api_recomendaciones_wishlist():
    conn = get_db()
    rows = conn.execute(
        'SELECT id, nombre, imagen, precio FROM productos ORDER BY eco_score DESC, vistas DESC LIMIT 6'
    ).fetchall()
    conn.close()
    return jsonify([
        {'id': r['id'], 'name': r['nombre'], 'price': r['precio'] or 0, 'image': r['imagen'] or ''}
        for r in rows
    ])


@app.route('/api/reviews/vote', methods=['POST'])
@login_required
def api_reviews_vote():
    data = request.get_json() or {}
    try:
        resena_id = int(data.get('review_id') or 0)
    except (TypeError, ValueError):
        resena_id = 0
    voto = 1 if data.get('vote_type') == 'up' else (-1 if data.get('vote_type') == 'down' else 0)
    if resena_id <= 0 or voto not in (1, -1):
        return jsonify({'error': 'Datos inválidos'}), 400

    conn = get_db()
    existe = conn.execute('SELECT id FROM resenas WHERE id = ?', (resena_id,)).fetchone()
    if not existe:
        conn.close()
        return jsonify({'error': 'Reseña no encontrada'}), 404
    fila = conn.execute(
        'SELECT id, voto FROM resena_votos WHERE resena_id = ? AND usuario_id = ?',
        (resena_id, session['usuario_id'])
    ).fetchone()
    if fila:
        if fila['voto'] == voto:
            conn.execute('DELETE FROM resena_votos WHERE id = ?', (fila['id'],))
        else:
            conn.execute('UPDATE resena_votos SET voto = ? WHERE id = ?', (voto, fila['id']))
    else:
        conn.execute(
            'INSERT INTO resena_votos (resena_id, usuario_id, voto) VALUES (?,?,?)',
            (resena_id, session['usuario_id'], voto)
        )
    conn.commit()
    nuevo = conn.execute(
        'SELECT COALESCE(SUM(voto), 0) as n FROM resena_votos WHERE resena_id = ?',
        (resena_id,)
    ).fetchone()['n']
    conn.close()
    return jsonify({'success': True, 'new_count': nuevo})


@app.route('/api/reviews', methods=['GET', 'POST'])
def api_reviews_sync():
    """Lista reseñas de un producto (GET) o recibe reseña nueva / sincroniza offline (POST)."""
    if request.method == 'GET':
        try:
            producto_id = int(request.args.get('producto_id') or request.args.get('productId') or 0)
        except (TypeError, ValueError):
            producto_id = 0
        if producto_id <= 0:
            return jsonify({'reviews': [], 'average_rating': 0, 'rating_distribution': {}, 'user_review': None})
        conn = get_db()
        rows = conn.execute(
            "SELECT r.id, r.usuario_id, r.nombre, r.rating, r.comentario, r.compra_verificada, r.created_at, r.foto, "
            "COALESCE(SUM(CASE WHEN rv.voto = 1 THEN 1 ELSE 0 END), 0) AS votes_helpful, "
            "COALESCE(SUM(CASE WHEN rv.voto = -1 THEN 1 ELSE 0 END), 0) AS votes_not_helpful "
            "FROM resenas r LEFT JOIN resena_votos rv ON rv.resena_id = r.id "
            "WHERE r.producto_id = ? GROUP BY r.id ORDER BY r.id DESC",
            (producto_id,)
        ).fetchall()
        reviews = []
        dist = {}
        total = 0
        for row in rows:
            rating = row['rating'] or 0
            dist[rating] = dist.get(rating, 0) + 1
            total += rating
            nombre = row['nombre'] or ('Usuario ' + str(row['usuario_id']) if row['usuario_id'] else 'Anónimo')
            reviews.append({
                'id': row['id'],
                'producto_id': producto_id,
                'usuario_id': row['usuario_id'],
                'nombre': nombre,
                'usuario_nombre': nombre,
                'usuario_avatar': '',
                'rating': rating,
                'titulo': None,
                'texto': row['comentario'] or '',
                'comentario': row['comentario'] or '',
                'compra_verificada': bool(row['compra_verificada']),
                'recomienda': None,
                'fotos': [('/static/' + row['foto'])] if row['foto'] else [],
                'video': None,
                'respuesta': None,
                'votes_helpful': row['votes_helpful'] or 0,
                'votes_not_helpful': row['votes_not_helpful'] or 0,
                'created_at': row['created_at'] or '',
            })
        avg = round(total / len(reviews), 2) if reviews else 0
        uid = session.get('usuario_id')
        user_review = None
        if uid:
            ur = conn.execute(
                'SELECT id, rating FROM resenas WHERE producto_id = ? AND usuario_id = ? ORDER BY id DESC LIMIT 1',
                (producto_id, uid)
            ).fetchone()
            if ur:
                user_review = {'id': ur['id'], 'rating': ur['rating']}
        conn.close()
        return jsonify({'reviews': reviews, 'average_rating': avg, 'rating_distribution': dist, 'user_review': user_review})
    # POST: formulario (FormData) o sincronización offline (JSON)
    data = request.form if request.form else (request.get_json(silent=True) or {})
    try:
        producto_id = int(data.get('producto_id') or data.get('productId') or 0)
    except (TypeError, ValueError):
        producto_id = 0
    try:
        rating = int(data.get('rating') or data.get('calificacion') or data.get('calification') or 5)
    except (TypeError, ValueError):
        rating = 5
    nombre = (data.get('nombre') or data.get('name') or session.get('nombre') or 'Anónimo').strip()
    comentario = (data.get('comentario') or data.get('comment') or data.get('texto') or data.get('text') or '').strip()
    if producto_id <= 0 or rating < 1 or rating > 5:
        return jsonify({'success': False, 'error': 'Datos inválidos'}), 400
    conn = get_db()
    cur = conn.execute(
        'INSERT INTO resenas (producto_id, usuario_id, nombre, rating, comentario, compra_verificada) VALUES (?,?,?,?,?,?)',
        (producto_id, session.get('usuario_id'), nombre, rating, comentario, 0)
    )
    conn.commit()
    resena_id = cur.lastrowid
    conn.close()
    return jsonify({'success': True, 'resena_id': resena_id})


@app.route('/api/cart/sync', methods=['POST'])
def api_cart_sync():
    """Sincronización del carrito offline del PWA (el carrito vive en el cliente)."""
    data = request.get_json() or {}
    items = data.get('items') if isinstance(data.get('items'), list) else []
    registrar_visita('cart_sync')
    return jsonify({'success': True, 'synced': len(items)})


# ── API Seguidores ───────────────────────────────────────────────────────────

@app.route('/api/usuario/<int:usuario_id>/seguir', methods=['POST'])
@login_required
def seguir_usuario(usuario_id):
    if usuario_id == session['usuario_id']:
        return jsonify({'error': 'No puedes seguirte a ti mismo'}), 400

    conn = get_db()
    existe = conn.execute(
        'SELECT id FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?',
        (session['usuario_id'], usuario_id)
    ).fetchone()

    if existe:
        conn.execute('DELETE FROM seguidores WHERE id = ?', (existe['id'],))
        conn.commit()
        conn.close()
        return jsonify({'siguiendo': False})

    conn.execute(
        'INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?,?)',
        (session['usuario_id'], usuario_id)
    )
    conn.commit()
    conn.close()
    add_xp(session['usuario_id'], 5)
    return jsonify({'siguiendo': True})


# ── Auth ─────────────────────────────────────────────────────────────────────

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'usuario_id' in session:
        return redirect(url_for('index'))

    # ── Rate limiting ──
    _limpiar_intentos_caducados()
    ip = request.remote_addr or '0.0.0.0'
    intentos_ip = _tb_cuenta_ip(ip)

    # Bloqueo por sesión (15 min)
    intentos = session.get('login_intentos', 0)
    bloqueo_hasta = session.get('login_bloqueo_hasta', 0)
    if bloqueo_hasta and datetime.now().timestamp() < bloqueo_hasta:
        restante = int(bloqueo_hasta - datetime.now().timestamp())
        flash_t('espera_minutos', 'danger', minutos=restante // 60)
        return render_template('login.html')

    # Bloqueo por IP (10 intentos / 15 min)
    if len(intentos_ip) >= 10:
        flash('Demasiados intentos desde esta IP. Intenta más tarde.', 'danger')
        return render_template('login.html')

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '').strip()
        if not is_valid_email(email):
            flash_t('correo_invalido', 'danger')
            return render_template('login.html')
        conn = get_db()
        usuario = conn.execute('SELECT * FROM usuarios WHERE email = ?', (email,)).fetchone()
        conn.close()
        if usuario and check_password_hash(usuario['password'], password):
            # Login exitoso: limpiar intentos (sesión e IP)
            session.pop('login_intentos', None)
            session.pop('login_bloqueo_hasta', None)
            _login_ip_attempts.pop(ip, None)
            session['usuario_id'] = usuario['id']
            session['nombre'] = usuario['nombre']
            session['email'] = usuario['email']
            session['rol'] = usuario['rol']
            # Racha de login diario
            try:
                _conn = get_db()
                _hoy = datetime.now().date().isoformat()
                _ayer = (datetime.now().date() - timedelta(days=1)).isoformat()
                _u = _conn.execute('SELECT ultimo_login, racha_dias FROM usuarios WHERE id=?', (usuario['id'],)).fetchone()
                if _u:
                    if _u['ultimo_login'] == _ayer:
                        _racha = (_u['racha_dias'] or 0) + 1
                    elif _u['ultimo_login'] == _hoy:
                        _racha = _u['racha_dias'] or 0
                    else:
                        _racha = 1
                    _conn.execute('UPDATE usuarios SET ultimo_login=?, racha_dias=? WHERE id=?',
                                  (_hoy, _racha, usuario['id']))
                    session['racha_dias'] = _racha
                    _conn.commit()
                _conn.close()
            except sqlite3.Error:
                pass
            flash_t('bienvenido', 'success', nombre=usuario['nombre'])
            return redirect(url_for('index'))

        # Login fallido: incrementar intentos (sesión e IP)
        intentos_ip.append(time.time())
        session['login_intentos'] = intentos + 1
        if session['login_intentos'] >= 5:
            session['login_bloqueo_hasta'] = datetime.now().timestamp() + 15 * 60  # 15 min
            session['login_intentos'] = 0
            flash_t('bloqueado_15', 'danger')
        else:
            restantes = 5 - session['login_intentos']
            flash_t('login_restantes', 'danger', restantes=restantes)
    return render_template('login.html')


@app.route('/recuperar', methods=['GET', 'POST'])
def recuperar_password():
    """Solicita restablecer contraseña. Sin SMTP configurado, muestra el enlace (modo demo)."""
    if 'usuario_id' in session:
        return redirect(url_for('index'))
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        conn = get_db()
        usuario = conn.execute('SELECT id, nombre FROM usuarios WHERE email = ?', (email,)).fetchone()
        enlace_demo = None
        if usuario:
            token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            expires = (datetime.now(timezone.utc) + timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')
            conn.execute(
                'INSERT INTO password_resets (usuario_id, token_hash, expires_at) VALUES (?,?,?)',
                (usuario['id'], token_hash, expires)
            )
            conn.commit()
            if not os.environ.get('SMTP_HOST'):
                enlace_demo = url_for('restablecer_password', token=token, _external=True)
        conn.close()
        # Mensaje genérico: no revelar si el correo existe
        return render_template('recuperar.html', enviado=True, enlace_demo=enlace_demo)
    return render_template('recuperar.html')


@app.route('/restablecer', methods=['GET', 'POST'])
def restablecer_password():
    token = request.args.get('token', '')
    if request.method == 'POST':
        token = request.form.get('token', '')
        password = request.form.get('password', '')
        password2 = request.form.get('password2', '')
        if not token or not password:
            flash_t('datos_incompletos', 'danger')
            return render_template('restablecer.html', token=token)
        if len(password) < 8:
            flash_t('password_corta', 'danger')
            return render_template('restablecer.html', token=token)
        if password != password2:
            flash('Las contraseñas no coinciden', 'danger')
            return render_template('restablecer.html', token=token)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        conn = get_db()
        reset = conn.execute(
            "SELECT * FROM password_resets WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')",
            (token_hash,)
        ).fetchone()
        if not reset:
            conn.close()
            flash('El enlace es inválido o expiró. Solicita uno nuevo.', 'danger')
            return redirect(url_for('recuperar_password'))
        conn.execute('UPDATE usuarios SET password = ? WHERE id = ?',
                     (generate_password_hash(password), reset['usuario_id']))
        conn.execute('UPDATE password_resets SET used = 1 WHERE id = ?', (reset['id'],))
        conn.commit()
        conn.close()
        flash_t('password_actualizada', 'success')
        return redirect(url_for('login'))
    # GET: validar token
    token_hash = hashlib.sha256(token.encode()).hexdigest() if token else ''
    conn = get_db()
    valido = conn.execute(
        "SELECT id FROM password_resets WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')",
        (token_hash,)
    ).fetchone() is not None
    conn.close()
    if not valido:
        flash('El enlace es inválido o expiró. Solicita uno nuevo.', 'danger')
        return redirect(url_for('recuperar_password'))
    return render_template('restablecer.html', token=token)


@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if 'usuario_id' in session:
        return redirect(url_for('index'))
    # Capturar código de referido ?ref=EC<id> para el registro
    ref = request.args.get('ref') or request.form.get('ref')
    if ref:
        session['ref_code'] = ref
    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        apellidos = request.form.get('apellidos', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        password2 = request.form.get('password2', '')
        telefono = request.form.get('telefono', '').strip()
        ciudad = request.form.get('ciudad', '').strip()

        # ── Validación robusta de registro ──
        errores = []
        if not is_valid_nombre(nombre):
            errores.append(tr('nombre_invalido'))
        if apellidos and not is_valid_nombre(apellidos):
            errores.append(tr('apellidos_invalido'))
        if not is_valid_email(email):
            errores.append(tr('correo_invalido'))
        if telefono and not is_valid_telefono(telefono):
            errores.append(tr('telefono_invalido'))
        if ciudad and len(ciudad) < 2:
            errores.append(tr('ciudad_invalida'))

        fuerte, _score, pw_errores = password_strength(password)
        if pw_errores:
            errores.append(tr('pw_reqs'))
        if password != password2:
            errores.append(tr('password_no_coincide'))

        if errores:
            for err in errores:
                flash(err, 'danger')
            return redirect(url_for('registro'))

        conn = get_db()
        existe = conn.execute('SELECT id FROM usuarios WHERE email = ?', (email,)).fetchone()
        if existe:
            flash_t('correo_existe', 'danger')
            conn.close()
            return redirect(url_for('registro'))

        hashed_password = generate_password_hash(password)
        # El primer usuario registrado en la plataforma se convierte en admin (bootstrap)
        es_primer_usuario = conn.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0] == 0
        rol = 'admin' if es_primer_usuario else 'comprador'
        conn.execute(
            'INSERT INTO usuarios (nombre, apellidos, email, password, telefono, ciudad, rol, google_id) VALUES (?,?,?,?,?,?,?,?)',
            (nombre, apellidos or '', email, hashed_password, normalizar_telefono(telefono), ciudad or '', rol, None)
        )
        usuario = conn.execute('SELECT * FROM usuarios WHERE email = ?', (email,)).fetchone()
        nuevo_id = usuario['id']
        # Sistema de referidos: ?ref=EC<id> capturado en sesión
        ref_code = session.pop('ref_code', '') or request.form.get('ref', '')
        m_ref = re.match(r'EC(\d+)$', str(ref_code).strip().upper())
        if m_ref:
            referente_id = int(m_ref.group(1))
            if referente_id != nuevo_id:
                try:
                    conn.execute('INSERT OR IGNORE INTO referidos (referente_id, referido_id) VALUES (?,?)',
                                 (referente_id, nuevo_id))
                    conn.execute('UPDATE usuarios SET eco_puntos = COALESCE(eco_puntos,0) + 100 WHERE id IN (?,?)',
                                 (referente_id, nuevo_id))
                    add_notificacion(referente_id, '🎁 ¡Alguien usó tu código!',
                                     'Ganaste 100 pts eco porque un amigo se registró con tu código', 'success')
                except sqlite3.IntegrityError:
                    pass
        conn.commit()
        conn.close()

        session['usuario_id'] = usuario['id']
        session['nombre'] = usuario['nombre']
        session['email'] = usuario['email']
        session['rol'] = usuario['rol']
        flash_t('cuenta_creada', 'success', nombre=nombre)
        return redirect(url_for('index'))
    return render_template('registro.html')


@app.route('/auth/google', methods=['POST'])
def auth_google():
    """Inicia sesión o crea una cuenta usando una credencial (ID token) de Google.

    El frontend envía el JWT emitido por Google Identity Services (credential).
    El token se verifica contra el endpoint público `https://oauth2.googleapis.com/tokeninfo`
    para garantizar que es válido y emitido por Google.
    """
    data = request.get_json(silent=True) or {}
    credential = (data.get('credential') or data.get('id_token') or '').strip()

    if not credential:
        return jsonify({'error': 'Credencial de Google no proporcionada.'}), 400

    # Verificar el token contra Google (requiere librería 'requests')
    try:
        import requests as _requests
        resp = _requests.post(
            'https://oauth2.googleapis.com/tokeninfo',
            data={'id_token': credential},
            timeout=8
        )
        if resp.status_code != 200:
            return jsonify({'error': 'Token de Google inválido o expirado.'}), 401
        info = resp.json()
    except Exception:
        return jsonify({'error': 'No se pudo verificar la credencial en este momento.'}), 502

    if not info.get('email'):
        return jsonify({'error': 'No se pudo obtener el correo de Google.'}), 400

    google_id = str(info.get('sub', ''))
    email = info.get('email', '').lower()
    nombre = info.get('name', '') or email.split('@')[0]
    avatar = info.get('picture', '')

    if not is_valid_email(email):
        return jsonify({'error': 'El correo de Google no es válido.'}), 400

    conn = get_db()
    usuario = conn.execute(
        'SELECT * FROM usuarios WHERE email = ? OR (google_id != "" AND google_id = ?)',
        (email, google_id)
    ).fetchone()

    if usuario:
        # Actualizar google_id/avatar si aún no están vinculados
        if google_id and usuario['google_id'] != google_id:
            conn.execute('UPDATE usuarios SET google_id = ?, email_verificado = 1 WHERE id = ?',
                         (google_id, usuario['id']))
        if avatar and not usuario['avatar']:
            conn.execute('UPDATE usuarios SET avatar = ? WHERE id = ?', (avatar, usuario['id']))
        conn.commit()
        usuario_id = usuario['id']
        rol = usuario['rol']
        nombre_uso = usuario['nombre']
    else:
        cursor = conn.execute(
            'INSERT INTO usuarios (nombre, email, password, avatar, google_id, email_verificado) VALUES (?,?,?,?,?,1)',
            (nombre[:80], email, generate_password_hash(secrets.token_hex(16)), avatar, google_id)
        )
        conn.commit()
        usuario_id = cursor.lastrowid
        rol = 'comprador'
        nombre_uso = nombre[:80]

    conn.close()

    session['usuario_id'] = usuario_id
    session['nombre'] = nombre_uso
    session['email'] = email
    session['rol'] = rol
    flash_t('google_bienvenido', 'success', nombre=nombre_uso)
    return jsonify({'success': True, 'redirigir': url_for('index')})


@app.route('/logout')
def logout():
    lang = session.get('lang', 'es')
    session.clear()
    session['lang'] = lang  # preservar idioma
    flash_t('sesion_cerrada', 'success')
    return redirect(url_for('index'))


@app.route('/api/set_lang', methods=['POST'])
def api_set_lang():
    """Sincroniza el idioma elegido en el cliente con la sesión del servidor."""
    data = request.get_json(silent=True) or {}
    lang = data.get('lang', 'es')
    if lang in ('es', 'en'):
        session['lang'] = lang
        return jsonify({'success': True, 'lang': lang})
    return jsonify({'error': 'Idioma no soportado.'}), 400


# ── Asistente de IA (estilo ChatGPT) ────────────────────────────────────────

CHAT_TEXTS = {
    'saludo': {
        'es': '¡Hola! 🌱 Soy **EcoBot IA**, el asistente inteligente de EcoMarket. Puedo ayudarte a buscar productos reales, resolver dudas de envíos, cupones o tu cuenta. ¿Qué necesitas?',
        'en': 'Hi! 🌱 I am **EcoBot AI**, the intelligent assistant of EcoMarket. I can help you find real products, answer shipping questions, coupons or your account. What do you need?'
    },
    'ayuda': {
        'es': 'Puedo ayudarte con:\n• 🔎 **Buscar y recomendar productos** (ej: "dame 3 productos de jardín" o "productos baratos")\n• 🚚 Envíos y entregas\n• 🎫 Cupones y descuentos\n• 💳 Métodos de pago\n• 👤 Tu cuenta, XP y niveles\n• ♻️ Consejos ecológicos',
        'en': 'I can help you with:\n• 🔎 **Find and recommend products** (e.g., "give me 3 garden products" or "cheap products")\n• 🚚 Shipping and delivery\n• 🎫 Coupons and discounts\n• 💳 Payment methods\n• 👤 Your account, XP and levels\n• ♻️ Eco tips'
    },
    'envio': {
        'es': '🚚 **Envíos en todo Perú**\n• Tiempo estimado: **3-7 días hábiles**\n• **GRATIS** en compras mayores a S/.150 (o con cupón ENVIOFREE)\n• Costo estándar: **S/.12**',
        'en': '🚚 **Nationwide shipping**\n• Estimated time: **3-7 business days**\n• **FREE** on orders over S/.150 (or with ENVIOFREE coupon)\n• Standard cost: **S/.12**'
    },
    'pago': {
        'es': '💳 **Métodos de pago**\n• Tarjeta de crédito/débito\n• Yape / Plin\n• Transferencia bancaria (BCP, Interbank, BBVA)\nTodos los pagos son 100% seguros.',
        'en': '💳 **Payment methods**\n• Credit/debit card\n• Yape / Plin\n• Bank transfer (BCP, Interbank, BBVA)\nAll payments are 100% secure.'
    },
    'devolucion': {
        'es': '🔄 **Devoluciones**\nTienes **30 días** para devolver un producto. Debe estar en su estado original. Contacta a soporte para iniciar el proceso.',
        'en': '🔄 **Returns**\nYou have **30 days** to return a product. It must be in original condition. Contact support to start the process.'
    },
    'contacto': {
        'es': '📧 **Contacto**\n• Email: hola@ecomarket.com\n• Tel: +51 999 888 777\n• Horario: Lun-Sáb 9am a 6pm',
        'en': '📧 **Contact**\n• Email: hola@ecomarket.com\n• Phone: +51 999 888 777\n• Hours: Mon-Sat 9am-6pm'
    },
'cuenta': {
        'es': '👤 Tu cuenta incluye: perfil con avatar y banner, seguidores, **XP y 50 niveles** (de Semilla 🌱 a Bosque 🌳), historial de compras/ventas, favoritos y configuración. Accede desde el menú de usuario.',
        'en': '👤 Your account includes: profile with avatar and banner, followers, **XP and 50 levels** (from Seed 🌱 to Forest 🌳), purchase/sales history, favorites and settings. Access it from the user menu.'
    },
    'ecofriendly': {
        'es': '♻️ **Consejos eco**\n• Usa bolsas de tela y botellas reutilizables\n• Composta residuos orgánicos\n• Compra a granel sin plásticos\n• Prefiere segunda mano\nCada compra en EcoMarket calcula tu ahorro de CO₂.',
        'en': '♻️ **Eco tips**\n• Use cloth bags and reusable bottles\n• Compost organic waste\n• Buy bulk without plastics\n• Prefer second-hand\nEvery EcoMarket purchase calculates your CO₂ savings.'
    },
    'ecoscore': {
        'es': '🌿 **EcoScore**: del 0 al 100 valora la sostenibilidad de un producto (materiales, empaque y origen). Un EcoScore alto muestra la insignia "Eco" y da más puntos.',
        'en': '🌿 **EcoScore**: from 0 to 100 rates a product sustainability (materials, packaging and origin). A high EcoScore shows the "Eco" badge and gives more points.'
    },
    'publicar': {
        'es': '📦 **Para publicar:**\n1. Crea una cuenta\n2. Ve a "Publicar"\n3. Completa nombre, precio, categoría, descripción e imágenes (jpg, png o webp)\n4. ¡Listo! Ganas **+15 XP**\nCualquier usuario registrado puede publicar gratis.',
        'en': '📦 **To publish:**\n1. Create an account\n2. Go to "Publish"\n3. Fill in name, price, category, description and images (jpg, png or webp)\n4. Done! You earn **+15 XP**\nAny registered user can publish for free.'
    },
    'default': {
        'es': 'No encontré una respuesta exacta. 😅 Puedes preguntarme por:\n• "productos baratos"\n• "dame 3 productos de accesorios"\n• "envíos", "cupones", "pagos"\n• "consejos ecológicos" o "mi cuenta"',
        'en': 'I could not find an exact answer. 😅 You can ask about:\n• "cheap products"\n• "give me 3 accessories products"\n• "shipping", "coupons", "payments"\n• "eco tips" or "my account"'
    }
};

CHAT_INTENTS = [
    {'id': 'saludo', 'es': ['hola', 'buenas', 'hey', 'buenos dias', 'whatsapp'], 'en': ['hi', 'hello', 'hey', 'good morning']},
    {'id': 'ayuda', 'es': ['ayuda', 'puedes', 'que haces', 'help'], 'en': ['help', 'what can you do']},
    {'id': 'envio', 'es': ['envio', 'entrega', 'demora', 'domicilio', 'cuanto tarda', 'costo de envio'], 'en': ['shipping', 'delivery', 'ship', 'arrive', 'shipping cost']},
    {'id': 'publicar', 'es': ['publicar', 'vender', 'publicacion', 'subir producto'], 'en': ['publish', 'sell', 'listing', 'list a product']},
    {'id': 'pago', 'es': ['pago', 'tarjeta', 'yape', 'paypal', 'transferencia', 'pagar'], 'en': ['payment', 'card', 'yape', 'paypal', 'transfer', 'pay']},
    {'id': 'devolucion', 'es': ['devolucion', 'reembolso', 'cambio', 'devolver'], 'en': ['return', 'refund', 'change']},
    {'id': 'contacto', 'es': ['contacto', 'soporte', 'telefono', 'correo', 'email'], 'en': ['contact', 'support', 'phone', 'email']},
    {'id': 'cuenta', 'es': ['cuenta', 'perfil', 'contrasena', 'sesion', 'login'], 'en': ['account', 'profile', 'password', 'login']},
    {'id': 'ecofriendly', 'es': ['reciclar', 'reciclaje', 'consejo', 'sostenible', 'ecolog'], 'en': ['recycle', 'recycling', 'tips', 'sustainable', 'eco']},
    {'id': 'ecoscore', 'es': ['ecoscore', 'puntaje eco'], 'en': ['ecoscore']}
];


def _chat_products(conn, categoria=None, limite=4, baratos=False, offset=0, buscar=None):
    """Obtiene productos reales de la BD (filtrados, baratos, paginados o por texto)."""
    if buscar:
        _like = ' OR '.join(['nombre LIKE ?'] * len(buscar))
        args = [f'%{w}%' for w in buscar] + [limite, offset]
        filas = conn.execute(
            f'SELECT id, nombre, precio, categoria FROM productos WHERE {_like} ORDER BY precio ASC LIMIT ? OFFSET ?',
            args).fetchall()
    elif categoria:
        filas = conn.execute(
            'SELECT id, nombre, precio, categoria FROM productos WHERE categoria = ? ORDER BY precio ASC LIMIT ? OFFSET ?',
            (categoria, limite, offset)).fetchall()
    elif baratos:
        filas = conn.execute(
            'SELECT id, nombre, precio, categoria FROM productos ORDER BY precio ASC LIMIT ? OFFSET ?',
            (limite, offset)).fetchall()
    else:
        filas = conn.execute(
            'SELECT id, nombre, precio, categoria FROM productos ORDER BY vistas DESC LIMIT ? OFFSET ?',
            (limite, offset)).fetchall()
    return [dict(r) for r in filas]


_CHAT_STOP = {'tienes', 'hay', 'busco', 'busca', 'quiero', 'dame', 'muestra', 'dime', 'un', 'una',
              'unos', 'unas', 'el', 'la', 'los', 'las', 'de', 'del', 'en', 'con', 'para', 'por',
              'que', 'qué', 'como', 'cómo', 'me', 'te', 'se', 'lo', 'le', 'al', 'mas', 'más',
              'producto', 'productos', 'item', 'items', 'algo', 'favor', 'favor'}


def _chat_keywords(msg_n):
    """Extrae palabras significativas (sin acentos) para buscar productos por nombre."""
    palabras = re.findall(r'[a-z]{4,}', msg_n)
    return [w for w in palabras if w not in _CHAT_STOP][:3]


def _normalizar(s):
    """Quita acentos y minúsculas para facilitar el matching de intenciones."""
    s = unicodedata.normalize('NFKD', s)
    s = s.encode('ascii', 'ignore').decode('ascii')
    return ' ' + s.lower() + ' '


def _kwhit(texto_normalizado, claves):
    """True si alguna clave aparece como palabra (tolera plurales, s/es, con límites)."""
    for k in claves:
        k = k.strip()
        if ' ' in k:
            if k in texto_normalizado:
                return True
        else:
            if re.search(r'\b' + re.escape(k) + r'(?:es|s)?\b', texto_normalizado):
                return True
    return False


def _chat_respuesta(msg, lang, conn):
    """Genera la respuesta de la IA según la intención y datos reales de la BD."""
    msg_l = ' ' + msg.lower() + ' '
    msg_n = _normalizar(msg_l)

    # 1) "dame N productos de Categoria" / "give me N products from category"
    m_es = re.search(r'(?:dame|muestra|busca|quiero)\s*(\d{1,2})?\s*(?:productos?|ofertas?)?\s*(?:de|en)?\s*(accesorios|hogar|higiene|jardin|alimentacion|ropa)', msg_n)
    m_en = re.search(r'(give me|show me|find|gimme)\s*(\d{1,2})?\s*(accessories|home|hygiene|garden|food|clothing)\s*(products|items)?', msg_n)
    m = m_es or m_en
    if m:
        if m_es:
            num = int(m_es.group(1)) if m_es.group(1) else 3
            cat_raw = m_es.group(2)
        else:
            num = int(m_en.group(2)) if m_en.group(2) else 3
            cat_raw = m_en.group(3)
        ref = {'accesorios': 'Accesorios', 'accessories': 'Accesorios', 'hogar': 'Hogar', 'home': 'Hogar',
               'higiene': 'Higiene', 'hygiene': 'Higiene', 'jardin': 'Jardín', 'garden': 'Jardín',
               'alimentacion': 'Alimentación', 'food': 'Alimentación',
               'ropa': 'Ropa', 'clothing': 'Ropa'}
        cat = ref.get(cat_raw.lower()) if cat_raw else None
        prods = _chat_products(conn, categoria=cat, limite=min(num, 5)) if cat else _chat_products(conn, baratos=True, limite=min(num, 5))
        if prods:
            if lang == 'en':
                cab = f"🛒 **{len(prods)} products from '{cat or 'the store'}':**"
            else:
                cab = f"🛒 **{len(prods)} productos de {cat or 'la tienda'}:**"
            lineas = '\n'.join(f'• {p["nombre"]} — S/.{p["precio"]:.2f}' for p in prods)
            continuacion = '\n\n¿Quieres ver alguno en detalle? 🙂' if lang == 'es' else '\n\nWant to see one in detail? 🙂'
            session['chat_ctx'] = {'kind': 'products', 'cat': cat, 'baratos': False, 'shown': len(prods), 'items': prods}
            return cab + '\n' + lineas + continuacion

    # 2) Productos baratos / recomendaciones
    if _kwhit(msg_n, ['barato', 'cheap', 'economico', 'affordable', 'presupuesto', 'budget']):
        prods = _chat_products(conn, baratos=True, limite=5)
        if lang == 'en':
            cab = '💰 **Cheapest products in the store:**'
        else:
            cab = '💰 **Los productos más baratos de la tienda:**'
        lineas = '\n'.join(f'• {p["nombre"]} — S/.{p["precio"]:.2f} · {p["categoria"]}' for p in prods)
        fin = '\n\n¿Te interesa alguno? Te ayudo a agregarlo al carrito 💚' if lang == 'es' else '\n\nInterested in one? I can help you add it to the cart 💚'
        session['chat_ctx'] = {'kind': 'products', 'cat': None, 'baratos': True, 'shown': len(prods), 'items': prods}
        return cab + '\n' + lineas + fin

    # 3) Cupones (reales)
    if _kwhit(msg_n, ['cupon', 'coupon', 'descuento', 'discount', 'oferta', 'promo']):
        if lang == 'en':
            return ('🎫 **Active coupons:**\n• ECO10 → 10% OFF (min. S/.30)\n• ECO20 → 20% OFF (min. S/.80)\n'
                    '• ENVIOFREE → Free shipping\n• BIENVENIDO → S/.15 OFF\nUse them at the cart or checkout.')
        return ('🎫 **Cupones activos:**\n• ECO10 → 10% OFF (mín. S/.30)\n• ECO20 → 20% OFF (mín. S/.80)\n'
                '• ENVIOFREE → Envío gratis\n• BIENVENIDO → S/.15 OFF\nÚsalos en el carrito o durante el pago.')

    # 3b) Seguimiento conversacional: "más", "otros", "el primero", "más barato"
    prev = session.get('chat_ctx') or {}
    if _kwhit(msg_n, ['mas opciones', 'otros', 'siguientes', 'ver mas', 'more', 'next', 'others', 'cuentame mas', 'tell me more', 'que mas hay', 'y que mas']):
        if prev.get('kind') == 'products':
            if prev.get('buscar'):
                prods = _chat_products(conn, buscar=prev['buscar'], limite=4, offset=prev.get('shown', 0))
            else:
                prods = _chat_products(conn, categoria=prev.get('cat'), baratos=prev.get('baratos', False),
                                       offset=prev.get('shown', 0), limite=4)
            if not prods:
                # se acabaron los resultados del filtro: ofrecer los más vistos como alternativa
                prods = _chat_products(conn, limite=4)
                if prods and lang == 'es':
                    lineas = '\n'.join(f'• [{p["nombre"]}](/producto/{p["id"]}) — S/.{p["precio"]:.2f}' for p in prods)
                    return '🤷 No hay más de eso por ahora, pero mira los más populares:\n' + lineas
                if prods:
                    lineas = '\n'.join(f'• [{p["nombre"]}](/producto/{p["id"]}) — S/.{p["precio"]:.2f}' for p in prods)
                    return '🤷 Nothing more on that for now, but check the most popular:\n' + lineas
            else:
                session['chat_ctx'] = {**prev, 'shown': prev.get('shown', 0) + len(prods)}
                lineas = '\n'.join(f'• [{p["nombre"]}](/producto/{p["id"]}) — S/.{p["precio"]:.2f}' for p in prods)
                return ('✨ **Más opciones:**\n' if lang == 'es' else '✨ **More options:**\n') + lineas
    if _kwhit(msg_n, ['el primero', 'la primera', 'ese', 'el segundo', 'la segunda', 'the first', 'the second']):
        items = prev.get('items') or []
        idx = 1 if _kwhit(msg_n, ['segundo', 'segunda', 'second']) else 0
        if len(items) > idx:
            p = items[idx]
            if lang == 'es':
                return f'➡️ **{p["nombre"]}** — S/.{p["precio"]:.2f}\n[Ver producto](/producto/{p["id"]})\n📦 Categoría: {p["categoria"]}'
            return f'➡️ **{p["nombre"]}** — S/.{p["precio"]:.2f}\n[View product](/producto/{p["id"]})\n📦 Category: {p["categoria"]}'
    if _kwhit(msg_n, ['mas barato', 'el mas economico', 'cheapest', 'lowest price']):
        prods = _chat_products(conn, baratos=True, limite=3)
        if prods:
            lineas = '\n'.join(f'• [{p["nombre"]}](/producto/{p["id"]}) — S/.{p["precio"]:.2f}' for p in prods)
            return ('💰 **Los más baratos ahora:**\n' if lang == 'es' else '💰 **Cheapest right now:**\n') + lineas

    # 3c) Búsqueda por nombre: "tienes agua", "busco tomate"
    kws = _chat_keywords(msg_n)
    if len(kws) >= 1 and _kwhit(msg_n, ['tienes', 'hay', 'busco', 'busca', 'quiero', 'venden', 'find', 'have', 'search', 'looking']):
        prods = _chat_products(conn, buscar=kws, limite=4)
        if prods:
            session['chat_ctx'] = {'kind': 'products', 'items': prods, 'shown': len(prods), 'buscar': kws}
            lineas = '\n'.join(f'• [{p["nombre"]}](/producto/{p["id"]}) — S/.{p["precio"]:.2f} · {p["categoria"]}' for p in prods)
            extra = '\n\n¿Quieres más opciones? Solo dime "otros" 🙂' if lang == 'es' else '\n\nWant more? Just say "more" 🙂'
            return ('🔎 **Esto encontré para ti:**\n' if lang == 'es' else '🔎 **Here is what I found:**\n') + lineas + extra

    # 3d) Precio del último producto mencionado: "cuánto cuesta", "precio", "how much"
    items = prev.get('items') or []
    if items and _kwhit(msg_n, ['cuanto cuesta', 'cuanto vale', 'precio', 'price', 'how much', 'cost']):
        p = items[0]
        if lang == 'es':
            return f'💵 **{p["nombre"]}** cuesta **S/.{p["precio"]:.2f}** (categoría: {p["categoria"]}).\n[Ver producto](/producto/{p["id"]})'
        return f'💵 **{p["nombre"]}** costs **S/.{p["precio"]:.2f}** (category: {p["categoria"]}).\n[View product](/producto/{p["id"]})'

    # 3e) Comparación rápida: "compara bicicleta y patineta", "compare X vs Y"
    if _kwhit(msg_n, ['compara', 'compare', 'cual es mejor', 'cuál es mejor', 'which is better', 'diferencia entre']):
        kws = _chat_keywords(msg_n)
        prods = _chat_products(conn, buscar=kws, limite=4) if kws else _chat_products(conn, limite=4)
        if len(prods) >= 2:
            session['chat_ctx'] = {'kind': 'products', 'items': prods, 'shown': len(prods)}
            lineas = '\n'.join(
                f'• [{p["nombre"]}](/producto/{p["id"]}) — S/.{p["precio"]:.2f} · {p["categoria"]}'
                for p in prods)
            extra = '\n\nDime "el primero" o "el segundo" para ver el detalle, o usa el comparador visual en /comparar 🙂' if lang == 'es' \
                else '\n\nSay "the first" or "the second" for details, or try the visual comparator at /comparar 🙂'
            return ('⚖️ **Comparativa:**\n' if lang == 'es' else '⚖️ **Comparison:**\n') + lineas + extra

    # 3f) Intención semántica: regalos, niños, lo mejor, más ecológico
    if _kwhit(msg_n, ['regalo', 'regalar', 'gift', 'obsequio', 'sorpresa', 'cumpleanos', 'cumpleaños']):
        prods = conn.execute(
            "SELECT id, nombre, precio, categoria, eco_score FROM productos WHERE categoria IN ('Accesorios','Juguetes','Arte','Bebés','Libros') ORDER BY eco_score DESC, precio DESC LIMIT 4"
        ).fetchall()
        prods = [dict(r) for r in prods]
        if prods:
            session['chat_ctx'] = {'kind': 'products', 'items': prods, 'shown': len(prods)}
            lineas = '\n'.join(f'• [{p["nombre"]}](/producto/{p["id"]}) — S/.{p["precio"]:.2f} · {p["categoria"]}' for p in prods)
            return ('🎁 **Ideas de regalo ecológicas:**\n' if lang == 'es' else '🎁 **Eco gift ideas:**\n') + lineas
    if _kwhit(msg_n, ['ninos', 'niños', 'kids', 'bebe', 'bebé', 'baby', 'hijo', 'hija', 'child']):
        prods = conn.execute(
            "SELECT id, nombre, precio, categoria, eco_score FROM productos WHERE categoria IN ('Juguetes','Bebés') ORDER BY eco_score DESC LIMIT 4"
        ).fetchall()
        prods = [dict(r) for r in prods]
        if prods:
            session['chat_ctx'] = {'kind': 'products', 'items': prods, 'shown': len(prods)}
            lineas = '\n'.join(f'• [{p["nombre"]}](/producto/{p["id"]}) — S/.{p["precio"]:.2f} · {p["categoria"]}' for p in prods)
            return ('🧸 **Para los peques:**\n' if lang == 'es' else '🧸 **For the little ones:**\n') + lineas
    if _kwhit(msg_n, ['los mejores', 'lo mejor', 'the best', 'top productos', 'mas populares', 'más populares', 'mas eco', 'más ecológico', 'sostenible']):
        prods = conn.execute(
            "SELECT id, nombre, precio, categoria, eco_score FROM productos WHERE vendido = 0 ORDER BY eco_score DESC, vistas DESC LIMIT 4"
        ).fetchall()
        prods = [dict(r) for r in prods]
        if prods:
            session['chat_ctx'] = {'kind': 'products', 'items': prods, 'shown': len(prods)}
            lineas = '\n'.join(f'• [{p["nombre"]}](/producto/{p["id"]}) — S/.{p["precio"]:.2f} · eco {p.get("eco_score", "?")}' for p in prods) if prods[0].get('eco_score') is not None else '\n'.join(f'• [{p["nombre"]}](/producto/{p["id"]}) — S/.{p["precio"]:.2f}' for p in prods)
            return ('🌿 **Los más ecológicos y populares:**\n' if lang == 'es' else '🌿 **The most eco and popular:**\n') + lineas

    # 4) Intenciones fijas
    for intent in CHAT_INTENTS:
        claves = intent['es'] + intent['en']
        if _kwhit(msg_n, claves):
            return CHAT_TEXTS[intent['id']][lang]

    # 5) Agradecimiento / despedida
    if _kwhit(msg_n, ['gracias', 'thanks', 'thank']):
        return ('¡De nada! 🌿 ¿Necesitas algo más?' if lang == 'es' else 'You are welcome! 🌿 Anything else?')
    if _kwhit(msg_n, ['adios', 'bye', 'chao', 'hasta luego']):
        return ('¡Hasta luego! 🌱 Recuerda que cada compra cuenta para el planeta.' if lang == 'es' else 'Goodbye! 🌱 Remember every purchase counts for the planet.')

    # 6) Respuesta por defecto con menú
    return CHAT_TEXTS['default'][lang]


@app.route('/api/chat', methods=['POST'])
def api_chat():
    """Asistente de IA tipo ChatGPT: responde con contexto real de la tienda."""
    data = request.get_json(silent=True) or {}
    msg = (data.get('message') or '').strip()
    if not msg:
        return jsonify({'error': 'Mensaje vacío.'}), 400

    lang = session.get('lang', 'es')
    # Detección simple de idioma si el texto es claramente inglés
    if lang == 'es' and any(w in msg.lower() for w in ('shipping', 'cheap ', 'give me', ' hello', ' please', ' the ', ' products')):
        lang = 'en'

    conn = get_db()
    try:
        respuesta = _chat_respuesta(msg, lang, conn)
    finally:
        conn.close()

    if lang == 'en':
        quick = ['Cheap products', 'Shipping', 'Coupons', 'Eco tips', 'My account']
    else:
        quick = ['productos baratos', 'Envíos', 'Cupones', 'Consejos eco', 'Mi cuenta']

    return jsonify({'reply': respuesta, 'lang': lang, 'quick_replies': quick})


@app.route('/api/mis_productos.csv')
@login_required
def exportar_productos_csv():
    """Exporta los productos del vendedor a CSV."""
    conn = get_db()
    rows = conn.execute(
        "SELECT nombre, categoria, precio, precio_original, stock, condicion, vistas, created_at "
        "FROM productos WHERE usuario_id = ? ORDER BY created_at DESC",
        (session['usuario_id'],)).fetchall()
    conn.close()

    def esc(v):
        return '"' + str(v if v is not None else '').replace('"', '""') + '"'

    lineas = ['nombre,categoria,precio,precio_original,stock,condicion,vistas,fecha']
    for r in rows:
        lineas.append(','.join(esc(x) for x in (
            r['nombre'], r['categoria'], r['precio'], r['precio_original'],
            r['stock'], r['condicion'], r['vistas'], r['created_at'])))
    return Response(chr(10).join(lineas), mimetype='text/csv',
                    headers={'Content-Disposition': 'attachment; filename=mis_productos.csv'})


@app.route('/perfil')
@login_required
def perfil():
    conn = get_db()
    usuario = conn.execute('SELECT * FROM usuarios WHERE id = ?', (session['usuario_id'],)).fetchone()

    mis_productos = conn.execute('''
        SELECT p.*,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas
        FROM productos p
        LEFT JOIN resenas r ON p.id = r.producto_id
        WHERE p.usuario_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ''', (session['usuario_id'],)).fetchall()

    favoritos = conn.execute('''
        SELECT p.*, f.created_at as fecha_favorito
        FROM favoritos f
        JOIN productos p ON f.producto_id = p.id
        WHERE f.usuario_id = ?
        ORDER BY f.created_at DESC
    ''', (session['usuario_id'],)).fetchall()

    resenas = conn.execute('''
        SELECT r.*, p.nombre as producto_nombre
        FROM resenas r
        JOIN productos p ON r.producto_id = p.id
        WHERE r.usuario_id = ?
        ORDER BY r.created_at DESC
    ''', (session['usuario_id'],)).fetchall()

    pedidos = conn.execute('''
        SELECT * FROM pedidos
        WHERE usuario_id = ?
        ORDER BY created_at DESC LIMIT 10
    ''', (session['usuario_id'],)).fetchall()

    # Ventas como vendedor: pedidos que incluyen productos propios
    ventas = conn.execute('''
        SELECT pi.id, pi.producto_id, pi.nombre as item_nombre, pi.cantidad, pi.precio,
               pd.id as pedido_id, pd.estado, pd.created_at, pd.direccion, u.nombre as comprador
        FROM pedido_items pi
        JOIN productos p ON pi.producto_id = p.id
        JOIN pedidos pd ON pi.pedido_id = pd.id
        LEFT JOIN usuarios u ON pd.usuario_id = u.id
        WHERE p.usuario_id = ?
        ORDER BY pd.created_at DESC LIMIT 10
    ''', (session['usuario_id'],)).fetchall()

    notificaciones = conn.execute(
        'SELECT * FROM notificaciones WHERE usuario_id = ? AND leida = 0 ORDER BY created_at DESC',
        (session['usuario_id'],)
    ).fetchall()

    seguidores = conn.execute(
        'SELECT COUNT(*) FROM seguidores WHERE seguido_id = ?',
        (session['usuario_id'],)
    ).fetchone()[0]

    siguiendo = conn.execute(
        'SELECT COUNT(*) FROM seguidores WHERE seguidor_id = ?',
        (session['usuario_id'],)
    ).fetchone()[0]

    logros = conn.execute(
        'SELECT logro_id FROM logros WHERE usuario_id = ?',
        (session['usuario_id'],)
    ).fetchall()
    logros_lista = [l['logro_id'] for l in logros]

    total_publicaciones = len(mis_productos)
    total_favoritos = len(favoritos)
    total_resenas_recibidas = conn.execute(
        'SELECT COUNT(*) FROM resenas r JOIN productos p ON r.producto_id = p.id WHERE p.usuario_id = ?',
        (session['usuario_id'],)
    ).fetchone()[0]
    total_ventas = conn.execute(
        'SELECT COUNT(*) FROM pedido_items pi JOIN productos p ON pi.producto_id = p.id WHERE p.usuario_id = ?',
        (session['usuario_id'],)
    ).fetchone()[0]
    valor_total = sum(p['precio'] for p in mis_productos)

    conn.close()

    return render_template('perfil.html',
                           usuario=usuario,
                           mis_productos=mis_productos,
                           favoritos=favoritos,
                           resenas=resenas,
                           pedidos=pedidos,
                           ventas=ventas,
                           notificaciones=notificaciones,
                           seguidores=seguidores,
                           siguiendo=siguiendo,
                           logros=logros_lista,
                           total_publicaciones=total_publicaciones,
                           total_favoritos=total_favoritos,
                           total_resenas_recibidas=total_resenas_recibidas,
                           total_ventas=total_ventas,
                           valor_total=valor_total)


@app.route('/perfil/actualizar', methods=['POST'])
@login_required
def actualizar_perfil():
    nombre = request.form.get('nombre', '').strip()
    bio = request.form.get('bio', '').strip()
    avatar_color = request.form.get('avatar_color', '').strip()
    if avatar_color and not re.fullmatch(r'#[0-9a-fA-F]{6}', avatar_color):
        avatar_color = ''

    conn = get_db()
    if nombre:
        conn.execute('UPDATE usuarios SET nombre = ?, bio = ?, avatar_color = COALESCE(NULLIF(?, \'\'), avatar_color) WHERE id = ?',
                     (nombre, bio, avatar_color, session['usuario_id']))
        session['nombre'] = nombre
        conn.commit()
        flash_t('perfil_actualizado', 'success')
    conn.close()
    return redirect(url_for('perfil'))


@app.route('/perfil/cambiar_password', methods=['POST'])
@login_required
def cambiar_password():
    actual = request.form.get('password_actual', '')
    nueva = request.form.get('password_nueva', '')
    confirmar = request.form.get('password_confirmar', '')

    if not all([actual, nueva, confirmar]):
        flash_t('campos_incompletos', 'danger')
        return redirect(url_for('perfil'))

    if nueva != confirmar:
        flash_t('password_no_coincide', 'danger')
        return redirect(url_for('perfil'))

    if len(nueva) < 6:
        flash_t('pw_reqs', 'danger')
        return redirect(url_for('perfil'))

    conn = get_db()
    usuario = conn.execute('SELECT * FROM usuarios WHERE id = ?', (session['usuario_id'],)).fetchone()
    if not usuario or not check_password_hash(usuario['password'], actual):
        flash_t('contrasena_actual_incorrecta', 'danger')
        conn.close()
        return redirect(url_for('perfil'))

    hashed_password = generate_password_hash(nueva)
    conn.execute('UPDATE usuarios SET password = ? WHERE id = ?',
                 (hashed_password, session['usuario_id']))
    conn.commit()
    conn.close()
    flash_t('contrasena_actualizada', 'success')
    return redirect(url_for('perfil'))


@app.route('/cuenta/eliminar', methods=['POST'])
@login_required
def eliminar_cuenta():
    """Elimina la cuenta anonimizando datos personales (conserva integridad referencial)."""
    password = request.form.get('password', '')
    conn = get_db()
    usuario = conn.execute('SELECT * FROM usuarios WHERE id = ?', (session['usuario_id'],)).fetchone()
    if not usuario or not check_password_hash(usuario['password'], password):
        conn.close()
        flash_t('contrasena_actual_incorrecta', 'danger')
        return redirect(url_for('perfil'))
    uid = session['usuario_id']
    anon_email = f"eliminado_{uid}@eliminado.local"
    conn.execute('''
        UPDATE usuarios SET nombre = 'Usuario eliminado', email = ?, password = ?,
            avatar = '', banner = '', bio = '', rol = 'comprador'
        WHERE id = ?
    ''', (anon_email, generate_password_hash(secrets.token_hex(32)), uid))
    conn.commit()
    conn.close()
    session.clear()
    flash('Tu cuenta ha sido eliminada. Lamentamos verte partir. 🌱', 'info')
    return redirect(url_for('index'))


@app.route('/notificaciones/leer/<int:notif_id>', methods=['POST'])
@login_required
def marcar_notificacion_leida(notif_id):
    conn = get_db()
    conn.execute('UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?',
                 (notif_id, session['usuario_id']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


@app.route('/notificaciones/leer-todas', methods=['POST'])
@login_required
def marcar_todas_leidas():
    conn = get_db()
    conn.execute('UPDATE notificaciones SET leida = 1 WHERE usuario_id = ?',
                 (session['usuario_id'],))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# ── Seguridad Mejorada ───────────────────────────────────────────────────────────

# Validaciones adicionales mejoradas
def validate_text_input(text, max_length=1000, min_length=1):
    """Valida input de texto con sanitización avanzada."""
    if not isinstance(text, str):
        return False
    
    text = text.strip()
    
    if len(text) < min_length or len(text) > max_length:
        return False
    
    # Sanitización avanzada contra XSS avanzado
    dangerous_patterns = [
        '<script', 'javascript:', 'onerror=', 'onload=', 
        'onclick=', 'onmouseover=', 'onfocus=', 'onblur=',
        'onmouseenter=', 'onmouseleave=', 'onkeydown=', 'onkeyup=',
        'eval(', 'expression(', 'vbscript:', 'data:text/html',
        'data:', 'background:', 'style=', 'xmlns:',
        '<iframe', '<object', '<embed', '<form',
        'alert(', 'confirm(', 'prompt(',
        'document.', 'window.', 'location.',
        'setTimeout(', 'setInterval(',
        'Function(', 'String.fromCharCode(',
        '\\x', '\\u', '\\n', '\\r', '\\t'
    ]
    
    text_lower = text.lower()
    for pattern in dangerous_patterns:
        if pattern in text_lower:
            return False
    
    # Validación contra null bytes
    if '\x00' in text:
        return False
    
    return True

def validate_number_input(number, min_value=0, max_value=1000000):
    """Valida input numérico con sanitización."""
    try:
        num = float(number)
        return min_value <= num <= max_value
    except (ValueError, TypeError):
        return False

def validate_url_input(url):
    """Valida URLs de forma más estricta."""
    if not url or not isinstance(url, str):
        return False
    
    url = url.strip()
    
    # Protocolos permitidos
    allowed_protocols = ['http://', 'https://']
    if not any(url.startswith(protocol) for protocol in allowed_protocols):
        return False
    
    # Patrones peligrosos
    dangerous_patterns = [
        'javascript:', 'data:', 'vbscript:', 'file:',
        '<script', 'onerror=', 'onload='
    ]
    
    url_lower = url.lower()
    for pattern in dangerous_patterns:
        if pattern in url_lower:
            return False
    
    return True

# ── Sistema de Optimización de Consultas SQL ───────────────────────────────────────

def optimize_sql_query(query, params=None):
    """Optimiza consultas SQL básicas."""
    if params is None:
        params = []
    
    # Eliminar SELECT * cuando sea posible
    if 'SELECT *' in query:
        # Intentar inferir columnas principales
        if 'usuarios' in query:
            query = query.replace('SELECT *', 'SELECT id, nombre, email, rol, created_at')
        elif 'productos' in query:
            query = query.replace('SELECT *', 'SELECT id, nombre, categoria, precio, vistas, created_at')
        elif 'pedidos' in query:
            query = query.replace('SELECT *', 'SELECT id, usuario_id, total, estado, created_at')
    
    return query, params

# ── Sistema de Paginación Avanzada ───────────────────────────────────────────────────

class AdvancedPagination:
    """Sistema de paginación optimizado para grandes volúmenes de datos."""
    
    def __init__(self, per_page=20, max_per_page=100):
        self.per_page = per_page
        self.max_per_page = max_per_page
    
    def get_pagination_info(self, total_items, current_page=1):
        """Calcula información de paginación."""
        total_pages = max(1, (total_items + self.per_page - 1) // self.per_page)
        current_page = max(1, min(current_page, total_pages))
        offset = (current_page - 1) * self.per_page
        
        return {
            'total_items': total_items,
            'total_pages': total_pages,
            'current_page': current_page,
            'per_page': self.per_page,
            'offset': offset,
            'has_next': current_page < total_pages,
            'has_prev': current_page > 1
        }
    
    def paginate_query(self, query, params=None, current_page=1):
        """Aplica paginación a una consulta SQL."""
        if params is None:
            params = []
        
        pagination_info = self.get_pagination_info(
            self._count_query(query, params),
            current_page
        )
        
        paginated_query = f"{query} LIMIT {self.per_page} OFFSET {pagination_info['offset']}"
        
        return paginated_query, params, pagination_info
    
    def _count_query(self, query, params):
        """Genera consulta de conteo."""
        # Extraer la parte SELECT ... FROM
        if 'SELECT' in query and 'FROM' in query:
            select_part = query[query.find('SELECT'):query.find('FROM')]
            from_part = query[query.find('FROM'):]
            count_query = f"SELECT COUNT(*) as total {from_part}"
            
            try:
                conn = get_db()
                result = conn.execute(count_query, params).fetchone()
                conn.close()
                return result['total'] if result else 0
            except Exception as advanced_pagination:
                logger.error(f"Error en conteo: {advanced_pagination}")
                return 0
        
        return 0

# Instancia global de paginación
pagination = AdvancedPagination()

# ── Sistema de Caché Mejorado con Soporte Redis ───────────────────────────────────────

class EnhancedCache:
    """Sistema de caché mejorado con soporte para Redis."""
    
    def __init__(self):
        self.cache = {}
        self.timestamps = {}
        self.default_ttl = 300  # 5 minutos
        self.redis_available = False
        self._check_redis_availability()
    
    def _check_redis_availability(self):
        """Verifica si Redis está disponible."""
        try:
            import redis
            self.redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
            self.redis_client.ping()
            self.redis_available = True
            logger.info("Redis disponible, usando caché distribuido")
        except ImportError:
            logger.info("Redis no disponible, usando caché en memoria")
        except Exception as e:
            logger.info(f"Redis no disponible: {e}, usando caché en memoria")
    
    def get(self, key):
        """Obtiene un valor del caché."""
        if self.redis_available:
            try:
                value = self.redis_client.get(key)
                if value:
                    return json.loads(value)
            except Exception as e:
                logger.error(f"Error obteniendo de Redis: {e}")
        
        # Fallback a caché en memoria
        if key not in self.cache:
            return None
        
        if key in self.timestamps:
            if time.time() - self.timestamps[key] > self.default_ttl:
                del self.cache[key]
                del self.timestamps[key]
                return None
        
        return self.cache[key]
    
    def set(self, key, value, ttl=None):
        """Guarda un valor en el caché."""
        ttl = ttl or self.default_ttl
        
        if self.redis_available:
            try:
                self.redis_client.setex(key, ttl, json.dumps(value))
            except Exception as e:
                logger.error(f"Error guardando en Redis: {e}")
        
        # Siempre guardar en caché local como fallback
        self.cache[key] = value
        self.timestamps[key] = time.time()
    
    def delete(self, key):
        """Elimina un valor del caché."""
        if self.redis_available:
            try:
                self.redis_client.delete(key)
            except Exception as e:
                logger.error(f"Error eliminando de Redis: {e}")
        
        if key in self.cache:
            del self.cache[key]
        if key in self.timestamps:
            del self.timestamps[key]
    
    def clear(self):
        """Limpia todo el caché."""
        if self.redis_available:
            try:
                self.redis_client.flushdb()
            except Exception as e:
                logger.error(f"Error limpiando Redis: {e}")
        
        self.cache.clear()
        self.timestamps.clear()
    
    def cleanup_expired(self):
        """Limpia entradas expiradas."""
        current_time = time.time()
        expired_keys = [
            key for key, timestamp in self.timestamps.items()
            if current_time - timestamp > self.default_ttl
        ]
        
        for key in expired_keys:
            self.delete(key)
        
        return len(expired_keys)

# Reemplazar caché simple con el mejorado
cache = EnhancedCache()

# ── Sistema de Websockets para Tiempo Real ───────────────────────────────────────────────

class WebSocketManager:
    """Gestor de conexiones WebSocket para actualizaciones en tiempo real."""
    
    def __init__(self):
        self.active_connections = {}
        self.user_connections = {}
    
    def connect(self, user_id, websocket):
        """Conecta un usuario al sistema de websockets."""
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)
        logger.info(f"Usuario {user_id} conectado via WebSocket")
    
    def disconnect(self, user_id, websocket):
        """Desconecta un usuario."""
        if user_id in self.user_connections:
            self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
            logger.info(f"Usuario {user_id} desconectado via WebSocket")
    
    def send_to_user(self, user_id, message):
        """Envía un mensaje a un usuario específico."""
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                try:
                    connection.send(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error enviando mensaje: {e}")
    
    def broadcast(self, message):
        """Envía un mensaje a todos los usuarios conectados."""
        for user_id, connections in self.user_connections.items():
            for connection in connections:
                try:
                    connection.send(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error en broadcast: {e}")

# Instancia global del gestor de websockets
websocket_manager = WebSocketManager()

# ── Sistema de Colas de Mensajes ───────────────────────────────────────────────────────

class MessageQueue:
    """Sistema de colas de mensajes para tareas asíncronas."""
    
    def __init__(self):
        self.queues = {
            'email': [],
            'notifications': [],
            'analytics': [],
            'backup': []
        }
    
    def push(self, queue_name, message):
        """Agrega un mensaje a una cola."""
        if queue_name in self.queues:
            self.queues[queue_name].append({
                'message': message,
                'timestamp': time.time(),
                'processed': False
            })
            logger.info(f"Mensaje agregado a cola {queue_name}")
    
    def pop(self, queue_name):
        """Obtiene y elimina un mensaje de una cola."""
        if queue_name in self.queues and self.queues[queue_name]:
            return self.queues[queue_name].pop(0)
        return None
    
    def size(self, queue_name):
        """Obtiene el tamaño de una cola."""
        return len(self.queues.get(queue_name, []))
    
    def process_queue(self, queue_name, processor):
        """Procesa todos los mensajes de una cola."""
        while self.size(queue_name) > 0:
            item = self.pop(queue_name)
            if item and not item['processed']:
                try:
                    processor(item['message'])
                    item['processed'] = True
                except Exception as e:
                    logger.error(f"Error procesando mensaje: {e}")

# Instancia global de colas
message_queue = MessageQueue()

# ── Sistema de Backup Automático ───────────────────────────────────────────────────────

class BackupManager:
    """Gestor de backups automáticos de la base de datos."""
    
    def __init__(self, backup_dir='backups'):
        self.backup_dir = os.path.join(BASE_DIR, backup_dir)
        os.makedirs(self.backup_dir, exist_ok=True)
        self.max_backups = 10
    
    def create_backup(self):
        """Crea un backup de la base de datos."""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(self.backup_dir, f'ecomarket_backup_{timestamp}.db')
        
        try:
            import shutil
            shutil.copy2(DB_PATH, backup_file)
            logger.info(f"Backup creado: {backup_file}")
            
            # Limpiar backups antiguos
            self._cleanup_old_backups()
            
            return backup_file
        except Exception as e:
            logger.error(f"Error creando backup: {e}")
            return None
    
    def _cleanup_old_backups(self):
        """Elimina backups antiguos manteniendo solo los más recientes."""
        backups = sorted(
            [f for f in os.listdir(self.backup_dir) if f.startswith('ecomarket_backup_')],
            reverse=True
        )
        
        for old_backup in backups[self.max_backups:]:
            try:
                os.remove(os.path.join(self.backup_dir, old_backup))
                logger.info(f"Backup antiguo eliminado: {old_backup}")
            except Exception as e:
                logger.error(f"Error eliminando backup: {e}")
    
    def restore_backup(self, backup_file):
        """Restaura un backup de la base de datos."""
        try:
            import shutil
            shutil.copy2(backup_file, DB_PATH)
            logger.info(f"Backup restaurado: {backup_file}")
            return True
        except Exception as e:
            logger.error(f"Error restaurando backup: {e}")
            return False

# Instancia global de backup
backup_manager = BackupManager()


def _backup_loop(intervalo_seg=24 * 3600):
    """Crea un backup automático cada `intervalo_seg` segundos (hilo daemon)."""
    import threading
    import time as _time

    def _run():
        while True:
            try:
                backup_manager.create_backup()
            except Exception as e:
                logger.error(f"Backup automático falló: {e}")
            _time.sleep(intervalo_seg)

    threading.Thread(target=_run, daemon=True).start()

# ── Sistema de Monitoring y Alertas ───────────────────────────────────────────────────

class MonitoringSystem:
    """Sistema de monitoring y alertas del sistema."""
    
    def __init__(self):
        self.metrics = {
            'requests_total': 0,
            'requests_success': 0,
            'requests_error': 0,
            'response_times': [],
            'db_queries': 0,
            'cache_hits': 0,
            'cache_misses': 0
        }
        self.alerts = []
    
    def record_request(self, success=True, response_time=0):
        """Registra una petición HTTP."""
        self.metrics['requests_total'] += 1
        if success:
            self.metrics['requests_success'] += 1
        else:
            self.metrics['requests_error'] += 1
        
        if response_time > 0:
            self.metrics['response_times'].append(response_time)
            # Mantener solo los últimos 1000 tiempos
            if len(self.metrics['response_times']) > 1000:
                self.metrics['response_times'] = self.metrics['response_times'][-1000:]
    
    def record_db_query(self):
        """Registra una consulta a la base de datos."""
        self.metrics['db_queries'] += 1
    
    def record_cache_hit(self):
        """Registra un hit de caché."""
        self.metrics['cache_hits'] += 1
    
    def record_cache_miss(self):
        """Registra un miss de caché."""
        self.metrics['cache_misses'] += 1
    
    def get_stats(self):
        """Obtiene estadísticas del sistema."""
        avg_response_time = (
            sum(self.metrics['response_times']) / len(self.metrics['response_times'])
            if self.metrics['response_times'] else 0
        )
        
        cache_hit_rate = (
            self.metrics['cache_hits'] / (self.metrics['cache_hits'] + self.metrics['cache_misses'])
            if (self.metrics['cache_hits'] + self.metrics['cache_misses']) > 0 else 0
        )
        
        return {
            'requests_total': self.metrics['requests_total'],
            'success_rate': (
                self.metrics['requests_success'] / self.metrics['requests_total']
                if self.metrics['requests_total'] > 0 else 0
            ),
            'avg_response_time': avg_response_time,
            'db_queries': self.metrics['db_queries'],
            'cache_hit_rate': cache_hit_rate,
            'uptime': time.time() - self.start_time if hasattr(self, 'start_time') else 0
        }
    
    def check_alerts(self):
        """Verifica condiciones de alerta."""
        stats = self.get_stats()
        alerts = []
        
        # Alerta si el error rate > 5%
        if stats['success_rate'] < 0.95:
            alerts.append({
                'type': 'error_rate',
                'severity': 'high',
                'message': f"Error rate alto: {(1 - stats['success_rate']) * 100:.2f}%"
            })
        
        # Alerta si el tiempo de respuesta > 2s
        if stats['avg_response_time'] > 2000:
            alerts.append({
                'type': 'slow_response',
                'severity': 'medium',
                'message': f"Tiempo de respuesta alto: {stats['avg_response_time']:.2f}ms"
            })
        
        # Alerta si el cache hit rate < 50%
        if stats['cache_hit_rate'] < 0.5:
            alerts.append({
                'type': 'low_cache_hit',
                'severity': 'low',
                'message': f"Cache hit rate bajo: {stats['cache_hit_rate'] * 100:.2f}%"
            })
        
        self.alerts = alerts
        return alerts

# Instancia global de monitoring
monitoring = MonitoringSystem()
monitoring.start_time = time.time()

# ── Sistema de SEO y Metadatos ───────────────────────────────────────────────────────

class SEOManager:
    """Gestor de SEO y metadatos dinámicos."""
    
    def __init__(self):
        self.default_meta = {
            'title': 'EcoMarket - Marketplace Ecológico',
            'description': 'Compra y vende productos ecológicos de forma sostenible. Encuentra productos eco-friendly, orgánicos y respetuosos con el medio ambiente.',
            'keywords': 'ecomarket, ecológico, sostenible, orgánico, eco-friendly, marketplace',
            'og_image': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=630&fit=crop',
            'twitter_card': 'summary_large_image'
        }
    
    def get_meta_tags(self, page_data=None):
        """Genera metadatos dinámicos basados en el contenido."""
        meta = self.default_meta.copy()
        
        if page_data:
            # Personalizar para productos
            if 'producto' in page_data:
                producto = page_data['producto']
                meta['title'] = f"{producto['nombre']} - EcoMarket"
                meta['description'] = producto['descripcion'][:160]
                meta['keywords'] = f"{producto['categoria']}, {producto['nombre']}, ecológico, sostenible"
                if producto['imagen']:
                    meta['og_image'] = producto['imagen']
            
            # Personalizar para categorías
            elif 'categoria' in page_data:
                categoria = page_data['categoria']
                meta['title'] = f"{categoria} - EcoMarket"
                meta['description'] = f"Descubre los mejores productos ecológicos de {categoria}. Compra de forma sostenible."
                meta['keywords'] = f"{categoria}, ecológico, sostenible, eco-friendly"
        
        return meta
    
    def generate_structured_data(self, data_type, data):
        """Genera datos estructurados Schema.org."""
        if data_type == 'product':
            return {
                '@context': 'https://schema.org/',
                '@type': 'Product',
                'name': data.get('nombre', ''),
                'description': data.get('descripcion', ''),
                'image': data.get('imagen', ''),
                'offers': {
                    '@type': 'Offer',
                    'price': data.get('precio', 0),
                    'priceCurrency': 'PEN',
                    'availability': 'https://schema.org/InStock'
                }
            }
        elif data_type == 'organization':
            return {
                '@context': 'https://schema.org/',
                '@type': 'Organization',
                'name': 'EcoMarket',
                'url': 'https://ecomarket.com',
                'logo': 'https://ecomarket.com/logo.png',
                'description': 'Marketplace ecológico y sostenible'
            }
        return {}

# Instancia global de SEO
seo_manager = SEOManager()

# ── Sistema de Optimización de Assets ───────────────────────────────────────────────────

class AssetOptimizer:
    """Optimizador de assets estáticos."""
    
    def __init__(self):
        self.image_cache = {}
        self.css_cache = {}
        self.js_cache = {}
    
    def optimize_image(self, image_path, quality=85, max_width=1200):
        """Optimiza imágenes reduciendo tamaño y mejorando carga."""
        try:
            img = Image.open(image_path)
            
            # Redimensionar si es muy grande
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Optimizar y guardar
            output = io.BytesIO()
            img.save(output, format='WEBP', quality=quality, optimize=True)
            img.close()
            
            return output.getvalue()
        except Exception as e:
            logger.error(f"Error optimizando imagen: {e}")
            return None
    
    def minify_css(self, css_content):
        """Minifica CSS eliminando espacios innecesarios."""
        # Eliminar comentarios
        css_content = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL)
        # Eliminar espacios múltiples
        css_content = re.sub(r'\s+', ' ', css_content)
        # Eliminar espacios alrededor de caracteres especiales
        css_content = re.sub(r'\s*([{}:;,])\s*', r'\1', css_content)
        return css_content.strip()
    
    def minify_js(self, js_content):
        """Minifica JavaScript básico."""
        # Eliminar comentarios de una línea
        js_content = re.sub(r'//.*', '', js_content)
        # Eliminar comentarios multi-línea
        js_content = re.sub(r'/\*.*?\*/', '', js_content, flags=re.DOTALL)
        # Eliminar espacios múltiples
        js_content = re.sub(r'\s+', ' ', js_content)
        return js_content.strip()

# Instancia global de optimizador
asset_optimizer = AssetOptimizer()

# ── Sistema de Lazy Loading ───────────────────────────────────────────────────────────

class LazyLoader:
    """Sistema de lazy loading para mejorar performance."""
    
    def __init__(self):
        self.loaded_scripts = set()
        self.loaded_styles = set()
    
    def should_load_script(self, script_name, current_page):
        """Determina si un script debe cargarse en la página actual."""
        # Scripts que siempre cargan
        always_load = ['ecomarket-consolidated', 'ecomarket-security']
        if script_name in always_load:
            return True
        
        # Scripts específicos por página
        page_scripts = {
            'index': ['ecommerce-analytics', 'ecomarket-social'],
            'detalle_producto': ['ecomarket-comments', 'ecomarket-compare'],
            'checkout': ['ecomarket-payments'],
            'perfil': ['ecomarket-gamification']
        }
        
        return script_name in page_scripts.get(current_page, [])
    
    def get_critical_css(self, current_page):
        """Obtiene CSS crítico para la página actual."""
        critical_css = {
            'index': ['ecomarket-consolidated', 'accessibility'],
            'detalle_producto': ['ecomarket-consolidated', 'ecomarket-advanced-features'],
            'checkout': ['ecomarket-consolidated'],
            'default': ['ecomarket-consolidated', 'accessibility']
        }
        
        return critical_css.get(current_page, critical_css['default'])

# Instancia global de lazy loader
lazy_loader = LazyLoader()

# ── Sistema de A/B Testing ───────────────────────────────────────────────────────────

class ABTesting:
    """Sistema de A/B testing para optimización de conversión."""
    
    def __init__(self):
        self.experiments = {
            'button_color': {
                'control': '#2e7d32',
                'variant_a': '#1b5e20',
                'variant_b': '#43a047'
            },
            'product_card_layout': {
                'control': 'standard',
                'variant_a': 'minimal',
                'variant_b': 'detailed'
            }
        }
    
    def get_variant(self, experiment_name, user_id):
        """Asigna una variante a un usuario."""
        if experiment_name not in self.experiments:
            return 'control'
        
        # Hash del user_id para consistencia
        user_hash = hashlib.md5(str(user_id).encode()).hexdigest()
        variant_index = int(user_hash, 16) % 3
        
        variants = ['control', 'variant_a', 'variant_b']
        return variants[variant_index]
    
    def track_conversion(self, experiment_name, variant, user_id):
        """Registra una conversión en un experimento."""
        # Aquí se guardaría en base de datos o analytics
        logger.info(f"Conversión registrada: {experiment_name} - {variant} - user {user_id}")

# Instancia global de A/B testing
ab_testing = ABTesting()

# ── Sistema de Notificaciones Email/SMS ───────────────────────────────────────────────

class NotificationManager:
    """Gestor de notificaciones por email y SMS."""
    
    def __init__(self):
        self.email_queue = []
        self.sms_queue = []
    
    def send_email(self, to, subject, body, template=None):
        """Envía un email (simulado - requiere configuración SMTP)."""
        email_data = {
            'to': to,
            'subject': subject,
            'body': body,
            'template': template,
            'timestamp': time.time()
        }
        self.email_queue.append(email_data)
        logger.info(f"Email en cola para {to}: {subject}")
        
        # En producción, aquí se integraría con SMTP o servicio como SendGrid
        return True
    
    def send_sms(self, to, message):
        """Envía un SMS (simulado - requiere integración Twilio)."""
        sms_data = {
            'to': to,
            'message': message,
            'timestamp': time.time()
        }
        self.sms_queue.append(sms_data)
        logger.info(f"SMS en cola para {to}")
        
        # En producción, aquí se integraría con Twilio o similar
        return True
    
    def send_order_confirmation(self, user_email, order_id, total):
        """Envía confirmación de pedido."""
        subject = f"Confirmación de Pedido #{order_id} - EcoMarket"
        body = f"""
        ¡Gracias por tu compra!
        
        Pedido: #{order_id}
        Total: S/ {total:.2f}
        
        Tu pedido ha sido procesado exitosamente.
        
        Saludos,
        El equipo de EcoMarket
        """
        return self.send_email(user_email, subject, body)
    
    def send_password_reset(self, user_email, reset_token):
        """Envía email de restablecimiento de contraseña."""
        subject = "Restablecer Contraseña - EcoMarket"
        body = f"""
        Hola,
        
        Para restablecer tu contraseña, haz clic en el siguiente enlace:
        
        {request.host_url}reset-password?token={reset_token}
        
        Este enlace expirará en 1 hora.
        
        Saludos,
        El equipo de EcoMarket
        """
        return self.send_email(user_email, subject, body)

# Instancia global de notificaciones
notification_manager = NotificationManager()

# ── Sistema de Analytics Avanzado ───────────────────────────────────────────────────────

class AdvancedAnalytics:
    """Sistema de analytics avanzado con machine learning básico."""
    
    def __init__(self):
        self.events = []
        self.user_sessions = {}
        self.conversion_funnel = {
            'page_view': 0,
            'product_view': 0,
            'add_to_cart': 0,
            'checkout': 0,
            'purchase': 0
        }
    
    def track_event(self, event_name, user_id=None, properties=None):
        """Registra un evento de analytics."""
        event = {
            'name': event_name,
            'user_id': user_id,
            'properties': properties or {},
            'timestamp': time.time()
        }
        self.events.append(event)
        
        # Actualizar funnel
        if event_name in self.conversion_funnel:
            self.conversion_funnel[event_name] += 1
        
        logger.info(f"Evento tracked: {event_name}")
    
    def get_funnel_analysis(self):
        """Analiza el funnel de conversión."""
        total = self.conversion_funnel['page_view'] or 1
        analysis = {}
        
        for step, count in self.conversion_funnel.items():
            if step == 'page_view':
                analysis[step] = {'count': count, 'rate': 1.0}
            else:
                prev_step = list(self.conversion_funnel.keys())[
                    list(self.conversion_funnel.keys()).index(step) - 1
                ]
                prev_count = self.conversion_funnel[prev_step] or 1
                analysis[step] = {
                    'count': count,
                    'rate': count / prev_count
                }
        
        return analysis
    
    def get_user_behavior(self, user_id):
        """Analiza comportamiento de un usuario."""
        user_events = [e for e in self.events if e['user_id'] == user_id]
        
        if not user_events:
            return None
        
        return {
            'total_events': len(user_events),
            'most_common_action': self._get_most_common_action(user_events),
            'session_duration': self._calculate_session_duration(user_events),
            'conversion_status': self._get_conversion_status(user_events)
        }
    
    def _get_most_common_action(self, events):
        """Obtiene la acción más común del usuario."""
        actions = [e['name'] for e in events]
        from collections import Counter
        return Counter(actions).most_common(1)[0][0]
    
    def _calculate_session_duration(self, events):
        """Calcula duración de sesión."""
        if len(events) < 2:
            return 0
        return events[-1]['timestamp'] - events[0]['timestamp']
    
    def _get_conversion_status(self, events):
        """Determina estado de conversión."""
        actions = [e['name'] for e in events]
        if 'purchase' in actions:
            return 'converted'
        elif 'checkout' in actions:
            return 'in_checkout'
        elif 'add_to_cart' in actions:
            return 'in_cart'
        else:
            return 'browsing'

# Instancia global de analytics
advanced_analytics = AdvancedAnalytics()

# ── Sistema de Búsqueda Semántica ───────────────────────────────────────────────────────

class SemanticSearch:
    """Sistema de búsqueda semántica con análisis de texto."""
    
    def __init__(self):
        self.vocabulary = {}
        self.product_vectors = {}
        self._build_vocabulary()
    
    def _build_vocabulary(self):
        """Construye vocabulario de los productos."""
        try:
            conn = get_db()
            productos = conn.execute('SELECT id, nombre, descripcion, categoria, etiquetas FROM productos').fetchall()
            conn.close()
            
            # Tokenizar y construir vocabulario
            for producto in productos:
                text = f"{producto['nombre']} {producto['descripcion']} {producto['categoria']} {producto['etiquetas']}"
                tokens = self._tokenize(text)
                
                for token in tokens:
                    if token not in self.vocabulary:
                        self.vocabulary[token] = len(self.vocabulary)
                
                # Crear vector del producto
                self.product_vectors[producto['id']] = self._text_to_vector(tokens)
            
            logger.info(f"Vocabulario construido: {len(self.vocabulary)} tokens")
        except Exception as e:
            logger.error(f"Error construyendo vocabulario: {e}")
    
    def _tokenize(self, text):
        """Tokeniza texto de forma básica."""
        # Convertir a minúsculas
        text = text.lower()
        # Eliminar puntuación
        text = re.sub(r'[^\w\s]', '', text)
        # Tokenizar
        tokens = text.split()
        # Eliminar stopwords básicas
        stopwords = {'el', 'la', 'de', 'en', 'y', 'o', 'que', 'para', 'con', 'por', 'un', 'una', 'los', 'las'}
        tokens = [t for t in tokens if t not in stopwords and len(t) > 2]
        return tokens
    
    def _text_to_vector(self, tokens):
        """Convierte tokens a vector TF-IDF simplificado."""
        vector = {}
        for token in tokens:
            if token in self.vocabulary:
                idx = self.vocabulary[token]
                vector[idx] = vector.get(idx, 0) + 1
        return vector
    
    def search(self, query, limit=10):
        """Realiza búsqueda semántica."""
        if not query:
            return []
        
        query_tokens = self._tokenize(query)
        query_vector = self._text_to_vector(query_tokens)
        
        if not query_vector:
            return []
        
        # Calcular similitud con cada producto
        similarities = []
        for product_id, product_vector in self.product_vectors.items():
            similarity = self._cosine_similarity(query_vector, product_vector)
            if similarity > 0:
                similarities.append((product_id, similarity))
        
        # Ordenar por similitud
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Obtener IDs de productos
        product_ids = [pid for pid, _ in similarities[:limit]]
        
        return product_ids
    
    def _cosine_similarity(self, vec1, vec2):
        """Calcula similitud coseno entre dos vectores."""
        intersection = set(vec1.keys()) & set(vec2.keys())
        if not intersection:
            return 0
        
        dot_product = sum(vec1[k] * vec2[k] for k in intersection)
        norm1 = sum(v ** 2 for v in vec1.values()) ** 0.5
        norm2 = sum(v ** 2 for v in vec2.values()) ** 0.5
        
        if norm1 == 0 or norm2 == 0:
            return 0
        
        return dot_product / (norm1 * norm2)

# Instancia global de búsqueda semántica
semantic_search = SemanticSearch()

# ── Sistema de Recomendaciones con ML ───────────────────────────────────────────────────

class MLRecommender:
    """Sistema de recomendaciones con técnicas de machine learning básicas."""
    
    def __init__(self):
        self.user_item_matrix = {}
        self.item_similarity = {}
        self._build_matrices()
    
    def _build_matrices(self):
        """Construye matrices de usuario-item y similitud."""
        try:
            conn = get_db()
            
            # Construir matriz usuario-item basada en favoritos y compras
            favoritos = conn.execute('SELECT usuario_id, producto_id FROM favoritos').fetchall()
            pedidos = conn.execute('SELECT usuario_id FROM pedidos').fetchall()
            
            for fav in favoritos:
                user_id = fav['usuario_id']
                product_id = fav['producto_id']
                if user_id not in self.user_item_matrix:
                    self.user_item_matrix[user_id] = {}
                self.user_item_matrix[user_id][product_id] = 1  # Interacción positiva
            
            conn.close()
            logger.info(f"Matriz usuario-item construida: {len(self.user_item_matrix)} usuarios")
        except Exception as e:
            logger.error(f"Error construyendo matrices: {e}")
    
    def get_recommendations(self, user_id, limit=10):
        """Obtiene recomendaciones para un usuario."""
        if user_id not in self.user_item_matrix:
            # Usuario nuevo, recomendar populares
            return self._get_popular_items(limit)
        
        user_items = self.user_item_matrix[user_id]
        recommendations = {}
        
        # Colaborative filtering básico
        for other_user_id, other_items in self.user_item_matrix.items():
            if other_user_id == user_id:
                continue
            
            # Calcular similitud entre usuarios
            similarity = self._user_similarity(user_items, other_items)
            
            if similarity > 0:
                for product_id, rating in other_items.items():
                    if product_id not in user_items:
                        recommendations[product_id] = recommendations.get(product_id, 0) + similarity * rating
        
        # Ordenar por score
        sorted_recommendations = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
        
        return [pid for pid, _ in sorted_recommendations[:limit]]
    
    def _get_popular_items(self, limit=10):
        """Obtiene items populares."""
        try:
            conn = get_db()
            populares = conn.execute('''
                SELECT id FROM productos 
                ORDER BY vistas DESC, eco_score DESC 
                LIMIT ?
            ''', (limit,)).fetchall()
            conn.close()
            return [p['id'] for p in populares]
        except Exception as e:
            logger.error(f"Error obteniendo populares: {e}")
            return []
    
    def _user_similarity(self, user1_items, user2_items):
        """Calcula similitud entre usuarios (Jaccard)."""
        set1 = set(user1_items.keys())
        set2 = set(user2_items.keys())
        
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        
        if union == 0:
            return 0
        
        return intersection / union

# Instancia global de recomendaciones
ml_recommender = MLRecommender()

# ── Sistema de Mejoras de Accesibilidad WCAG 2.1 AAA ───────────────────────────────────────

class AccessibilityEnhancer:
    """Mejoras de accesibilidad avanzadas."""
    
    def __init__(self):
        self.high_contrast_mode = False
        self.reduced_motion = False
        self.large_text = False
    
    def check_preferences(self):
        """Verifica preferencias de accesibilidad del usuario."""
        # Se puede extender para leer preferencias guardadas en base de datos
        pass
    
    def get_aria_labels(self, context):
        """Genera etiquetas ARIA dinámicas."""
        labels = {
            'search': 'Buscar productos',
            'cart': 'Ver carrito de compras',
            'favorite': 'Agregar a favoritos',
            'buy': 'Comprar producto',
            'filter': 'Filtrar productos'
        }
        return labels.get(context, '')
    
    def generate_skip_links(self):
        """Genera enlaces de navegación por saltos."""
        return """
        <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
        <a href="#navigation" class="skip-link">Saltar a navegación</a>
        <a href="#search" class="skip-link">Saltar a búsqueda</a>
        """
    
    def get_color_contrast_ratio(self, foreground, background):
        """Calcula ratio de contraste entre colores."""
        # Implementación simplificada
        try:
            # Convertir hex a RGB
            fg = self._hex_to_rgb(foreground)
            bg = self._hex_to_rgb(background)
            
            # Calcular luminancia
            fg_lum = self._get_luminance(fg)
            bg_lum = self._get_luminance(bg)
            
            # Calcular ratio
            lighter = max(fg_lum, bg_lum)
            darker = min(fg_lum, bg_lum)
            
            return (lighter + 0.05) / (darker + 0.05)
        except:
            return 4.5  # Default
    
    def _hex_to_rgb(self, hex_color):
        """Convierte color hex a RGB."""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def _get_luminance(self, rgb):
        """Calcula luminancia relativa."""
        r, g, b = [x / 255.0 for x in rgb]
        return 0.2126 * r + 0.7152 * g + 0.0722 * b

# Instancia global de accesibilidad
accessibility = AccessibilityEnhancer()

# ── Sistema de PWA Completo con Sync Offline ───────────────────────────────────────────────

class PWAManager:
    """Gestor de PWA con sincronización offline."""
    
    def __init__(self):
        self.offline_queue = []
        self.sync_pending = False
    
    def queue_offline_action(self, action_type, data):
        """Encola una acción para sincronización offline."""
        action = {
            'type': action_type,
            'data': data,
            'timestamp': time.time(),
            'synced': False
        }
        self.offline_queue.append(action)
        self.sync_pending = True
        logger.info(f"Acción encolada para sync offline: {action_type}")
    
    def sync_offline_actions(self):
        """Sincroniza acciones pendientes cuando hay conexión."""
        if not self.offline_queue:
            return True
        
        sync_errors = []
        
        for action in self.offline_queue:
            if action['synced']:
                continue
            
            try:
                if action['type'] == 'favorite':
                    # Sincronizar favorito
                    self._sync_favorite(action['data'])
                elif action['type'] == 'review':
                    # Sincronizar reseña
                    self._sync_review(action['data'])
                elif action['type'] == 'order':
                    # Sincronizar pedido
                    self._sync_order(action['data'])
                
                action['synced'] = True
            except Exception as e:
                sync_errors.append(e)
                logger.error(f"Error sincronizando acción: {e}")
        
        # Limpiar acciones sincronizadas
        self.offline_queue = [a for a in self.offline_queue if not a['synced']]
        self.sync_pending = len(self.offline_queue) > 0
        
        return len(sync_errors) == 0
    
    def _sync_favorite(self, data):
        """Sincroniza un favorito."""
        conn = get_db()
        conn.execute('''
            INSERT OR IGNORE INTO favoritos (usuario_id, producto_id)
            VALUES (?, ?)
        ''', (data['usuario_id'], data['producto_id']))
        conn.commit()
        conn.close()
    
    def _sync_review(self, data):
        """Sincroniza una reseña."""
        conn = get_db()
        conn.execute('''
            INSERT INTO resenas (producto_id, usuario_id, nombre, rating, comentario)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['producto_id'], data['usuario_id'], data['nombre'], 
              data['rating'], data['comentario']))
        conn.commit()
        conn.close()
    
    def _sync_order(self, data):
        """Sincroniza un pedido."""
        # Implementación más compleja requeriría re-procesar el pedido
        pass
    
    def get_sync_status(self):
        """Obtiene estado de sincronización."""
        return {
            'pending': len(self.offline_queue),
            'sync_pending': self.sync_pending,
            'last_sync': time.time()
        }

# Instancia global de PWA
pwa_manager = PWAManager()

# ── Sistema Multi-Idioma Completo ───────────────────────────────────────────────────────

class I18NManager:
    """Gestor de internacionalización completo."""
    
    def __init__(self):
        self.supported_languages = ['es', 'en', 'pt', 'fr']
        self.translations = {
            'es': {
                # Navegación
                'home': 'Inicio',
                'shop': 'Tienda',
                'refill': 'Recargas',
                'impact': 'Impacto',
                'learn': 'Aprender',
                'find_store': 'Encontrar Tienda',
                'search': 'Buscar',
                'cart': 'Carrito',
                'login': 'Iniciar Sesión',
                'register': 'Registrarse',
                'profile': 'Perfil',
                'logout': 'Cerrar Sesión',
                'welcome': 'Bienvenido',
                'buy': 'Comprar',
                'products': 'Productos',
                # Hero Section
                'hero_title': 'Raíces en la Naturaleza, Construido para el Futuro',
                'hero_subtitle': 'Tu tienda de un solo paso para esenciales de cero residuos, recargas a granel y una comunidad dedicada a un planeta más limpio.',
                'shop_zero_waste': 'Comprar Cero Residuos',
                'how_refills_work': 'Cómo Funcionan las Recargas',
                'plastic_saved': 'Botellas de Plástico Ahorradas',
                # Categorías
                'shop_by_category': 'Comprar por Categoría',
                'category_subtitle': 'Todo lo que necesitas para transitionar a un estilo de vida sostenible, curado por calidad e impacto.',
                'personal_care': 'Cuidado Personal',
                'home_essentials': 'Esenciales del Hogar',
                'kitchen': 'Cocina',
                'on_the_go': 'En Movimiento',
                'cleaning': 'Limpieza',
                'wellness': 'Bienestar',
                # Productos
                'eco_score': 'Puntuación Eco',
                'condition': 'Condición',
                'new': 'Nuevo',
                'used': 'Usado',
                'refurbished': 'Reacondicionado',
                'price': 'Precio',
                'stock': 'Stock',
                'description': 'Descripción',
                'specifications': 'Especificaciones',
                'location': 'Ubicación',
                'seller': 'Vendedor',
                'reviews': 'Reseñas',
                'rating': 'Calificación',
                'add_to_cart': 'Agregar al Carrito',
                'add_to_favorites': 'Agregar a Favoritos',
                'view_details': 'Ver Detalles',
                # Checkout
                'checkout': 'Checkout',
                'shipping': 'Envío',
                'payment': 'Pago',
                'order_summary': 'Resumen del Pedido',
                'subtotal': 'Subtotal',
                'total': 'Total',
                'shipping_address': 'Dirección de Envío',
                'payment_method': 'Método de Pago',
                'place_order': 'Realizar Pedido',
                'credit_card': 'Tarjeta de Crédito',
                'paypal': 'PayPal',
                'cash_on_delivery': 'Pago contra Entrega',
                # Usuario
                'my_account': 'Mi Cuenta',
                'my_orders': 'Mis Pedidos',
                'my_favorites': 'Mis Favoritos',
                'my_reviews': 'Mis Reseñas',
                'settings': 'Configuración',
                'notifications': 'Notificaciones',
                'messages': 'Mensajes',
                'edit_profile': 'Editar Perfil',
                'change_password': 'Cambiar Contraseña',
                'shipping_addresses': 'Direcciones de Envío',
                'payment_methods': 'Métodos de Pago',
                # Admin
                'admin_panel': 'Panel de Administración',
                'manage_products': 'Gestionar Productos',
                'manage_users': 'Gestionar Usuarios',
                'manage_orders': 'Gestionar Pedidos',
                'analytics': 'Analíticas',
                'reports': 'Reportes',
                'settings_admin': 'Configuración',
                # Mensajes
                'success': 'Éxito',
                'error': 'Error',
                'warning': 'Advertencia',
                'info': 'Información',
                'login_success': 'Inicio de sesión exitoso',
                'login_failed': 'Error en inicio de sesión',
                'register_success': 'Registro exitoso',
                'register_failed': 'Error en registro',
                'added_to_cart': 'Agregado al carrito',
                'removed_from_cart': 'Eliminado del carrito',
                'order_placed': 'Pedido realizado',
                'order_failed': 'Error al realizar pedido',
                'profile_updated': 'Perfil actualizado',
                'password_changed': 'Contraseña cambiada',
                # Footer
                'about_us': 'Sobre Nosotros',
                'contact': 'Contacto',
                'faq': 'Preguntas Frecuentes',
                'privacy_policy': 'Política de Privacidad',
                'terms_of_service': 'Términos de Servicio',
                'shipping_policy': 'Política de Envío',
                'return_policy': 'Política de Devoluciones',
                'follow_us': 'Síguenos',
                'newsletter': 'Boletín',
                'subscribe': 'Suscribirse',
                # Otros
                'loading': 'Cargando...',
                'no_results': 'No hay resultados',
                'try_again': 'Intentar de nuevo',
                'view_all': 'Ver Todo',
                'show_more': 'Mostrar Más',
                'show_less': 'Mostrar Menos',
                'filter': 'Filtrar',
                'sort': 'Ordenar',
                'sort_by': 'Ordenar por',
                'price_low_high': 'Precio: Bajo a Alto',
                'price_high_low': 'Precio: Alto a Bajo',
                'newest': 'Más Recientes',
                'oldest': 'Más Antiguos',
                'popular': 'Populares',
                'rating_high': 'Mejor Calificación',
                'eco_score_high': 'Mejor Puntuación Eco'
            },
            'en': {
                # Navigation
                'home': 'Home',
                'shop': 'Shop',
                'refill': 'Refill',
                'impact': 'Impact',
                'learn': 'Learn',
                'find_store': 'Find Store',
                'search': 'Search',
                'cart': 'Cart',
                'login': 'Login',
                'register': 'Register',
                'profile': 'Profile',
                'logout': 'Logout',
                'welcome': 'Welcome',
                'buy': 'Buy',
                'products': 'Products',
                # Hero Section
                'hero_title': 'Rooted in Nature, Built for the Future',
                'hero_subtitle': 'Your one-stop shop for premium zero-waste essentials, bulk refills, and a community dedicated to a cleaner planet.',
                'shop_zero_waste': 'Shop Zero Waste',
                'how_refills_work': 'How Refills Work',
                'plastic_saved': 'Plastic Bottles Saved',
                # Categories
                'shop_by_category': 'Shop by Category',
                'category_subtitle': 'Everything you need to transition to a sustainable lifestyle, curated for quality and impact.',
                'personal_care': 'Personal Care',
                'home_essentials': 'Home Essentials',
                'kitchen': 'Kitchen',
                'on_the_go': 'On the Go',
                'cleaning': 'Cleaning',
                'wellness': 'Wellness',
                # Products
                'eco_score': 'Eco Score',
                'condition': 'Condition',
                'new': 'New',
                'used': 'Used',
                'refurbished': 'Refurbished',
                'price': 'Price',
                'stock': 'Stock',
                'description': 'Description',
                'specifications': 'Specifications',
                'location': 'Location',
                'seller': 'Seller',
                'reviews': 'Reviews',
                'rating': 'Rating',
                'add_to_cart': 'Add to Cart',
                'add_to_favorites': 'Add to Favorites',
                'view_details': 'View Details',
                # Checkout
                'checkout': 'Checkout',
                'shipping': 'Shipping',
                'payment': 'Payment',
                'order_summary': 'Order Summary',
                'subtotal': 'Subtotal',
                'total': 'Total',
                'shipping_address': 'Shipping Address',
                'payment_method': 'Payment Method',
                'place_order': 'Place Order',
                'credit_card': 'Credit Card',
                'paypal': 'PayPal',
                'cash_on_delivery': 'Cash on Delivery',
                # User
                'my_account': 'My Account',
                'my_orders': 'My Orders',
                'my_favorites': 'My Favorites',
                'my_reviews': 'My Reviews',
                'settings': 'Settings',
                'notifications': 'Notifications',
                'messages': 'Messages',
                'edit_profile': 'Edit Profile',
                'change_password': 'Change Password',
                'shipping_addresses': 'Shipping Addresses',
                'payment_methods': 'Payment Methods',
                # Admin
                'admin_panel': 'Admin Panel',
                'manage_products': 'Manage Products',
                'manage_users': 'Manage Users',
                'manage_orders': 'Manage Orders',
                'analytics': 'Analytics',
                'reports': 'Reports',
                'settings_admin': 'Settings',
                # Messages
                'success': 'Success',
                'error': 'Error',
                'warning': 'Warning',
                'info': 'Information',
                'login_success': 'Login successful',
                'login_failed': 'Login failed',
                'register_success': 'Registration successful',
                'register_failed': 'Registration failed',
                'added_to_cart': 'Added to cart',
                'removed_from_cart': 'Removed from cart',
                'order_placed': 'Order placed',
                'order_failed': 'Order failed',
                'profile_updated': 'Profile updated',
                'password_changed': 'Password changed',
                # Footer
                'about_us': 'About Us',
                'contact': 'Contact',
                'faq': 'FAQ',
                'privacy_policy': 'Privacy Policy',
                'terms_of_service': 'Terms of Service',
                'shipping_policy': 'Shipping Policy',
                'return_policy': 'Return Policy',
                'follow_us': 'Follow Us',
                'newsletter': 'Newsletter',
                'subscribe': 'Subscribe',
                # Other
                'loading': 'Loading...',
                'no_results': 'No results',
                'try_again': 'Try again',
                'view_all': 'View All',
                'show_more': 'Show More',
                'show_less': 'Show Less',
                'filter': 'Filter',
                'sort': 'Sort',
                'sort_by': 'Sort by',
                'price_low_high': 'Price: Low to High',
                'price_high_low': 'Price: High to Low',
                'newest': 'Newest',
                'oldest': 'Oldest',
                'popular': 'Popular',
                'rating_high': 'Highest Rating',
                'eco_score_high': 'Highest Eco Score'
            },
            'pt': {
                'home': 'Início',
                'shop': 'Loja',
                'refill': 'Recargas',
                'impact': 'Impacto',
                'learn': 'Aprender',
                'find_store': 'Encontrar Loja',
                'search': 'Buscar',
                'cart': 'Carrinho',
                'login': 'Entrar',
                'register': 'Registrar',
                'profile': 'Perfil',
                'logout': 'Sair',
                'welcome': 'Bem-vindo',
                'buy': 'Comprar',
                'products': 'Produtos',
                'hero_title': 'Enraizado na Natureza, Construído para o Futuro',
                'hero_subtitle': 'Sua loja de parada única para essenciais de zero resíduos, recargas a granel e uma comunidade dedicada a um planeta mais limpo.',
                'shop_zero_waste': 'Comprar Zero Resíduos',
                'how_refills_work': 'Como Funcionam as Recargas',
                'plastic_saved': 'Garrafas de Plástico Economizadas',
                'shop_by_category': 'Comprar por Categoria',
                'category_subtitle': 'Tudo que você precisa para transicionar para um estilo de vida sustentável, curado por qualidade e impacto.',
                'personal_care': 'Cuidado Pessoal',
                'home_essentials': 'Essenciais da Casa',
                'kitchen': 'Cozinha',
                'on_the_go': 'Em Movimento',
                'cleaning': 'Limpeza',
                'wellness': 'Bem-estar',
                'eco_score': 'Pontuação Eco',
                'condition': 'Condição',
                'new': 'Novo',
                'used': 'Usado',
                'refurbished': 'Recondicionado',
                'price': 'Preço',
                'stock': 'Estoque',
                'description': 'Descrição',
                'specifications': 'Especificações',
                'location': 'Localização',
                'seller': 'Vendedor',
                'reviews': 'Avaliações',
                'rating': 'Classificação',
                'add_to_cart': 'Adicionar ao Carrinho',
                'add_to_favorites': 'Adicionar aos Favoritos',
                'view_details': 'Ver Detalhes',
                'checkout': 'Checkout',
                'shipping': 'Envio',
                'payment': 'Pagamento',
                'order_summary': 'Resumo do Pedido',
                'subtotal': 'Subtotal',
                'total': 'Total',
                'shipping_address': 'Endereço de Envio',
                'payment_method': 'Método de Pagamento',
                'place_order': 'Fazer Pedido',
                'credit_card': 'Cartão de Crédito',
                'paypal': 'PayPal',
                'cash_on_delivery': 'Pagamento na Entrega',
                'my_account': 'Minha Conta',
                'my_orders': 'Meus Pedidos',
                'my_favorites': 'Meus Favoritos',
                'my_reviews': 'Minhas Avaliações',
                'settings': 'Configurações',
                'notifications': 'Notificações',
                'messages': 'Mensagens',
                'edit_profile': 'Editar Perfil',
                'change_password': 'Alterar Senha',
                'success': 'Sucesso',
                'error': 'Erro',
                'warning': 'Aviso',
                'info': 'Informação',
                'login_success': 'Login bem-sucedido',
                'login_failed': 'Login falhou',
                'register_success': 'Registro bem-sucedido',
                'register_failed': 'Registro falhou',
                'added_to_cart': 'Adicionado ao carrinho',
                'removed_from_cart': 'Removido do carrinho',
                'order_placed': 'Pedido realizado',
                'order_failed': 'Falha ao realizar pedido',
                'loading': 'Carregando...',
                'no_results': 'Sem resultados',
                'try_again': 'Tentar novamente',
                'view_all': 'Ver Tudo',
                'show_more': 'Mostrar Mais',
                'show_less': 'Mostrar Menos',
                'filter': 'Filtrar',
                'sort': 'Ordenar',
                'sort_by': 'Ordenar por',
                'price_low_high': 'Preço: Baixo a Alto',
                'price_high_low': 'Preço: Alto a Baixo',
                'newest': 'Mais Recentes',
                'oldest': 'Mais Antigos',
                'popular': 'Populares',
                'rating_high': 'Maior Classificação',
                'eco_score_high': 'Maior Pontuação Eco'
            },
            'fr': {
                'home': 'Accueil',
                'shop': 'Boutique',
                'refill': 'Recharge',
                'impact': 'Impact',
                'learn': 'Apprendre',
                'find_store': 'Trouver Magasin',
                'search': 'Rechercher',
                'cart': 'Panier',
                'login': 'Connexion',
                'register': 'S\'inscrire',
                'profile': 'Profil',
                'logout': 'Déconnexion',
                'welcome': 'Bienvenue',
                'buy': 'Acheter',
                'products': 'Produits',
                'hero_title': 'Enraciné dans la Nature, Construit pour l\'Avenir',
                'hero_subtitle': 'Votre magasin tout-en-un pour les essentiels zéro déchet, recharges en vrac et une communauté dédiée à une planète plus propre.',
                'shop_zero_waste': 'Acheter Zéro Déchet',
                'how_refills_work': 'Comment Fonctionnent les Recharges',
                'plastic_saved': 'Bouteilles en Plastique Économisées',
                'shop_by_category': 'Acheter par Catégorie',
                'category_subtitle': 'Tout ce dont vous avez besoin pour transitionner vers un mode de vie durable, sélectionné pour la qualité et l\'impact.',
                'personal_care': 'Soins Personnels',
                'home_essentials': 'Essentiels de la Maison',
                'kitchen': 'Cuisine',
                'on_the_go': 'En Déplacement',
                'cleaning': 'Nettoyage',
                'wellness': 'Bien-être',
                'eco_score': 'Score Éco',
                'condition': 'Condition',
                'new': 'Nouveau',
                'used': 'Utilisé',
                'refurbished': 'Reconditionné',
                'price': 'Prix',
                'stock': 'Stock',
                'description': 'Description',
                'specifications': 'Spécifications',
                'location': 'Emplacement',
                'seller': 'Vendeur',
                'reviews': 'Avis',
                'rating': 'Note',
                'add_to_cart': 'Ajouter au Panier',
                'add_to_favorites': 'Ajouter aux Favoris',
                'view_details': 'Voir Détails',
                'checkout': 'Paiement',
                'shipping': 'Livraison',
                'payment': 'Paiement',
                'order_summary': 'Résumé de la Commande',
                'subtotal': 'Sous-total',
                'total': 'Total',
                'shipping_address': 'Adresse de Livraison',
                'payment_method': 'Méthode de Paiement',
                'place_order': 'Passer la Commande',
                'credit_card': 'Carte de Crédit',
                'paypal': 'PayPal',
                'cash_on_delivery': 'Paiement à la Livraison',
                'my_account': 'Mon Compte',
                'my_orders': 'Mes Commandes',
                'my_favorites': 'Mes Favoris',
                'my_reviews': 'Mes Avis',
                'settings': 'Paramètres',
                'notifications': 'Notifications',
                'messages': 'Messages',
                'edit_profile': 'Modifier le Profil',
                'change_password': 'Changer le Mot de Passe',
                'success': 'Succès',
                'error': 'Erreur',
                'warning': 'Avertissement',
                'info': 'Information',
                'login_success': 'Connexion réussie',
                'login_failed': 'Échec de la connexion',
                'register_success': 'Inscription réussie',
                'register_failed': 'Échec de l\'inscription',
                'added_to_cart': 'Ajouté au panier',
                'removed_from_cart': 'Retiré du panier',
                'order_placed': 'Commande passée',
                'order_failed': 'Échec de la commande',
                'loading': 'Chargement...',
                'no_results': 'Aucun résultat',
                'try_again': 'Réessayer',
                'view_all': 'Voir Tout',
                'show_more': 'Afficher Plus',
                'show_less': 'Afficher Moins',
                'filter': 'Filtrer',
                'sort': 'Trier',
                'sort_by': 'Trier par',
                'price_low_high': 'Prix: Bas à Haut',
                'price_high_low': 'Prix: Haut à Bas',
                'newest': 'Plus Récents',
                'oldest': 'Plus Anciens',
                'popular': 'Populaires',
                'rating_high': 'Note la Plus Élevée',
                'eco_score_high': 'Score Éco le Plus Élevé'
            }
        }
    
    def get_translation(self, key, lang='es'):
        """Obtiene traducción de una clave."""
        if lang not in self.translations:
            lang = 'es'
        return self.translations[lang].get(key, key)
    
    def get_translations_for_lang(self, lang='es'):
        """Obtiene todas las traducciones para un idioma."""
        if lang not in self.translations:
            lang = 'es'
        return self.translations[lang]
    
    def detect_language(self, request):
        """Detecta idioma preferido del usuario."""
        # Verificar cookie de idioma
        lang_cookie = request.cookies.get('lang')
        if lang_cookie in self.supported_languages:
            return lang_cookie
        
        # Verificar header Accept-Language
        accept_lang = request.headers.get('Accept-Language', 'es')
        if accept_lang:
            for lang in self.supported_languages:
                if lang in accept_lang.lower():
                    return lang
        
        return 'es'

# Instancia global de I18N
i18n_manager = I18NManager()

# ── API Endpoints para Nuevas Funcionalidades ───────────────────────────────────────────────

@app.route('/api/monitoring/stats')
@login_required
@admin_required
def monitoring_stats():
    """API para obtener estadísticas de monitoring."""
    return jsonify(monitoring.get_stats())

@app.route('/api/monitoring/alerts')
@login_required
@admin_required
def monitoring_alerts():
    """API para obtener alertas del sistema."""
    return jsonify(monitoring.check_alerts())

@app.route('/api/backup/create', methods=['POST'])
@login_required
@admin_required
def create_backup():
    """API para crear backup de la base de datos."""
    backup_file = backup_manager.create_backup()
    if backup_file:
        return jsonify({'success': True, 'backup_file': backup_file})
    return jsonify({'success': False, 'error': 'Error creando backup'}), 500


@app.route('/api/backup/list')
@login_required
@admin_required
def list_backups():
    """Lista los backups disponibles (solo admin)."""
    backups = sorted(
        [f for f in os.listdir(backup_manager.backup_dir)
         if f.startswith('ecomarket_backup_') and f.endswith('.db')],
        reverse=True,
    )
    return jsonify({'backups': backups})


@app.route('/api/backup/restore', methods=['POST'])
@login_required
@admin_required
def restore_backup():
    """Restaura un backup por nombre de archivo (solo admin).

    Body JSON: {"backup": "ecomarket_backup_YYYYMMDD_HHMMSS.db"}
    """
    nombre = (request.get_json(silent=True) or {}).get('backup', '')
    if not nombre or '/' in nombre or '\\' in nombre or not nombre.endswith('.db'):
        return jsonify({'success': False, 'error': 'Nombre de backup inválido'}), 400
    ruta = os.path.join(backup_manager.backup_dir, nombre)
    if not os.path.isfile(ruta):
        return jsonify({'success': False, 'error': 'Backup no encontrado'}), 404
    # Crear un backup de seguridad del estado actual antes de restaurar
    backup_manager.create_backup()
    if backup_manager.restore_backup(ruta):
        return jsonify({'success': True, 'restored': nombre})
    return jsonify({'success': False, 'error': 'Error restaurando backup'}), 500


TABLAS_DEMO_TRANSACCIONALES = [
    'pedido_items', 'pedidos', 'mensajes', 'notificaciones',
    'favoritos', 'resenas', 'resena_votos', 'resena_respuestas',
    'preguntas', 'reportes', 'visitas', 'historial_busquedas',
    'historial_precios', 'seguidores',
]


@app.route('/api/demo/reset', methods=['POST'])
@login_required
@admin_required
def demo_reset():
    """Resetea el estado transaccional para una demo limpia (solo admin).

    Conserva usuarios, productos y cupones; borra pedidos, mensajes,
    reseñas, favoritos, notificaciones, etc., y marca productos como
    no vendidos. Crea un backup de seguridad antes de tocar nada.
    """
    backup_manager.create_backup()
    conn = get_db()
    try:
        for tabla in TABLAS_DEMO_TRANSACCIONALES:
            conn.execute(f'DELETE FROM {tabla}')
        conn.execute('UPDATE productos SET vendido = 0')
        conn.commit()
        logger.info('Demo reset completado por admin')
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error(f'Error en demo reset: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/api/semantic/search')
def semantic_search_api():
    """API para búsqueda semántica."""
    query = request.args.get('q', '').strip()
    limit = int(request.args.get('limit', 10))
    
    if not query:
        return jsonify({'results': []})
    
    product_ids = semantic_search.search(query, limit)
    
    conn = get_db()
    placeholders = ','.join('?' * len(product_ids))
    productos = conn.execute(f'''
        SELECT * FROM productos WHERE id IN ({placeholders})
    ''', product_ids).fetchall()
    conn.close()
    
    return jsonify({'results': [dict(p) for p in productos]})

@app.route('/api/recommendations/ml')
@login_required
def ml_recommendations():
    """API para recomendaciones con ML."""
    user_id = session.get('usuario_id')
    limit = int(request.args.get('limit', 10))
    
    recommended_ids = ml_recommender.get_recommendations(user_id, limit)
    
    if not recommended_ids:
        return jsonify({'recommendations': []})
    
    conn = get_db()
    placeholders = ','.join('?' * len(recommended_ids))
    productos = conn.execute(f'''
        SELECT * FROM productos WHERE id IN ({placeholders})
    ''', recommended_ids).fetchall()
    conn.close()
    
    return jsonify({'recommendations': [dict(p) for p in productos]})

@app.route('/api/analytics/track', methods=['POST'])
def track_analytics():
    """API para tracking de eventos analytics."""
    data = request.get_json()
    event_name = data.get('event')
    user_id = session.get('usuario_id')
    properties = data.get('properties', {})
    
    advanced_analytics.track_event(event_name, user_id, properties)

    # Persistir en BD para dashboard admin (solo eventos ligeros)
    if event_name in ('scroll_depth', 'time_on_page', 'page_view', 'add_to_cart', 'search'):
        try:
            conn = get_db()
            conn.execute('INSERT INTO analytics_eventos (evento, usuario_id, propiedades) VALUES (?,?,?)',
                         (event_name, user_id, json.dumps(properties or {}, ensure_ascii=False)[:500]))
            conn.commit()
            conn.close()
        except sqlite3.Error:
            pass

    return jsonify({'success': True})

@app.route('/api/analytics/funnel')
@login_required
@admin_required
def analytics_funnel():
    """API para análisis de funnel."""
    return jsonify(advanced_analytics.get_funnel_analysis())

@app.route('/api/analytics/user/<int:user_id>')
@login_required
@admin_required
def user_analytics(user_id):
    """API para analytics de usuario específico."""
    behavior = advanced_analytics.get_user_behavior(user_id)
    return jsonify(behavior or {})

@app.route('/api/pwa/sync', methods=['POST'])
@login_required
def pwa_sync():
    """API para sincronización offline."""
    data = request.get_json()
    action_type = data.get('action_type')
    action_data = data.get('data')
    
    pwa_manager.queue_offline_action(action_type, action_data)
    
    return jsonify({'success': True, 'sync_status': pwa_manager.get_sync_status()})

@app.route('/api/pwa/sync-status')
@login_required
def pwa_sync_status():
    """API para obtener estado de sincronización."""
    return jsonify(pwa_manager.get_sync_status())

@app.route('/api/i18n/translations')
def get_translations():
    """API para obtener traducciones."""
    lang = request.args.get('lang', 'es')
    return jsonify(i18n_manager.get_translations_for_lang(lang))

@app.route('/api/productos/traducciones')
def api_productos_traducciones():
    """Traducciones de productos por idioma (campos nombre_XX/descripcion_XX si existen)."""
    conn = get_db()
    conn.row_factory = sqlite3.Row
    columnas = {r[1] for r in conn.execute('PRAGMA table_info(productos)')}
    idiomas = [c[2:] for c in columnas if c.startswith('nombre_')]
    traducciones = {}
    if idiomas:
        campos = ','.join(f'id, {", ".join(c for c in columnas if c.startswith(("nombre_", "descripcion_")))}')
        for row in conn.execute(f'SELECT {campos} FROM productos').fetchall():
            pid = str(row['id'])
            traducciones[pid] = {k: row[k] for k in row.keys() if k.startswith(('nombre_', 'descripcion_')) and row[k]}
    conn.close()
    return jsonify({'success': True, 'traducciones': traducciones, 'idiomas': idiomas})


@app.route('/api/ab/test/variant')
@login_required
def get_ab_variant():
    """API para obtener variante de A/B test."""
    experiment_name = request.args.get('experiment')
    user_id = session.get('usuario_id')
    
    variant = ab_testing.get_variant(experiment_name, user_id)
    
    return jsonify({'experiment': experiment_name, 'variant': variant})

@app.route('/api/ab/test/conversion', methods=['POST'])
@login_required
def track_ab_conversion():
    """API para tracking de conversión A/B test."""
    data = request.get_json()
    experiment_name = data.get('experiment')
    variant = data.get('variant')
    user_id = session.get('usuario_id')
    
    ab_testing.track_conversion(experiment_name, variant, user_id)
    
    return jsonify({'success': True})

@app.route('/api/cache/stats')
@login_required
@admin_required
def cache_stats():
    """API para estadísticas de caché."""
    stats = {
        'redis_available': cache.redis_available,
        'cache_size': len(cache.cache),
        'expired_cleaned': cache.cleanup_expired()
    }
    return jsonify(stats)

@app.route('/api/cache/clear', methods=['POST'])
@login_required
@admin_required
def clear_cache():
    """API para limpiar caché."""
    cache.clear()
    return jsonify({'success': True})

# ── Gamificación API ───────────────────────────────────────────────────────

@app.route('/api/usuario/<int:user_id>/gamificacion')
@login_required
def get_user_gamification(user_id):
    """API para obtener datos de gamificación de usuario."""
    if session.get('usuario_id') != user_id and session.get('rol') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    conn = get_db()
    usuario = conn.execute('SELECT * FROM usuarios WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    
    if not usuario:
        return jsonify({'error': 'User not found'}), 404
    
    # Badges disponibles
    badges = [
        {'icon': '🌱', 'name': 'First Purchase', 'unlocked': usuario['xp'] > 0},
        {'icon': '🌿', 'name': 'Eco Warrior', 'unlocked': usuario['xp'] > 100},
        {'icon': '🌳', 'name': 'Nature Guardian', 'unlocked': usuario['xp'] > 500},
        {'icon': '🌍', 'name': 'Planet Savior', 'unlocked': usuario['xp'] > 1000},
        {'icon': '⭐', 'name': 'Top Reviewer', 'unlocked': usuario['eco_puntos'] > 50},
        {'icon': '🏆', 'name': 'Champion', 'unlocked': usuario['nivel'] > 5}
    ]
    
    return jsonify({
        'usuario_id': usuario['id'],
        'nombre': usuario['nombre'],
        'xp': usuario['xp'],
        'nivel': usuario['nivel'],
        'rango': usuario['rango'],
        'eco_puntos': usuario['eco_puntos'],
        'badges': badges
    })

@app.route('/api/gamificacion/xp', methods=['POST'])
@login_required
def api_gamificacion_xp():
    """API para agregar XP a usuario."""
    data = request.get_json()
    xp_amount = data.get('xp', 0)
    user_id = session.get('usuario_id')
    
    if xp_amount <= 0:
        return jsonify({'error': 'Invalid XP amount'}), 400
    
    conn = get_db()
    conn.execute('UPDATE usuarios SET xp = xp + ? WHERE id = ?', (xp_amount, user_id))
    
    # Check for level up
    usuario = conn.execute('SELECT xp, nivel FROM usuarios WHERE id = ?', (user_id,)).fetchone()
    new_level = 1 + (usuario['xp'] // 100)
    
    if new_level > usuario['nivel']:
        conn.execute('UPDATE usuarios SET nivel = ? WHERE id = ?', (new_level, user_id))
        
        # Update rango
        rangos = ['Semilla 🌱', 'Brote 🌿', 'Planta 🌱', 'Árbol 🌳', 'Bosque 🌲', 'Ecosistema 🌍']
        rango_index = min(new_level - 1, len(rangos) - 1)
        conn.execute('UPDATE usuarios SET rango = ? WHERE id = ?', (rangos[rango_index], user_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'xp_added': xp_amount})

@app.route('/api/leaderboard')
def get_leaderboard():
    """API para obtener leaderboard."""
    conn = get_db()
    
    # Leaderboard de vendedores (por productos vendidos)
    vendedores = conn.execute('''
        SELECT u.id, u.nombre, u.avatar, u.xp, u.nivel, u.rango,
               COUNT(p.id) as productos_vendidos
        FROM usuarios u
        LEFT JOIN productos p ON u.id = p.usuario_id
        WHERE u.rol = 'vendedor' OR u.rol = 'admin'
        GROUP BY u.id
        ORDER BY productos_vendidos DESC
        LIMIT 10
    ''').fetchall()
    
    # Leaderboard de compradores (por XP)
    compradores = conn.execute('''
        SELECT id, nombre, avatar, xp, nivel, rango
        FROM usuarios
        WHERE rol = 'comprador'
        ORDER BY xp DESC
        LIMIT 10
    ''').fetchall()
    
    conn.close()
    
    return jsonify({
        'vendedores': [dict(v) for v in vendedores],
        'compradores': [dict(c) for c in compradores]
    })

@app.route('/api/cupones/aplicar', methods=['POST'])
@login_required
def apply_coupon():
    """API para aplicar cupón."""
    data = request.get_json()
    codigo = data.get('codigo', '').strip().upper()
    
    if not codigo:
        return jsonify({'error': 'Coupon code required'}), 400
    
    conn = get_db()
    cupon = conn.execute('''
        SELECT * FROM cupones
        WHERE codigo = ? AND activo = 1 AND usos_actuales < usos_maximos
    ''', (codigo,)).fetchone()
    
    if not cupon:
        conn.close()
        return jsonify({'error': 'Invalid or expired coupon'}), 400
    
    # Cupón personal: solo su dueño puede usarlo
    if cupon['propietario_id'] and cupon['propietario_id'] != session.get('usuario_id'):
        conn.close()
        return jsonify({'error': 'Este cupón no es tuyo'}), 403

    conn.close()
    
    return jsonify({
        'success': True,
        'cupon': dict(cupon),
        'descuento': cupon['descuento'],
        'tipo': cupon['tipo']
    })

def validate_product_data(data):
    """Valida datos de producto de forma más estricta."""
    required_fields = ['nombre', 'categoria', 'precio', 'descripcion']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"Campo {field} requerido"
    
    # Validar nombre
    if not validate_text_input(data['nombre'], max_length=200):
        return False, "Nombre inválido"
    
    # Validar descripción
    if not validate_text_input(data['descripcion'], max_length=2000):
        return False, "Descripción inválida"
    
    # Validar precio
    try:
        precio = float(data['precio'])
        if precio < 0 or precio > 100000:
            return False, "Precio fuera de rango válido"
    except (ValueError, TypeError):
        return False, "Precio inválido"
    
    # Validar stock
    if 'stock' in data:
        try:
            stock = int(data['stock'])
            if stock < 0 or stock > 10000:
                return False, "Stock fuera de rango válido"
        except (ValueError, TypeError):
            return False, "Stock inválido"
    
    return True, "Validación exitosa"

def validate_user_data(data):
    """Valida datos de usuario de forma más estricta."""
    required_fields = ['nombre', 'email', 'password']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"Campo {field} requerido"
    
    # Validar nombre
    if not validate_text_input(data['nombre'], max_length=100):
        return False, "Nombre inválido"
    
    # Validar email
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, data['email']):
        return False, "Email inválido"
    
    # Validar contraseña
    password = data['password']
    if len(password) < 8:
        return False, "Contraseña debe tener al menos 8 caracteres"
    
    if not re.search(r'[A-Z]', password):
        return False, "Contraseña debe tener al menos una mayúscula"
    
    if not re.search(r'[a-z]', password):
        return False, "Contraseña debe tener al menos una minúscula"
    
    if not re.search(r'\d', password):
        return False, "Contraseña debe tener al menos un número"
    
    return True, "Validación exitosa"

# Rate limiting mejorado
login_attempts = {}
MAX_LOGIN_ATTEMPTS = 5
LOGIN_ATTEMPT_WINDOW = 300  # 5 minutos

def check_login_attempts(identifier):
    """Verifica si hay demasiados intentos de login."""
    now = time.time()
    
    # Limpiar intentos antiguos
    if identifier in login_attempts:
        login_attempts[identifier] = [
            attempt for attempt in login_attempts[identifier]
            if now - attempt < LOGIN_ATTEMPT_WINDOW
        ]
    
    current_attempts = len(login_attempts.get(identifier, []))
    
    if current_attempts >= MAX_LOGIN_ATTEMPTS:
        return False, f"Demasiados intentos. Intenta nuevamente en {LOGIN_ATTEMPT_WINDOW//60} minutos."
    
    return True, "Intentos permitidos"

def record_login_attempt(identifier):
    """Registra un intento de login."""
    if identifier not in login_attempts:
        login_attempts[identifier] = []
    
    login_attempts[identifier].append(time.time())

# Headers de seguridad mejorados
@app.after_request
def add_security_headers(response):
    """Agrega headers de seguridad adicionales."""
    # Protección contra clickjacking
    response.headers['X-Frame-Options'] = 'DENY'
    
    # Protección contra MIME sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # Habilitar XSS Protection
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Política de referer
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # CSP básico
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.google.com https://www.gstatic.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; "
        "img-src 'self' data: https:; "
        "connect-src 'self'; "
        "frame-ancestors 'none';"
    )
    
    # HSTS (solo en producción con HTTPS)
    if not app.debug:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    return response

# Validación de archivos mejorada
def validate_file_upload(file):
    """Valida uploads de archivos de forma más estricta."""
    if not file:
        return False, "No se proporcionó archivo"
    
    # Validar tamaño máximo (5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return False, "Archivo muy grande (máximo 5MB)"
    
    if file_size == 0:
        return False, "Archivo vacío"
    
    # Validar tipo de archivo
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
    ALLOWED_MIME_TYPES = {
        'image/png', 'image/jpeg', 'image/webp', 'image/gif'
    }
    
    filename = file.filename
    if not filename:
        return False, "Nombre de archivo inválido"
    
    # Validar extensión
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Extensión no permitida: {ext}"
    
    # Validar MIME type
    file_content = file.read()
    file.seek(0)
    
    import imghdr
    img_type = imghdr.what(None, file_content)
    
    if img_type not in ['png', 'jpeg', 'webp', 'gif']:
        return False, "Tipo de imagen no válido"
    
    return True, "Archivo válido"

# Sanitización de URLs
def sanitize_url(url):
    """Sanitiza URLs para prevenir ataques."""
    if not url or not isinstance(url, str):
        return ''
    
    url = url.strip()
    
    # Solo permitir protocolos seguros
    allowed_protocols = ['http', 'https']
    if '://' in url:
        protocol = url.split('://')[0].lower()
        if protocol not in allowed_protocols:
            return ''
    
    # Prevenir javascript: y data: URLs
    dangerous_patterns = ['javascript:', 'data:', 'vbscript:', 'file:']
    url_lower = url.lower()
    for pattern in dangerous_patterns:
        if pattern in url_lower:
            return ''
    
    return url

# Protección contra enumeración de usuarios
@app.route('/api/check-user/<email>')
def check_user_exists(email):
    """Endpoint para verificar si existe un usuario (protegido)."""
    try:
        # Validar email primero
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'exists': False}), 200
        
        # Rate limiting para este endpoint
        client_ip = request.remote_addr
        if not check_login_attempts(client_ip)[0]:
            return jsonify({'error': 'Demasiados intentos'}), 429
        
        conn = get_db()
        user = conn.execute('SELECT id FROM usuarios WHERE email = ?', (email,)).fetchone()
        conn.close()
        
        # Siempre retornar lo mismo para prevenir enumeración
        # Solo dar información diferente si el usuario está logueado y es admin
        if 'usuario_id' in session:
            user_id = session['usuario_id']
            conn = get_db()
            current_user = conn.execute('SELECT rol FROM usuarios WHERE id = ?', (user_id,)).fetchone()
            conn.close()
            
            if current_user and current_user['rol'] == 'admin':
                return jsonify({'exists': user is not None})
        
        # Para usuarios normales, respuesta genérica
        return jsonify({'exists': False})
        
    except Exception as e:
        logger.error(f"Error verificando usuario: {e}")
        return jsonify({'exists': False}), 200

# ── Sistema de Respuestas a Reseñas ───────────────────────────────────────────────

@app.route('/api/resenas/<int:resena_id>/responder', methods=['POST'])
@login_required
def responder_resena(resena_id):
    """Permite responder a una reseña de producto."""
    if 'usuario_id' not in session:
        return jsonify({'error': 'Debes iniciar sesión'}), 401
    
    try:
        data = request.get_json()
        comentario = data.get('comentario', '').strip()
        
        if not comentario:
            return jsonify({'error': 'El comentario no puede estar vacío'}), 400
        
        conn = get_db()
        usuario_id = session['usuario_id']
        
        # Verificar que la reseña existe
        resena = conn.execute(
            'SELECT * FROM resenas WHERE id = ?',
            (resena_id,)
        ).fetchone()
        
        if not resena:
            return jsonify({'error': 'Reseña no encontrada'}), 404
        
        # Verificar que el usuario es el vendedor del producto
        producto = conn.execute(
            'SELECT * FROM productos WHERE id = ?',
            (resena['producto_id'],)
        ).fetchone()
        
        if not producto or producto['usuario_id'] != usuario_id:
            return jsonify({'error': 'Solo el vendedor puede responder reseñas'}), 403
        
        # Crear respuesta
        conn.execute(
            'INSERT INTO resena_respuestas (resena_id, usuario_id, comentario) VALUES (?, ?, ?)',
            (resena_id, usuario_id, comentario)
        )
        conn.commit()
        
        # Crear notificación al autor de la reseña
        if resena['usuario_id']:
            conn.execute(
                'INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)',
                (resena['usuario_id'], 
                 'Respuesta a tu reseña', 
                 f'El vendedor respondió a tu reseña de "{producto["nombre"]}"',
                 'info')
            )
            conn.commit()
        
        return jsonify({'success': True, 'mensaje': 'Respuesta enviada exitosamente'})
    except Exception as e:
        logger.error(f"Error respondiendo reseña: {e}")
        conn.rollback()
        return jsonify({'error': 'Error al responder reseña'}), 500
    finally:
        conn.close()

@app.route('/api/resenas/<int:resena_id>/respuestas', methods=['GET'])
def obtener_respuestas_resena(resena_id):
    """Obtiene todas las respuestas a una reseña."""
    try:
        conn = get_db()
        
        respuestas = [dict(row) for row in conn.execute(
            '''SELECT rr.*, u.nombre as usuario_nombre, u.avatar 
               FROM resena_respuestas rr 
               JOIN usuarios u ON rr.usuario_id = u.id 
               WHERE rr.resena_id = ? 
               ORDER BY rr.created_at ASC''',
            (resena_id,)
        ).fetchall()]
        
        return jsonify({'respuestas': respuestas})
    except Exception as e:
        logger.error(f"Error obteniendo respuestas de reseña: {e}")
        return jsonify({'error': 'Error al obtener respuestas'}), 500
    finally:
        conn.close()

# ── API Preguntas y Respuestas (Q&A de productos) ────────────────────────────

def _pregunta_json(row, conn):
    """Serializa una pregunta con datos de usuario/vendedor."""
    u = conn.execute('SELECT nombre, avatar FROM usuarios WHERE id = ?', (row['usuario_id'],)).fetchone()
    d = dict(row)
    d['usuario'] = {'nombre': u['nombre'] if u else 'Usuario', 'avatar': (u['avatar'] if u else None) or None}
    d['vendedor'] = None
    if row['respuesta']:
        p = conn.execute('SELECT p.usuario_id, u.nombre, u.avatar FROM preguntas pr JOIN productos p ON pr.producto_id = p.id JOIN usuarios u ON p.usuario_id = u.id WHERE pr.id = ?', (row['id'],)).fetchone()
        d['vendedor'] = {'nombre': p['nombre'] if p else 'Vendedor', 'avatar': (p['avatar'] if p else None) or None}
    d['fechaPregunta'] = row['created_at']
    d['fechaRespuesta'] = row['fecha_respuesta']
    d['esVendedor'] = False
    return d

@app.route('/api/productos/<int:producto_id>/preguntas', methods=['GET'])
def api_preguntas_producto(producto_id):
    """Lista preguntas de un producto."""
    conn = get_db()
    try:
        offset = request.args.get('offset', 0, type=int)
        rows = conn.execute(
            'SELECT * FROM preguntas WHERE producto_id = ? ORDER BY created_at DESC LIMIT 20 OFFSET ?',
            (producto_id, offset)
        ).fetchall()
        return jsonify({'preguntas': [_pregunta_json(r, conn) for r in rows]})
    finally:
        conn.close()

@app.route('/api/productos/<int:producto_id>/preguntas', methods=['POST'])
@login_required
def api_crear_pregunta(producto_id):
    """Crea una pregunta en un producto."""
    data = request.get_json() or {}
    pregunta = sanitize_string(data.get('pregunta', ''))[:500]
    if len(pregunta) < 10:
        return jsonify({'error': 'La pregunta debe tener al menos 10 caracteres'}), 400

    conn = get_db()
    try:
        cur = conn.execute(
            'INSERT INTO preguntas (producto_id, usuario_id, pregunta) VALUES (?,?,?)',
            (producto_id, session['usuario_id'], pregunta)
        )
        conn.commit()
        row = conn.execute('SELECT * FROM preguntas WHERE id = ?', (cur.lastrowid,)).fetchone()
        return jsonify({'pregunta': _pregunta_json(row, conn)}), 201
    finally:
        conn.close()

@app.route('/api/preguntas/<int:pregunta_id>/responder', methods=['POST'])
@login_required
def api_responder_pregunta(pregunta_id):
    """El vendedor del producto responde una pregunta."""
    data = request.get_json() or {}
    respuesta = sanitize_string(data.get('respuesta', ''))[:1000]
    if not respuesta:
        return jsonify({'error': 'Respuesta vacía'}), 400

    conn = get_db()
    try:
        pr = conn.execute('SELECT pr.*, p.usuario_id AS vendedor_id FROM preguntas pr JOIN productos p ON pr.producto_id = p.id WHERE pr.id = ?', (pregunta_id,)).fetchone()
        if not pr:
            return jsonify({'error': 'Pregunta no encontrada'}), 404
        if pr['vendedor_id'] != session['usuario_id']:
            return jsonify({'error': 'Solo el vendedor puede responder'}), 403
        conn.execute(
            "UPDATE preguntas SET respuesta = ?, fecha_respuesta = datetime('now') WHERE id = ?",
            (respuesta, pregunta_id)
        )
        conn.commit()
        row = conn.execute('SELECT * FROM preguntas WHERE id = ?', (pregunta_id,)).fetchone()
        return jsonify({'respuesta': row['respuesta']})
    finally:
        conn.close()

@app.route('/api/preguntas/<int:pregunta_id>/helpful', methods=['POST'])
def api_pregunta_helpful(pregunta_id):
    """Marca una pregunta como útil."""
    conn = get_db()
    try:
        conn.execute('UPDATE preguntas SET helpful = helpful + 1 WHERE id = ?', (pregunta_id,))
        conn.commit()
        row = conn.execute('SELECT helpful FROM preguntas WHERE id = ?', (pregunta_id,)).fetchone()
        return jsonify({'helpful': row['helpful'] if row else 0})
    finally:
        conn.close()

@app.route('/api/producto/<int:producto_id>/reportar', methods=['POST'])
@login_required
def api_reportar_producto(producto_id):
    """Reporta un producto sospechoso."""
    data = request.get_json(silent=True) or request.form
    motivo = (data.get('motivo') or '').strip()[:300]
    if not motivo:
        return jsonify({'error': 'Describe el motivo del reporte'}), 400
    conn = get_db()
    prod = conn.execute('SELECT id FROM productos WHERE id = ?', (producto_id,)).fetchone()
    if not prod:
        conn.close()
        return jsonify({'error': 'Producto no encontrado'}), 404
    ya = conn.execute(
        'SELECT id FROM reportes WHERE producto_id = ? AND usuario_id = ?',
        (producto_id, session['usuario_id'])
    ).fetchone()
    if ya:
        conn.close()
        return jsonify({'error': 'Ya reportaste este producto'}), 400
    conn.execute(
        'INSERT INTO reportes (producto_id, usuario_id, motivo) VALUES (?,?,?)',
        (producto_id, session['usuario_id'], motivo)
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# ── Mensajería privada comprador ↔ vendedor ─────────────────────────────────────

@app.route('/mensajes')
@login_required
def mensajes_view():
    """Bandeja de entrada: conversaciones agrupadas por usuario + producto."""
    uid = session['usuario_id']
    conn = get_db()
    hilos = conn.execute('''
        SELECT
            CASE WHEN m.de_id = ? THEN m.para_id ELSE m.de_id END AS otro_id,
            u.nombre AS otro_nombre,
            u.avatar_color AS otro_color,
            m.producto_id,
            p.nombre AS producto_nombre,
            MAX(m.created_at) AS ultimo,
            COUNT(*) AS total,
            SUM(CASE WHEN m.para_id = ? AND m.leido = 0 THEN 1 ELSE 0 END) AS no_leidos
        FROM mensajes m
        JOIN usuarios u ON u.id = CASE WHEN m.de_id = ? THEN m.para_id ELSE m.de_id END
        LEFT JOIN productos p ON p.id = m.producto_id
        WHERE m.de_id = ? OR m.para_id = ?
        GROUP BY otro_id, m.producto_id
        ORDER BY ultimo DESC
    ''', (uid, uid, uid, uid, uid)).fetchall()
    conn.close()
    return render_template('mensajes.html', hilos=[dict(h) for h in hilos])


@app.route('/api/mensajes', methods=['POST'])
@login_required
def api_mensaje_enviar():
    """Envía un mensaje privado (opcionalmente asociado a un producto)."""
    data = request.get_json(silent=True) or request.form
    para_id = int(data.get('para_id') or 0)
    producto_id = data.get('producto_id') or None
    texto = (data.get('mensaje') or '').strip()
    uid = session['usuario_id']

    if para_id == uid:
        return jsonify({'error': 'No puedes escribirte a ti mismo'}), 400
    if not texto or len(texto) > 1000:
        return jsonify({'error': 'Mensaje vacío o demasiado largo'}), 400

    conn = get_db()
    destinatario = conn.execute('SELECT id, nombre FROM usuarios WHERE id = ?', (para_id,)).fetchone()
    if not destinatario:
        conn.close()
        return jsonify({'error': 'Destinatario no encontrado'}), 404
    if producto_id:
        prod = conn.execute('SELECT nombre, usuario_id FROM productos WHERE id = ?', (producto_id,)).fetchone()
        if not prod:
            conn.close()
            return jsonify({'error': 'Producto no encontrado'}), 404
        # Solo se permite escribir al dueño del producto (o hilo ya existente)
        if prod['usuario_id'] and prod['usuario_id'] != para_id:
            conn.close()
            return jsonify({'error': 'Destinatario incorrecto'}), 400
    conn.execute(
        'INSERT INTO mensajes (producto_id, de_id, para_id, mensaje) VALUES (?,?,?,?)',
        (producto_id, uid, para_id, texto)
    )
    conn.commit()
    conn.close()

    nombre_prod = ''
    if producto_id:
        conn = get_db()
        p = conn.execute('SELECT nombre FROM productos WHERE id = ?', (producto_id,)).fetchone()
        nombre_prod = p['nombre'] if p else ''
        conn.close()
    add_notificacion(
        para_id,
        '💬 Nuevo mensaje',
        f'{session["nombre"]} te escribió' + (f' sobre "{nombre_prod}"' if nombre_prod else '') + '.',
        'info'
    )
    return jsonify({'success': True})


@app.route('/api/mensajes/hilo')
@login_required
def api_mensajes_hilo():
    """Devuelve los mensajes de una conversación y los marca como leídos."""
    otro_id = int(request.args.get('con', 0))
    producto_id = request.args.get('producto')
    uid = session['usuario_id']
    if not otro_id or otro_id == uid:
        return jsonify({'error': 'Conversación inválida'}), 400
    conn = get_db()
    query = '''
        SELECT m.id, m.mensaje, m.created_at, m.de_id, u.nombre AS de_nombre
        FROM mensajes m JOIN usuarios u ON u.id = m.de_id
        WHERE ((m.de_id = ? AND m.para_id = ?) OR (m.de_id = ? AND m.para_id = ?))
    '''
    params = [uid, otro_id, otro_id, uid]
    if producto_id:
        query += ' AND m.producto_id = ?'
        params.append(int(producto_id))
    else:
        query += ' AND m.producto_id IS NULL'
    query += ' ORDER BY m.created_at ASC LIMIT 200'
    rows = conn.execute(query, params).fetchall()
    # marcar como leídos los recibidos
    conn.execute(
        'UPDATE mensajes SET leido = 1 WHERE para_id = ? AND de_id = ? AND leido = 0',
        (uid, otro_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'mensajes': [dict(r) for r in rows]})


# ── Sistema de Recomendaciones ────────────────────────────────────────────────────

@app.route('/api/recomendaciones', methods=['GET'])
@login_required
def api_recomendaciones():
    """Genera recomendaciones de productos basadas en el historial del usuario."""
    if 'usuario_id' not in session:
        return jsonify({'error': 'Debes iniciar sesión'}), 401
    
    try:
        conn = get_db()
        usuario_id = session['usuario_id']
        
        # Obtener categorías que el usuario ha visto o comprado
        categorias_vistas = [r['categoria'] for r in conn.execute(
            'SELECT DISTINCT categoria FROM productos p '
            'JOIN visitas v ON v.pagina = "producto_detalle" '
            'WHERE v.usuario_id = ?',
            (usuario_id,)
        ).fetchall()]
        
        categorias_compradas = [r['categoria'] for r in conn.execute(
            'SELECT DISTINCT p.categoria FROM pedido_items pi '
            'JOIN pedidos ped ON pi.pedido_id = ped.id '
            'JOIN productos p ON pi.producto_id = p.id '
            'WHERE ped.usuario_id = ?',
            (usuario_id,)
        ).fetchall()]
        
        # Combinar categorías y dar prioridad a las compradas
        categorias_prioritarias = list(set(categorias_compradas + categorias_vistas))
        
        # Obtener productos de esas categorías que el usuario no ha visto
        productos_vistos = [r['producto_id'] for r in conn.execute(
            'SELECT DISTINCT producto_id FROM visitas WHERE usuario_id = ? AND pagina = "producto_detalle"',
            (usuario_id,)
        ).fetchall()]
        
        if categorias_prioritarias:
            placeholders = ','.join(['?'] * len(categorias_prioritarias))
            if productos_vistos:
                productos_vistos_str = ','.join(['?'] * len(productos_vistos))
                query = f'''
                    SELECT p.*, u.nombre as vendedor_nombre,
                        COALESCE(AVG(r.rating), 0) as rating_promedio,
                        COUNT(DISTINCT r.id) as total_resenas
                    FROM productos p
                    LEFT JOIN usuarios u ON p.usuario_id = u.id
                    LEFT JOIN resenas r ON p.id = r.producto_id
                    WHERE p.categoria IN ({placeholders})
                    AND p.stock > 0
                    AND p.id NOT IN ({productos_vistos_str})
                    GROUP BY p.id
                    ORDER BY rating_promedio DESC, p.vistas DESC
                    LIMIT 8
                '''
                params = categorias_prioritarias + productos_vistos
            else:
                query = f'''
                    SELECT p.*, u.nombre as vendedor_nombre,
                        COALESCE(AVG(r.rating), 0) as rating_promedio,
                        COUNT(DISTINCT r.id) as total_resenas
                    FROM productos p
                    LEFT JOIN usuarios u ON p.usuario_id = u.id
                    LEFT JOIN resenas r ON p.id = r.producto_id
                    WHERE p.categoria IN ({placeholders})
                    AND p.stock > 0
                    GROUP BY p.id
                    ORDER BY rating_promedio DESC, p.vistas DESC
                    LIMIT 8
                '''
                params = categorias_prioritarias
        else:
            # Si no hay historial, recomendar productos populares
            query = '''
                SELECT p.*, u.nombre as vendedor_nombre,
                    COALESCE(AVG(r.rating), 0) as rating_promedio,
                    COUNT(DISTINCT r.id) as total_resenas
                FROM productos p
                LEFT JOIN usuarios u ON p.usuario_id = u.id
                LEFT JOIN resenas r ON p.id = r.producto_id
                WHERE p.stock > 0
                GROUP BY p.id
                ORDER BY p.vistas DESC, rating_promedio DESC
                LIMIT 8
            '''
            params = []
        
        recomendaciones = [dict(row) for row in conn.execute(query, params).fetchall()]
        
        return jsonify({'recomendaciones': recomendaciones})
    except Exception as e:
        logger.error(f"Error generando recomendaciones: {e}")
        conn.rollback()
        return jsonify({'error': 'Error al generar recomendaciones'}), 500
    finally:
        conn.close()


# ── Admin ─────────────────────────────────────────────────────────────────────

@app.route('/admin/backup')
@login_required
@admin_required
def admin_backup():
    """Crea una copia de seguridad de la base de datos y la descarga."""
    try:
        backup_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backups')
        os.makedirs(backup_dir, exist_ok=True)
        nombre = f"ecomarket_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
        ruta = os.path.join(backup_dir, nombre)
        src = sqlite3.connect(DB_PATH)
        dst = sqlite3.connect(ruta)
        src.backup(dst)
        dst.close()
        src.close()
        logger.info(f"Backup creado: {ruta}")
        return send_file(ruta, as_attachment=True, download_name=nombre)
    except Exception as e:
        logger.error(f"Error en backup: {e}")
        flash('Error al crear la copia de seguridad', 'danger')
        return redirect(url_for('admin'))


@app.route('/admin')
@login_required
@admin_required
def admin():
    conn = get_db()
    productos = conn.execute('''
        SELECT p.*, u.nombre as vendedor_nombre,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas
        FROM productos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN resenas r ON p.id = r.producto_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ''').fetchall()

    usuarios = conn.execute('SELECT * FROM usuarios ORDER BY id DESC').fetchall()

    reportes = conn.execute('''
        SELECT r.*, p.nombre AS producto_nombre, u.nombre AS reportante
        FROM reportes r
        JOIN productos p ON p.id = r.producto_id
        JOIN usuarios u ON u.id = r.usuario_id
        WHERE r.estado = 'pendiente'
        ORDER BY r.created_at DESC
        LIMIT 50
    ''').fetchall()

    stats = {
        'total_productos': conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0],
        'total_usuarios': conn.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0],
        'total_resenas': conn.execute('SELECT COUNT(*) FROM resenas').fetchone()[0],
        'total_pedidos': conn.execute('SELECT COUNT(*) FROM pedidos').fetchone()[0],
        'total_visitas': conn.execute('SELECT COUNT(*) FROM visitas').fetchone()[0],
    }
    # Engagement (analytics persistente)
    try:
        stats['eventos_hoy'] = conn.execute(
            "SELECT COUNT(*) FROM analytics_eventos WHERE date(created_at)=date('now','localtime')").fetchone()[0]
        stats['scroll_promedio'] = conn.execute(
            "SELECT AVG(CAST(json_extract(propiedades,'$.depth') AS INTEGER)) FROM analytics_eventos WHERE evento='scroll_depth'").fetchone()[0] or 0
        stats['tiempo_promedio'] = conn.execute(
            "SELECT AVG(CAST(json_extract(propiedades,'$.seconds') AS INTEGER)) FROM analytics_eventos WHERE evento='time_on_page'").fetchone()[0] or 0
        stats['busquedas_hoy'] = conn.execute(
            "SELECT COUNT(*) FROM analytics_eventos WHERE evento='search' AND date(created_at)=date('now','localtime')").fetchone()[0]
        top_paginas = conn.execute(
            "SELECT json_extract(propiedades,'$.path') AS path, COUNT(*) AS n FROM analytics_eventos WHERE evento='page_view' GROUP BY path ORDER BY n DESC LIMIT 5").fetchall()
        stats['top_paginas'] = [dict(r) for r in top_paginas]
    except sqlite3.Error:
        stats.update({'eventos_hoy': 0, 'scroll_promedio': 0, 'tiempo_promedio': 0, 'busquedas_hoy': 0, 'top_paginas': []})
    conn.close()
    return render_template('admin.html', productos=productos, usuarios=usuarios, stats=stats,
                           reportes=[dict(r) for r in reportes])


@app.route('/admin/reporte/<int:reporte_id>/resolver', methods=['POST'])
@login_required
@admin_required
def resolver_reporte(reporte_id):
    conn = get_db()
    conn.execute("UPDATE reportes SET estado = 'resuelto' WHERE id = ?", (reporte_id,))
    conn.commit()
    conn.close()
    flash('Reporte marcado como resuelto', 'success')
    return redirect(url_for('admin'))


@app.route('/admin/eliminar/<int:producto_id>', methods=['POST'])
@login_required
@admin_required
def eliminar_producto_admin(producto_id):
    conn = get_db()
    conn.execute('DELETE FROM productos WHERE id = ?', (producto_id,))
    conn.commit()
    conn.close()
    flash_t('producto_eliminado', 'success')
    return redirect(url_for('admin'))


@app.route('/admin/usuario/<int:usuario_id>/eliminar', methods=['POST'])
@login_required
@admin_required
def eliminar_usuario_admin(usuario_id):
    conn = get_db()
    fila = conn.execute('SELECT rol FROM usuarios WHERE id = ?', (usuario_id,)).fetchone()
    if fila and fila['rol'] == 'admin':
        conn.close()
        flash('No se puede eliminar a un administrador.', 'danger')
        return redirect(url_for('admin'))
    conn.execute('DELETE FROM usuarios WHERE id = ? AND rol != "admin"', (usuario_id,))
    conn.commit()
    conn.close()
    flash_t('usuario_eliminado', 'success')
    return redirect(url_for('admin'))


@app.route('/admin/pedido/<int:pedido_id>/estado', methods=['POST'])
@login_required
@admin_required
def cambiar_estado_pedido(pedido_id):
    estados_validos = ('pendiente', 'confirmado', 'pagado', 'enviado', 'entregado', 'cancelado')
    estado = request.form.get('estado', '').strip().lower()
    if estado not in estados_validos:
        flash('Estado de pedido inválido.', 'danger')
        return redirect(url_for('admin'))
    conn = get_db()
    pedido = conn.execute('SELECT * FROM pedidos WHERE id = ?', (pedido_id,)).fetchone()
    if not pedido:
        conn.close()
        flash('Pedido no encontrado.', 'danger')
        return redirect(url_for('admin'))
    conn.execute('UPDATE pedidos SET estado = ? WHERE id = ?', (estado, pedido_id))
    conn.commit()
    if pedido['usuario_id']:
        add_notificacion(pedido['usuario_id'], '📦 Actualización de pedido',
                         f'Tu pedido #{pedido_id} ahora está: {estado.capitalize()}.', 'info')
    conn.close()
    flash(f'Pedido #{pedido_id} actualizado a "{estado}".', 'success')
    return redirect(url_for('admin'))


# ── API Exportar ─────────────────────────────────────────────────────────────

@app.route('/api/exportar/productos')
@login_required
def exportar_productos():
    conn = get_db()
    productos = conn.execute('''
        SELECT p.*, u.nombre as vendedor
        FROM productos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        ORDER BY p.id
    ''').fetchall()
    conn.close()
    return jsonify([dict(p) for p in productos])


# ── Static files ─────────────────────────────────────────────────────────────

@app.route('/static/manifest.json')
def manifest():
    return jsonify({
        "name": "EcoMarket",
        "short_name": "EcoMarket",
        "description": "Marketplace ecológico",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#2e7d32",
        "theme_color": "#2e7d32",
        "icons": [{"src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌱</text></svg>", "sizes": "192x192", "type": "image/svg+xml"}]
    })


# ── Healthcheck & deploy readiness ────────────────────────────────────────

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'ok',
        'app': 'EcoMarket',
        'environment': 'production' if os.environ.get('FLASK_ENV') == 'production' else 'development'
    })


# ── API Rutas para Sistemas Adicionales ───────────────────────────────────────────────

@app.route('/api/quality/validar', methods=['POST'])
@login_required
def api_validar_producto():
    """Valida un producto antes de publicar"""
    if not quality_control:
        return jsonify({'error': 'Sistema no disponible'}), 503
    
    data = request.get_json()
    validacion = quality_control.validar_producto(data)
    return jsonify(validacion)

@app.route('/api/inventario/actualizar', methods=['POST'])
@login_required
def api_actualizar_inventario():
    """Actualiza el stock de un producto"""
    if not inventory_system:
        return jsonify({'error': 'Sistema no disponible'}), 503
    
    data = request.get_json()
    stock = inventory_system.actualizar_stock(data['producto_id'], data['cantidad'])
    return jsonify({'stock': stock})

@app.route('/api/inventario/dashboard')
@login_required
@admin_required
def api_inventario_dashboard():
    """Estadísticas de inventario desde la base de datos real"""
    conn = get_db()
    try:
        total = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
        bajo = conn.execute('SELECT COUNT(*) FROM productos WHERE stock > 0 AND stock < 5').fetchone()[0]
        sin = conn.execute('SELECT COUNT(*) FROM productos WHERE stock <= 0').fetchone()[0]
        alertas = conn.execute('''
            SELECT id, nombre, stock, categoria FROM productos
            WHERE stock <= 5 ORDER BY stock ASC LIMIT 20
        ''').fetchall()
        return jsonify({
            'total_productos': total,
            'stock_bajo': bajo,
            'sin_stock': sin,
            'alertas': [dict(a) for a in alertas]
        })
    finally:
        conn.close()

@app.route('/api/geolocalizacion/registrar', methods=['POST'])
@login_required
def api_registrar_ubicacion():
    """Registra la ubicación de un usuario"""
    if not geolocation_system:
        return jsonify({'error': 'Sistema no disponible'}), 503
    
    data = request.get_json()
    ubicacion = geolocation_system.registrar_ubicacion(
        session['usuario_id'],
        data['latitud'],
        data['longitud'],
        data['direccion']
    )
    return jsonify(ubicacion)

@app.route('/api/geolocalizacion/vendedores-cercanos')
@login_required
def api_vendedores_cercanos():
    """Busca vendedores cercanos"""
    if not geolocation_system:
        return jsonify({'error': 'Sistema no disponible'}), 503
    
    radio = request.args.get('radio', 10, type=int)
    cercanos = geolocation_system.buscar_vendedores_cercanos(session['usuario_id'], radio)
    return jsonify({'vendedores': cercanos})

@app.route('/api/ai/generar-descripcion', methods=['POST'])
@login_required
def api_generar_descripcion():
    """Genera descripción con AI"""
    if not ai_generator:
        return jsonify({'error': 'Sistema no disponible'}), 503
    
    data = request.get_json()
    descripcion = ai_generator.generar_descripcion(data)
    return jsonify({'descripcion': descripcion})

@app.route('/api/soporte/ticket', methods=['POST'])
@login_required
def api_crear_ticket():
    """Crea un ticket de soporte"""
    if not support_system:
        return jsonify({'error': 'Sistema no disponible'}), 503
    
    data = request.get_json()
    ticket = support_system.crear_ticket(
        session['usuario_id'],
        data['asunto'],
        data['descripcion'],
        data.get('prioridad', 'media')
    )
    return jsonify(ticket)

@app.route('/api/soporte/tickets')
@login_required
def api_obtener_tickets():
    """Obtiene tickets del usuario"""
    if not support_system:
        return jsonify({'error': 'Sistema no disponible'}), 503
    
    tickets = support_system.obtener_tickets_usuario(session['usuario_id'])
    return jsonify({'tickets': tickets})

@app.route('/api/newsletter/suscribir', methods=['POST'])
def api_suscribir_newsletter():
    """Suscribe al newsletter (SQLite)."""
    data = request.get_json(silent=True) or {}
    email = sanitize_string(data.get('email', ''), max_length=120).strip().lower()
    nombre = sanitize_string(data.get('nombre', ''), max_length=80).strip()
    if not is_valid_email(email):
        return jsonify({'error': 'Email inválido'}), 400
    prefs = json.dumps([str(p)[:40] for p in (data.get('preferencias') or [])][:10])
    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO suscriptores (email, nombre, preferencias) VALUES (?,?,?) '
            'ON CONFLICT(email) DO UPDATE SET nombre=excluded.nombre, activo=1',
            (email, nombre, prefs))
        conn.commit()
    except sqlite3.Error:
        conn.rollback()
        conn.close()
        return jsonify({'error': 'No se pudo guardar la suscripción'}), 500
    conn.close()
    return jsonify({'success': True, 'email': email}), 201


@app.route('/api/newsletter/desuscribir', methods=['POST'])
def api_desuscribir_newsletter():
    """Desuscribe del newsletter."""
    data = request.get_json(silent=True) or {}
    email = sanitize_string(data.get('email', ''), max_length=120).strip().lower()
    conn = get_db()
    cur = conn.execute('UPDATE suscriptores SET activo=0 WHERE email=?', (email,))
    conn.commit()
    conn.close()
    return jsonify({'success': cur.rowcount > 0})


@app.route('/api/destacado')
def api_destacado():
    """Producto destacado del día (determinista por fecha)."""
    conn = get_db()
    total = conn.execute(
        "SELECT COUNT(*) FROM productos WHERE COALESCE(vendido,0)=0").fetchone()[0]
    if not total:
        conn.close()
        return jsonify({'producto': None})
    import random as _r
    dia = datetime.now().timetuple().tm_yday
    idx = (dia * 7 + total) % total
    row = conn.execute('''
        SELECT p.id, p.nombre, p.precio, p.precio_original, p.imagen, p.categoria, p.eco_score,
               COALESCE(AVG(r.rating),0) AS rating_promedio
        FROM productos p LEFT JOIN resenas r ON r.producto_id = p.id
        WHERE COALESCE(p.vendido,0)=0
        GROUP BY p.id ORDER BY p.id LIMIT 1 OFFSET ?''', (idx,)).fetchone()
    conn.close()
    return jsonify({'producto': dict(row) if row else None})


# ── Wishlist compartible ───────────────────────────────────────────

@app.route('/api/wishlist/compartir', methods=['POST'])
@login_required
def api_wishlist_compartir():
    """Genera (o reutiliza) un link público de la wishlist del usuario."""
    uid = session['usuario_id']
    conn = get_db()
    row = conn.execute('SELECT token FROM wishlist_share WHERE usuario_id=?', (uid,)).fetchone()
    if row:
        conn.close()
        return jsonify({'token': row['token'], 'url': url_for('wishlist_publica', token=row['token'], _external=True)})
    token = secrets.token_urlsafe(10)
    conn.execute('INSERT INTO wishlist_share (token, usuario_id) VALUES (?,?)', (token, uid))
    conn.commit()
    conn.close()
    return jsonify({'token': token, 'url': url_for('wishlist_publica', token=token, _external=True)})


@app.route('/w/<token>')
def wishlist_publica(token):
    """Página pública con los favoritos de un usuario."""
    conn = get_db()
    share = conn.execute('SELECT usuario_id FROM wishlist_share WHERE token=?', (token,)).fetchone()
    if not share:
        conn.close()
        flash('Este link de wishlist no existe o fue revocado.', 'warning')
        return redirect(url_for('index'))
    uid = share['usuario_id']
    dueno = conn.execute('SELECT nombre FROM usuarios WHERE id=?', (uid,)).fetchone()
    items = conn.execute('''
        SELECT p.id, p.nombre, p.precio, p.precio_original, p.imagen, p.categoria, p.eco_score,
               COALESCE(p.vendido,0) AS vendido
        FROM favoritos f JOIN productos p ON p.id = f.producto_id
        WHERE f.usuario_id=? AND COALESCE(p.vendido,0)=0
        ORDER BY f.created_at DESC LIMIT 60''', (uid,)).fetchall()
    conn.close()
    return render_template('wishlist_publica.html',
                           dueno=(dueno['nombre'] if dueno else 'Un usuario'),
                           items=[dict(r) for r in items])


# ── Avisos de reposición de stock ──────────────────────────────────

@app.route('/api/avisar-stock/<int:producto_id>', methods=['POST'])
@login_required
def api_avisar_stock(producto_id):
    """Toggle: pide o cancela aviso cuando el producto vuelva a tener stock."""
    uid = session['usuario_id']
    conn = get_db()
    p = conn.execute('SELECT stock, nombre FROM productos WHERE id=?', (producto_id,)).fetchone()
    if not p:
        conn.close()
        return jsonify({'error': 'Producto no encontrado'}), 404
    if p['stock'] > 0:
        conn.close()
        return jsonify({'error': 'El producto ya tiene stock', 'activo': False}), 400
    existente = conn.execute(
        'SELECT id FROM avisos_stock WHERE usuario_id=? AND producto_id=?', (uid, producto_id)).fetchone()
    if existente:
        conn.execute('DELETE FROM avisos_stock WHERE id=?', (existente['id'],))
        conn.commit()
        conn.close()
        return jsonify({'activo': False})
    conn.execute('INSERT INTO avisos_stock (usuario_id, producto_id) VALUES (?,?)', (uid, producto_id))
    conn.commit()
    conn.close()
    return jsonify({'activo': True})


# ── Rastreo público de pedido ──────────────────────────────────────

@app.route('/rastrear/<token>')
def rastrear_pedido(token):
    """Seguimiento público del pedido (sin login, solo con el token)."""
    conn = get_db()
    p = conn.execute('''
        SELECT id, nombre, estado, total, created_at, metodo_pago, ciudad
        FROM pedidos WHERE token_rastreo = ?''', (token,)).fetchone()
    if not p:
        conn.close()
        flash('Pedido no encontrado. Verifica el link.', 'warning')
        return redirect(url_for('index'))
    items = conn.execute('SELECT nombre, cantidad, precio FROM pedido_items WHERE pedido_id=?',
                         (p['id'],)).fetchall()
    conn.close()
    return render_template('rastrear.html', pedido=dict(p), items=[dict(i) for i in items])


# ── Carrito compartible (compra en grupo) ──────────────────────────

@app.route('/grupo/<ids>')
def grupo_compra(ids):
    """Link compartible: /grupo/1,5,9 — muestra productos y permite agregarlos todos."""
    try:
        id_list = [int(x) for x in ids.split(',') if x.strip().isdigit()][:12]
    except ValueError:
        id_list = []
    if not id_list:
        flash('Selección inválida.', 'warning')
        return redirect(url_for('index'))
    conn = get_db()
    placeholders = ','.join('?' * len(id_list))
    items = conn.execute(f'''
        SELECT p.id, p.nombre, p.precio, p.precio_original, p.imagen, p.categoria,
               p.stock, COALESCE(p.vendido,0) AS vendido
        FROM productos p WHERE p.id IN ({placeholders}) AND COALESCE(p.vendido,0)=0''',
        id_list).fetchall()
    orden = {pid: i for i, pid in enumerate(id_list)}
    items = sorted((dict(r) for r in items), key=lambda r: orden.get(r['id'], 999))
    conn.close()
    if not items:
        flash('Esos productos ya no están disponibles.', 'warning')
        return redirect(url_for('index'))
    return render_template('grupo.html', items=items, ids=ids)

# ── Rutas para Templates de Nuevas Funcionalidades ───────────────────────────────

@app.route('/api/verificacion/estado')
@login_required
def api_verificacion_estado():
    """Nivel de verificación real del vendedor según su actividad."""
    uid = session['usuario_id']
    conn = get_db()
    u = conn.execute('''SELECT email_verificado, telefono,
        (SELECT COUNT(*) FROM productos WHERE usuario_id=?) AS publicados,
        (SELECT COUNT(*) FROM productos WHERE usuario_id=? AND vendido=1) AS ventas
        FROM usuarios WHERE id=?''', (uid, uid, uid)).fetchone()
    rating = conn.execute('''SELECT COALESCE(AVG(r.rating),0) FROM resenas r
        JOIN productos p ON p.id=r.producto_id WHERE p.usuario_id=?''', (uid,)).fetchone()[0]
    conn.close()
    if not u:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    checks = {
        'email': bool(u['email_verificado']),
        'telefono': bool(u['telefono']),
        'publicaciones': u['publicados'] >= 3,
        'ventas': u['ventas'] >= 10,
        'top': u['ventas'] >= 25 and rating >= 4.5,
    }
    if checks['top']: nivel = 5; nombre = 'Top Seller'
    elif checks['ventas']: nivel = 4; nombre = 'Premium'
    elif checks['publicaciones'] and checks['telefono']: nivel = 3; nombre = 'Verificado'
    elif checks['email'] and checks['telefono']: nivel = 2; nombre = 'Confirmado'
    elif checks['email']: nivel = 1; nombre = 'Básico'
    else: nivel = 0; nombre = 'Sin verificar'
    return jsonify({'nivel': nivel, 'nombre': nombre, 'checks': checks,
                    'stats': {'publicados': u['publicados'], 'ventas': u['ventas'],
                              'rating': round(rating, 1), 'telefono': bool(u['telefono']),
                              'email_verificado': bool(u['email_verificado'])}})


@app.route('/verificacion')
@login_required
def verificacion_vendedor():
    """Página de verificación de vendedor"""
    return render_template('verificacion_vendedor.html')

@app.route('/soporte')
@login_required
def soporte_cliente():
    """Página de soporte al cliente"""
    return render_template('soporte.html')

@app.route('/guia-vendedor')
def guia_vendedor():
    """Guía práctica para vender mejor en EcoMarket."""
    return render_template('guia_vendedor.html')


@app.route('/newsletter')
def newsletter():
    """Página de newsletter"""
    return render_template('newsletter.html')

@app.route('/inventario')
@login_required
@admin_required
def inventario():
    """Página de gestión de inventario"""
    return render_template('inventario.html')

@app.route('/busqueda-avanzada')
def busqueda_avanzada():
    """Página de búsqueda avanzada"""
    return render_template('busqueda_avanzada.html')

# ── Error handlers ───────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500


# ── Inicio ────────────────────────────────────────────────────────────────────

# Inicializar la base de datos al importar el módulo
init_db()
_backup_loop()

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(debug=debug_mode, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
