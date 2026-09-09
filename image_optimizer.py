"""
EcoMarket - Sistema de Optimización de Imágenes
Optimización automática de imágenes para mejor rendimiento
"""
import os
import io
from PIL import Image, ImageOps, ImageEnhance
from pathlib import Path
import hashlib
import logging
from typing import Tuple, Optional, List
import json
from datetime import datetime

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ImageOptimizer:
    """Sistema completo de optimización de imágenes"""
    
    def __init__(self, upload_folder: str, cache_folder: str = None):
        self.upload_folder = upload_folder
        self.cache_folder = cache_folder or os.path.join(upload_folder, 'cache')
        self.metadata_file = os.path.join(self.cache_folder, 'metadata.json')
        
        # Crear carpeta de cache si no existe
        os.makedirs(self.cache_folder, exist_ok=True)
        
        # Configuración de optimización
        self.config = {
            'quality': 85,
            'max_width': 1200,
            'max_height': 1200,
            'thumbnail_size': (300, 300),
            'formats': ['JPEG', 'PNG', 'WEBP'],
            'progressive': True,
            'optimize': True
        }
        
        # Cargar metadata existente
        self.metadata = self._load_metadata()
    
    def _load_metadata(self) -> dict:
        """Carga metadata de imágenes cacheadas"""
        try:
            if os.path.exists(self.metadata_file):
                with open(self.metadata_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error loading metadata: {e}")
        return {}
    
    def _save_metadata(self):
        """Guarda metadata de imágenes cacheadas"""
        try:
            with open(self.metadata_file, 'w') as f:
                json.dump(self.metadata, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving metadata: {e}")
    
    def _get_file_hash(self, file_path: str) -> str:
        """Calcula hash de un archivo"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def _get_cache_path(self, original_path: str, suffix: str = '') -> str:
        """Genera ruta de cache para una imagen"""
        filename = os.path.basename(original_path)
        name, ext = os.path.splitext(filename)
        cache_filename = f"{name}{suffix}.webp"  # Siempre usar WebP para cache
        return os.path.join(self.cache_folder, cache_filename)
    
    def optimize_image(self, file_path: str, force: bool = False) -> dict:
        """Optimiza una imagen completa"""
        try:
            # Verificar si ya está optimizada
            file_hash = self._get_file_hash(file_path)
            cache_key = f"{file_hash}_optimized"
            
            if not force and cache_key in self.metadata:
                logger.info(f"Image already optimized: {file_path}")
                return self.metadata[cache_key]
            
            # Abrir imagen
            with Image.open(file_path) as img:
                # Convertir a RGB si es necesario
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Redimensionar si es muy grande
                width, height = img.size
                if width > self.config['max_width'] or height > self.config['max_height']:
                    img.thumbnail((self.config['max_width'], self.config['max_height']), Image.Resampling.LANCZOS)
                
                # Optimizar
                output_path = self._get_cache_path(file_path)
                img.save(
                    output_path,
                    'WEBP',
                    quality=self.config['quality'],
                    optimize=self.config['optimize'],
                    method=6  # Compresión máxima
                )
                
                # Generar metadata
                original_size = os.path.getsize(file_path)
                optimized_size = os.path.getsize(output_path)
                compression_ratio = (1 - optimized_size / original_size) * 100
                
                metadata = {
                    'original_path': file_path,
                    'optimized_path': output_path,
                    'original_size': original_size,
                    'optimized_size': optimized_size,
                    'compression_ratio': compression_ratio,
                    'dimensions': img.size,
                    'format': 'WEBP',
                    'optimized_at': datetime.now().isoformat()
                }
                
                # Guardar metadata
                self.metadata[cache_key] = metadata
                self._save_metadata()
                
                logger.info(f"Image optimized: {file_path} - {compression_ratio:.1f}% reduction")
                return metadata
                
        except Exception as e:
            logger.error(f"Error optimizing image {file_path}: {e}")
            return {'error': str(e)}
    
    def create_thumbnail(self, file_path: str, size: Tuple[int, int] = None) -> str:
        """Crea un thumbnail de una imagen"""
        try:
            size = size or self.config['thumbnail_size']
            thumbnail_path = self._get_cache_path(file_path, '_thumb')
            
            # Verificar si ya existe
            if os.path.exists(thumbnail_path):
                return thumbnail_path
            
            with Image.open(file_path) as img:
                # Convertir a RGB si es necesario
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Crear thumbnail
                img.thumbnail(size, Image.Resampling.LANCZOS)
                
                # Guardar
                img.save(
                    thumbnail_path,
                    'WEBP',
                    quality=self.config['quality'],
                    optimize=True
                )
                
                logger.info(f"Thumbnail created: {thumbnail_path}")
                return thumbnail_path
                
        except Exception as e:
            logger.error(f"Error creating thumbnail: {e}")
            return file_path  # Fallback a original
    
    def create_responsive_images(self, file_path: str) -> dict:
        """Crea múltiples versiones responsive de una imagen"""
        try:
            sizes = [
                (320, 'small'),
                (640, 'medium'),
                (1024, 'large'),
                (1920, 'xlarge')
            ]
            
            responsive_images = {}
            
            with Image.open(file_path) as img:
                # Convertir a RGB si es necesario
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                for width, label in sizes:
                    # Crear versión
                    resized = img.copy()
                    if img.size[0] > width:
                        ratio = width / img.size[0]
                        new_height = int(img.size[1] * ratio)
                        resized = resized.resize((width, new_height), Image.Resampling.LANCZOS)
                    
                    # Guardar
                    output_path = self._get_cache_path(file_path, f'_{label}')
                    resized.save(
                        output_path,
                        'WEBP',
                        quality=self.config['quality'],
                        optimize=True
                    )
                    
                    responsive_images[label] = {
                        'path': output_path,
                        'width': width,
                        'size': os.path.getsize(output_path)
                    }
            
            logger.info(f"Responsive images created: {file_path}")
            return responsive_images
            
        except Exception as e:
            logger.error(f"Error creating responsive images: {e}")
            return {}
    
    def convert_to_webp(self, file_path: str) -> str:
        """Convierte una imagen a WebP"""
        try:
            webp_path = self._get_cache_path(file_path)
            
            # Verificar si ya existe
            if os.path.exists(webp_path):
                return webp_path
            
            with Image.open(file_path) as img:
                # Convertir a RGB si es necesario
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Guardar como WebP
                img.save(
                    webp_path,
                    'WEBP',
                    quality=self.config['quality'],
                    optimize=True
                )
                
                logger.info(f"Image converted to WebP: {webp_path}")
                return webp_path
                
        except Exception as e:
            logger.error(f"Error converting to WebP: {e}")
            return file_path
    
    def batch_optimize(self, folder: str, recursive: bool = True) -> List[dict]:
        """Optimiza todas las imágenes en una carpeta"""
        results = []
        
        # Obtener lista de archivos
        if recursive:
            files = Path(folder).rglob('*')
        else:
            files = Path(folder).glob('*')
        
        # Filtrar solo imágenes
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}
        image_files = [f for f in files if f.suffix.lower() in image_extensions]
        
        logger.info(f"Found {len(image_files)} images to optimize")
        
        # Optimizar cada imagen
        for image_file in image_files:
            result = self.optimize_image(str(image_file))
            results.append(result)
        
        return results
    
    def get_image_info(self, file_path: str) -> dict:
        """Obtiene información detallada de una imagen"""
        try:
            with Image.open(file_path) as img:
                return {
                    'filename': os.path.basename(file_path),
                    'format': img.format,
                    'mode': img.mode,
                    'size': img.size,
                    'width': img.size[0],
                    'height': img.size[1],
                    'file_size': os.path.getsize(file_path),
                    'has_transparency': img.mode in ('RGBA', 'LA') or 'transparency' in img.info
                }
        except Exception as e:
            logger.error(f"Error getting image info: {e}")
            return {'error': str(e)}
    
    def cleanup_cache(self, max_age_days: int = 30):
        """Limpia archivos de cache antiguos"""
        try:
            now = datetime.now()
            cutoff = now.timestamp() - (max_age_days * 24 * 60 * 60)
            
            deleted_count = 0
            deleted_size = 0
            
            for file_path in Path(self.cache_folder).glob('*'):
                if file_path.is_file() and file_path.name != 'metadata.json':
                    file_mtime = file_path.stat().st_mtime
                    if file_mtime < cutoff:
                        deleted_size += file_path.stat().st_size
                        file_path.unlink()
                        deleted_count += 1
            
            logger.info(f"Cache cleanup: {deleted_count} files deleted, {deleted_size / 1024 / 1024:.2f} MB freed")
            
            return {'deleted_count': deleted_count, 'deleted_size': deleted_size}
            
        except Exception as e:
            logger.error(f"Error cleaning cache: {e}")
            return {'error': str(e)}
    
    def get_cache_stats(self) -> dict:
        """Obtiene estadísticas del cache"""
        try:
            total_files = 0
            total_size = 0
            
            for file_path in Path(self.cache_folder).glob('*'):
                if file_path.is_file() and file_path.name != 'metadata.json':
                    total_files += 1
                    total_size += file_path.stat().st_size
            
            return {
                'total_files': total_files,
                'total_size': total_size,
                'total_size_mb': total_size / 1024 / 1024,
                'cache_folder': self.cache_folder
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {'error': str(e)}


class ImageValidator:
    """Validador de imágenes para seguridad"""
    
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_DIMENSIONS = (4000, 4000)  # Máximo 4000x4000
    MIN_DIMENSIONS = (50, 50)  # Mínimo 50x50
    
    @staticmethod
    def validate_file(file_path: str) -> tuple[bool, str]:
        """Valida un archivo de imagen"""
        try:
            # Verificar extensión
            ext = Path(file_path).suffix.lower()
            if ext not in ImageValidator.ALLOWED_EXTENSIONS:
                return False, f"Extensión no permitida: {ext}"
            
            # Verificar tamaño
            file_size = os.path.getsize(file_path)
            if file_size > ImageValidator.MAX_FILE_SIZE:
                return False, f"Archivo demasiado grande: {file_size / 1024 / 1024:.2f}MB"
            
            # Verificar que sea una imagen válida
            try:
                with Image.open(file_path) as img:
                    # Verificar dimensiones
                    width, height = img.size
                    if width > ImageValidator.MAX_DIMENSIONS[0] or height > ImageValidator.MAX_DIMENSIONS[1]:
                        return False, f"Dimensiones demasiado grandes: {width}x{height}"
                    
                    if width < ImageValidator.MIN_DIMENSIONS[0] or height < ImageValidator.MIN_DIMENSIONS[1]:
                        return False, f"Dimensiones demasiado pequeñas: {width}x{height}"
                    
                    # Verificar magic bytes
                    if not ImageValidator._validate_magic_bytes(file_path, img.format):
                        return False, "Magic bytes no coinciden con la extensión"
                    
            except Exception as e:
                return False, f"Archivo de imagen inválido: {str(e)}"
            
            return True, "Imagen válida"
            
        except Exception as e:
            return False, f"Error validando imagen: {str(e)}"
    
    @staticmethod
    def _validate_magic_bytes(file_path: str, expected_format: str) -> bool:
        """Valida magic bytes del archivo"""
        magic_bytes = {
            'JPEG': b'\xff\xd8\xff',
            'PNG': b'\x89PNG',
            'GIF': b'GIF',
            'WEBP': b'RIFF'
        }
        
        try:
            with open(file_path, 'rb') as f:
                header = f.read(4)
                expected_magic = magic_bytes.get(expected_format, b'')
                return header.startswith(expected_magic)
        except:
            return False


# Funciones de utilidad
def optimize_uploaded_image(file_path: str, upload_folder: str) -> dict:
    """Optimiza una imagen subida"""
    optimizer = ImageOptimizer(upload_folder)
    return optimizer.optimize_image(file_path)


def create_thumbnail_for_image(file_path: str, upload_folder: str) -> str:
    """Crea thumbnail para una imagen"""
    optimizer = ImageOptimizer(upload_folder)
    return optimizer.create_thumbnail(file_path)


def validate_image_file(file_path: str) -> tuple[bool, str]:
    """Valida un archivo de imagen"""
    return ImageValidator.validate_file(file_path)


if __name__ == '__main__':
    # Ejemplo de uso
    import sys
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        if os.path.exists(image_path):
            optimizer = ImageOptimizer(os.path.dirname(image_path))
            
            print("Optimizando imagen...")
            result = optimizer.optimize_image(image_path)
            print(f"Resultado: {result}")
            
            print("\nCreando thumbnail...")
            thumb_path = optimizer.create_thumbnail(image_path)
            print(f"Thumbnail: {thumb_path}")
            
            print("\nInformación de la imagen:")
            info = optimizer.get_image_info(image_path)
            print(info)
        else:
            print(f"Archivo no encontrado: {image_path}")
    else:
        print("Uso: python image_optimizer.py <ruta_imagen>")