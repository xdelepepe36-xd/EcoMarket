"""
Script para agregar más productos (Batch 2)
"""

import sqlite3
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import DB_PATH, get_db

PRODUCTOS = [
    # Más Higiene
    ("Jabon Marsella", "Higiene", 20.00, "Jabón de Marsella tradicional al 72%", 40, 9),
    ("Esponja Konjac", "Higiene", 25.00, "Esponja de konjac japonesa para limpieza", 35, 10),
    ("Aceite Arbol Te", "Higiene", 32.00, "Aceite esencial de árbol de té purificador", 25, 9),
    ("Mascarilla Arcilla", "Higiene", 18.00, "Mascarilla facial de arcilla rosa pura", 45, 10),
    ("Balsamo Cacao", "Higiene", 24.00, "Balsamo labial de cacao crudo nutritivo", 30, 9),
    ("Jabon Calendula", "Higiene", 15.00, "Jabón de caléndula para pieles sensibles", 55, 9),
    ("Desodorante Lavanda", "Higiene", 16.00, "Desodorante roll-on de lavanda en vidrio", 40, 9),
    ("Acondicionador Eucalipto", "Higiene", 14.00, "Acondicionador natural de eucalipto y menta", 50, 8),
    ("Aceite Jojoba", "Higiene", 35.00, "Aceite de jojoba para piel seca", 20, 9),
    ("Crema Rosa Mosqueta", "Higiene", 42.00, "Crema nocturna con rosa mosqueta y vitamina E", 18, 8),
    
    # Más Hogar
    ("Dispensador Jabon", "Hogar", 28.00, "Dispensador de jabón de bambú", 30, 9),
    ("Frascos Vidrio", "Hogar", 75.00, "Set de 6 frascos de vidrio con tapa hermética", 15, 9),
    ("Utensilios Bambú", "Hogar", 72.00, "Set completo de utensilios de bambú", 12, 9),
    ("Esponja Luffa", "Hogar", 28.00, "Esponja de luffa orgánica absorbente", 45, 10),
    ("Toallas Lino", "Hogar", 68.00, "Toallas de lino orgánico suaves", 18, 9),
    ("Detergente Concentrado", "Hogar", 45.00, "Detergente líquido concentrado 1L = 20L", 25, 9),
    ("Organizador Cajones", "Hogar", 85.00, "Organizador de cajones de madera recuperada", 12, 10),
    ("Pelota Lana", "Hogar", 15.00, "Pelota de lana natural para secar ropa", 50, 10),
    ("Colgador Bambú", "Hogar", 38.00, "Colgador de ropa de bambú plegable", 22, 9),
    ("Contenedores Bambú", "Hogar", 55.00, "Set de 5 contenedores de bambú impermeables", 20, 9),
    
    # Más Alimentación
    ("Avena Orgánica", "Alimentación", 18.00, "Avena orgánica en grano rica en proteínas", 35, 9),
    ("Miel Propoleo", "Alimentación", 38.00, "Miel de abeja con propóleo crudo", 22, 10),
    ("Choco Negro 70%", "Alimentación", 28.00, "Chocolate negro 70% cacao Fair Trade", 30, 9),
    ("Te Rooibos", "Alimentación", 32.00, "Té rooibos orgánico antioxidante sin cafeína", 25, 9),
    ("Arroz Integral", "Alimentación", 16.00, "Arroz integral basmati orgánico sin gluten", 40, 9),
    ("Aceite Coco", "Alimentación", 65.00, "Aceite de coco virgen extra 1L en vidrio", 12, 10),
    ("Frutos Premium", "Alimentación", 42.00, "Mix premium de frutos secos 500g", 18, 9),
    ("Pan Centeno", "Alimentación", 22.00, "Pan de centeno 100% integral sin levadura", 28, 10),
    ("Leche Avena", "Alimentación", 24.00, "Leche de avena natural sin azúcar 1L", 32, 9),
    ("Salsa Tomate", "Alimentación", 16.00, "Salsa de tomate orgánica en vidrio 250ml", 45, 9),
    ("Mante Mani", "Alimentación", 38.00, "Mante de maní orgánico sin sal 500g", 20, 10),
    
    # Más Ropa
    ("Camiseta Lino", "Ropa", 52.00, "Camiseta de lino orgánico transpirable", 18, 9),
    ("Vestido Algodón", "Ropa", 95.00, "Vestido de algodón crudo sin teñir", 12, 10),
    ("Sueter Lana Reciclada", "Ropa", 68.00, "Suéter hecho de lana reciclada", 15, 9),
    ("Zapatos Corcho", "Ropa", 125.00, "Zapatos de corcho vegano cómodos", 8, 10),
    ("Gorra Algodón", "Ropa", 28.00, "Gorra de algodón orgánico transpirable", 30, 9),
    ("Cartera Cuero Veg", "Ropa", 78.00, "Cartera de cuero vegano de hongo", 10, 10),
    ("Bufanda Alpaca 2", "Ropa", 95.00, "Bufanda de lana de alpaca súper suave", 8, 10),
    ("Pantalon Cargo", "Ropa", 72.00, "Pantalón cargo de algodón orgánico", 15, 9),
    ("Cinturon Hemp", "Ropa", 55.00, "Cinturón de cáñamo orgánico duradero", 18, 10),
    ("Vestido Seda Rec", "Ropa", 110.00, "Vestido de seda reciclada diseño único", 6, 10),
    
    # Más Jardín
    ("Maceta Bambú Grande", "Jardín", 38.00, "Maceta grande de bambú para plantas grandes", 18, 10),
    ("Bomba Riego Solar", "Jardín", 120.00, "Bomba de riego solar con panel", 8, 10),
    ("Semillas Flores", "Jardín", 20.00, "Pack de semillas de flores variadas", 35, 10),
    ("Invernadero Bambú", "Jardín", 180.00, "Invernadero de bambú 2x2m", 5, 10),
    ("Sustrato Universal", "Jardín", 28.00, "Sustrato orgánico universal 10L", 25, 9),
    ("Pala Bambú", "Jardín", 32.00, "Pala de jardín de bambú ligera ergonómica", 20, 9),
    ("Aspersor Reciclado", "Jardín", 25.00, "Aspersor hecho de plástico reciclado", 22, 9),
    ("Kit Propagacion", "Jardín", 18.00, "Kit con cubetas de papel y tierra", 30, 9),
    ("Hidroponia Bambú", "Jardín", 95.00, "Sistema hidropónico de bambú 6 plantas", 10, 10),
    ("Lampara UV", "Jardín", 78.00, "Lámpara UV para plantas 15W", 12, 8),
    
    # Más Accesorios
    ("Mochila Cuero Veg", "Accesorios", 95.00, "Mochila de cuero vegano de piña", 10, 10),
    ("Gafas Polarizadas", "Accesorios", 52.00, "Gafas de sol polarizadas montura bambú", 18, 9),
    ("Botella Acero", "Accesorios", 38.00, "Botella térmica de acero inoxidable 24h", 22, 9),
    ("Cubiertos Premium", "Accesorios", 65.00, "Set premium de cubiertos de bambú", 15, 9),
    ("Lampara LED Mesa", "Accesorios", 42.00, "Lámpara LED de mesa USB recargable", 20, 8),
    ("Cargador Solar Doble", "Accesorios", 95.00, "Cargador solar plegable doble panel 20k", 8, 10),
    ("Laptop Solar", "Accesorios", 85.00, "Carcasa de laptop con panel solar", 10, 10),
    ("Bolsa Lino", "Accesorios", 28.00, "Bolsa de compras de lino resistente", 35, 9),
    ("Utensilios Viaje", "Accesorios", 45.00, "Set de utensilios de viaje de bambú", 18, 9),
    ("Botella Filtrante", "Accesorios", 35.00, "Botella de agua con filtro carbón activado", 25, 9),
    ("Taza Japonesa", "Accesorios", 22.00, "Taza de cerámica japonesa tradicional", 28, 9),
    
    # Libros (nueva categoría)
    ("Guia Cultivo Eco", "Libros", 35.00, "Guía completa para cultivar huerto ecológico", 20, 9),
    ("Recetas Cero Residuos", "Libros", 42.00, "Libro de recetas sin generar residuos", 15, 9),
    ("Guia Vida Sostenible", "Libros", 38.00, "Guía práctica para vivir sostenible", 18, 9),
    ("Compostaje Principiantes", "Libros", 28.00, "Libro sobre compostaje fácil", 25, 9),
    ("Jardin Urbano", "Libros", 32.00, "Libro sobre jardinería urbana", 22, 9),
    ("Recetas Plantas Nativas", "Libros", 30.00, "Libro de recetas con plantas nativas", 18, 10),
    ("DIY Ecologico", "Libros", 35.00, "20 proyectos ecológicos fáciles", 20, 9),
    ("Consumo Consciente", "Libros", 28.00, "Guía para consumo consciente", 15, 9),
    ("Permacultura Todos", "Libros", 45.00, "Introducción a la permacultura urbana", 12, 9),
    ("Energia Solar Casa", "Libros", 55.00, "Guía para instalar energía solar", 10, 9),
    ("Cocina Estacion", "Libros", 32.00, "Libro de cocina estacional local", 18, 9),
    ("Recetas Veganas", "Libros", 38.00, "Libro de recetas veganas peruanas", 15, 10),
    
    # Tecnología Ecológica (nueva categoría)
    ("Cargador Solar 10W", "Tecnología", 85.00, "Panel solar 10W con regulador USB", 12, 10),
    ("Lampara Solar LED", "Tecnología", 45.00, "Lámpara solar LED 5W se carga con luz", 20, 10),
    ("Kit Solar Basico", "Tecnología", 450.00, "Kit solar 100W + regulador + batería 50Ah", 5, 10),
    ("Monitor Energia", "Tecnología", 120.00, "Monitor consumo energía tiempo real WiFi", 8, 9),
    ("Termostato Inteligente", "Tecnología", 85.00, "Termostato inteligente ahorra 30%", 15, 9),
    ("Interruptor Remoto", "Tecnología", 35.00, "Enchufe inteligente apaga dispositivos", 25, 8),
    ("Sensor Agua", "Tecnología", 55.00, "Sensor de agua detecta fugas", 12, 9),
    ("Cargador 20Ah", "Tecnología", 150.00, "Cargador solar plegable 20Ah QC 3.0", 6, 10),
    ("Lampara Solar Ext", "Tecnología", 75.00, "Lámpara solar exterior sensor movimiento", 10, 9),
    ("Kit Domotico", "Tecnología", 280.00, "Kit domótico 4 enchufes + hub WiFi", 5, 8),
]

def agregar_productos():
    print("Conectando a la base de datos...")
    conn = get_db()
    
    productos_existentes = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    print(f"Productos existentes: {productos_existentes}")
    
    productos_agregados = 0
    productos_existentes_nombres = {row[0] for row in conn.execute('SELECT nombre FROM productos').fetchall()}
    
    for prod in PRODUCTOS:
        nombre, categoria, precio, descripcion, stock, eco_score = prod
        
        if nombre in productos_existentes_nombres:
            print(f"[!] {nombre} ya existe, saltando...")
            continue
        
        try:
            conn.execute('''
                INSERT INTO productos (nombre, categoria, precio, descripcion, stock, eco_score, condicion, usuario_id)
                VALUES (?, ?, ?, ?, ?, ?, 'nuevo', NULL)
            ''', (nombre, categoria, precio, descripcion, stock, eco_score))
            productos_agregados += 1
            print(f"[OK] {nombre} agregado")
        except Exception as e:
            print(f"[ERROR] Error agregando {nombre}: {e}")
    
    conn.commit()
    
    productos_finales = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    print(f"\nProductos finales: {productos_finales}")
    print(f"Productos agregados: {productos_agregados}")
    
    conn.close()
    print("\nProductos agregados exitosamente!")

if __name__ == '__main__':
    agregar_productos()