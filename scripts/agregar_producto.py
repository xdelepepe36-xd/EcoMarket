"""
agregar_producto.py — Añade un producto al catálogo de EcoMarket de forma segura.

Agrega un producto a data/products.json respetando el formato existente.
También copia la imagen si se indica una ruta local (a static/uploads/).

Uso interactivo:
    python scripts/agregar_producto.py

O con argumentos (no interactivo):
    python scripts/agregar_producto.py "Botella Reutilizable 1L" \
        Accesorios 55 "Botella de acero inoxidable 1L, libre de BPA." \
        --imagen https://images.unsplash.com/... --stock 30 --vistas 100
"""
import argparse
import json
import os
import shutil
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE, 'data', 'products.json')
UPLOADS = os.path.join(BASE, 'static', 'uploads')
CATEGORIAS = ['Hogar', 'Accesorios', 'Higiene', 'Jardín', 'Alimentación', 'Ropa']


def cargar():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def guardar(productos):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        f.write('[\n')
        for i, p in enumerate(productos):
            coma = ',' if i < len(productos) - 1 else ''
            f.write('  ' + json.dumps(p, ensure_ascii=False) + coma + '\n')
        f.write(']\n')


def procesar_imagen(ruta_o_url):
    """Si es una ruta local, la copia a uploads y devuelve URL estática."""
    if not ruta_o_url:
        return ''
    if ruta_o_url.startswith('http'):
        return ruta_o_url
    if os.path.exists(ruta_o_url):
        os.makedirs(UPLOADS, exist_ok=True)
        nombre = 'producto-' + os.path.basename(ruta_o_url)
        destino = os.path.join(UPLOADS, nombre)
        shutil.copy(ruta_o_url, destino)
        return 'uploads/' + nombre
    return ruta_o_url


def agregar(nombre, categoria, precio, descripcion, imagen='', stock=10,
            precio_original=None, condicion='nuevo', vistas=0):
    productos = cargar()
    # No duplicar por nombre
    if any(p['nombre'] == nombre for p in productos):
        print('[AVISO] Ya existe un producto con ese nombre. No se agrego.')
        return False

    nuevo_id = max((p['id'] for p in productos), default=0) + 1
    producto = {
        'id': nuevo_id,
        'nombre': nombre,
        'categoria': categoria,
        'precio': float(precio),
        'precio_original': float(precio_original) if precio_original else float(precio),
        'descripcion': descripcion,
        'imagen': procesar_imagen(imagen),
        'stock': int(stock),
        'condicion': condicion,
        'vistas': int(vistas),
    }
    productos.append(producto)
    guardar(productos)
    print(f'[OK] Producto agregado (id {nuevo_id}): {nombre}')
    print('Reinicia la app para que el seed aditivo lo inserte en la BD.')
    return True


def main():
    parser = argparse.ArgumentParser(description='Agregar producto a EcoMarket')
    parser.add_argument('nombre', nargs='?')
    parser.add_argument('categoria', nargs='?')
    parser.add_argument('precio', nargs='?', type=float)
    parser.add_argument('descripcion', nargs='?')
    parser.add_argument('--imagen', default='')
    parser.add_argument('--stock', type=int, default=10)
    parser.add_argument('--precio_original', type=float, default=None)
    parser.add_argument('--condicion', default='nuevo')
    parser.add_argument('--vistas', type=int, default=0)
    args = parser.parse_args()

    if not (args.nombre and args.categoria and args.precio and args.descripcion):
        print('Modo interactivo\n')
        nombre = input('Nombre del producto: ').strip()
        categoria = input(f'Categoría ({"/".join(CATEGORIAS)}): ').strip()
        try:
            precio = float(input('Precio (S/.): ').strip())
        except ValueError:
            print('Precio inválido.')
            sys.exit(1)
        descripcion = input('Descripción: ').strip()
        imagen = input('URL de imagen o ruta local (Enter para vacío): ').strip()
        args = argparse.Namespace(nombre=nombre, categoria=categoria, precio=precio,
                                  descripcion=descripcion, imagen=imagen,
                                  stock=10, precio_original=None,
                                  condicion='nuevo', vistas=0)
    else:
        print('Modo argumentos')

    if args.categoria not in CATEGORIAS:
        print(f'[AVISO] La categoria "{args.categoria}" no esta en la lista. Se usara igualmente.')
    agregar(args.nombre, args.categoria, args.precio, args.descripcion,
            args.imagen, args.stock, args.precio_original, args.condicion, args.vistas)


if __name__ == '__main__':
    main()