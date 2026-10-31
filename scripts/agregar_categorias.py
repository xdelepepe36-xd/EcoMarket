"""
Script para agregar nuevas categorías de productos
Optimizado para no sobrecargar el sistema
"""

import sqlite3
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import DB_PATH, get_db

NUEVAS_CATEGORIAS = [
    "Deportes",
    "Juguetes",
    "Arte",
    "Mascotas",
    "Bebés",
    "Papelería",
    "Música",
    "Electrodomésticos",
    "Herramientas",
    "Muebles"
]

def agregar_categorias():
    print("Conectando a la base de datos...")
    conn = get_db()
    
    categorias_existentes = {row[0] for row in conn.execute('SELECT nombre FROM categorias').fetchall()}
    print(f"Categorías existentes: {len(categorias_existentes)}")
    
    categorias_agregadas = 0
    
    for categoria in NUEVAS_CATEGORIAS:
        if categoria in categorias_existentes:
            print(f"[!] {categoria} ya existe, saltando...")
            continue
        
        try:
            conn.execute('''
                INSERT INTO categorias (nombre, descripcion)
                VALUES (?, ?)
            ''', (categoria, f"Productos de {categoria} sostenibles y ecológicos"))
            categorias_agregadas += 1
            print(f"[OK] Categoría {categoria} agregada")
        except Exception as e:
            print(f"[ERROR] Error agregando {categoria}: {e}")
    
    conn.commit()
    
    categorias_finales = conn.execute('SELECT COUNT(*) FROM categorias').fetchone()[0]
    print(f"\nCategorías finales: {categorias_finales}")
    print(f"Categorías agregadas: {categorias_agregadas}")
    
    conn.close()
    print("\nCategorías agregadas exitosamente!")

if __name__ == '__main__':
    agregar_categorias()
