#!/usr/bin/env python3
"""
EcoMarket - Script para agregar productos con imágenes
Agrega productos de ejemplo con imágenes de alta calidad
"""

import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path

# Configuración
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'ecomarket.db')
PRODUCTS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'productos_seeds.json')

# Productos de ejemplo con imágenes
PRODUCTOS_CON_IMAGENES = [
    {
        "nombre": "Bolsa Ecológica de Algodón Orgánico",
        "categoria": "Hogar",
        "precio": 45.00,
        "precio_original": 55.00,
        "descripcion": "Bolsa reutilizable hecha de algodón 100% orgánico. Perfecta para compras diarias, resistente y lavable. Reduce el uso de plásticos desechables.",
        "imagen": "https://images.unsplash.com/photo-1595488698991-5de8c1d2b92c?w=400&h=300&fit=crop",
        "stock": 50,
        "condicion": "nuevo",
        "etiquetas": "ecologico,algodon,reutilizable,bolsas",
        "eco_score": 5,
        "especificaciones": '{"material": "Algodón 100% orgánico", "dimensiones": "35x40cm", "capacidad": "10kg", "lavable": true}',
        "ubicacion": "Lima, Perú"
    },
    {
        "nombre": "Jarrón de Cerámica Reciclada",
        "categoria": "Hogar",
        "precio": 85.00,
        "precio_original": null,
        "descripcion": "Hermoso jarrón artesanal hecho de cerámica reciclada. Cada pieza es única con patrones naturales. Ideal para decoración de interiores con estilo sostenible.",
        "imagen": "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=300&fit=crop",
        "stock": 25,
        "condicion": "nuevo",
        "etiquetas": "ceramica,reciclado,artesanal,decoracion",
        "eco_score": 4,
        "especificaciones": '{"material": "Cerámica reciclada", "altura": "25cm", "ancho": "15cm", "peso": "1.2kg"}',
        "ubicacion": "Cusco, Perú"
    },
    {
        "nombre": "Kit de Jardín Urbano",
        "categoria": "Jardín",
        "precio": 120.00,
        "precio_original": 150.00,
        "descripcion": "Set completo para iniciar tu jardín en espacios pequeños. Incluye macetas biodegradables, semillas orgánicas, tierra nutritiva y guía de cultivo.",
        "imagen": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
        "stock": 30,
        "condicion": "nuevo",
        "etiquetas": "jardin,urbano,semillas,macetas",
        "eco_score": 5,
        "especificaciones": '{"macetas": "3 unidades biodegradables", "semillas": "5 variedades", "tierra": "5kg", "guia": "incluida"}',
        "ubicacion": "Arequipa, Perú"
    },
    {
        "nombre": "Jabón Artesanal de Lavanda",
        "categoria": "Higiene",
        "precio": 18.00,
        "precio_original": null,
        "descripcion": "Jabón natural hecho a mano con aceite esencial de lavanda y ingredientes orgánicos. Hidrata la piel sin químicos agresivos.",
        "imagen": "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=300&fit=crop",
        "stock": 100,
        "condicion": "nuevo",
        "etiquetas": "jabon,artesanal,lavanda,natural,higiene",
        "eco_score": 4,
        "especificaciones": '{"peso": "120g", "ingredientes": "Aceite de coco, lavanda, manteca de karité", "tipo_piel": "Todas"}',
        "ubicacion": "Lima, Perú"
    },
    {
        "nombre": "Lámpara de Bambú Sostenible",
        "categoria": "Hogar",
        "precio": 95.00,
        "precio_original": 110.00,
        "descripcion": "Lámpara de mesa fabricada con bambú sostenible y tela de algodón orgánico. Diseño minimalista que aporta calidez y naturalidad a cualquier espacio.",
        "imagen": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=300&fit=crop",
        "stock": 20,
        "condicion": "nuevo",
        "etiquetas": "lampara,bambu,sostenible,decoracion",
        "eco_score": 5,
        "especificaciones": '{"material": "Bambú y algodón orgánico", "altura": "45cm", "tipo_bombilla": "LED incluida", "certificacion": "FSC"}',
        "ubicacion": "Piura, Perú"
    },
    {
        "nombre": "Set de Utensilios de Bambú",
        "categoria": "Hogar",
        "precio": 35.00,
        "precio_original": null,
        "descripcion": "Kit de utensilios de cocina hechos de bambú 100% natural. Incluye cuchara, tenedor, cuchillo y palillos. Alternativa ecológica al plástico.",
        "imagen": "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop",
        "stock": 75,
        "condicion": "nuevo",
        "etiquetas": "utensilios,bambu,cocina,ecologico",
        "eco_score": 5,
        "especificaciones": '{"material": "Bambú 100% natural", "piezas": "6 utensilios", "lavable": "Lavavajillas seguro", "durabilidad": "2+ años"}',
        "ubicacion": "Lima, Perú"
    },
    {
        "nombre": "Tote Bag de Yute Reciclado",
        "categoria": "Accesorios",
        "precio": 28.00,
        "precio_original": 35.00,
        "descripcion": "Bolso tote elegante hecho de yute reciclado con forro de algodón. Perfecto para trabajo, compras o diario. Diseño versátil y sostenible.",
        "imagen": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=300&fit=crop",
        "stock": 60,
        "condicion": "nuevo",
        "etiquetas": "bolso,yute,reciclado,accesorios",
        "eco_score": 4,
        "especificaciones": '{"material": "Yute reciclado y algodón", "dimensiones": "40x35x10cm", "bolsillos": "3 interiores", "correas": "Ajustables"}',
        "ubicacion": "Trujillo, Perú"
    },
    {
        "nombre": "Portavelas de Cera de Abeja",
        "categoria": "Hogar",
        "precio": 42.00,
        "precio_original": null,
        "descripcion": "Portavelas reutilizables hechos de tela impregnada en cera de abeja. Alternativa natural y ecológica al papel film. Lavables y reutilizables.",
        "imagen": "https://images.unsplash.com/photo-1615484477760-6e794a7775b9?w=400&h=300&fit=crop",
        "stock": 45,
        "condicion": "nuevo",
        "etiquetas": "portavelas,cera,abeja,ecologico,cocina",
        "eco_score": 5,
        "especificaciones": '{"material": "Algodón orgánico y cera de abeja", "piezas": "3 tamaños", "lavable": "Agua fría", "reutilizable": "100+ usos"}',
        "ubicacion": "Lima, Perú"
    },
    {
        "nombre": "Cepillo de Dientes de Bambú",
        "categoria": "Higiene",
        "precio": 12.00,
        "precio_original": 15.00,
        "descripcion": "Cepillo dental ecológico con mango de bambú biodegradable y cerdas suaves. Alternativa sostenible a los cepillos de plástico.",
        "imagen": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&h=300&fit=crop",
        "stock": 200,
        "condicion": "nuevo",
        "etiquetas": "cepillo,bambu,dental,ecologico",
        "eco_score": 5,
        "especificaciones": '{"material": "Bambú moso", "cerdas": "Nylon suave", "biodegradable": "90%", "vida_util": "3-4 meses"}',
        "ubicacion": "Lima, Perú"
    },
    {
        "nombre": "Set de Semillas de Hierbas Aromáticas",
        "categoria": "Jardín",
        "precio": 25.00,
        "precio_original": null,
        "descripcion": "Colección de semillas orgánicas de hierbas aromáticas: albahaca, romero, tomillo, menta y perejil. Perfectas para cultivar en casa.",
        "imagen": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=300&fit=crop",
        "stock": 80,
        "condicion": "nuevo",
        "etiquetas": "semillas,hierbas,aromaticas,organico",
        "eco_score": 5,
        "especificaciones": '{"variedades": "5 tipos", "cantidad": "50 semillas c/u", "organico": "Certificado", "guia": "Incluida"}',
        "ubicacion": "Cusco, Perú"
    },
    {
        "nombre": "Camiseta de Algodón Reciclado",
        "categoria": "Ropa",
        "precio": 55.00,
        "precio_original": 70.00,
        "descripcion": "Camiseta básica confeccionada con algodón reciclado certificado. Cómoda, transpirable y amigable con el medio ambiente.",
        "imagen": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
        "stock": 40,
        "condicion": "nuevo",
        "etiquetas": "camiseta,algodon,reciclado,ropa",
        "eco_score": 4,
        "especificaciones": '{"material": "Algodón reciclado 50%", "tallas": "S, M, L, XL", "colores": "Natural, gris, verde", "certificacion": "GOTS"}',
        "ubicacion": "Lima, Perú"
    },
    {
        "nombre": "Organizador de Caucho Reciclado",
        "categoria": "Hogar",
        "precio": 38.00,
        "precio_original": null,
        "descripcion": "Organizador multiusos fabricado con caucho reciclado de neumáticos. Resistente, impermeable y con diseño moderno. Perfecto para cualquier espacio.",
        "imagen": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop",
        "stock": 35,
        "condicion": "reconditionado",
        "etiquetas": "organizador,caucho,reciclado,almacenaje",
        "eco_score": 5,
        "especificaciones": '{"material": "Caucho reciclado", "dimensiones": "30x20x15cm", "compartimentos": "6", "impermeable": true}',
        "ubicacion": "Lima, Perú"
    },
    {
        "nombre": "Esponja Konjac Natural",
        "categoria": "Higiene",
        "precio": 22.00,
        "precio_original": null,
        "descripcion": "Esponja facial de konjac 100% natural para limpieza suave. Exfolia gentilmente mientras hidrata la piel. Biodegradable y compostable.",
        "imagen": "https://images.unsplash.com/photo-1556228720-1956a9ea9a65?w=400&h=300&fit=crop",
        "stock": 90,
        "condicion": "nuevo",
        "etiquetas": "esponja,konjac,natural,facial",
        "eco_score": 5,
        "especificaciones": '{"material": "Konjac 100% natural", "tipo_piel": "Todas", "uso": "Diario", "biodegradable": true}',
        "ubicacion": "Lima, Perú"
    },
    {
        "nombre": "Set de Tazas de Cerámica Artesanal",
        "categoria": "Hogar",
        "precio": 65.00,
        "precio_original": 80.00,
        "descripcion": "Set de 4 tazas de café hechas a mano con cerámica local. Cada taza tiene un diseño único. Perfectas para disfrutar tu café favorito.",
        "imagen": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop",
        "stock": 25,
        "condicion": "nuevo",
        "etiquetas": "tazas,ceramica,artesanal,cafe",
        "eco_score": 4,
        "especificaciones": '{"material": "Cerámica local", "cantidad": "4 tazas", "capacidad": "300ml c/u", "lavable": "Lavavajillas seguro"}',
        "ubicacion": "Cusco, Perú"
    },
    {
        "nombre": "Botella de Agua Reutilizable",
        "categoria": "Accesorios",
        "precio": 32.00,
        "precio_original": 40.00,
        "descripcion": "Botella de acero inoxidable de alta calidad con diseño minimalista. Mantiene tu bebida fría por 24h o caliente por 12h. Alternativa perfecta a botellas desechables.",
        "imagen": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop",
        "stock": 70,
        "condicion": "nuevo",
        "etiquetas": "botella,acero,reutilizable,agua",
        "eco_score": 5,
        "especificaciones": '{"material": "Acero inoxidable 18/8", "capacidad": "500ml", "aislamiento": "24h frío/12h caliente", "bpa_free": true}',
        "ubicacion": "Lima, Perú"
    },
    {
        "nombre": "Caja de Herramientas de Madera Recuperada",
        "categoria": "Hogar",
        "precio": 145.00,
        "precio_original": null,
        "descripcion": "Caja de herramientas artesanal fabricada con madera recuperada de construcciones antiguas. Cada pieza tiene historia y carácter único.",
        "imagen": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
        "stock": 15,
        "condicion": "reconditionado",
        "etiquetas": "caja,madera,recuperada,herramientas",
        "eco_score": 5,
        "especificaciones": '{"material": "Madera recuperada", "dimensiones": "50x25x20cm", "compartimentos": "10", "acabado": "Aceite natural"}',
        "ubicacion": "Arequipa, Perú"
    }
]

def get_db_connection():
    """Obtiene conexión a la base de datos"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def producto_existe(conn, nombre):
    """Verifica si un producto ya existe"""
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM productos WHERE nombre = ?", (nombre,))
    return cursor.fetchone() is not None

def insertar_producto(conn, producto):
    """Inserta un producto en la base de datos"""
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO productos (
            nombre, categoria, precio, precio_original, descripcion, 
            imagen, stock, condicion, etiquetas, eco_score, 
            especificaciones, ubicacion, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        producto['nombre'],
        producto['categoria'],
        producto['precio'],
        producto.get('precio_original'),
        producto['descripcion'],
        producto['imagen'],
        producto['stock'],
        producto['condicion'],
        producto['etiquetas'],
        producto['eco_score'],
        producto.get('especificaciones', '{}'),
        producto.get('ubicacion', ''),
        datetime.now().isoformat()
    ))
    
    return cursor.lastrowid

def generar_thumbnail(imagen_url, producto_id):
    """Genera URL de thumbnail (simplificado)"""
    # En un caso real, aquí se descargaría y procesaría la imagen
    return imagen_url.replace('w=400&h=300', 'w=150&h=150')

def main():
    """Función principal"""
    print("🌱 EcoMarket - Agregando productos con imágenes...")
    
    # Verificar que la base de datos existe
    if not os.path.exists(DB_PATH):
        print(f"❌ Base de datos no encontrada: {DB_PATH}")
        return
    
    conn = get_db_connection()
    
    try:
        productos_agregados = 0
        productos_existente = 0
        
        for producto in PRODUCTOS_CON_IMAGENES:
            # Verificar si el producto ya existe
            if producto_existe(conn, producto['nombre']):
                print(f"⏭️  Producto ya existe: {producto['nombre']}")
                productos_existente += 1
                continue
            
            # Insertar producto
            producto_id = insertar_producto(conn, producto)
            
            # Generar thumbnail
            thumbnail_url = generar_thumbnail(producto['imagen'], producto_id)
            
            # Actualizar thumbnail
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE productos SET imagen_thumb = ? WHERE id = ?",
                (thumbnail_url, producto_id)
            )
            
            print(f"✅ Producto agregado: {producto['nombre']} (ID: {producto_id})")
            productos_agregados += 1
        
        conn.commit()
        
        print(f"\n📊 Resumen:")
        print(f"   ✅ Productos agregados: {productos_agregados}")
        print(f"   ⏭️  Productos ya existentes: {productos_existente}")
        print(f"   📦 Total procesados: {len(PRODUCTOS_CON_IMAGENES)}")
        
        # Guardar en JSON también
        try:
            with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
                productos_existentes = json.load(f)
            
            nuevos_productos = []
            for producto in PRODUCTOS_CON_IMAGENES:
                if not any(p['nombre'] == producto['nombre'] for p in productos_existentes):
                    nuevos_productos.append(producto)
            
            productos_existentes.extend(nuevos_productos)
            
            with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
                json.dump(productos_existentes, f, indent=2, ensure_ascii=False)
            
            print(f"💾 JSON actualizado: {PRODUCTS_FILE}")
            
        except Exception as e:
            print(f"⚠️  Error actualizando JSON: {e}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    main()