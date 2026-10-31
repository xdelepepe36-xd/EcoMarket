"""
Script simple para agregar productos en batch
"""

import sqlite3
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import DB_PATH, get_db

PRODUCTOS = [
    # Higiene
    ("Jabon Ecológico Lavanda", "Higiene", 12.50, "Jabón natural con aceites esenciales de lavanda", 50, 9),
    ("Champu Sólido Menta", "Higiene", 18.00, "Champú en barra de menta, libre de plástico", 40, 10),
    ("Acondicionador Lavanda", "Higiene", 15.00, "Acondicionador natural con esencias de lavanda", 60, 8),
    ("Cepillo de Bambú", "Higiene", 22.00, "Cepillo dental de bambú biodegradable", 35, 9),
    ("Hilo Dental Vegano", "Higiene", 8.00, "Hilo dental de cera de abeja con vidrio", 100, 10),
    ("Desodorante Piedra", "Higiene", 14.00, "Desodorante natural en barra de piedra de alumbre", 45, 9),
    ("Jabon Carbón Activado", "Higiene", 16.00, "Jabón con carbón activado para piel grasa", 55, 8),
    ("Aceite Corporal Coco", "Higiene", 28.00, "Aceite de coco virgen para hidratación", 30, 9),
    ("Crema Facial Aloe", "Higiene", 35.00, "Crema facial con aloe vera y vitamina E", 25, 8),
    ("Balsamo Labial Coco", "Higiene", 20.00, "Balsamo labial natural con cera de abeja", 40, 9),
    
    # Hogar
    ("Botella Vidrio 1L", "Hogar", 25.00, "Botella de vidrio reutilizable 1L", 50, 10),
    ("Pajas Bambú 100u", "Hogar", 18.00, "Pajitas de bambú biodegradables pack 100", 80, 10),
    ("Tupperware Vidrio", "Hogar", 45.00, "Set de 3 contenedores de vidrio herméticos", 30, 9),
    ("Toallas Microfibra", "Hogar", 55.00, "Set de 4 toallas de microfibra ecológica", 25, 8),
    ("Detergente Citricos", "Hogar", 32.00, "Detergente biodegradable con aroma cítricos 1L", 40, 9),
    ("Esponja Lana Veg", "Hogar", 22.00, "Esponja natural de lana vegetal compostable", 60, 10),
    ("Kit Bambú Cocina", "Hogar", 68.00, "Set de utensilios de cocina de bambú", 20, 9),
    ("Sacabocados Algodón", "Hogar", 45.00, "Sacabocados de algodón orgánico", 35, 9),
    ("Bolsas Compostaje", "Hogar", 35.00, "Set de 3 bolsas compostables", 40, 10),
    ("Portavas Tela", "Hogar", 28.00, "Portavas reutilizables de tela impermeable", 50, 9),
    
    # Alimentación
    ("Huevos Granja", "Alimentación", 15.00, "Docena de huevos de gallinas de pastoreo", 30, 10),
    ("Miel Silvestre", "Alimentación", 45.00, "Miel cruda de abejas silvestres sin procesar", 20, 10),
    ("Cafe Orgánico", "Alimentación", 38.00, "Café en grano orgánico Fair Trade 500g", 25, 9),
    ("Te Verde Hojas", "Alimentación", 28.00, "Té verde orgánico en hojas sueltas 200g", 40, 9),
    ("Pasta Integral", "Alimentación", 12.00, "Pasta de trigo integral orgánica", 50, 8),
    ("Aceite Oliva", "Alimentación", 55.00, "Aceite de oliva virgen extra en vidrio 500ml", 15, 10),
    ("Frutos Secos Mix", "Alimentación", 35.00, "Mix de frutos secos orgánicos 500g", 25, 9),
    ("Pan Masa Madre", "Alimentación", 18.00, "Pan de masa madre artesanal 24h fermentación", 40, 9),
    ("Leche Almendras", "Alimentación", 22.00, "Leche de almendras sin azúcar en vidrio 1L", 30, 9),
    ("Yogur Natural", "Alimentación", 14.00, "Yogur natural en pot de vidrio reutilizable", 35, 8),
    
    # Ropa
    ("Camiseta Algodón", "Ropa", 45.00, "Camiseta de algodón orgánico certificado", 20, 9),
    ("Jeans Reciclado", "Ropa", 85.00, "Jeans hechos de algodón reciclado", 15, 8),
    ("Calcetines Lana", "Ropa", 22.00, "Calcetines de lana merino transpirables", 30, 9),
    ("Zapatillas Corcho", "Ropa", 95.00, "Zapatillas de corcho vegano biodegradables", 12, 10),
    ("Gorra Bambú", "Ropa", 25.00, "Gorra hecha de fibras de bambú", 35, 9),
    ("Bolso Tela Reciclada", "Ropa", 55.00, "Bolso hecho de tela reciclada", 18, 10),
    ("Bufanda Alpaca", "Ropa", 75.00, "Bufanda tejida a mano con lana de alpaca", 10, 10),
    ("Chaleco Lana", "Ropa", 120.00, "Chaleco de lana de oveja sin crueldad", 8, 10),
    ("Cinturon Cuero Veg", "Ropa", 48.00, "Cinturón de cuero vegano de piña", 20, 9),
    ("Pantalon Lino", "Ropa", 65.00, "Pantalón de lino orgánico transpirable", 15, 9),
    
    # Jardín
    ("Maceta Bambú", "Jardín", 28.00, "Maceta de bambú con bandeja de drenaje", 25, 10),
    ("Semillas Tomate", "Jardín", 18.00, "Semillas de tomate de variedades heirloom", 40, 10),
    ("Compostera Terracota", "Jardín", 55.00, "Compostera de terracota con tapa", 20, 9),
    ("Guante Bambú", "Jardín", 22.00, "Guante de jardín resistente de bambú", 30, 9),
    ("Kit Cultivo", "Jardín", 35.00, "Kit completo para cultivar tomates en maceta", 25, 9),
    ("Fertilizante Org", "Jardín", 42.00, "Fertilizante orgánico 100% natural 2kg", 20, 9),
    ("Tijeras Poda", "Jardín", 38.00, "Tijeras de poda profesional acero inoxidable", 15, 8),
    ("Riego Goteo", "Jardín", 65.00, "Sistema de riego por goteo con programador", 10, 8),
    ("Tierra Orgánica", "Jardín", 25.00, "Tierra orgánica universal 20L", 30, 9),
    ("Maceta Cerámica", "Jardín", 48.00, "Maceta de cerámica hecha a mano", 12, 9),
    
    # Accesorios
    ("Mochila Cordel", "Accesorios", 85.00, "Mochila hecha de cordel reciclado", 10, 10),
    ("Mochila Yute", "Accesorios", 45.00, "Mochila de yute 100% natural", 20, 10),
    ("Botella Termica", "Accesorios", 32.00, "Botella térmica de acero inoxidable", 25, 9),
    ("Taza Cerámica", "Accesorios", 18.00, "Taza de cerámica con tapa de bambú", 40, 9),
    ("Kit Cubiertos", "Accesorios", 52.00, "Set de cubiertos de bambú con estuche", 18, 9),
    ("Funda Laptop", "Accesorios", 35.00, "Funda de laptop de fieltro reciclado", 22, 10),
    ("Gafas Bambú", "Accesorios", 45.00, "Gafas de sol con montura de bambú", 15, 9),
    ("Power Bank Solar", "Accesorios", 68.00, "Power bank con panel solar integrado", 12, 10),
    ("Lampara Lectura", "Accesorios", 75.00, "Lámpara de lectura que se carga con sol", 10, 10),
    ("Cargador USB Solar", "Accesorios", 88.00, "Cargador USB solar plegable", 8, 10),
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