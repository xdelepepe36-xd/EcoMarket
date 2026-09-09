#!/usr/bin/env python3
"""
EcoMarket - Asset Optimization Script
Optimiza imágenes, CSS y JavaScript para producción
"""

import os
import sys
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple
import subprocess

class AssetOptimizer:
    def __init__(self, base_dir: str = None):
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).parent.parent
        self.css_dir = self.base_dir / 'css'
        self.js_dir = self.base_dir / 'js'
        self.static_dir = self.base_dir / 'static'
        self.dist_dir = self.base_dir / 'dist'
        self.optimized_dir = self.base_dir / 'static' / 'optimized'
        
        # Crear directorios
        self.optimized_dir.mkdir(exist_ok=True)
        self.dist_dir.mkdir(exist_ok=True)
        
    def optimize_all(self) -> Dict[str, bool]:
        """Ejecuta todas las optimizaciones"""
        results = {
            'css': self.optimize_css(),
            'js': self.optimize_js(),
            'images': self.optimize_images()
        }
        return results
    
    def optimize_css(self) -> bool:
        """Optimiza archivos CSS"""
        print("🎨 Optimizando CSS...")
        
        try:
            css_files = list(self.css_dir.glob('*.css'))
            
            for css_file in css_files:
                print(f"  Procesando: {css_file.name}")
                
                # Leer contenido
                with open(css_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Minificar (básico)
                minified = self._minify_css(content)
                
                # Guardar versión optimizada
                output_file = self.optimized_dir / f"{css_file.stem}.min.css"
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(minified)
                
                # Calcular ahorro
                original_size = len(content)
                optimized_size = len(minified)
                savings = ((original_size - optimized_size) / original_size) * 100
                
                print(f"    ✅ Ahorro: {savings:.1f}% ({original_size} -> {optimized_size} bytes)")
            
            print("✅ CSS optimizado correctamente")
            return True
            
        except Exception as e:
            print(f"❌ Error optimizando CSS: {e}")
            return False
    
    def optimize_js(self) -> bool:
        """Optimiza archivos JavaScript"""
        print("📜 Optimizando JavaScript...")
        
        try:
            js_files = list(self.js_dir.glob('*.js'))
            
            for js_file in js_files:
                print(f"  Procesando: {js_file.name}")
                
                # Leer contenido
                with open(js_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Minificar (básico)
                minified = self._minify_js(content)
                
                # Guardar versión optimizada
                output_file = self.optimized_dir / f"{js_file.stem}.min.js"
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(minified)
                
                # Calcular ahorro
                original_size = len(content)
                optimized_size = len(minified)
                savings = ((original_size - optimized_size) / original_size) * 100
                
                print(f"    ✅ Ahorro: {savings:.1f}% ({original_size} -> {optimized_size} bytes)")
            
            print("✅ JavaScript optimizado correctamente")
            return True
            
        except Exception as e:
            print(f"❌ Error optimizando JavaScript: {e}")
            return False
    
    def optimize_images(self) -> bool:
        """Optimiza imágenes"""
        print("🖼️  Optimizando imágenes...")
        
        try:
            # Extensiones de imagen soportadas
            image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            
            # Buscar imágenes en static
            image_files = []
            for ext in image_extensions:
                image_files.extend(self.static_dir.rglob(f'*{ext}'))
            
            if not image_files:
                print("  ℹ️  No se encontraron imágenes para optimizar")
                return True
            
            # Intentar usar PIL si está disponible
            try:
                from PIL import Image
                use_pil = True
            except ImportError:
                print("  ⚠️  PIL no disponible, usando copia básica")
                use_pil = False
            
            for image_file in image_files:
                # Ignorar archivos ya optimizados
                if 'optimized' in str(image_file):
                    continue
                
                print(f"  Procesando: {image_file.name}")
                
                if use_pil:
                    try:
                        with Image.open(image_file) as img:
                            # Convertir a RGB si es necesario
                            if img.mode in ('RGBA', 'P'):
                                img = img.convert('RGB')
                            
                            # Optimizar
                            output_path = self.optimized_dir / image_file.name
                            img.save(
                                output_path,
                                optimize=True,
                                quality=85
                            )
                            
                            # Calcular ahorro
                            original_size = image_file.stat().st_size
                            optimized_size = output_path.stat().st_size
                            savings = ((original_size - optimized_size) / original_size) * 100
                            
                            print(f"    ✅ Ahorro: {savings:.1f}% ({original_size} -> {optimized_size} bytes)")
                    except Exception as e:
                        print(f"    ⚠️  Error procesando {image_file.name}: {e}")
                        # Fallback: copiar archivo
                        shutil.copy2(image_file, self.optimized_dir / image_file.name)
                else:
                    # Fallback: copiar archivo
                    shutil.copy2(image_file, self.optimized_dir / image_file.name)
                    print(f"    ℹ️  Copiado (sin optimización)")
            
            print("✅ Imágenes optimizadas correctamente")
            return True
            
        except Exception as e:
            print(f"❌ Error optimizando imágenes: {e}")
            return False
    
    def _minify_css(self, css: str) -> str:
        """Minifica CSS (básico)"""
        # Eliminar comentarios
        css = self._remove_css_comments(css)
        # Eliminar espacios extra
        css = ' '.join(css.split())
        # Eliminar espacios alrededor de caracteres especiales
        css = css.replace(' { ', '{').replace(' {', '{')
        css = css.replace(' } ', '}').replace(' }', '}')
        css = css.replace(' {', '{').replace('{ ', '{')
        css = css.replace(' }', '}').replace('} ', '}')
        css = css.replace(' : ', ':').replace(' :', ':').replace(': ', ':')
        css = css.replace(' ; ', ';').replace(' ;', ';').replace('; ', ';')
        css = css.replace(' , ', ',').replace(' ,', ',').replace(', ', ',')
        # Eliminar último punto y coma
        css = css.replace(';}', '}')
        return css.strip()
    
    def _remove_css_comments(self, css: str) -> str:
        """Elimina comentarios CSS"""
        import re
        return re.sub(r'/\*[\s\S]*?\*/', '', css)
    
    def _minify_js(self, js: str) -> str:
        """Minifica JavaScript (básico)"""
        # Eliminar comentarios de una línea
        js = '\n'.join(line for line in js.split('\n') if not line.strip().startswith('//'))
        # Eliminar comentarios multi-línea
        import re
        js = re.sub(r'/\*[\s\S]*?\*/', '', js)
        # Eliminar espacios extra
        js = ' '.join(js.split())
        # Eliminar espacios alrededor de operadores
        js = js.replace(' = ', '=').replace(' =', '=').replace('= ', '=')
        js = js.replace(' + ', '+').replace(' +', '+').replace('+ ', '+')
        js = js.replace(' - ', '-').replace(' -', '-').replace('- ', '-')
        js = js.replace(' * ', '*').replace(' *', '*').replace('* ', '*')
        js = js.replace(' / ', '/').replace(' /', '/').replace('/ ', '/')
        js = js.replace(' { ', '{').replace(' {', '{')
        js = js.replace(' } ', '}').replace(' }', '}')
        js = js.replace(' ( ', '(').replace(' (', '(')
        js = js.replace(' ) ', ')').replace(' )', ')')
        js = js.replace(' [ ', '[').replace(' [', '[')
        js = js.replace(' ] ', ']').replace(' ]', ']')
        js = js.replace(' ; ', ';').replace(' ;', ';')
        js = js.replace(' : ', ':').replace(' :', ':')
        js = js.replace(' , ', ',').replace(' ,', ',')
        return js.strip()
    
    def generate_manifest(self) -> bool:
        """Genera manifest de assets"""
        print("📋 Generando manifest de assets...")
        
        try:
            manifest = {
                'version': datetime.now().isoformat(),
                'assets': {}
            }
            
            # CSS
            css_files = list(self.optimized_dir.glob('*.min.css'))
            for css_file in css_files:
                manifest['assets'][css_file.name] = {
                    'path': f'static/optimized/{css_file.name}',
                    'size': css_file.stat().st_size,
                    'type': 'stylesheet',
                    'original': css_file.name.replace('.min.css', '.css')
                }
            
            # JS
            js_files = list(self.optimized_dir.glob('*.min.js'))
            for js_file in js_files:
                manifest['assets'][js_file.name] = {
                    'path': f'static/optimized/{js_file.name}',
                    'size': js_file.stat().st_size,
                    'type': 'script',
                    'original': js_file.name.replace('.min.js', '.js')
                }
            
            # Imágenes
            image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            for ext in image_extensions:
                for image_file in self.optimized_dir.glob(f'*{ext}'):
                    manifest['assets'][image_file.name] = {
                        'path': f'static/optimized/{image_file.name}',
                        'size': image_file.stat().st_size,
                        'type': 'image'
                    }
            
            # Guardar manifest
            manifest_file = self.dist_dir / 'asset-manifest.json'
            with open(manifest_file, 'w', encoding='utf-8') as f:
                json.dump(manifest, f, indent=2)
            
            print(f"✅ Manifest generado: {manifest_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error generando manifest: {e}")
            return False
    
    def get_optimization_stats(self) -> Dict:
        """Obtiene estadísticas de optimización"""
        stats = {
            'original_size': 0,
            'optimized_size': 0,
            'files_processed': 0,
            'savings': 0
        }
        
        # CSS
        for css_file in self.css_dir.glob('*.css'):
            original = css_file.stat().st_size
            optimized = (self.optimized_dir / f"{css_file.stem}.min.css")
            if optimized.exists():
                stats['original_size'] += original
                stats['optimized_size'] += optimized.stat().st_size
                stats['files_processed'] += 1
        
        # JS
        for js_file in self.js_dir.glob('*.js'):
            original = js_file.stat().st_size
            optimized = (self.optimized_dir / f"{js_file.stem}.min.js")
            if optimized.exists():
                stats['original_size'] += original
                stats['optimized_size'] += optimized.stat().st_size
                stats['files_processed'] += 1
        
        if stats['original_size'] > 0:
            stats['savings'] = ((stats['original_size'] - stats['optimized_size']) / stats['original_size']) * 100
        
        return stats


def main():
    """Función principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Optimiza assets de EcoMarket')
    parser.add_argument('--css', action='store_true', help='Optimizar solo CSS')
    parser.add_argument('--js', action='store_true', help='Optimizar solo JavaScript')
    parser.add_argument('--images', action='store_true', help='Optimizar solo imágenes')
    parser.add_argument('--stats', action='store_true', help='Mostrar estadísticas')
    parser.add_argument('--base-dir', help='Directorio base del proyecto')
    
    args = parser.parse_args()
    
    optimizer = AssetOptimizer(args.base_dir)
    
    if args.stats:
        stats = optimizer.get_optimization_stats()
        print("\n📊 Estadísticas de optimización:")
        print(f"  Archivos procesados: {stats['files_processed']}")
        print(f"  Tamaño original: {stats['original_size']:,} bytes")
        print(f"  Tamaño optimizado: {stats['optimized_size']:,} bytes")
        print(f"  Ahorro total: {stats['savings']:.1f}%")
        return
    
    if args.css:
        optimizer.optimize_css()
    elif args.js:
        optimizer.optimize_js()
    elif args.images:
        optimizer.optimize_images()
    else:
        results = optimizer.optimize_all()
        optimizer.generate_manifest()
        
        # Mostrar resumen
        print("\n📊 Resumen:")
        for asset_type, success in results.items():
            status = "✅" if success else "❌"
            print(f"  {status} {asset_type.upper()}")
        
        # Mostrar estadísticas
        stats = optimizer.get_optimization_stats()
        if stats['files_processed'] > 0:
            print(f"\n💰 Ahorro total: {stats['savings']:.1f}% ({stats['original_size'] - stats['optimized_size']:,} bytes)")


if __name__ == '__main__':
    main()