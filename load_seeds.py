"""
EcoMarket - Cargar Productos Semilla
Script para cargar productos desde productos_seeds.json a la base de datos
"""
import sqlite3
import json
import os
import sys
from datetime import datetime

# Configurar encoding para Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Configuración
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'data', 'ecomarket.db')
SEEDS_PATH = os.path.join(BASE_DIR, 'data', 'productos_seeds.json')

def get_db():
    """Obtener conexión a la base de datos"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def load_seeds():
    """Cargar productos desde JSON a la base de datos"""
    # Verificar que existe el archivo de seeds
    if not os.path.exists(SEEDS_PATH):
        print(f"❌ Archivo de seeds no encontrado: {SEEDS_PATH}")
        return False
    
    # Leer archivo JSON
    with open(SEEDS_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    productos = data.get('productos', [])
    
    if not productos:
        print("❌ No hay productos en el archivo de seeds")
        return False
    
    conn = get_db()
    
    try:
        # Contar productos existentes
        count_before = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
        print(f"📊 Productos existentes: {count_before}")
        
        # Insertar productos
        inserted = 0
        updated = 0
        
        for prod in productos:
            # Convertir especificaciones a JSON
            especificaciones_json = json.dumps(prod.get('especificaciones', {}), ensure_ascii=False)
            
            # Verificar si el producto ya existe
            existing = conn.execute(
                'SELECT id FROM productos WHERE id = ?', 
                (prod['id'],)
            ).fetchone()
            
            if existing:
                # Actualizar producto existente
                conn.execute('''
                    UPDATE productos SET
                        nombre = ?,
                        categoria = ?,
                        precio = ?,
                        precio_original = ?,
                        descripcion = ?,
                        imagen = ?,
                        stock = ?,
                        condicion = ?,
                        etiquetas = ?,
                        eco_score = ?,
                        especificaciones = ?,
                        ubicacion = ?
                    WHERE id = ?
                ''', (
                    prod['nombre'],
                    prod['categoria'],
                    prod['precio'],
                    prod.get('precio_original'),
                    prod['descripcion'],
                    prod['imagen'],
                    prod['stock'],
                    prod['condicion'],
                    prod['etiquetas'],
                    prod['eco_score'],
                    especificaciones_json,
                    prod.get('ubicacion', ''),
                    prod['id']
                ))
                updated += 1
            else:
                # Insertar nuevo producto
                conn.execute('''
                    INSERT INTO productos (
                        id, nombre, categoria, precio, precio_original, 
                        descripcion, imagen, stock, condicion, etiquetas, 
                        eco_score, especificaciones, ubicacion, usuario_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    prod['id'],
                    prod['nombre'],
                    prod['categoria'],
                    prod['precio'],
                    prod.get('precio_original'),
                    prod['descripcion'],
                    prod['imagen'],
                    prod['stock'],
                    prod['condicion'],
                    prod['etiquetas'],
                    prod['eco_score'],
                    especificaciones_json,
                    prod.get('ubicacion', ''),
                    1  # usuario_id por defecto (admin)
                ))
                inserted += 1
        
        conn.commit()
        
        # Contar productos después
        count_after = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
        
        print(f"✅ Productos insertados: {inserted}")
        print(f"🔄 Productos actualizados: {updated}")
        print(f"📊 Total productos después: {count_after}")
        print(f"🌱 Eco-score promedio: {data['meta']['eco_score_promedio']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al cargar seeds: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    print("🌱 Cargando productos semilla en EcoMarket...")
    print("=" * 50)
    
    success = load_seeds()
    
    print("=" * 50)
    if success:
        print("✅ Productos cargados exitosamente")
    else:
        print("❌ Error al cargar productos")
