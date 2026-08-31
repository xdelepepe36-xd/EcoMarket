"""
EcoMarket - Script de Compresión de Assets
Comprime y optimiza archivos CSS y JS para mejor rendimiento
"""

import os
import re
import json
from pathlib import Path
import shutil
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, 'static')
COMPRESSED_DIR = os.path.join(STATIC_DIR, 'compressed')


class AssetCompressor:
    """Compresor de assets estáticos."""
    
    def __init__(self):
        self.compressed_count = 0
        self.original_size = 0
        self.compressed_size = 0
        self.start_time = datetime.now()
    
    def compress_css(self, content):
        """Comprime contenido CSS."""
        # Eliminar comentarios
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # Eliminar espacios en blanco innecesarios
        content = re.sub(r'\s+', ' ', content)
        
        # Eliminar espacios alrededor de caracteres especiales
        content = re.sub(r'\s*([{}:;,])\s*', r'\1', content)
        
        # Eliminar espacios al inicio y final
        content = content.strip()
        
        return content
    
    def compress_js(self, content):
        """Comprime contenido JavaScript básico."""
        # Eliminar comentarios de una línea
        content = re.sub(r'//.*', '', content)
        
        # Eliminar comentarios multilínea
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # Eliminar espacios en blanco innecesarios
        content = re.sub(r'\s+', ' ', content)
        
        # Eliminar espacios alrededor de operadores
        content = re.sub(r'\s*([=+\-*/<>!&|,;:])\s*', r'\1', content)
        
        # Eliminar espacios al inicio y final
        content = content.strip()
        
        return content
    
    def compress_file(self, file_path, output_dir):
        """Comprime un archivo individual."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_size = len(content)
            self.original_size += original_size
            
            # Determinar tipo de archivo y comprimir
            if file_path.endswith('.css'):
                compressed = self.compress_css(content)
                extension = '.min.css'
            elif file_path.endswith('.js'):
                compressed = self.compress_js(content)
                extension = '.min.js'
            else:
                print(f"Tipo de archivo no soportado: {file_path}")
                return False
            
            compressed_size = len(compressed)
            self.compressed_size += compressed_size
            
            # Crear directorio de salida si no existe
            os.makedirs(output_dir, exist_ok=True)
            
            # Guardar archivo comprimido
            output_path = os.path.join(output_dir, os.path.basename(file_path).replace('.css', extension).replace('.js', extension))
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(compressed)
            
            self.compressed_count += 1
            
            compression_ratio = (1 - compressed_size / original_size) * 100
            
            print(f"Comprimido: {os.path.basename(file_path)} - {original_size:,} -> {compressed_size:,} bytes ({compression_ratio:.1f}% reducción)")
            
            return True
            
        except Exception as e:
            print(f"Error comprimiendo {file_path}: {e}")
            return False
    
    def compress_directory(self, input_dir, output_dir, extensions=['.css', '.js']):
        """Comprime todos los archivos en un directorio."""
        input_path = Path(input_dir)
        
        if not input_path.exists():
            print(f"Directorio no encontrado: {input_dir}")
            return
        
        # Encontrar todos los archivos con las extensiones especificadas
        files = []
        for ext in extensions:
            files.extend(input_path.glob(f'*{ext}'))
            files.extend(input_path.glob(f'**/*{ext}'))
        
        print(f"Encontrados {len(files)} archivos para comprimir")
        
        # Comprimir cada archivo
        for file_path in files:
            # Mantener estructura de directorios relativa
            relative_path = file_path.relative_to(input_path)
            file_output_dir = os.path.join(output_dir, str(relative_path.parent))
            
            self.compress_file(str(file_path), file_output_dir)
    
    def generate_report(self):
        """Genera reporte de compresión."""
        duration = (datetime.now() - self.start_time).total_seconds()
        
        if self.original_size > 0:
            total_compression = (1 - self.compressed_size / self.original_size) * 100
        else:
            total_compression = 0
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'duration_seconds': duration,
            'files_compressed': self.compressed_count,
            'original_size_bytes': self.original_size,
            'compressed_size_bytes': self.compressed_size,
            'total_compression_percent': total_compression,
            'original_size_mb': self.original_size / (1024 * 1024),
            'compressed_size_mb': self.compressed_size / (1024 * 1024),
            'space_saved_mb': (self.original_size - self.compressed_size) / (1024 * 1024)
        }
        
        return report


def main():
    """Función principal."""
    print("🗜️  EcoMarket Asset Compressor")
    print("=" * 40)
    
    compressor = AssetCompressor()
    
    # Comprimir archivos CSS y JS del directorio static
    print("\n📁 Comprimiendo archivos de static/...")
    compressor.compress_directory(STATIC_DIR, COMPRESSED_DIR)
    
    # Generar y mostrar reporte
    report = compressor.generate_report()
    
    print("\n📊 Reporte de Compresión:")
    print(f"Archivos comprimidos: {report['files_compressed']}")
    print(f"Tamaño original: {report['original_size_mb']:.2f} MB")
    print(f"Tamaño comprimido: {report['compressed_size_mb']:.2f} MB")
    print(f"Espacio ahorrado: {report['space_saved_mb']:.2f} MB ({report['total_compression_percent']:.1f}%)")
    print(f"Tiempo de ejecución: {report['duration_seconds']:.2f} segundos")
    
    # Guardar reporte en JSON
    report_path = os.path.join(BASE_DIR, 'compression_report.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n💾 Reporte guardado en: {report_path}")
    print(f"📂 Archivos comprimidos en: {COMPRESSED_DIR}")
    
    if report['files_compressed'] > 0:
        print("\n✅ Compresión completada exitosamente")
    else:
        print("\n⚠️  No se encontraron archivos para comprimir")


if __name__ == '__main__':
    main()