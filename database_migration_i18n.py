"""
EcoMarket - Migración de Base de Datos para Soporte Multiidioma
Script para agregar soporte de idiomas en productos y contenido
"""
import sqlite3
import os
import json
from datetime import datetime

# Configuración
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'data', 'ecomarket.db')

def migrate_database():
    """Ejecuta la migración para soporte multiidioma"""
    
    print("🌍 Iniciando migración para soporte multiidioma...")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        
        # Paso 1: Agregar columnas de idioma a la tabla productos
        print("\n📝 Agregando columnas de idioma a tabla productos...")
        
        # Columnas para nombre en diferentes idiomas
        columns_to_add = [
            "nombre_en TEXT",
            "nombre_pt TEXT", 
            "nombre_fr TEXT",
            "nombre_de TEXT",
            "nombre_it TEXT",
            "descripcion_en TEXT",
            "descripcion_pt TEXT",
            "descripcion_fr TEXT",
            "descripcion_de TEXT",
            "descripcion_it TEXT",
            "idiomas_disponibles TEXT DEFAULT 'es'"  # JSON array de idiomas disponibles
        ]
        
        for column in columns_to_add:
            try:
                conn.execute(f"ALTER TABLE productos ADD COLUMN {column}")
                print(f"  ✓ Columna agregada: {column}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"  ⊘ Columna ya existe: {column}")
                else:
                    print(f"  ✗ Error agregando {column}: {e}")
        
        # Paso 2: Crear tabla de traducciones de categorías
        print("\n📝 Creando tabla de traducciones de categorías...")
        
        conn.execute('''
            CREATE TABLE IF NOT EXISTS categoria_traducciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                categoria_id TEXT NOT NULL,
                idioma TEXT NOT NULL,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(categoria_id, idioma),
                FOREIGN KEY (categoria_id) REFERENCES productos(categoria) ON DELETE CASCADE
            )
        ''')
        print("  ✓ Tabla categoria_traducciones creada")
        
        # Paso 3: Crear tabla de traducciones de contenido estático
        print("\n📝 Creando tabla de traducciones de contenido...")
        
        conn.execute('''
            CREATE TABLE IF NOT EXISTS contenido_traducciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                clave TEXT NOT NULL,
                idioma TEXT NOT NULL,
                valor TEXT NOT NULL,
                contexto TEXT DEFAULT 'general',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(clave, idioma)
            )
        ''')
        print("  ✓ Tabla contenido_traducciones creada")
        
        # Paso 4: Insertar traducciones iniciales de categorías
        print("\n📝 Insertando traducciones iniciales de categorías...")
        
        categorias = ['Hogar', 'Accesorios', 'Higiene', 'Jardín', 'Alimentación', 'Ropa']
        
        traducciones_categorias = {
            'Hogar': {
                'en': 'Home',
                'pt': 'Lar',
                'fr': 'Maison',
                'de': 'Haushalt',
                'it': 'Casa'
            },
            'Accesorios': {
                'en': 'Accessories',
                'pt': 'Acessórios',
                'fr': 'Accessoires',
                'de': 'Zubehör',
                'it': 'Accessori'
            },
            'Higiene': {
                'en': 'Hygiene',
                'pt': 'Higiene',
                'fr': 'Hygiène',
                'de': 'Hygiene',
                'it': 'Igiene'
            },
            'Jardín': {
                'en': 'Garden',
                'pt': 'Jardim',
                'fr': 'Jardin',
                'de': 'Garten',
                'it': 'Giardino'
            },
            'Alimentación': {
                'en': 'Food',
                'pt': 'Alimentação',
                'fr': 'Alimentation',
                'de': 'Lebensmittel',
                'it': 'Alimentazione'
            },
            'Ropa': {
                'en': 'Clothing',
                'pt': 'Roupa',
                'fr': 'Vêtements',
                'de': 'Kleidung',
                'it': 'Abbigliamento'
            }
        }
        
        for categoria, traducciones in traducciones_categorias.items():
            for idioma, traduccion in traducciones.items():
                try:
                    conn.execute('''
                        INSERT OR IGNORE INTO categoria_traducciones 
                        (categoria_id, idioma, nombre, descripcion)
                        VALUES (?, ?, ?, ?)
                    ''', (categoria, idioma, traduccion, f'Categoría de {categoria} en {idioma}'))
                except sqlite3.Error as e:
                    print(f"  ✗ Error insertando traducción {categoria}-{idioma}: {e}")
        
        print("  ✓ Traducciones de categorías insertadas")
        
        # Paso 5: Insertar traducciones de contenido estático
        print("\n📝 Insertando traducciones de contenido estático...")
        
        # Traducciones de navegación
        traducciones_contenido = {
            'nav.home': {
                'es': 'Inicio',
                'en': 'Home',
                'pt': 'Início',
                'fr': 'Accueil',
                'de': 'Startseite',
                'it': 'Home'
            },
            'nav.products': {
                'es': 'Productos',
                'en': 'Products',
                'pt': 'Produtos',
                'fr': 'Produits',
                'de': 'Produkte',
                'it': 'Prodotti'
            },
            'nav.favorites': {
                'es': 'Favoritos',
                'en': 'Favorites',
                'pt': 'Favoritos',
                'fr': 'Favoris',
                'de': 'Favoriten',
                'it': 'Preferiti'
            },
            'nav.cart': {
                'es': 'Carrito',
                'en': 'Cart',
                'pt': 'Carrinho',
                'fr': 'Panier',
                'de': 'Warenkorb',
                'it': 'Carrello'
            },
            'nav.publish': {
                'es': 'Publicar',
                'en': 'Publish',
                'pt': 'Publicar',
                'fr': 'Publier',
                'de': 'Veröffentlichen',
                'it': 'Pubblica'
            }
        }
        
        for clave, traducciones in traducciones_contenido.items():
            for idioma, valor in traducciones.items():
                try:
                    conn.execute('''
                        INSERT OR IGNORE INTO contenido_traducciones 
                        (clave, idioma, valor, contexto)
                        VALUES (?, ?, ?, 'navigation')
                    ''', (clave, idioma, valor))
                except sqlite3.Error as e:
                    print(f"  ✗ Error insertando traducción {clave}-{idioma}: {e}")
        
        print("  ✓ Traducciones de contenido insertadas")
        
        # Paso 6: Crear índices para optimizar búsquedas
        print("\n📝 Creando índices para optimización...")
        
        indices = [
            "CREATE INDEX IF NOT EXISTS idx_productos_nombre_en ON productos(nombre_en)",
            "CREATE INDEX IF NOT EXISTS idx_productos_nombre_pt ON productos(nombre_pt)",
            "CREATE INDEX IF NOT EXISTS idx_productos_nombre_fr ON productos(nombre_fr)",
            "CREATE INDEX IF NOT EXISTS idx_productos_nombre_de ON productos(nombre_de)",
            "CREATE INDEX IF NOT EXISTS idx_productos_nombre_it ON productos(nombre_it)",
            "CREATE INDEX IF NOT EXISTS idx_categoria_traducciones_categoria ON categoria_traducciones(categoria_id)",
            "CREATE INDEX IF NOT EXISTS idx_categoria_traducciones_idioma ON categoria_traducciones(idioma)",
            "CREATE INDEX IF NOT EXISTS idx_contenido_traducciones_clave ON contenido_traducciones(clave)",
            "CREATE INDEX IF NOT EXISTS idx_contenido_traducciones_idioma ON contenido_traducciones(idioma)"
        ]
        
        for index_sql in indices:
            try:
                conn.execute(index_sql)
                print(f"  ✓ Índice creado")
            except sqlite3.Error as e:
                print(f"  ✗ Error creando índice: {e}")
        
        # Paso 7: Actualizar productos existentes con traducciones por defecto
        print("\n📝 Actualizando productos existentes con traducciones por defecto...")
        
        productos = conn.execute('SELECT id, nombre, descripcion FROM productos').fetchall()
        
        for producto in productos:
            producto_id = producto['id']
            nombre_es = producto['nombre']
            descripcion_es = producto['descripcion']
            
            # Actualizar idiomas disponibles
            idiomas_disp = json.dumps(['es'])
            conn.execute('UPDATE productos SET idiomas_disponibles = ? WHERE id = ?', 
                       (idiomas_disp, producto_id))
            
            # Copiar nombre español a otros idiomas como fallback
            try:
                conn.execute('UPDATE productos SET nombre_en = ? WHERE id = ?', 
                           (nombre_es, producto_id))
                conn.execute('UPDATE productos SET nombre_pt = ? WHERE id = ?', 
                           (nombre_es, producto_id))
                conn.execute('UPDATE productos SET nombre_fr = ? WHERE id = ?', 
                           (nombre_es, producto_id))
                conn.execute('UPDATE productos SET nombre_de = ? WHERE id = ?', 
                           (nombre_es, producto_id))
                conn.execute('UPDATE productos SET nombre_it = ? WHERE id = ?', 
                           (nombre_es, producto_id))
                
                conn.execute('UPDATE productos SET descripcion_en = ? WHERE id = ?', 
                           (descripcion_es, producto_id))
                conn.execute('UPDATE productos SET descripcion_pt = ? WHERE id = ?', 
                           (descripcion_es, producto_id))
                conn.execute('UPDATE productos SET descripcion_fr = ? WHERE id = ?', 
                           (descripcion_es, producto_id))
                conn.execute('UPDATE productos SET descripcion_de = ? WHERE id = ?', 
                           (descripcion_es, producto_id))
                conn.execute('UPDATE productos SET descripcion_it = ? WHERE id = ?', 
                           (descripcion_es, producto_id))
                
                print(f"  ✓ Producto {producto_id} actualizado")
            except sqlite3.Error as e:
                print(f"  ✗ Error actualizando producto {producto_id}: {e}")
        
        conn.commit()
        conn.close()
        
        print("\n✅ Migración completada exitosamente!")
        print("\n📊 Resumen:")
        print("  • Columnas de idioma agregadas a productos")
        print("  • Tabla de traducciones de categorías creada")
        print("  • Tabla de traducciones de contenido creada")
        print("  • Traducciones iniciales insertadas")
        print("  • Índices de optimización creados")
        print("  • Productos existentes actualizados")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        if 'conn' in locals():
            conn.close()
        return False


def rollback_migration():
    """Revierte la migración en caso de error"""
    
    print("\n🔄 Iniciando rollback de la migración...")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        
        # Eliminar columnas de idioma
        columns_to_remove = [
            "nombre_en", "nombre_pt", "nombre_fr", "nombre_de", "nombre_it",
            "descripcion_en", "descripcion_pt", "descripcion_fr", "descripcion_de", "descripcion_it",
            "idiomas_disponibles"
        ]
        
        for column in columns_to_remove:
            try:
                conn.execute(f"ALTER TABLE productos DROP COLUMN {column}")
                print(f"  ✓ Columna eliminada: {column}")
            except sqlite3.OperationalError as e:
                print(f"  ⊘ Error eliminando {column}: {e}")
        
        # Eliminar tablas de traducciones
        conn.execute('DROP TABLE IF EXISTS categoria_traducciones')
        print("  ✓ Tabla categoria_traducciones eliminada")
        
        conn.execute('DROP TABLE IF EXISTS contenido_traducciones')
        print("  ✓ Tabla contenido_traducciones eliminada")
        
        conn.commit()
        conn.close()
        
        print("\n✅ Rollback completado exitosamente!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error durante el rollback: {e}")
        if 'conn' in locals():
            conn.close()
        return False


def show_migration_status():
    """Muestra el estado actual de la migración"""
    
    print("\n📊 Estado actual de la migración:")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        
        # Verificar columnas en productos
        cursor = conn.execute("PRAGMA table_info(productos)")
        columns = cursor.fetchall()
        
        has_i18n_columns = any(col['name'] in ['nombre_en', 'nombre_pt', 'nombre_fr'] for col in columns)
        
        print(f"  • Tabla productos tiene columnas i18n: {'Sí' if has_i18n_columns else 'No'}")
        
        # Verificar tablas de traducciones
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row['name'] for row in cursor.fetchall()]
        
        print(f"  • Tabla categoria_traducciones existe: {'Sí' if 'categoria_traducciones' in tables else 'No'}")
        print(f"  • Tabla contenido_traducciones existe: {'Sí' if 'contenido_traducciones' in tables else 'No'}")
        
        # Contar traducciones
        if 'categoria_traducciones' in tables:
            count = conn.execute('SELECT COUNT(*) as count FROM categoria_traducciones').fetchone()['count']
            print(f"  • Traducciones de categorías: {count}")
        
        if 'contenido_traducciones' in tables:
            count = conn.execute('SELECT COUNT(*) as count FROM contenido_traducciones').fetchone()['count']
            print(f"  • Traducciones de contenido: {count}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error verificando estado: {e}")


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'migrate':
            migrate_database()
        elif command == 'rollback':
            rollback_migration()
        elif command == 'status':
            show_migration_status()
        else:
            print("Comando no reconocido. Usos:")
            print("  python database_migration_i18n.py migrate  - Ejecutar migración")
            print("  python database_migration_i18n.py rollback - Revertir migración")
            print("  python database_migration_i18n.py status   - Ver estado")
    else:
        print("EcoMarket - Migración de Base de Datos para Soporte Multiidioma")
        print("\nUso:")
        print("  python database_migration_i18n.py migrate  - Ejecutar migración")
        print("  python database_migration_i18n.py rollback - Revertir migración")
        print("  python database_migration_i18n.py status   - Ver estado")
        print("\nComandos disponibles:")
        print("  migrate   - Ejecuta la migración completa")
        print("  rollback   - Revierte todos los cambios")
        print("  status    - Muestra el estado actual de la migración")