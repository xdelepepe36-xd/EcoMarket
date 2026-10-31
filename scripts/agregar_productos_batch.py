"""
Script para agregar productos en batch de forma optimizada
Agrega 100+ productos sin sobrecargar el sistema
"""

import sqlite3
import os
import sys

# Agregar el directorio padre al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import DB_PATH, get_db

# Lista de productos para agregar
PRODUCTOS = [
    # Categoría: Higiene
    {"nombre": "Jabón Ecológico de Lavanda", "categoria": "Higiene", "precio": 12.50, "descripcion": "Jabón natural hecho con aceites esenciales de lavanda. Sin químicos agresivos.", "stock": 50, "eco_score": 9},
    {"nombre": "Champú Sólido Menta", "categoria": "Higiene", "precio": 18.00, "descripcion": "Champú en barra de menta, libre de plástico. Dura hasta 80 lavados.", "stock": 40, "eco_score": 10},
    {"nombre": "Acondicionador de Ambiente Lavanda", "categoria": "Higiene", "precio": 15.00, "descripcion": "Acondicionador de ambiente natural con esencias de lavanda y eucalipto.", "stock": 60, "eco_score": 8},
    {"nombre": "Cepillo de Bambú", "categoria": "Higiene", "precio": 22.00, "descripcion": "Cepillo dental de bambú con cerdas de carbón activado. Biot degradable.", "stock": 35, "eco_score": 9},
    {"nombre": "Hilo Dental Vegano", "categoria": "Higiene", "precio": 8.00, "descripcion": "Hilo dental de cera de abeja con recipiente de vidrio reutilizable.", "stock": 100, "eco_score": 10},
    {"nombre": "Desodorante en Piedra", "categoria": "Higiene", "precio": 14.00, "descripcion": "Desodorante natural en barra de piedra de alumbre. Sin aluminio.", "stock": 45, "eco_score": 9},
    {"nombre": "Jabón de Carbón Activado", "categoria": "Higiene", "precio": 16.00, "descripcion": "Jabón con carbón activado para limpiar y purificar la piel. Ideal para piel grasa.", "stock": 55, "eco_score": 8},
    {"nombre": "Aceite Corporal de Coco", "categoria": "Higiene", "precio": 28.00, "descripcion": "Aceite de coco virgen para hidratación profunda. 100% natural.", "stock": 30, "eco_score": 9},
    {"nombre": "Crema Facial de Aloe Vera", "categoria": "Higiene", "precio": 35.00, "descripcion": "Crema facial con aloe vera y vitamina E. Hidrata y regenera.", "stock": 25, "eco_score": 8},
    {"nombre": "Bálsamo Labial Coco-Menta", "categoria": "Higiene", "precio": 20.00, "descripcion": "Bálsamo labial natural con cera de abeja y menta. Hiper hidratante.", "stock": 40, "eco_score": 9},
    
    # Categoría: Hogar
    {"nombre": "Botella de Vidrio Reutilizable", "categoria": "Hogar", "precio": 25.00, "descripcion": "Botella de vidrio de 1L con tapa de bambú. Reutilizable infinitamente.", "stock": 50, "eco_score": 10},
    {"nombre": "Paja de Bambú (Pack 100)", "categoria": "Hogar", "precio": 18.00, "descripcion": "Pajitas de bambú biodegradables. Pack de 100 unidades.", "stock": 80, "eco_score": 10},
    {"nombre": "Tupperware de Vidrio", "categoria": "Hogar", "precio": 45.00, "descripcion": "Set de 3 contenedores de vidrio con tapas herméticas. Perfectos para conservar.", "stock": 30, "eco_score": 9},
    {"nombre": "Toallas de Microfibra", "categoria": "Hogar", "precio": 55.00, "descripcion": "Set de 4 toallas de microfibra ecológica. Absorbentes y duraderas.", "stock": 25, "eco_score": 8},
    {"nombre": "Detergente Ecológico Cítricos", "categoria": "Hogar", "precio": 32.00, "descripcion": "Detergente biodegradable con aroma de cítricos. 1 litro.", "stock": 40, "eco_score": 9},
    {"nombre": "Esponja de Lana Vegetal", "categoria": "Hogar", "precio": 22.00, "descripcion": "Esponja natural de lana vegetal. Biodegradable y compostable.", "stock": 60, "eco_score": 10},
    {"nombre": "Kit de Herramientas de Bambú", "categoria": "Hogar", "precio": 68.00, "descripcion": "Set de utensilios de cocina de bambú. Incluye espátula, cuchara, tenedor.", "stock": 20, "eco_score": 9},
    {"nombre": "Sacabocados de Algodón", "categoria": "Hogar", "precio": 45.00, "descripcion": "Sacabocados de algodón orgánico. Absorbentes y sin plástico.", "stock": 35, "eco_score": 9},
    {"nombre": "Bolsas de Compostaje", "categoria": "Hogar", "precio": 35.00, "descripcion": "Set de 3 bolsas compostables para separar residuos.", "stock": 40, "eco_score": 10},
    {"nombre": "Portavas de Lavado", "categoria": "Hogar", "precio": 28.00, "descripcion": "Portavas reutilizables de tela impermeable. Ecológicos y económicos.", "stock": 50, "eco_score": 9},
    {"nombre": "Kit de Cultivo de Hierbas", "categoria": "Hogar", "precio": 42.00, "descripcion": "Kit completo para cultivar hierbas en casa. Semillas y macetas.", "stock": 25, "eco_score": 10},
    
    # Categoría: Alimentación
    {"nombre": "Huevos de Granja Libre", "categoria": "Alimentación", "precio": 15.00, "descripcion": "Docena de huevos de gallinas de pastoreo. 100% orgánicos.", "stock": 30, "eco_score": 10},
    {"nombre": "Miel de Abeja Silvestre", "categoria": "Alimentación", "precio": 45.00, "descripcion": "Miel cruda de abejas silvestres. Sin procesar, 100% natural.", "stock": 20, "eco_score": 10},
    {"nombre": "Café Orgánico Fair Trade", "categoria": "Alimentación", "precio": 38.00, "descripcion": "Café en grano orgánico certificado Fair Trade. 500g.", "stock": 25, "eco_score": 9},
    {"nombre": "Té Verde en Hojas", "categoria": "Alimentación", "precio": 28.00, "descripcion": "Té verde orgánico en hojas sueltas. 200g. Sin plástico.", "stock": 40, "eco_score": 9},
    {"nombre": "Pasta de Trigo Integral", "categoria": "Alimentación", "precio": 12.00, "descripcion": "Pasta de trigo integral orgánica. Empaquetada en papel.", "stock": 50, "eco_score": 8},
    {"nombre": "Aceite de Oliva Virgen", "categoria": "Alimentación", "precio": 55.00, "descripcion": "Aceite de oliva virgen extra prensado en botella de vidrio. 500ml.", "stock": 15, "eco_score": 10},
    {"nombre": "Frutos Secos Mix", "categoria": "Alimentación", "precio": 35.00, "descripcion": "Mix de frutos secos orgánicos. Almendras, nueces, pasas. 500g.", "stock": 25, "eco_score": 9},
    {"nombre": "Pan de Masa Madre", "categoria": "Alimentación", "precio": 18.00, "descripcion": "Pan de masa madre artesanal. Fermentado 24 horas. Sin conservantes.", "stock": 40, "eco_score": 9},
    {"nombre": "Leche de Almendras", "categoria": "Alimentación", "precio": 22.00, "descripcion": "Leche de almendras sin azúcar. En botella de vidrio. 1L.", "stock": 30, "eco_score": 9},
    {"nombre": "Yogur Natural en Vidrio", "categoria": "Alimentación", "precio": 14.00, "descripcion": "Yogur natural en pot de vidrio reutilizable. Con frutas de temporada.", "stock": 35, "eco_score": 8},
    {"nombre": "Qinoa Real Orgánica", "categoria": "Alimentación", "precio": 25.00, "descripcion": "Qinoa real orgánica peruana. Rica en proteínas. 500g.", "stock": 30, "eco_score": 10},
    
    # Categoría: Ropa
    {"nombre": "Camiseta de Algodón Orgánico", "categoria": "Ropa", "precio": 45.00, "descripcion": "Camiseta de algodón orgánico certificado. Teñida con tintes naturales.", "stock": 20, "eco_score": 9},
    {"nombre": "Jeans Denim Reciclado", "categoria": "Ropa", "precio": 85.00, "descripcion": "Jeans hechos de algodón reciclado. Diseño moderno y sostenible.", "stock": 15, "eco_score": 8},
    {"nombre": "Calcetines de Lana Merino", "categoria": "Ropa", "precio": 22.00, "descripcion": "Calcetines de lana merino ultra suave. Transpirables y térmicos.", "stock": 30, "eco_score": 9},
    {"nombre": "Zapatillas de Corcho", "categoria": "Ropa", "precio": 95.00, "descripcion": "Zapatillas de corcho vegano. Cómodas y biodegradables.", "stock": 12, "eco_score": 10},
    {"nombre": "Gorra de Bambú", "categoria": "Ropa", "precio": 25.00, "descripcion": "Gorra hecha de fibras de bambú. Absorbe el sudor naturalmente.", "stock": 35, "eco_score": 9},
    {"nombre": "Bolso de Tela Reciclada", "categoria": "Ropa", "precio": 55.00, "descripcion": "Bolso hecho de tela reciclada de banners publicitarios. Diseño único.", "stock": 18, "eco_score": 10},
    {"nombre": "Bufanda de Alpaca", "categoria": "Ropa", "precio": 75.00, "descripcion": "Bufanda tejida a mano con lana de alpaca peruana. Suave y cálida.", "stock": 10, "eco_score": 10},
    {"nombre": "Chaleco de Lana Sostenible", "categoria": "Ropa", "precio": 120.00, "descripcion": "Chaleco de lana de oveja criada en pastoreo. Sin crueldad.", "stock": 8, "eco_score": 10},
    {"nombre": "Cinturón de Cuero Vegano", "categoria": "Ropa", "precio": 48.00, "descripcion": "Cinturón de cuero vegano de piña. Duradero y ético.", "stock": 20, "eco_score": 9},
    {"nombre": "Pantalón de Lino Orgánico", "categoria": "Ropa", "precio": 65.00, "descripcion": "Pantalón de lino orgánico ligero. Transpirable y natural.", "stock": 15, "eco_score": 9},
    {"nombre": "Vestido de Seda Ecológica", "categoria": "Ropa", "precio": 150.00, "descripcion": "Vestido de seda ecológica certificado. Teñido con tintes vegetales.", "stock": 5, "eco_score": 10},
    
    # Categoría: Jardín
    {"nombre": "Maceta de Bambú", "categoria": "Jardín", "precio": 28.00, "descripcion": "Maceta de bambú con bandeja de drenaje. Perfecta para hierbas.", "stock": 25, "eco_score": 10},
    {"nombre": "Semillas de Tomate Heirloom", "categoria": "Jardín", "precio": 18.00, "descripcion": "Semillas de tomate de variedades heirloom. Orgánicas y no híbridas.", "stock": 40, "eco_score": 10},
    {"nombre": "Compostera de Terracota", "categoria": "Jardín", "precio": 55.00, "descripcion": "Compostera de terracota con tapa. Ideal para apartamento.", "stock": 20, "eco_score": 9},
    {"nombre": "Guante de Jardín de Bambú", "categoria": "Jardín", "precio": 22.00, "descripcion": "Guante de jardín resistente hecho de bambú. Una talla universal.", "stock": 30, "eco_score": 9},
    {"nombre": "Kit de Cultivo de Tomates", "categoria": "Jardín", "precio": 35.00, "descripcion": "Kit completo para cultivar tomates orgánicos en maceta.", "stock": 25, "eco_score": 9},
    {"nombre": "Fertilizante Orgánico", "categoria": "Jardín", "precio": 42.00, "descripcion": "Fertilizante orgánico 100% natural. En pellet de 2kg.", "stock": 20, "eco_score": 9},
    {"nombre": "Tijeras de Poda de Calidad", "categoria": "Jardín", "precio": 38.00, "descripcion": "Tijeras de poda profesional de acero inoxidable. Hechas para durar.", "stock": 15, "eco_score": 8},
    {"nombre": "Riego por Goteo (Kit)", "categoria": "Jardín", "precio": 65.00, "descripcion": "Sistema de riego por goteo con 10 goteros y programador.", "stock": 10, "eco_score": 8},
    {"nombre": "Tierra Orgánica Universal", "categoria": "Jardín", "precio": 25.00, "descripcion": "Tierra orgánica universal para todo tipo de plantas. Saco de 20L.", "stock": 30, "eco_score": 9},
    {"nombre": "Maceta de Cerámica Artesanal", "categoria": "Jardín", "precio": 48.00, "descripcion": "Maceta de cerámica hecha a mano. Diseño único y hermoso.", "stock": 12, "eco_score": 9},
    {"nombre": "Lámpara de Cultivo LED", "categoria": "Jardín", "precio": 55.00, "descripcion": "Lámpara LED de cultivo con espectro completo. 15W bajo consumo.", "stock": 15, "eco_score": 8},
    
    # Más productos de Jardín
    {"nombre": "Maceta de Bambú Grande", "categoria": "Jardín", "precio": 38.00, "descripcion": "Maceta grande de bambú. Ideal para plantas grandes y árboles pequeños.", "stock": 18, "eco_score": 10},
    {"nombre": "Bomba de Riego Solar", "categoria": "Jardín", "precio": 120.00, "descripcion": "Bomba de riego solar con panel. Funciona con luz solar, sin electricidad.", "stock": 8, "eco_score": 10},
    {"nombre": "Semillas de Flores Mix", "categoria": "Jardín", "precio": 20.00, "descripcion": "Pack de semillas de flores variadas. Orgánicas y coloridas.", "stock": 35, "eco_score": 10},
    {"nombre": "Invernadero de Bambú", "categoria": "Jardín", "precio": 180.00, "descripcion": "Invernadero de bambú de 2x2m. Montaje fácil, sin herramientas.", "stock": 5, "eco_score": 10},
    {"nombre": "Sustrato Orgánico Universal", "categoria": "Jardín", "precio": 28.00, "descripcion": "Sustrato orgánico universal para todo tipo de plantas. Saco de 10L.", "stock": 25, "eco_score": 9},
    {"nombre": "Pala de Jardín de Bambú", "categoria": "Jardín", "precio": 32.00, "descripcion": "Pala de jardín de bambú ligera y resistente. Ergonómica.", "stock": 20, "eco_score": 9},
    {"nombre": "Aspersor de Plástico Reciclado", "categoria": "Jardín", "precio": 25.00, "descripcion": "Aspersor hecho de plástico reciclado. Durable y ecológico.", "stock": 22, "eco_score": 9},
    {"nombre": "Kit de Propagación de Semillas", "categoria": "Jardín", "precio": 18.00, "descripcion": "Kit con cubetas de papel y tierra para propagar semillas.", "stock": 30, "eco_score": 9},
    {"nombre": "Hidroponía de Bambú (Kit)", "categoria": "Jardín", "precio": 95.00, "descripcion": "Sistema hidropónico de bambú para cultivar sin tierra. 6 plantas.", "stock": 10, "eco_score": 10},
    {"nombre": "Lámpara UV para Cultivo", "categoria": "Jardín", "precio": 78.00, "descripcion": "Lámpara UV para plantas. Mejora crecimiento y previene plagas.", "stock": 12, "eco_score": 8},
    
    # Más productos de Higiene
    {"nombre": "Jabón de Marsella", "categoria": "Higiene", "precio": 20.00, "descripcion": "Jabón de Marsella tradicional al 72%. Aceite de oliva puro.", "stock": 40, "eco_score": 9},
    {"nombre": "Esponja Konjac Japonesa", "categoria": "Higiene", "precio": 25.00, "descripcion": "Esponja de konjac japonesa para limpieza suave. 100% natural.", "stock": 35, "eco_score": 10},
    {"nombre": "Aceite Esencial de Árbol de Té", "categoria": "Higiene", "precio": 32.00, "descripcion": "Aceite esencial de árbol de té purificador. Para piel grasa y acné.", "stock": 25, "eco_score": 9},
    {"nombre": "Mascarilla de Arcilla", "categoria": "Higiene", "precio": 18.00, "descripcion": "Mascarilla facial de arcilla rosa. Pura y sin aditivos.", "stock": 45, "eco_score": 10},
    {"nombre": "Bálsamo Labial Cacao", "categoria": "Higiene", "precio": 24.00, "descripcion": "Bálsamo labial de cacao crudo. Nutritivo y reparador.", "stock": 30, "eco_score": 9},
    {"nombre": "Jabón de Caléndula", "categoria": "Higiene", "precio": 15.00, "descripcion": "Jabón de caléndula para pieles sensibles. Antiinflamatorio.", "stock": 55, "eco_score": 9},
    {"nombre": "Desodorante Roll-on Lavanda", "categoria": "Higiene", "precio": 16.00, "descripcion": "Desodorante roll-on de lavanda en vidrio reutilizable. Sin alcohol.", "stock": 40, "eco_score": 9},
    {"nombre": "Acondicionador de Ambiente Eucalipto", "categoria": "Higiene", "precio": 14.00, "descripcion": "Acondicionador natural de eucalipto y menta. Relajante.", "stock": 50, "eco_score": 8},
    {"nombre": "Aceite Corporal de Jojoba", "categoria": "Higiene", "precio": 35.00, "descripcion": "Aceite de jojoba para piel seca. Hidrata sin engrasar.", "stock": 20, "eco_score": 9},
    {"nombre": "Crema Nocturna de Rosa Mosqueta", "categoria": "Higiene", "precio": 42.00, "descripcion": "Crema nocturna con rosa mosqueta y vitamina E. Regenera.", "stock": 18, "eco_score": 8},
    
    # Más productos de Hogar
    {"nombre": "Dispensador de Jabón en Bambú", "categoria": "Hogar", "precio": 28.00, "descripcion": "Dispensador de jabón de bambú. Reduce desperdicio de jabón.", "stock": 30, "eco_score": 9},
    {"nombre": "Set de Frascos de Vidrio con Tapa", "categoria": "Hogar", "precio": 75.00, "descripcion": "Set de 6 frascos de vidrio con tapa hermética. Conserva mejor.", "stock": 15, "eco_score": 9},
    {"nombre": "Kit de Utensilios de Cocina de Bambú", "categoria": "Hogar", "precio": 72.00, "descripcion": "Set completo de utensilios de bambú. Cuchara, cuchillo, espátula, tenedor.", "stock": 12, "eco_score": 9},
    {"nombre": "Esponja de Luffa Vegetal", "categoria": "Hogar", "precio": 28.00, "descripcion": "Esponja de luffa orgánica. Absorbente y compostable.", "stock": 45, "eco_score": 10},
    {"nombre": "Toallas de Lino Orgánico", "categoria": "Hogar", "precio": 68.00, "descripcion": "Toallas de lino orgánico. Suaves, absorbentes y duraderas.", "stock": 18, "eco_score": 9},
    {"nombre": "Detergente Líquido Concentrado", "categoria": "Hogar", "precio": 45.00, "descripcion": "Detergente líquido concentrado. 1L = 20 litros diluido.", "stock": 25, "eco_score": 9},
    {"nombre": "Organizador de Cajones de Madera", "categoria": "Hogar", "precio": 85.00, "descripcion": "Organizador de cajones de madera recuperada. Apilable y ecológico.", "stock": 12, "eco_score": 10},
    {"nombre": "Pelota de Lana para Lavado", "categoria": "Hogar", "precio": 15.00, "descripcion": "Pelota de lana natural para secar ropa sin suavizar telas.", "stock": 50, "eco_score": 10},
    {"nombre": "Colgador de Ropa de Bambú", "categoria": "Hogar", "precio": 38.00, "descripcion": "Colgador de ropa de bambú con 4 pinzas. Plegable y portable.", "stock": 22, "eco_score": 9},
    {"nombre": "Set de Contenedores de Bambú", "categoria": "Hogar", "precio": 55.00, "descripcion": "Set de 5 contenedores de bambú de diferentes tamaños. Impermeables.", "stock": 20, "eco_score": 9},
    {"nombre": "Lámpara de Mesa LED Solar", "categoria": "Hogar", "precio": 48.00, "descripcion": "Lámpara de mesa LED que se carga con luz solar. No usa electricidad.", "stock": 15, "eco_score": 10},
    
    # Más productos de Alimentación
    {"nombre": "Avena Orgánica en Grano", "categoria": "Alimentación", "precio": 18.00, "descripcion": "Avena orgánica en grano. Rica en proteínas y fibra. 500g.", "stock": 35, "eco_score": 9},
    {"nombre": "Miel de Abeja con Propóleo", "categoria": "Alimentación", "precio": 38.00, "descripcion": "Miel de abeja con propóleo crudo. 100% natural y sin procesar.", "stock": 22, "eco_score": 10},
    {"nombre": "Choco Negro 70% Fair Trade", "categoria": "Alimentación", "precio": 28.00, "descripcion": "Chocolate negro 70% cacao certificado Fair Trade. 100g.", "stock": 30, "eco_score": 9},
    {"nombre": "Té Rooibos Orgánico", "categoria": "Alimentación", "precio": 32.00, "descripcion": "Té rooibos orgánico en hojas. Antioxidante y sin cafeína.", "stock": 25, "eco_score": 9},
    {"nombre": "Arroz Integral Basmati", "categoria": "Alimentación", "precio": 16.00, "descripcion": "Arroz integral basmati orgánico peruano. Sin glúten.", "stock": 40, "eco_score": 9},
    {"nombre": "Aceite de Coco Virgen Extra", "categoria": "Alimentación", "precio": 65.00, "descripcion": "Aceite de coco virgen extra prensado. 1L en vidrio.", "stock": 12, "eco_score": 10},
    {"nombre": "Frutos Secos Premium Mix", "categoria": "Alimentación", "precio": 42.00, "descripcion": "Mix premium de frutos secos: almendras, nueces, pistachos. 500g.", "stock": 18, "eco_score": 9},
    {"nombre": "Pan de Centeno 100% Integral", "categoria": "Alimentación", "precio": 22.00, "descripcion": "Pan de centeno 100% integral. Sin levadura química. 500g.", "stock": 28, "eco_score": 10},
    {"nombre": "Leche de Avena Sin Azúcar", "categoria": "Alimentación", "precio": 24.00, "descripcion": "Leche de avena natural sin azúcar. En botella de vidrio. 1L.", "stock": 32, "eco_score": 9},
    {"nombre": "Salsa de Tomate Orgánica", "categoria": "Alimentación", "precio": 16.00, "descripcion": "Salsa de tomate orgánica en vidrio. Sin conservantes. 250ml.", "stock": 45, "eco_score": 9},
    {"nombre": "Mante de Maní Orgánico", "categoria": "Alimentación", "precio": 38.00, "descripcion": "Mante de maní orgánico sin sal. En frasco de vidrio. 500g.", "stock": 20, "eco_score": 10},
    
    # Más productos de Ropa
    {"nombre": "Camiseta de Lino Orgánico", "categoria": "Ropa", "precio": 52.00, "descripcion": "Camiseta de lino orgánico transpirable. Perfecta para verano.", "stock": 18, "eco_score": 9},
    {"nombre": "Vestido de Algodón Crudo", "categoria": "Ropa", "precio": 95.00, "descripcion": "Vestido de algodón crudo sin teñir. Natural y cómodo.", "stock": 12, "eco_score": 10},
    {"nombre": "Suéter de Lana Reciclada", "categoria": "Ropa", "precio": 68.00, "descripcion": "Suéter hecho de lana reciclada. Cálido y sostenible.", "stock": 15, "eco_score": 9},
    {"nombre": "Zapatos de Corcho Vegano", "categoria": "Ropa", "precio": 125.00, "descripcion": "Zapatos de corcho vegano cómodos. Transpirables y biodegradables.", "stock": 8, "eco_score": 10},
    {"nombre": "Gorra de Algodón Orgánico", "categoria": "Ropa", "precio": 28.00, "descripcion": "Gorra de algodón orgánico transpirable. Estilo beanie.", "stock": 30, "eco_score": 9},
    {"nombre": "Cartera de Cuero Vegano", "categoria": "Ropa", "precio": 78.00, "descripcion": "Cartera de cuero vegano de hongo con bordes acabados.", "stock": 10, "eco_score": 10},
    {"nombre": "Bufanda de Lana de Alpaca", "categoria": "Ropa", "precio": 95.00, "descripcion": "Bufanda de lana de alpaca。Súper suave y cálida.", "stock": 8, "eco_score": 10},
    {"nombre": "Pantalón Cargo de Algodón", "categoria": "Ropa", "precio": 72.00, "descripcion": "Pantalón cargo de algodón orgánico. Durable y cómodo.", "stock": 15, "eco_score": 9},
    {"nombre": "Cinturón de Hemp", "categoria": "Ropa", "precio": 55.00, "descripcion": "Cinturón de cáñamo de cáñamo orgánico. Duradero y resistente.", "stock": 18, "eco_score": 10},
    {"nombre": "Vestido de Seda Reciclada", "categoria": "Ropa", "precio": 110.00, "descripcion": "Vestido de seda reciclada y retazos textiles. Diseño único.", "stock": 6, "eco_score": 10},
    
    # Más productos de Accesorios
    {"nombre": "Mochila de Cuero Vegano", "categoria": "Accesorios", "precio": 95.00, "descripcion": "Mochila de cuero vegano de piña. Duradera y elegante.", "stock": 10, "eco_score": 10},
    {"nombre": "Gafas de Sol Polarizadas", "categoria": "Accesorios", "precio": 52.00, "descripcion": "Gafas de sol polarizadas con montura de bambú. Protección UV400.", "stock": 18, "eco_score": 9},
    {"nombre": "Botella Térmica de Acero", "categoria": "Accesorios", "precio": 38.00, "descripcion": "Botella térmica de acero inoxidable. Doble pared, 24h de duración.", "stock": 22, "eco_score": 9},
    {"nombre": "Set de Cubiertos de Bambú Premium", "categoria": "Accesorios", "precio": 65.00, "descripcion": "Set premium de cubiertos de bambú. Incluye estuche de tela.", "stock": 15, "eco_score": 9},
    {"nombre": "Lámpara LED de Mesa", "categoria": "Accesorios", "precio": 42.00, "descripcion": "Lámpara LED de mesa USB recargable. 7 colores LED.", "stock": 20, "eco_score": 8},
    {"nombre": "Cargador Solar Portátil Doble", "categoria": "Accesorios", "precio": 95.00, "descripcion": "Cargador solar plegable doble panel. 20,000mAh. 2 puertos USB.", "stock": 8, "eco_score": 10},
    {"nombre": "Portátil Solar (Laptop Case)", "categoria": "Accesorios", "precio": 85.00, "descripcion": "Carcasa de laptop con panel solar integrado. Carga dispositivos.", "stock": 10, "eco_score": 10},
    {"nombre": "Bolsa de Compras de Lino", "categoria": "Accesorios", "precio": 28.00, "descripcion": "Bolsa de compras de lino resistente. Doble asa, bolsillos internos.", "stock": 35, "eco_score": 9},
    {"nombre": "Kit de Utensilios de Viaje", "categoria": "Accesorios", "precio": 45.00, "descripcion": "Set de utensilios de viaje de bambú. Tenedor, cuchara, cuchillo.", "stock": 18, "eco_score": 9},
    {"nombre": "Botella de Agua Filtrante", "categoria": "Accesorios", "precio": 35.00, "descripcion": "Botella de agua con filtro de carbón activado. Filtra hasta 300L.", "stock": 25, "eco_score": 9},
    {"nombre": "Taza de Cerámica Japonesa", "categoria": "Accesorios", "precio": 22.00, "descripcion": "Taza de cerámica japonesa tradicional. Hecha a mano.", "stock": 28, "eco_score": 9},
    
    # Categoría: Libros (nueva)
    {"nombre": "Guía de Cultivo Ecológico", "categoria": "Libros", "precio": 35.00, "descripcion": "Guía completa para cultivar tu propio huerto ecológico.", "stock": 20, "eco_score": 9},
    {"nombre": "Recetas Cero Residuos", "categoria": "Libros", "precio": 42.00, "descripcion": "Libro de recetas para cocinar sin generar residuos.", "stock": 15, "eco_score": 9},
    {"nombre": "Guía de Vida Sostenible", "categoria": "Libros", "precio": 38.00, "descripcion": "Guía práctica para vivir de forma sostenible en la ciudad.", "stock": 18, "eco_score": 9},
    {"nombre": "Compostaje para Principiantes", "categoria": "Libros", "precio": 28.00, "descripcion": "Libro sobre compostaje fácil para principiantes.", "stock": 25, "eco_score": 9},
    {"nombre": "Jardín Urbano", "categoria": "Libros", "descripcion": "Libro sobre jardinería urbana en espacios pequeños.", "stock": 22, "precio": 32.00, "eco_score": 9},
    {"nombre": "Recetas con Plantas Nativas", "categoria": "Libros", "descripcion": "Libro de recetas usando plantas nativas peruanas.", "stock": 18, "precio": 30.00, "eco_score": 10},
    {"nombre": "DIY Ecológico", "categoria": "Libros", "descripcion": "20 proyectos ecológicos fáciles para hacer en casa.", "stock": 20, "precio": 35.00, "eco_score": 9},
    {"nombre": "Consumo Consciente", "categoria": "Libros", "descripcion": "Guía para consumo consciente y minimalismo.", "stock": 15, "precio": 28.00, "eco_score": 9},
    {"nombre": "Permacultura Para Todos", "categoria": "Libros", "descripcion": "Introducción a la permacultura aplicada en ciudad.", "stock": 12, "precio": 45.00, "eco_score": 9},
    {"nombre": "Energía Solar en Casa", "categoria": "Libros", "descripcion": "Guía para instalar energía solar en tu hogar.", "stock": 10, "precio": 55.00, "eco_score": 9},
    {"nombre": "Cocina de Estación", "categoria": "Libros", "descripcion": "Libro de cocina estacional con ingredientes locales.", "stock": 18, "precio": 32.00, "eco_score": 9},
    {"nombre": "Recetas Veganas Peruanas", "categoria": "Libros", "descripcion": "Libro de recetas veganas tradicionales peruanas.", "stock": 15, "precio": 38.00, "eco_score": 10},
    
    # Categoría: Tecnología Ecológica (nueva)
    {"nombre": "Cargador Solar de 10W", "categoria": "Tecnología", "precio": 85.00, "descripcion": "Panel solar de 10W con regulador USB. Ideal para cargar celular.", "stock": 12, "eco_score": 10},
    {"nombre": "Lámpara Solar LED 5W", "categoria": "Tecnología", "precio": 45.00, "descripcion": "Lámpara solar LED de 5W. Se carga con luz, funciona toda la noche.", "stock": 20, "eco_score": 10},
    {"nombre": "Kit Solar Básico", "categoria": "Tecnología", "precio": 450.00, "descripcion": "Kit solar básico: panel 100W + regulador + batería 50Ah.", "stock": 5, "eco_score": 10},
    {"nombre": "Monitor de Consumo de Energía", "categoria": "Tecnología", "precio": 120.00, "descripcion": "Monitor que muestra consumo de energía en tiempo real. WiFi incluido.", "stock": 8, "eco_score": 9},
    {"nombre": "Termostato Inteligente Ecológico", "categoria": "Tecnología", "precio": 85.00, "descripcion": "Termostato inteligente que aprende tus hábitos. Ahorra hasta 30%.", "stock": 15, "eco_score": 9},
    {"nombre": "Interruptor de Apagado Remoto", "categoria": "Tecnología", "precio": 35.00, "descripcion": "Enchufe inteligente que apaga dispositivos automáticamente.", "stock": 25, "eco_score": 8},
    {"nombre": "Sensor de Agua Inteligente", "categoria": "Tecnología", "precio": 55.00, "descripcion": "Sensor de agua que detecta fugas y monitorea consumo.", "stock": 12, "eco_score": 9},
    {"nombre": "Cargador Portátil Solar 20Ah", "categoria": "Tecnología", "precio": 150.00, "descripcion": "Cargador solar plegable 20Ah. 2 puertos USB QC 3.0.", "stock": 6, "eco_score": 10},
    {"nombre": "Lámpara Solar Exterior", "categoria": "Tecnología", "precio": 75.00, "descripcion": "Lámpara solar para exterior con sensor de movimiento. 100 LEDs.", "stock": 10, "eco_score": 9},
    {"nombre": "Kit Domótico Básico", "categoria": "Tecnología", "precio": 280.00, "descripcion": "Kit domótico básico: 4 enchufes + hub WiFi. Compatible Alexa/Google.", "stock": 5, "eco_score": 8},
]
    
    # Categoría: Accesorios
    {"nombre": "Mochila de Cordel Reciclado", "categoria": "Accesorios", "precio": 85.00, "descripcion": "Mochila hecha de cordel reciclado. Duradera y única.", "stock": 10, "eco_score": 10},
    {"nombre": "Mochila de Yute Ecológica", "categoria": "Accesorios", "precio": 45.00, "descripcion": "Mochila de yute 100% natural. Compartimiento justo y sostenible.", "stock": 20, "eco_score": 10},
    {"nombre": "Botella de Agua Térmica", "categoria": "Accesorios", "precio": 32.00, "descripcion": "Botella térmica de acero inoxidable. Mantiene frío por 24h.", "stock": 25, "eco_score": 9},
    {"nombre": "Taza de Cerámica Reutilizable", "categoria": "Accesorios", "precio": 18.00, "descripcion": "Taza de cerámica con tapa de bambú. Para café o té sin plástico.", "stock": 40, "eco_score": 9},
    {"nombre": "Kit de Cubiertos de Bambú", "categoria": "Accesorios", "precio": 52.00, "descripcion": "Set de cubiertos de bambú para el trabajo o picnic. Incluye estuche.", "stock": 18, "eco_score": 9},
    {"nombre": "Laptop Sleeve de Fieltro Reciclado", "categoria": "Accesorios", "precio": 35.00, "descripcion": "Funda de laptop de fieltro reciclado. Protege y es único.", "stock": 22, "eco_score": 10},
    {"nombre": "Gafas de Sol de Bambú", "categoria": "Accesorios", "precio": 45.00, "descripcion": "Gafas de sol con montura de bambú y lentes polarizados.", "stock": 15, "eco_score": 9},
    {"nombre": "Power Bank Solar", "categoria": "Accesorios", "precio": 68.00, "descripcion": "Power bank con panel solar integrado. Se carga con el sol.", "stock": 12, "eco_score": 10},
    {"nombre": "Lámpara de Lectura LED Solar", "categoria": "Accesorios", "precio": 75.00, "descripcion": "Lámpara de lectura que se carga con luz solar. Funciona hasta 8 horas.", "stock": 10, "eco_score": 10},
    {"nombre": "Cargador USB Solar Portátil", "categoria": "Accesorios", "precio": 88.00, "descripcion": "Cargador USB solar plegable. Ideal para camping y viajes.", "stock": 8, "eco_score": 10},
]

def agregar_productos():
    """Agrega productos en batch de forma optimizada."""
    print("Conectando a la base de datos...")
    conn = get_db()
    
    # Obtener categorías existentes
    categorias_existentes = {row[0] for row in conn.execute('SELECT DISTINCT categoria FROM productos').fetchall()}
    print(f"Categorías existentes: {len(categorias_existentes)}")
    
    # Contar productos existentes
    productos_existentes = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    print(f"Productos existentes: {productos_existentes}")
    
    # Insertar productos en batch
    print(f"Agregando {len(PRODUCTOS)} productos...")
    
    productos_agregados = 0
    productos_existentes_nombres = {row[0] for row in conn.execute('SELECT nombre FROM productos').fetchall()}
    
    for producto in PRODUCTOS:
        # Verificar si ya existe
        if producto['nombre'] in productos_existentes_nombres:
            print(f"  [!] {producto['nombre']} ya existe, saltando...")
            continue
        
        try:
            conn.execute('''
                INSERT INTO productos (nombre, categoria, precio, descripcion, stock, eco_score, condicion, usuario_id)
                VALUES (?, ?, ?, ?, ?, ?, 'nuevo', NULL)
            ''', (
                producto['nombre'],
                producto['categoria'],
                producto['precio'],
                producto['descripcion'],
                producto['stock'],
                producto['eco_score']
            ))
            productos_agregados += 1
            print(f"  [OK] {producto['nombre']} agregado")
        except Exception as e:
            print(f"  [ERROR] Error agregando {producto['nombre']}: {e}")
    
    conn.commit()
    
    # Verificar productos finales
    productos_finales = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    print(f"\nProductos finales: {productos_finales}")
    print(f"Productos agregados: {productos_agregados}")
    
    conn.close()
    print("\n✅ Productos agregados exitosamente!")

if __name__ == '__main__':
    agregar_productos()