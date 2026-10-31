"""
Script para agregar 50 productos adicionales (Batch 3)
Optimizado para no sobrecargar el sistema
"""

import sqlite3
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import DB_PATH, get_db

PRODUCTOS = [
    # Más Higiene
    ("Jabon Cafe Miel", "Higiene", 22.00, "Jabón con miel y café orgánico. Hidratante y aromático.", 40, 9),
    ("Champu Rosa Mosqueta", "Higiene", 20.00, "Champú sólido con extracto de rosa mosqueta. 80 lavados.", 35, 9),
    ("Pasta Dental Carbon", "Higiene", 15.00, "Pasta dental de carbón activado. Blanqueador natural.", 60, 9),
    ("Enjuague Bucal Salvia", "Higiene", 18.00, "Enjuague bucal de salvia orgánica. Fresco y natural.", 45, 9),
    ("Aceite Corporal Rosa", "Higiene", 35.00, "Aceite corporal de rosa mosqueta y vitamina E. Regenerador.", 25, 9),
    ("Balsamo Labial Coco Rosa", "Higiene", 22.00, "Bálsamo labial de coco y rosa mosqueta. Nutritivo.", 35, 9),
    ("Jabon Avena", "Higiene", 16.00, "Jabón con avena y exfoliante suave. Para pieles sensibles.", 50, 9),
    ("Mascarilla Arcilla Azul", "Higiene", 20.00, "Mascarilla facial de arcilla azul con propiedades calmantes.", 40, 9),
    ("Aceite Tea Tree", "Higiene", 28.00, "Aceite de árbol de té para piel grasa con acné.", 30, 9),
    ("Desodorante Limon", "Higiene", 16.00, "Desodorante natural en barra de limón. Fresco y cítrico.", 45, 9),
    
    # Más Hogar
    ("Botella Acero Inox", "Hogar", 30.00, "Botella de acero inoxidable 500ml. Duradera y ecológica.", 30, 10),
    ("Kit Vasos Reciclados", "Hogar", 55.00, "Set de 6 vasos de vidrio reciclado. Elegantes.", 25, 10),
    ("Servilletas Bambú", "Hogar", 42.00, "Set de 6 servilletas de bambú. Calidad premium.", 20, 10),
    ("Platos Hoja Palma", "Hogar", 48.00, "Set de 4 platos de hoja de palma biodegradable.", 18, 10),
    ("Taza Cerámica Hecha a Mano", "Hogar", 28.00, "Taza de cerámica artesanal de 350ml. Diseño único.", 30, 9),
    ("Almohada Lino", "Hogar", 65.00, "Almohada de lino orgánico con funda de cáñamo.", 15, 10),
    ("Manta Organica", "Hogar", 85.00, "Manta de algodón orgánico y lino crudo. Suave y fresca.", 12, 10),
    ("Cojines Lana", "Hogar", 35.00, "Par de cojines de lana merino. Térmicos y transpirables.", 20, 9),
    ("Sillón Hecho a Mano", "Hogar", 450.00, "Sillón de madera recuperada hecho a mano. Ecológico.", 5, 10),
    ("Lámpara Bambú", "Hogar", 95.00, "Lámpara de bambú con pantalla táctil. LED cálido.", 8, 10),
    
    # Más Alimentación
    ("Te Matcha Latte", "Alimentación", 32.00, "Té matcha latte orgánico sin azúcar en vidrio 500ml.", 25, 9),
    ("Café descafeinado", "Alimentación", 35.00, "Café descafinado orgánico en grano. 500g.", 20, 9),
    ("Té Jazmín", "Alimentación", 28.00, "Té jazmín orgánico en hojas sueltas. 200g.", 30, 9),
    ("Miel de Mielato", "Alimentación", 50.00, "Miel de mielato de flores silvestres. 100% cruda.", 15, 10),
    ("Pan Integral Semillas", "Alimentación", 18.00, "Pan integral con semillas de girasol y chía. 500g.", 40, 9),
    ("Qinoa Roja", "Alimentación", 35.00, "Qinoa roja orgánica peruana. Rico en antioxidantes. 500g.", 20, 10),
    ("Aceite de Semilla de Uva", "Alimentación", 70.00, "Aceite de semilla de uva prensado en frío. 500ml.", 10, 10),
    ("Cacao en Polvo", "Alimentación", 28.00, "Cacao en polvo crudo orgánico. 200g.", 30, 9),
    ("Semillas de Chía", "Alimentación", 22.00, "Semillas de chía orgánicas. Ricas en omega-3. 200g.", 50, 9),
    ("Yogur Coco Lima", "Alimentación", 18.00, "Yogur de coco natural con limón en vidrio. 300g.", 25, 9),
    
    # Más Ropa
    ("Chaleco Lana Alpaca", "Ropa", 120.00, "Chaleco de lana de alpaca tejido a mano. Cálido y elegante.", 8, 10),
    ("Gorra Lana Merino", "Ropa", 32.00, "Gorra de lana merino ultra suave. Transpirable y térmica.", 30, 9),
    ("Calcetines Algodón Pima", "Ropa", 25.00, "Calcetines de algodón pima. Suaves y duraderos.", 40, 9),
    ("Bufanda Cuello Cíclico", "Ropa", 55.00, "Bufanda de cuello cíclico de lana merino. Versátil.", 15, 9),
    ("Cinturón Cuero Vegano Piña", "Ropa", 58.00, "Cinturón de cuero vegano de piña. Duradero y ético.", 18, 10),
    ("Camisa Rayón Bambú", "Ropa", 48.00, "Camisa de rayón de bambú transpirable. Fresca y cómoda.", 20, 9),
    ("Vestido Seda Vegano", "Ropa", 110.00, "Vestido de seda vegana de naranja. Elegante y ético.", 6, 10),
    ("Zapatos Tela Reciclada", "Ropa", 88.00, "Zapatos de tela reciclada con suela de corcho. Eco-fashion.", 10, 10),
    ("Gafas Sol Bambú", "Ropa", 42.00, "Gafas de sol con montura de bambú. UV400.", 15, 9),
    ("Cartera Bambú Minimalista", "Ropa", 65.00, "Cartera minimalista de bambú con bandolera.", 12, 10),
    
    # Más Jardín
    ("Maceta Cerámica Pintada", "Jardín", 55.00, "Maceta de cerámica pintada a mano. Diseño único.", 12, 9),
    ("Regadera Bambú", "Jardín", 75.00, "Regadera de bambú con atomizador. Decorativa y funcional.", 8, 10),
    ("Guantes de Jardín Piel", "Jardín", 35.00, "Guantes de jardín de piel. Protección total.", 18, 9),
    ("Tijeras de Poda Profesional", "Jardín", 55.00, "Tijeras de poda profesional bypass. 30mm.", 12, 9),
    ("Sistema de Riego Goteo", "Jardín", 125.00, "Sistema de riego por goteo con programador WiFi. 12 goteros.", 5, 10),
    ("Maceta Creciente", "Jardín", 42.00, "Maceta con sistema de auto-riego. Planta feliz.", 15, 9),
    ("Tierra Hortícola Premium", "Jardín", 32.00, "Tierra hortícola premium 50L. Para plantas exigentes.", 18, 9),
    ("Herramientas Jardín Set", "Jardín", 85.00, "Set de 6 herramientas de jardín. Todo lo necesario.", 12, 9),
    ("Lámpara Crecimiento UV", "Jardín", 110.00, "Lámpara UV para plantas. 15W espectro completo.", 8, 9),
    ("Semillas Flores Mix Premium", "Jardín", 25.00, "Pack de semillas de flores raras. Orgánicas.", 20, 10),
    
    # Más Accesorios
    ("Botella Térmica Premium", "Accesorios", 45.00, "Botella térmica de acero inoxidable 1L. 24h calor/frío.", 22, 9),
    ("Taza Cerámica Japonesa Matcha", "Accesorios", 28.00, "Taza de cerámica japonesa para matcha. 150ml.", 28, 9),
    ("Kit Camping Eco", "Accesorios", 150.00, "Kit de camping ecológico. Tienda, hamaca, utensilios.", 6, 10),
    ("Silla Plegable Ligera", "Accesorios", 95.00, "Silla plegable de bambú ligera. Portátil y resistente.", 10, 10),
    ("Mochila Deportiva Sostenible", "Accesorios", 85.00, "Mochila deportiva de materiales reciclados. Ligera.", 12, 10),
    ("Power Bank Solar Premium", "Accesorios", 120.00, "Power bank solar 30,000mAh. 2 puertos USB-C.", 8, 10),
    ("Lámpara Camping Solar", "Accesorios", 75.00, "Lámpara de camping solar con panel plegable. LED.", 10, 9),
    ("Botella Filtrante Avanzada", "Accesorios", 45.00, "Botella con filtro de carbón UV. Filtra 1,000L.", 20, 9),
    ("Termo Digital Solar", "Accesorios", 68.00, "Termómetro digital que se carga con luz solar. Eco.", 15, 9),
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
