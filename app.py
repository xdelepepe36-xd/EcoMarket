"""
EcoMarket - Marketplace Ecológico v3.2
Backend completo con SQLite, subida de imágenes, API REST, dashboard y más.
Optimizado con mejor manejo de errores, caching, seguridad y accesibilidad.
"""
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory
from whitenoise import WhiteNoise
import sqlite3
import os
import json
from functools import wraps
from datetime import datetime, timedelta
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

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get('DATABASE_URL', os.path.join(BASE_DIR, 'data', 'ecomarket.db'))
UPLOAD_FOLDER = os.environ.get('UPLOADS_DIR', os.path.join(BASE_DIR, 'static', 'uploads'))

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
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:;"
    
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
    return {
        'google_client_id': os.environ.get('GOOGLE_CLIENT_ID', ''),
        'SITIO_NOMBRE': 'EcoMarket',
        'ANIO_ACTUAL': datetime.now().year,
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
    return bool(EMAIL_RE.match(email or ''))


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
            if request.is_json:
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
    return render_template('index.html', productos=productos, categorias=categorias)


@app.route('/premium')
def index_premium():
    """Ruta dedicada para el diseño premium con gradientes modernos."""
    registrar_visita('premium')
    conn = get_db()
    productos = conn.execute('''
        SELECT p.*, COALESCE(AVG(r.rating), 0) as rating_promedio
        FROM productos p
        LEFT JOIN resenas r ON p.id = r.producto_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 12
    ''').fetchall()
    conn.close()
    return render_template('index-premium.html', productos=productos)


@app.route('/dashboard-premium')
@login_required
def dashboard_premium():
    """Dashboard premium con todas las funcionalidades."""
    registrar_visita('dashboard_premium')
    return render_template('dashboard-premium.html')


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
        pagina = int(request.args.get('pagina', 1))

        query = '''
            SELECT p.*, u.nombre as vendedor_nombre,
                COALESCE(AVG(r.rating), 0) as rating_promedio,
                COUNT(DISTINCT r.id) as total_resenas
            FROM productos p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            LEFT JOIN resenas r ON p.id = r.producto_id
            WHERE 1=1
        '''
        count_query = 'SELECT COUNT(*) FROM (SELECT p.id FROM productos p WHERE 1=1'
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
    if 'usuario_id' in session:
        conn = get_db()
        fav = conn.execute(
            'SELECT id FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
            (session['usuario_id'], producto_id)
        ).fetchone()
        es_favorito = fav is not None
        conn.close()

    return render_template('detalle-producto.html',
                           **data,
                           es_favorito=es_favorito,
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


@app.route('/api/favorito/<int:producto_id>', methods=['DELETE'])
@login_required
def eliminar_favorito_api(producto_id):
    conn = get_db()
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
            'INSERT INTO pedidos (usuario_id, nombre, email, direccion, total, metodo_pago, ciudad, telefono, envio, descuento) VALUES (?,?,?,?,?,?,?,?,?,?)',
            (session['usuario_id'], nombre_comp or nombre, email, direccion, total_final, metodo_pago, ciudad, telefono, envio, descuento)
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

        conn = get_db()
        cursor = conn.execute(
            'INSERT INTO productos (nombre, categoria, precio, descripcion, imagen, imagen_thumb, stock, condicion, especificaciones, usuario_id, ubicacion) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            (nombre, categoria, precio_valor, descripcion, imagen, imagen_thumb, stock_valor, condicion, especificaciones_json, session['usuario_id'], ubicacion)
        )
        producto_id = cursor.lastrowid

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
            conn.execute(
                'UPDATE productos SET nombre=?, categoria=?, precio=?, descripcion=?, stock=?, especificaciones=? WHERE id=?',
                (nombre, categoria, float(precio), descripcion, int(stock), especificaciones_json, producto_id)
            )
            conn.commit()
            flash_t('producto_actualizado', 'success')
        conn.close()
        return redirect(url_for('perfil'))

    conn.close()
    return render_template('publicar.html', producto=producto, editando=True)


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
    conn.close()
    return render_template('impacto.html',
                           total_productos=total,
                           total_categorias=categorias,
                           total_resenas=total_resenas,
                           total_usuarios=total_usuarios,
                           total_visitas=total_visitas,
                           total_pedidos=total_pedidos)


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
        descuento = cupon['descuento']

    conn.close()
    return jsonify({
        'valido': True,
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
            'tipo': r['tipo'] if r['tipo'] == '%' else 'fixed',
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
            "SELECT r.id, r.usuario_id, r.nombre, r.rating, r.comentario, r.compra_verificada, r.created_at, "
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
                'fotos': [],
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


@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if 'usuario_id' in session:
        return redirect(url_for('index'))
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


def _chat_products(conn, categoria=None, limite=4, baratos=False):
    """Obtiene productos reales de la BD (opcionalmente filtrados y baratos)."""
    if categoria:
        filas = conn.execute(
            'SELECT nombre, precio, categoria FROM productos WHERE categoria = ? ORDER BY precio ASC LIMIT ?',
            (categoria, limite)).fetchall()
    elif baratos:
        filas = conn.execute(
            'SELECT nombre, precio, categoria FROM productos ORDER BY precio ASC LIMIT ?', (limite,)).fetchall()
    else:
        filas = conn.execute(
            'SELECT nombre, precio, categoria FROM productos ORDER BY vistas DESC LIMIT ?', (limite,)).fetchall()
    return [dict(r) for r in filas]


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
        return cab + '\n' + lineas + fin

    # 3) Cupones (reales)
    if _kwhit(msg_n, ['cupon', 'coupon', 'descuento', 'discount', 'oferta', 'promo']):
        if lang == 'en':
            return ('🎫 **Active coupons:**\n• ECO10 → 10% OFF (min. S/.30)\n• ECO20 → 20% OFF (min. S/.80)\n'
                    '• ENVIOFREE → Free shipping\n• BIENVENIDO → S/.15 OFF\nUse them at the cart or checkout.')
        return ('🎫 **Cupones activos:**\n• ECO10 → 10% OFF (mín. S/.30)\n• ECO20 → 20% OFF (mín. S/.80)\n'
                '• ENVIOFREE → Envío gratis\n• BIENVENIDO → S/.15 OFF\nÚsalos en el carrito o durante el pago.')

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

    conn = get_db()
    if nombre:
        conn.execute('UPDATE usuarios SET nombre = ?, bio = ? WHERE id = ?',
                     (nombre, bio, session['usuario_id']))
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
def add_xp():
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

@app.route('/api/cupones/disponibles')
def get_available_coupons():
    """API para obtener cupones disponibles."""
    conn = get_db()
    cupones = conn.execute('''
        SELECT * FROM cupones
        WHERE activo = 1 AND usos_actuales < usos_maximos
        ORDER BY descuento DESC
    ''').fetchall()
    conn.close()
    
    return jsonify({'cupones': [dict(c) for c in cupones]})

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
    
    conn.close()
    
    return jsonify({
        'success': True,
        'cupon': dict(cupon),
        'descuento': cupon['descuento'],
        'tipo': cupon['tipo']
    })()

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

    stats = {
        'total_productos': conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0],
        'total_usuarios': conn.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0],
        'total_resenas': conn.execute('SELECT COUNT(*) FROM resenas').fetchone()[0],
        'total_pedidos': conn.execute('SELECT COUNT(*) FROM pedidos').fetchone()[0],
        'total_visitas': conn.execute('SELECT COUNT(*) FROM visitas').fetchone()[0],
    }
    conn.close()
    return render_template('admin.html', productos=productos, usuarios=usuarios, stats=stats)


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

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(debug=debug_mode, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
