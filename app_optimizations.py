"""
EcoMarket - Optimizaciones y Mejoras del Backend
Archivo complementario para mejoras de seguridad, rendimiento y funcionalidades
"""
import sqlite3
import os
import time
import hashlib
import secrets
from functools import wraps
from datetime import datetime, timedelta
from contextlib import contextmanager
import threading
import logging
from typing import Optional, Dict, List, Any

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ecomarket.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ── CACHING IMPLEMENTATION ───────────────────────────────────────────────────

class SimpleCache:
    """Sistema de caché en memoria con TTL"""
    
    def __init__(self):
        self._cache: Dict[str, tuple] = {}
        self._lock = threading.Lock()
    
    def get(self, key: str, default=None):
        with self._lock:
            if key in self._cache:
                value, expiry = self._cache[key]
                if time.time() < expiry:
                    return value
                else:
                    del self._cache[key]
        return default
    
    def set(self, key: str, value: Any, ttl: int = 300):
        with self._lock:
            self._cache[key] = (value, time.time() + ttl)
    
    def delete(self, key: str):
        with self._lock:
            self._cache.pop(key, None)
    
    def clear(self):
        with self._lock:
            self._cache.clear()

cache = SimpleCache()

# ── DATABASE CONNECTION POOL ───────────────────────────────────────────────────

class DatabasePool:
    """Pool de conexiones a base de datos para mejor rendimiento"""
    
    def __init__(self, db_path: str, pool_size: int = 5):
        self.db_path = db_path
        self.pool_size = pool_size
        self._connections: List[sqlite3.Connection] = []
        self._lock = threading.Lock()
        self._initialize_pool()
    
    def _initialize_pool(self):
        """Inicializa el pool de conexiones"""
        for _ in range(self.pool_size):
            conn = self._create_connection()
            self._connections.append(conn)
    
    def _create_connection(self) -> sqlite3.Connection:
        """Crea una nueva conexión optimizada"""
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA cache_size=-8000")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute("PRAGMA temp_store=MEMORY")
        return conn
    
    @contextmanager
    def get_connection(self):
        """Obtiene una conexión del pool (context manager)"""
        conn = None
        try:
            with self._lock:
                if self._connections:
                    conn = self._connections.pop()
                else:
                    conn = self._create_connection()
                    logger.warning("Pool exhausted, creating new connection")
            
            yield conn
            
        finally:
            if conn:
                with self._lock:
                    if len(self._connections) < self.pool_size:
                        self._connections.append(conn)
                    else:
                        conn.close()
    
    def close_all(self):
        """Cierra todas las conexiones del pool"""
        with self._lock:
            for conn in self._connections:
                conn.close()
            self._connections.clear()

# ── SECURITY ENHANCEMENTS ─────────────────────────────────────────────────────

class SecurityEnhancer:
    """Mejoras de seguridad adicionales"""
    
    @staticmethod
    def sanitize_input(text: str) -> str:
        """Sanitiza input de usuario para prevenir XSS"""
        if not text:
            return ""
        
        # Eliminar caracteres peligrosos
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00', '\n', '\r']
        for char in dangerous_chars:
            text = text.replace(char, '')
        
        # Normalizar Unicode
        text = unicodedata.normalize('NFKC', text)
        
        return text.strip()
    
    @staticmethod
    def validate_file_type(filename: str, allowed_extensions: set) -> bool:
        """Valida tipo de archivo con verificación de magic bytes"""
        if not '.' in filename:
            return False
        
        ext = filename.rsplit('.', 1)[1].lower()
        if ext not in allowed_extensions:
            return False
        
        # Verificar magic bytes (implementación básica)
        magic_bytes = {
            'png': b'\x89PNG',
            'jpg': b'\xff\xd8\xff',
            'jpeg': b'\xff\xd8\xff',
            'gif': b'GIF',
            'webp': b'RIFF'
        }
        
        try:
            with open(filename, 'rb') as f:
                header = f.read(4)
                return header.startswith(magic_bytes.get(ext, b''))
        except:
            return False
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Genera un token criptográficamente seguro"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash de contraseña con salt"""
        salt = secrets.token_hex(16)
        hash_value = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return f"{salt}${hash_value}"
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verifica contraseña contra hash"""
        try:
            salt, hash_value = hashed_password.split('$')
            computed_hash = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                salt.encode('utf-8'),
                100000
            ).hex()
            return computed_hash == hash_value
        except:
            return False

# ── RATE LIMITING ─────────────────────────────────────────────────────────────

class RateLimiter:
    """Sistema de rate limiting para prevenir abusos"""
    
    def __init__(self):
        self._requests: Dict[str, List[float]] = {}
        self._lock = threading.Lock()
    
    def is_allowed(self, identifier: str, max_requests: int = 100, window: int = 60) -> bool:
        """Verifica si el identificador puede hacer más requests"""
        now = time.time()
        
        with self._lock:
            if identifier not in self._requests:
                self._requests[identifier] = []
            
            # Limpiar requests antiguos
            self._requests[identifier] = [
                req_time for req_time in self._requests[identifier]
                if now - req_time < window
            ]
            
            # Verificar límite
            if len(self._requests[identifier]) >= max_requests:
                logger.warning(f"Rate limit exceeded for {identifier}")
                return False
            
            # Registrar request
            self._requests[identifier].append(now)
            return True
    
    def cleanup(self):
        """Limpia registros antiguos"""
        now = time.time()
        with self._lock:
            for identifier in list(self._requests.keys()):
                self._requests[identifier] = [
                    req_time for req_time in self._requests[identifier]
                    if now - req_time < 3600  # Mantener solo última hora
                ]
                if not self._requests[identifier]:
                    del self._requests[identifier]

rate_limiter = RateLimiter()

# ── PERFORMANCE MONITORING ────────────────────────────────────────────────────

class PerformanceMonitor:
    """Monitor de rendimiento para identificar cuellos de botella"""
    
    def __init__(self):
        self._metrics: Dict[str, List[float]] = {}
        self._lock = threading.Lock()
    
    def record(self, operation: str, duration: float):
        """Registra duración de una operación"""
        with self._lock:
            if operation not in self._metrics:
                self._metrics[operation] = []
            self._metrics[operation].append(duration)
            
            # Mantener solo últimos 1000 registros
            if len(self._metrics[operation]) > 1000:
                self._metrics[operation] = self._metrics[operation][-1000:]
    
    def get_stats(self, operation: str) -> Dict[str, float]:
        """Obtiene estadísticas de una operación"""
        with self._lock:
            if operation not in self._metrics or not self._metrics[operation]:
                return {}
            
            durations = self._metrics[operation]
            return {
                'count': len(durations),
                'avg': sum(durations) / len(durations),
                'min': min(durations),
                'max': max(durations),
                'p95': sorted(durations)[int(len(durations) * 0.95)] if durations else 0
            }
    
    def get_all_stats(self) -> Dict[str, Dict[str, float]]:
        """Obtiene estadísticas de todas las operaciones"""
        with self._lock:
            return {op: self.get_stats(op) for op in self._metrics}

performance_monitor = PerformanceMonitor()

# ── DECORATORS ─────────────────────────────────────────────────────────────────

def monitor_performance(operation_name: str):
    """Decorator para monitorear rendimiento de funciones"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                performance_monitor.record(operation_name, duration)
                return result
            except Exception as e:
                duration = time.time() - start_time
                performance_monitor.record(f"{operation_name}_error", duration)
                logger.error(f"Error in {operation_name}: {e}")
                raise
        return wrapper
    return decorator

def rate_limit(max_requests: int = 100, window: int = 60):
    """Decorator para rate limiting"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Usar IP del request como identificador
            from flask import request
            identifier = request.remote_addr
            
            if not rate_limiter.is_allowed(identifier, max_requests, window):
                from flask import jsonify
                return jsonify({'error': 'Rate limit exceeded'}), 429
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

def cached(ttl: int = 300, key_prefix: str = ""):
    """Decorator para cachear resultados de funciones"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generar clave de caché
            cache_key = f"{key_prefix}_{func.__name__}_{str(args)}_{str(kwargs)}"
            
            # Intentar obtener de caché
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Ejecutar función y cachear resultado
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# ── DATABASE OPTIMIZATIONS ────────────────────────────────────────────────────

class DatabaseOptimizer:
    """Optimizaciones para operaciones de base de datos"""
    
    @staticmethod
    @contextmanager
    def transaction(db_pool: DatabasePool):
        """Context manager para transacciones optimizadas"""
        conn = None
        try:
            with db_pool.get_connection() as conn:
                conn.execute("BEGIN")
                yield conn
                conn.execute("COMMIT")
        except Exception as e:
            if conn:
                conn.execute("ROLLBACK")
            logger.error(f"Transaction failed: {e}")
            raise
    
    @staticmethod
    def bulk_insert(db_pool: DatabasePool, table: str, columns: List[str], data: List[Dict]):
        """Insert bulk optimizado"""
        if not data:
            return
        
        placeholders = ','.join(['?' for _ in columns])
        columns_str = ','.join(columns)
        sql = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"
        
        with db_pool.get_connection() as conn:
            values = [[row[col] for col in columns] for row in data]
            conn.executemany(sql, values)
            conn.commit()
    
    @staticmethod
    def optimize_query(query: str) -> str:
        """Optimiza query SQL básica"""
        # Agregar hints de optimización
        if "SELECT" in query.upper() and "ORDER BY" in query.upper():
            if "LIMIT" not in query.upper():
                query += " LIMIT 1000"
        
        return query

# ── API RESPONSE HELPERS ─────────────────────────────────────────────────────

class APIResponse:
    """Helpers para respuestas de API consistentes"""
    
    @staticmethod
    def success(data: Any = None, message: str = "Success") -> tuple:
        """Respuesta exitosa estándar"""
        return jsonify({
            'success': True,
            'message': message,
            'data': data,
            'timestamp': datetime.now().isoformat()
        }), 200
    
    @staticmethod
    def error(message: str, code: int = 400, details: Any = None) -> tuple:
        """Respuesta de error estándar"""
        return jsonify({
            'success': False,
            'message': message,
            'error_code': code,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }), code
    
    @staticmethod
    def paginated(data: List, page: int, per_page: int, total: int) -> tuple:
        """Respuesta paginada estándar"""
        return jsonify({
            'success': True,
            'data': data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'total_pages': (total + per_page - 1) // per_page
            },
            'timestamp': datetime.now().isoformat()
        }), 200

# ── TASK QUEUE (SIMPLE IMPLEMENTATION) ────────────────────────────────────────

import queue
import threading

class TaskQueue:
    """Cola de tareas simple para background processing"""
    
    def __init__(self, num_workers: int = 2):
        self._queue = queue.Queue()
        self._workers = []
        self._shutdown = False
        
        for _ in range(num_workers):
            worker = threading.Thread(target=self._worker)
            worker.daemon = True
            worker.start()
            self._workers.append(worker)
    
    def _worker(self):
        """Worker thread para procesar tareas"""
        while not self._shutdown:
            try:
                task, args, kwargs = self._queue.get(timeout=1)
                try:
                    task(*args, **kwargs)
                except Exception as e:
                    logger.error(f"Task failed: {e}")
                finally:
                    self._queue.task_done()
            except queue.Empty:
                continue
    
    def add_task(self, task, *args, **kwargs):
        """Agrega una tarea a la cola"""
        self._queue.put((task, args, kwargs))
    
    def shutdown(self):
        """Cierra el task queue"""
        self._shutdown = True
        for worker in self._workers:
            worker.join()

task_queue = TaskQueue()

# ── ASYNC TASK EXAMPLES ───────────────────────────────────────────────────────

def async_send_email(to: str, subject: str, body: str):
    """Tarea asíncrona para enviar emails"""
    # Implementación con threading o async
    logger.info(f"Sending email to {to}: {subject}")
    # Aquí iría la implementación real de envío de email

def async_generate_thumbnail(image_path: str):
    """Tarea asíncrona para generar thumbnails"""
    try:
        from PIL import Image
        img = Image.open(image_path)
        img.thumbnail((300, 300), Image.Resampling.LANCZOS)
        
        base, ext = os.path.splitext(image_path)
        thumb_path = f"{base}_thumb{ext}"
        img.save(thumb_path, optimize=True, quality=85)
        
        logger.info(f"Generated thumbnail: {thumb_path}")
    except Exception as e:
        logger.error(f"Failed to generate thumbnail: {e}")

# ── HEALTH CHECK ENDPOINT ────────────────────────────────────────────────────

def health_check() -> Dict[str, Any]:
    """Health check del sistema"""
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '3.0',
        'cache_size': len(cache._cache),
        'db_pool_size': 5,  # Debería ser dinámico
        'performance_stats': performance_monitor.get_all_stats()
    }

# ── INITIALIZATION ────────────────────────────────────────────────────────────

def initialize_optimizations(db_path: str):
    """Inicializa todas las optimizaciones"""
    global db_pool
    
    # Inicializar pool de base de datos
    db_pool = DatabasePool(db_path)
    
    # Iniciar limpieza periódica de rate limiter
    def cleanup_task():
        while True:
            time.sleep(300)  # Cada 5 minutos
            rate_limiter.cleanup()
    
    cleanup_thread = threading.Thread(target=cleanup_task, daemon=True)
    cleanup_thread.start()
    
    logger.info("Optimizations initialized successfully")
    
    return db_pool

# Exponer funciones para uso en app.py
__all__ = [
    'cache',
    'DatabasePool',
    'SecurityEnhancer',
    'RateLimiter',
    'rate_limiter',
    'PerformanceMonitor',
    'performance_monitor',
    'monitor_performance',
    'rate_limit',
    'cached',
    'DatabaseOptimizer',
    'APIResponse',
    'TaskQueue',
    'task_queue',
    'async_send_email',
    'async_generate_thumbnail',
    'health_check',
    'initialize_optimizations'
]