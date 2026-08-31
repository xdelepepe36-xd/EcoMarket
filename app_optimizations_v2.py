"""
EcoMarket - Optimizaciones Adicionales v2.0
Optimizaciones de rendimiento y estructura mejoradas
"""

import functools
import time
from datetime import datetime, timedelta
from functools import wraps

# ── Cache Decorator para funciones costosas ────────────────────────────────────

def cache_result(max_age_seconds=300):
    """Cache decorator para funciones costosas con expiración."""
    cache = {}
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Crear clave del cache
            cache_key = (func.__name__, str(args), str(sorted(kwargs.items())))
            
            # Verificar si existe en cache y no ha expirado
            if cache_key in cache:
                result, timestamp = cache[cache_key]
                if time.time() - timestamp < max_age_seconds:
                    return result
            
            # Ejecutar función y guardar en cache
            result = func(*args, **kwargs)
            cache[cache_key] = (result, time.time())
            
            # Limpiar cache antiguo periódicamente
            if len(cache) > 100:
                current_time = time.time()
                expired_keys = [k for k, (_, t) in cache.items() 
                               if current_time - t > max_age_seconds]
                for key in expired_keys:
                    del cache[key]
            
            return result
        return wrapper
    return decorator


# ── Optimización de consultas a base de datos ─────────────────────────────────

def optimize_db_query(query, params=None):
    """Optimiza consultas SQL básicas."""
    if params is None:
        params = []
    
    # Eliminar espacios innecesarios
    query = ' '.join(query.split())
    
    # Asegurar que use índices cuando sea posible
    # Esta es una implementación básica, podría expandirse
    return query, params


# ── Rate Limiting mejorado ─────────────────────────────────────────────────────

class RateLimiter:
    """Rate limiter in-memory con limpieza automática."""
    
    def __init__(self, max_requests=100, window_seconds=60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {}
    
    def is_allowed(self, identifier):
        """Verifica si el identificador puede hacer una solicitud."""
        now = time.time()
        
        # Limpiar solicitudes antiguas
        if identifier in self.requests:
            self.requests[identifier] = [
                t for t in self.requests[identifier] 
                if now - t < self.window_seconds
            ]
        else:
            self.requests[identifier] = []
        
        # Verificar límite
        if len(self.requests[identifier]) >= self.max_requests:
            return False
        
        # Registrar solicitud
        self.requests[identifier].append(now)
        return True
    
    def get_remaining(self, identifier):
        """Obtiene solicitudes restantes para el identificador."""
        if identifier not in self.requests:
            return self.max_requests
        
        now = time.time()
        self.requests[identifier] = [
            t for t in self.requests[identifier] 
            if now - t < self.window_seconds
        ]
        
        return max(0, self.max_requests - len(self.requests[identifier]))


# ── Compresión de respuestas ───────────────────────────────────────────────────

def compress_response_if_possible(response, threshold=1024):
    """Comprime respuestas si son grandes y el cliente lo soporta."""
    # Implementación básica - podría expandirse con gzip/brotli
    if len(response.data) > threshold:
        # Aquí se implementaría la compresión real
        pass
    return response


# ── Optimización de imágenes ───────────────────────────────────────────────────

def get_optimized_image_url(original_url, width=800, height=600, quality=85):
    """Genera URL optimizada para imágenes."""
    if not original_url:
        return original_url
    
    # Si es una URL externa, retornar tal cual
    if original_url.startswith('http'):
        return original_url
    
    # Para imágenes locales, agregar parámetros de optimización
    if '?' in original_url:
        return f"{original_url}&w={width}&h={height}&q={quality}"
    else:
        return f"{original_url}?w={width}&h={height}&q={quality}"


# ── Batch operations ────────────────────────────────────────────────────────────

def batch_operation(items, operation_func, batch_size=50):
    """Ejecuta operaciones en lotes para mejor rendimiento."""
    results = []
    
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        try:
            batch_results = [operation_func(item) for item in batch]
            results.extend(batch_results)
        except Exception as e:
            print(f"Error en batch {i//batch_size}: {e}")
            results.extend([None] * len(batch))
    
    return results


# ── Optimización de memoria ───────────────────────────────────────────────────

class MemoryOptimizer:
    """Herramientas para optimización de memoria."""
    
    @staticmethod
    def clear_large_objects():
        """Limpia objetos grandes de memoria."""
        import gc
        gc.collect()
    
    @staticmethod
    def optimize_data_structure(data):
        """Optimiza estructuras de datos para usar menos memoria."""
        if isinstance(data, list):
            return tuple(data) if len(data) > 100 else data
        elif isinstance(data, dict):
            return {k: MemoryOptimizer.optimize_data_structure(v) 
                   for k, v in data.items()}
        return data


# ── Async utilities para operaciones I/O ───────────────────────────────────────

import asyncio
from concurrent.futures import ThreadPoolExecutor

async def run_in_threadpool(func, *args, **kwargs):
    """Ejecuta funciones síncronas en un thread pool."""
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        result = await loop.run_in_executor(executor, func, *args, **kwargs)
    return result


# ── Validación y sanitización mejorada ─────────────────────────────────────────

def sanitize_input(input_value, max_length=1000):
    """Sanitiza entrada de usuario de manera segura."""
    if not input_value:
        return input_value
    
    # Convertir a string si no lo es
    if not isinstance(input_value, str):
        input_value = str(input_value)
    
    # Truncar si es muy largo
    if len(input_value) > max_length:
        input_value = input_value[:max_length]
    
    # Eliminar caracteres peligrosos básicos
    dangerous_chars = ['<', '>', '"', "'", '&', '\x00']
    for char in dangerous_chars:
        input_value = input_value.replace(char, '')
    
    return input_value.strip()


# ── Logging optimizado ─────────────────────────────────────────────────────────

class OptimizedLogger:
    """Logger optimizado para producción."""
    
    def __init__(self, log_file='ecomarket.log', max_size=10*1024*1024):
        self.log_file = log_file
        self.max_size = max_size
        self.buffer = []
        self.buffer_size = 100
    
    def log(self, level, message, data=None):
        """Registra un mensaje con nivel opcional."""
        timestamp = datetime.now().isoformat()
        log_entry = {
            'timestamp': timestamp,
            'level': level,
            'message': message,
            'data': data
        }
        
        self.buffer.append(log_entry)
        
        if len(self.buffer) >= self.buffer_size:
            self.flush()
    
    def flush(self):
        """Escribe el buffer al archivo."""
        if not self.buffer:
            return
        
        try:
            import json
            with open(self.log_file, 'a') as f:
                for entry in self.buffer:
                    f.write(json.dumps(entry) + '\n')
            
            # Verificar tamaño del archivo
            try:
                import os
                if os.path.exists(self.log_file):
                    size = os.path.getsize(self.log_file)
                    if size > self.max_size:
                        self.rotate_log()
            except:
                pass
        except Exception as e:
            print(f"Error writing log: {e}")
        finally:
            self.buffer = []
    
    def rotate_log(self):
        """Rota el archivo de log."""
        import os
        import shutil
        
        if os.path.exists(self.log_file):
            backup_file = f"{self.log_file}.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.move(self.log_file, backup_file)


# ── Métricas de rendimiento ───────────────────────────────────────────────────

class PerformanceMetrics:
    """Rastrea métricas de rendimiento."""
    
    def __init__(self):
        self.metrics = {}
    
    def record_metric(self, name, value, unit='ms'):
        """Registra una métrica."""
        if name not in self.metrics:
            self.metrics[name] = []
        
        self.metrics[name].append({
            'value': value,
            'unit': unit,
            'timestamp': datetime.now().isoformat()
        })
        
        # Mantener solo las últimas 1000 mediciones
        if len(self.metrics[name]) > 1000:
            self.metrics[name] = self.metrics[name][-1000:]
    
    def get_average(self, name):
        """Obtiene el promedio de una métrica."""
        if name not in self.metrics or not self.metrics[name]:
            return 0
        
        values = [m['value'] for m in self.metrics[name]]
        return sum(values) / len(values)
    
    def get_percentile(self, name, percentile=95):
        """Obtiene el percentil de una métrica."""
        if name not in self.metrics or not self.metrics[name]:
            return 0
        
        values = sorted([m['value'] for m in self.metrics[name]])
        index = int(len(values) * percentile / 100)
        return values[index]


# ── Instancias globales ───────────────────────────────────────────────────────

rate_limiter = RateLimiter(max_requests=100, window_seconds=60)
logger = OptimizedLogger()
performance_metrics = PerformanceMetrics()