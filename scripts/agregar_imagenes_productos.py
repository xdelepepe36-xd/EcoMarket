"""
Script para agregar imágenes a los productos
"""

import sqlite3
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import DB_PATH, get_db

# Mapeo de imágenes por categoría
IMAGENES_CATEGORIA = {
    "Higiene": [
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop",
    ],
    "Hogar": [
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop",
    ],
    "Alimentación": [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400&h=400&fit=crop",
    ],
    "Ropa": [
        "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop",
    ],
    "Jardín": [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1591955506264-3f8a9e8d5b42?w=400&h=400&fit=crop",
    ],
    "Accesorios": [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400&h=400&fit=crop",
    ],
    "Libros": [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop",
    ],
    "Tecnología": [
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop",
    ],
}

def agregar_imagenes():
    print("Conectando a la base de datos...")
    conn = get_db()
    
    # Obtener productos sin imagen
    productos_sin_imagen = conn.execute('''
        SELECT id, nombre, categoria FROM productos 
        WHERE imagen = '' OR imagen IS NULL
    ''').fetchall()
    
    print(f"Productos sin imagen: {len(productos_sin_imagen)}")
    
    actualizados = 0
    import random
    
    for prod in productos_sin_imagen:
        prod_id, nombre, categoria = prod
        
        # Obtener imagen de la categoría
        if categoria in IMAGENES_CATEGORIA:
            imagenes = IMAGENES_CATEGORIA[categoria]
            imagen = random.choice(imagenes)
        else:
            # Imagen por defecto
            imagen = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop"
        
        try:
            conn.execute('UPDATE productos SET imagen = ? WHERE id = ?', (imagen, prod_id))
            actualizados += 1
            print(f"[OK] {nombre} -> {imagen[:50]}...")
        except Exception as e:
            print(f"[ERROR] Error actualizando {nombre}: {e}")
    
    conn.commit()
    
    print(f"\nProductos actualizados: {actualizados}")
    conn.close()
    print("\nImagenes agregadas exitosamente!")

if __name__ == '__main__':
    agregar_imagenes()