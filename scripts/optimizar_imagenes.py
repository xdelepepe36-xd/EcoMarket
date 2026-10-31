"""
Script para optimizar imágenes y assets
Optimizado para no sobrecargar el sistema
"""

import os
import sys
from PIL import Image
import io

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'uploads')

def optimizar_imagen(input_path, calidad=85, max_ancho=1200):
    """Optimiza una imagen reduciendo calidad y tamaño"""
    try:
        # Abrir imagen
        img = Image.open(input_path)
        
        # Convertir a RGB si es necesario
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Redimensionar si es muy grande
        ancho, alto = img.size
        if ancho > max_ancho:
            ratio = max_ancho / ancho
            nuevo_alto = int(alto * ratio)
            img = img.resize((max_ancho, nuevo_alto), Image.Resampling.LANCZOS)
        
        # Guardar optimizado
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=calidad, optimize=True)
        size_original = os.path.getsize(input_path)
        size_optimizado = output.tell()
        
        # Escribir si hay mejora
        if size_optimizado < size_original:
            with open(input_path, 'wb') as f:
                f.write(output.getvalue())
            return True, size_original, size_optimizado
        
        return False, size_original, size_optimizado
    except Exception as e:
        print(f"[ERROR] Error optimizando {input_path}: {e}")
        return False, 0, 0

def optimizar_assets():
    """Optimiza todas las imágenes en uploads"""
    print("Optimizando imágenes en uploads...")
    
    if not os.path.exists(UPLOADS_DIR):
        print(f"[!] Directorio uploads no encontrado: {UPLOADS_DIR}")
        return
    
    imagenes = []
    for root, dirs, files in os.walk(UPLOADS_DIR):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                imagenes.append(os.path.join(root, file))
    
    print(f"Encontradas {len(imagenes)} imágenes")
    
    optimizadas = 0
    bytes_ahorrados = 0
    
    for img_path in imagenes:
        print(f"Optimizando: {os.path.basename(img_path)}")
        optimizada, original, optimizado = optimizar_imagen(img_path)
        
        if optimizada:
            optimizadas += 1
            bytes_ahorrados += (original - optimizado)
            ahorro_kb = (original - optimizado) / 1024
            print(f"  [OK] Ahorrado: {ahorro_kb:.2f} KB")
        else:
            print(f"  [-] Sin mejora")
    
    print(f"\nResumen:")
    print(f"Imágenes optimizadas: {optimizadas}/{len(imagenes)}")
    print(f"Bytes ahorrados: {bytes_ahorrados:,} ({bytes_ahorrados/1024/1024:.2f} MB)")

if __name__ == '__main__':
    optimizar_assets()
