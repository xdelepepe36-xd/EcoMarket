"""
Script para agregar productos con nuevas categorías
Optimizado para no sobrecargar el sistema
"""

import sqlite3
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import DB_PATH, get_db

PRODUCTOS_NUEVAS_CATEGORIAS = [
    # Deportes
    ("Yoga Mat Ecológico", "Deportes", 35.00, "Esterilla de yoga de corcho natural. Antideslizante y biodegradable.", 30, 9),
    ("Bicicleta Urbana Plegable", "Deportes", 450.00, "Bicicleta urbana plegable de aluminio reciclado. Ligera y resistente.", 8, 10),
    ("Botones Hidratación Reciclado", "Deportes", 22.00, "Botón de hidratación de plástico reciclado. 750ml sin BPA.", 40, 9),
    ("Mochila Deportiva Impermeable", "Deportes", 75.00, "Mochila deportiva de materiales reciclados impermeables.", 15, 9),
    ("Zapatillas Running Sostenibles", "Deportes", 120.00, "Zapatillas de running con suela de caucho reciclado.", 12, 10),
    
    # Juguetes
    ("Bloques de Madera Orgánica", "Juguetes", 45.00, "Bloques de construcción de madera certificada FSC. 50 piezas.", 20, 10),
    ("Peluche Algodón Orgánico", "Juguetes", 28.00, "Peluche de conejo de algodón orgánico. Sin tintes tóxicos.", 25, 9),
    ("Juego de Cartas Reciclado", "Juguetes", 18.00, "Juego de cartas de papel reciclado con tintes vegetales.", 35, 9),
    ("Kit Experimentos Naturaleza", "Juguetes", 55.00, "Kit de experimentos con materiales naturales y sostenibles.", 15, 9),
    ("Muñeca Tela Reciclada", "Juguetes", 32.00, "Muñeca hecha con tela reciclada y relleno orgánico.", 18, 9),
    
    # Arte
    ("Acuarelas Naturales", "Arte", 38.00, "Set de acuarelas con pigmentos naturales. 12 colores.", 22, 9),
    ("Pinceles Bambú", "Arte", 25.00, "Set de 6 pinceles de bambú con cerdas veganas.", 30, 9),
    ("Papel Artesanal Reciclado", "Arte", 20.00, "Bloque de papel artesanal reciclado 100% post-consumo.", 28, 10),
    ("Témperas Eco-Friendly", "Arte", 35.00, "Set de témperas eco-friendly sin tóxicos. 8 colores.", 18, 9),
    ("Lienzo Algodón Orgánico", "Arte", 42.00, "Lienzo de algodón orgánico sobre bastidor de madera FSC.", 15, 10),
    
    # Mascotas
    ("Correa Cáñamo", "Mascotas", 28.00, "Correa de cáñamo orgánico resistente y biodegradable.", 35, 9),
    ("Comedero Bambú", "Mascotas", 32.00, "Comedero de bambú para perros y gatos. Antideslizante.", 25, 9),
    ("Cama Manta Lana", "Mascotas", 65.00, "Cama de mascota con manta de lana merino lavable.", 12, 10),
    ("Juguete Cuerda Cáñamo", "Mascotas", 18.00, "Juguete de cuerda de cáñamo para perros. Duradero.", 40, 9),
    ("Collar Cuero Vegano", "Mascotas", 25.00, "Collar de cuero vegano de piña con hebilla metal.", 30, 9),
    
    # Bebés
    ("Pañales de Tela Orgánica", "Bebés", 28.00, "Pañales de tela de algodón orgánico reutilizables. Pack 6.", 15, 10),
    ("Biberón Vidrio", "Bebés", 22.00, "Biberón de vidrio borosilicato sin BPA. 240ml.", 35, 9),
    ("Almohada Cuna Lana", "Bebés", 35.00, "Almohada de cuna de lana merino transpirable.", 18, 10),
    ("Ropa Bebé Algodón Orgánico", "Bebés", 32.00, "Body de algodón orgánico GOTS. Talla 0-3 meses.", 25, 9),
    ("Juguete Bambú Mordedor", "Bebés", 18.00, "Mordedor de bambú silicona natural. Seguro y tóxico-free.", 40, 9),
    
    # Papelería
    ("Cuero Vegetal", "Papelería", 42.00, "Cuaderno de cuero vegetal y papel reciclado. 200 hojas.", 20, 10),
    ("Lápices Bambú", "Papelería", 15.00, "Set de 12 lápices de bambú con mina reciclada.", 45, 9),
    ("Marcadores Sin Alcohol", "Papelería", 25.00, "Set de marcadores sin alcohol a base de agua. 8 colores.", 30, 9),
    ("Diario Artesanal", "Papelería", 28.00, "Diario de papel reciclado con encuadernación artesanal.", 22, 9),
    ("Bolígrafo Reciclado", "Papelería", 12.00, "Bolígrafo de plástico reciclado con tinta recargable.", 50, 9),
    
    # Música
    ("Ukulele Bambú", "Música", 120.00, "Ukulele de bambú y madera recuperada. Sonido cálido.", 8, 10),
    ("Guitarra Clásica Madera", "Música", 350.00, "Guitarra clásica de madera sostenible certificada FSC.", 5, 10),
    ("Pandereta Reciclada", "Música", 35.00, "Pandereta de materiales reciclados con parche sintético.", 15, 9),
    ("Armónica Estuche Bambú", "Música", 45.00, "Armónica en estuche de bambú. 10 agujeros.", 18, 9),
    ("Tambor Cerámica Pintada", "Música", 65.00, "Tambor de cerámica pintada a mano. 30cm.", 10, 10),
    
    # Electrodomésticos
    ("Licuadora Manual Manual", "Electrodomésticos", 55.00, "Licuadora manual sin electricidad. Operación manual.", 12, 10),
    ("Ventilador Bambú USB", "Electrodomésticos", 45.00, "Ventilador de bambú con motor USB eficiente.", 15, 9),
    ("Hervidor Bambú", "Electrodomésticos", 65.00, "Hervidor eléctrico de bambú con apagado automático.", 10, 10),
    ("Plancha Ceramic Sin PTFE", "Electrodomésticos", 85.00, "Plancha cerámica sin PTFE. Eco-friendly.", 8, 10),
    ("Lámpara LED Solar", "Electrodomésticos", 55.00, "Lámpara LED con panel solar integrado. Portátil.", 12, 10),
    
    # Herramientas
    ("Set Herramientas Bambú", "Herramientas", 95.00, "Set de 8 herramientas con mangos de bambú.", 10, 10),
    ("Martillo Madera Reciclada", "Herramientas", 35.00, "Martillo con mango de madera reciclada.", 18, 9),
    ("Destornillador Set Ecológico", "Herramientas", 42.00, "Set de destornilladores con mangos de corcho.", 15, 9),
    ("Nivel Bambú", "Herramientas", 38.00, "Nivel de burbuja con cuerpo de bambú.", 12, 9),
    ("Mesa de Trabajo Bambú", "Herramientas", 150.00, "Mesa de trabajo plegable de bambú. Resistente.", 6, 10),
    
    # Muebles
    ("Mesa Café Bambú", "Muebles", 185.00, "Mesa de café de bambú laminado. Diseño minimalista.", 8, 10),
    ("Silla Bambú Plegable", "Muebles", 95.00, "Silla de bambú plegable ergonómica.", 12, 10),
    ("Estante Madera Reciclada", "Muebles", 220.00, "Estante de madera recuperada. 3 niveles.", 5, 10),
    ("Lámpara Suelo Bambú", "Muebles", 135.00, "Lámpara de suelo de bambú con LED integrado.", 8, 10),
    ("Escritorio Compacto Bambú", "Muebles", 295.00, "Escritorio compacto de bambú con cajón.", 4, 10),
]

def agregar_productos_categorias():
    print("Conectando a la base de datos...")
    conn = get_db()
    
    productos_existentes = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    print(f"Productos existentes: {productos_existentes}")
    
    productos_agregados = 0
    productos_existentes_nombres = {row[0] for row in conn.execute('SELECT nombre FROM productos').fetchall()}
    
    for prod in PRODUCTOS_NUEVAS_CATEGORIAS:
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
            print(f"[OK] {nombre} ({categoria}) agregado")
        except Exception as e:
            print(f"[ERROR] Error agregando {nombre}: {e}")
    
    conn.commit()
    
    productos_finales = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    categorias_finales = conn.execute('SELECT COUNT(DISTINCT categoria) FROM productos').fetchone()[0]
    print(f"\nProductos finales: {productos_finales}")
    print(f"Categorías finales: {categorias_finales}")
    print(f"Productos agregados: {productos_agregados}")
    
    categorias = [row[0] for row in conn.execute('SELECT DISTINCT categoria FROM productos ORDER BY categoria').fetchall()]
    print(f"\nCategorías: {', '.join(categorias)}")
    
    conn.close()
    print("\nProductos de nuevas categorías agregados exitosamente!")

if __name__ == '__main__':
    agregar_productos_categorias()
