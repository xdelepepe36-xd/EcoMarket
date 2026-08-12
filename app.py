"""
EcoMarket - Marketplace Ecológico v3.0
Backend completo con SQLite, subida de imágenes, API REST, dashboard y más.
"""
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory
import sqlite3
import os
import json
from functools import wraps
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import hashlib
import secrets
from PIL import Image

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get('DATABASE_URL', os.path.join(BASE_DIR, 'data', 'ecomarket.db'))
UPLOAD_FOLDER = os.environ.get('UPLOADS_DIR', os.path.join(BASE_DIR, 'static', 'uploads'))


# ── Filtros Jinja2 personalizados ────────────────────────────────────────────

@app.template_filter('fromjson')
def fromjson_filter(value):
    """Convierte una cadena JSON a un objeto Python."""
    if not value:
        return {}
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return {}

# Configuración de subida de imágenes
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
ITEMS_PER_PAGE = 12

# Imágenes por defecto para productos (Unsplash)
PRODUCT_IMAGES = {
    'Hogar': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    'Accesorios': 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=300&fit=crop',
    'Higiene': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop',
    'Jardín': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop',
    'Alimentación': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    'Ropa': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'
}

# Asegurar que la carpeta de uploads existe
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_product_image(categoria):
    return PRODUCT_IMAGES.get(categoria, PRODUCT_IMAGES['default'])


def _create_thumbnail(saved_path, thumb_path, max_size=800):
    """Genera una miniatura del archivo guardado en saved_path y la escribe en thumb_path.
    No procesa SVGs; en caso de error, elimina cualquier intento parcial.
    """
    try:
        ext = os.path.splitext(saved_path)[1].lower().lstrip('.')
        if ext == 'svg':
            return False
        with Image.open(saved_path) as img:
            img.convert('RGB')
            img.thumbnail((max_size, max_size), Image.LANCZOS)
            # Asegurar carpeta
            os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
            img.save(thumb_path, optimize=True, quality=85)
        return True
    except Exception:
        try:
            if os.path.exists(thumb_path):
                os.remove(thumb_path)
        except Exception:
            pass
        return False


# ── DB ──────────────────────────────────────────────────────────────────────

def get_db():
    """Obtiene una conexión a la base de datos SQLite con configuración optimizada.
    
    Returns:
        sqlite3.Connection: Conexión con row_factory configurado y PRAGMAs aplicados.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA cache_size=-8000")
    return conn


def init_db():
    """Inicializa la base de datos creando todas las tablas, seeds e índices.
    
    Crea las tablas si no existen, inserta productos y cupones de ejemplo
    si están vacías, aplica migraciones y crea índices para optimizar búsquedas.
    """
    # Asegurar que el directorio de la base de datos existe
    db_dir = os.path.dirname(DB_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            avatar TEXT DEFAULT '',
            avatar_color TEXT DEFAULT '#2e7d32',
            banner TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            rol TEXT DEFAULT 'comprador',
            xp INTEGER DEFAULT 0,
            nivel INTEGER DEFAULT 1,
            rango TEXT DEFAULT 'Semilla 🌱',
            eco_puntos INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
         CREATE TABLE IF NOT EXISTS productos (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             nombre TEXT NOT NULL,
             categoria TEXT NOT NULL,
             precio REAL NOT NULL,
             precio_original REAL,
             descripcion TEXT NOT NULL,
             imagen TEXT DEFAULT '',
             imagen_thumb TEXT DEFAULT '',
             stock INTEGER DEFAULT 10,
             condicion TEXT DEFAULT 'nuevo',
             etiquetas TEXT DEFAULT '',
             eco_score INTEGER DEFAULT 0,
             especificaciones TEXT DEFAULT '',
             usuario_id INTEGER,
             vistas INTEGER DEFAULT 0,
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
         );
         
         CREATE TABLE IF NOT EXISTS producto_imagenes (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             producto_id INTEGER NOT NULL,
             imagen TEXT NOT NULL,
             imagen_thumb TEXT DEFAULT '',
             titulo TEXT DEFAULT '',
             orden INTEGER DEFAULT 0,
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
         );
        
        CREATE TABLE IF NOT EXISTS favoritos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(usuario_id, producto_id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS resenas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            usuario_id INTEGER,
            nombre TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comentario TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        );
        
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            direccion TEXT NOT NULL,
            total REAL NOT NULL,
            estado TEXT DEFAULT 'confirmado',
            metodo_pago TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        );
        
        CREATE TABLE IF NOT EXISTS pedido_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            producto_id INTEGER,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            cantidad INTEGER DEFAULT 1,
            FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS notificaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            titulo TEXT NOT NULL,
            mensaje TEXT NOT NULL,
            tipo TEXT DEFAULT 'info',
            leida INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS visitas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pagina TEXT NOT NULL,
            usuario_id INTEGER,
            ip TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS seguidores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seguidor_id INTEGER NOT NULL,
            seguido_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(seguidor_id, seguido_id),
            FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (seguido_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS logros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            logro_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(usuario_id, logro_id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS insignias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            insignia_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(usuario_id, insignia_id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS historial_busquedas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            termino TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS cupones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE NOT NULL,
            descuento REAL NOT NULL,
            tipo TEXT DEFAULT '%',
            minimo REAL DEFAULT 0,
            usos_maximos INTEGER DEFAULT 100,
            usos_actuales INTEGER DEFAULT 0,
            expira TIMESTAMP,
            activo INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')

    # Seed productos si la tabla está vacía
    if conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0] == 0:
        seed_path = os.path.join(os.path.dirname(__file__), 'data', 'products.json')
        if os.path.exists(seed_path):
            with open(seed_path, 'r', encoding='utf-8') as f:
                try:
                    productos = json.load(f)
                    for p in productos:
                        imagen = p.get('imagen', '')
                        if not imagen or imagen == 'uploads/placeholder.svg':
                            imagen = get_product_image(p.get('categoria', 'default'))
                        conn.execute(
                            'INSERT INTO productos (nombre, categoria, precio, precio_original, descripcion, imagen, stock, condicion, vistas) VALUES (?,?,?,?,?,?,?,?,?)',
                            (p['nombre'], p['categoria'], p['precio'], p.get('precio_original', p['precio']),
                             p['descripcion'], imagen,
                             p.get('stock', 10), p.get('condicion', 'nuevo'), p.get('vistas', 0))
                        )
                except json.JSONDecodeError:
                    pass

    # Seed cupones si la tabla está vacía
    if conn.execute('SELECT COUNT(*) FROM cupones').fetchone()[0] == 0:
        cupones = [
            ('ECO10', 10, '%', 30, 100, '2026-12-31'),
            ('ECO20', 20, '%', 80, 100, '2026-12-31'),
            ('ENVIOFREE', 100, 'shipping', 0, 100, '2026-12-31'),
            ('BIENVENIDO', 15, 'fixed', 0, 200, '2026-12-31'),
        ]
        for c in cupones:
            conn.execute(
                'INSERT INTO cupones (codigo, descuento, tipo, minimo, usos_maximos, expira) VALUES (?,?,?,?,?,?)',
                c
            )

    # ── Migraciones para BD existentes ─────────────────────────
    # Agregar columna especificaciones si no existe
    try:
        conn.execute('ALTER TABLE productos ADD COLUMN especificaciones TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass  # La columna ya existe

    # Agregar columna imagen_thumb a productos si no existe
    try:
        conn.execute('ALTER TABLE productos ADD COLUMN imagen_thumb TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # Agregar columna imagen_thumb a producto_imagenes si no existe
    try:
        conn.execute('ALTER TABLE producto_imagenes ADD COLUMN imagen_thumb TEXT DEFAULT ""')
        conn.commit()
    except sqlite3.OperationalError:
        pass

    # ── Índices para optimizar búsquedas ──────────────────────
    conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(precio)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_usuario ON productos(usuario_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_resenas_producto ON resenas(producto_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_producto_imagenes_producto ON producto_imagenes(producto_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_productos_imagen_thumb ON productos(imagen_thumb)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_producto_imagenes_imagen_thumb ON producto_imagenes(imagen_thumb)')

    conn.commit()
    conn.close()


# ── Decoradores ──────────────────────────────────────────────────────────────

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'usuario_id' not in session:
            if request.is_json:
                return jsonify({'error': 'No autorizado'}), 401
            flash('Debes iniciar sesión para acceder.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('rol') != 'admin':
            flash('Acceso restringido. Se requieren permisos de administrador.', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated


# ── Utilidades ───────────────────────────────────────────────────────────────

def get_productos_destacados(limit=6):
    conn = get_db()
    productos = conn.execute('''
        SELECT p.*, u.nombre as vendedor_nombre,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas
        FROM productos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN resenas r ON p.id = r.producto_id
        GROUP BY p.id
        ORDER BY p.vistas DESC, p.created_at DESC
        LIMIT ?
    ''', (limit,)).fetchall()
    conn.close()
    return productos


def get_producto_detalle(producto_id):
    conn = get_db()
    producto = conn.execute('''
        SELECT p.*, u.nombre as vendedor_nombre, u.email as vendedor_email, u.avatar as vendedor_avatar,
            (SELECT COUNT(*) FROM productos WHERE usuario_id = p.usuario_id) as total_vendedor_productos,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas
        FROM productos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN resenas r ON p.id = r.producto_id
        WHERE p.id = ?
        GROUP BY p.id
    ''', (producto_id,)).fetchone()

    if producto:
        conn.execute('UPDATE productos SET vistas = vistas + 1 WHERE id = ?', (producto_id,))
        conn.commit()

        relacionados = conn.execute('''
            SELECT p.*, COALESCE(AVG(r.rating), 0) as rating_promedio,
                COUNT(DISTINCT r.id) as total_resenas
            FROM productos p
            LEFT JOIN resenas r ON p.id = r.producto_id
            WHERE p.categoria = ? AND p.id != ?
            GROUP BY p.id
            ORDER BY RANDOM() LIMIT 4
        ''', (producto['categoria'], producto_id)).fetchall()

        similares = conn.execute('''
            SELECT p.*, COALESCE(AVG(r.rating), 0) as rating_promedio,
                COUNT(DISTINCT r.id) as total_resenas
            FROM productos p
            LEFT JOIN resenas r ON p.id = r.producto_id
            WHERE p.id != ? AND p.precio BETWEEN ? * 0.7 AND ? * 1.3
            GROUP BY p.id
            ORDER BY RANDOM() LIMIT 4
        ''', (producto_id, producto['precio'], producto['precio'])).fetchall()

        resenas = conn.execute('''
            SELECT r.*, COALESCE(u.nombre, r.nombre) as nombre_usuario
            FROM resenas r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.producto_id = ?
            ORDER BY r.created_at DESC
        ''', (producto_id,)).fetchall()

        estrellas = {}
        for i in range(1, 6):
            count = conn.execute(
                'SELECT COUNT(*) FROM resenas WHERE producto_id = ? AND rating = ?',
                (producto_id, i)
            ).fetchone()[0]
            estrellas[i] = count

        # Imágenes adicionales del producto (galería)
        imagenes_extra = conn.execute(
            'SELECT * FROM producto_imagenes WHERE producto_id = ? ORDER BY orden ASC, id ASC',
            (producto_id,)
        ).fetchall()

        # If producto.imagen_thumb exists use it for main image prefer thumb
        if producto.get('imagen_thumb'):
            producto = dict(producto)
            producto['imagen_pref'] = producto.get('imagen_thumb') or producto.get('imagen')
        else:
            producto = dict(producto)
            producto['imagen_pref'] = producto.get('imagen')

        # Normalize imagenes_extra to dicts
        imagenes_extra = [dict(i) for i in imagenes_extra]

        # Especificaciones del producto (JSON)
        especificaciones = {}
        if producto['especificaciones']:
            try:
                especificaciones = json.loads(producto['especificaciones'])
            except (json.JSONDecodeError, TypeError):
                especificaciones = {}

        conn.close()
        return {
            'producto': producto,
            'relacionados': relacionados,
            'similares': similares,
            'resenas': resenas,
            'estrellas': estrellas,
            'imagenes_extra': imagenes_extra,
            'especificaciones': especificaciones
        }
    conn.close()
    return None


def get_categorias():
    conn = get_db()
    categorias = [r['categoria'] for r in
                  conn.execute('SELECT DISTINCT categoria FROM productos ORDER BY categoria').fetchall()]
    conn.close()
    return categorias


def add_notificacion(usuario_id, titulo, mensaje, tipo='info'):
    conn = get_db()
    conn.execute(
        'INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES (?,?,?,?)',
        (usuario_id, titulo, mensaje, tipo)
    )
    conn.commit()
    conn.close()


def registrar_visita(pagina):
    try:
        conn = get_db()
        conn.execute(
            'INSERT INTO visitas (pagina, usuario_id, ip) VALUES (?,?,?)',
            (pagina, session.get('usuario_id'), request.remote_addr or '')
        )
        conn.commit()
        conn.close()
    except:
        pass


def add_xp(usuario_id, cantidad):
    conn = get_db()
    conn.execute('UPDATE usuarios SET xp = xp + ? WHERE id = ?', (cantidad, usuario_id))
    usuario = conn.execute('SELECT xp, nivel, rango FROM usuarios WHERE id = ?', (usuario_id,)).fetchone()
    if usuario:
        xp = usuario['xp']
        nuevo_nivel = min(50, 1 + xp // 100)
        if nuevo_nivel > usuario['nivel']:
            conn.execute('UPDATE usuarios SET nivel = ? WHERE id = ?', (nuevo_nivel, usuario_id))
    conn.commit()
    conn.close()


# ── Rutas principales ────────────────────────────────────────────────────────

@app.route('/')
def index():
    registrar_visita('inicio')
    productos = get_productos_destacados(6)
    categorias = get_categorias()
    return render_template('index.html', productos=productos, categorias=categorias)


@app.route('/productos')
def productos_view():
    registrar_visita('productos')
    conn = get_db()
    categoria = request.args.get('categoria', '')
    orden = request.args.get('orden', 'nuevos')
    precio_min = request.args.get('precio_min', '')
    precio_max = request.args.get('precio_max', '')
    busqueda = request.args.get('q', '')
    pagina = int(request.args.get('pagina', 1))

    query = '''
        SELECT p.*, u.nombre as vendedor_nombre,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas
        FROM productos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN resenas r ON p.id = r.producto_id
        WHERE 1=1
    '''
    count_query = 'SELECT COUNT(*) FROM (SELECT p.id FROM productos p WHERE 1=1'
    params = []
    count_params = []

    if categoria and categoria != 'Todas':
        query += ' AND p.categoria = ?'
        count_query += ' AND p.categoria = ?'
        params.append(categoria)
        count_params.append(categoria)
    if busqueda:
        query += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)'
        count_query += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)'
        params.extend([f'%{busqueda}%', f'%{busqueda}%'])
        count_params.extend([f'%{busqueda}%', f'%{busqueda}%'])
    if precio_min:
        query += ' AND p.precio >= ?'
        count_query += ' AND p.precio >= ?'
        params.append(float(precio_min))
        count_params.append(float(precio_min))
    if precio_max:
        query += ' AND p.precio <= ?'
        count_query += ' AND p.precio <= ?'
        params.append(float(precio_max))
        count_params.append(float(precio_max))

    query += ' GROUP BY p.id'
    count_query += ')'

    total_productos = conn.execute(count_query, count_params).fetchone()[0]
    total_paginas = max(1, (total_productos + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE)
    pagina = max(1, min(pagina, total_paginas))
    offset = (pagina - 1) * ITEMS_PER_PAGE

    ordenes = {
        'nuevos': 'ORDER BY p.created_at DESC',
        'populares': 'ORDER BY p.vistas DESC',
        'baratos': 'ORDER BY p.precio ASC',
        'caros': 'ORDER BY p.precio DESC',
        'mejor_valorados': 'ORDER BY rating_promedio DESC'
    }
    query += ' ' + ordenes.get(orden, 'ORDER BY p.created_at DESC')
    query += f' LIMIT {ITEMS_PER_PAGE} OFFSET {offset}'

    productos = conn.execute(query, params).fetchall()
    categorias = [r['categoria'] for r in
                  conn.execute('SELECT DISTINCT categoria FROM productos ORDER BY categoria').fetchall()]
    conn.close()

    return render_template('productos.html',
                           productos=productos,
                           categorias=categorias,
                           total_productos=total_productos,
                           categoria_sel=categoria,
                           orden_sel=orden,
                           busqueda=busqueda,
                           pagina=pagina,
                           total_paginas=total_paginas)


@app.route('/producto/<int:producto_id>')
def producto_detalle(producto_id):
    registrar_visita(f'producto_{producto_id}')
    data = get_producto_detalle(producto_id)
    if data is None:
        flash('Producto no encontrado.', 'warning')
        return redirect(url_for('productos_view'))

    es_favorito = False
    if 'usuario_id' in session:
        conn = get_db()
        fav = conn.execute(
            'SELECT id FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
            (session['usuario_id'], producto_id)
        ).fetchone()
        es_favorito = fav is not None
        conn.close()

    return render_template('detalle-producto.html',
                           **data,
                           es_favorito=es_favorito,
                           ahora=datetime.now())


@app.route('/api/producto/<int:producto_id>/favorito', methods=['POST'])
@login_required
def toggle_favorito_api(producto_id):
    conn = get_db()
    fav = conn.execute(
        'SELECT id FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
        (session['usuario_id'], producto_id)
    ).fetchone()

    if fav:
        conn.execute('DELETE FROM favoritos WHERE id = ?', (fav['id'],))
        conn.commit()
        conn.close()
        return jsonify({'favorito': False})

    conn.execute('INSERT INTO favoritos (usuario_id, producto_id) VALUES (?,?)',
                 (session['usuario_id'], producto_id))
    conn.commit()
    conn.close()
    add_xp(session['usuario_id'], 5)
    return jsonify({'favorito': True})


@app.route('/api/producto/<int:producto_id>/resena', methods=['POST'])
@login_required
def agregar_resena_api(producto_id):
    data = request.get_json()
    rating = int(data.get('rating', 5))
    comentario = data.get('comentario', '').strip()

    if rating < 1 or rating > 5:
        return jsonify({'error': 'Rating inválido'}), 400

    conn = get_db()
    conn.execute(
        'INSERT INTO resenas (producto_id, usuario_id, nombre, rating, comentario) VALUES (?,?,?,?,?)',
        (producto_id, session['usuario_id'], session['nombre'], rating, comentario)
    )
    conn.commit()

    vendedor = conn.execute(
        'SELECT usuario_id FROM productos WHERE id = ?',
        (producto_id,)
    ).fetchone()
    if vendedor and vendedor['usuario_id']:
        add_notificacion(
            vendedor['usuario_id'],
            '⭐ Nueva reseña',
            f'{session["nombre"]} dejó una reseña en tu producto.',
            'success'
        )
    conn.close()
    add_xp(session['usuario_id'], 10)
    return jsonify({'success': True})


@app.route('/favoritos')
@login_required
def favoritos_view():
    conn = get_db()
    productos = conn.execute('''
        SELECT p.*, u.nombre as vendedor_nombre,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas,
            f.created_at as fecha_favorito
        FROM favoritos f
        JOIN productos p ON f.producto_id = p.id
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN resenas r ON p.id = r.producto_id
        WHERE f.usuario_id = ?
        GROUP BY p.id
        ORDER BY f.created_at DESC
    ''', (session['usuario_id'],)).fetchall()
    conn.close()
    return render_template('favoritos.html', productos=productos)


@app.route('/api/favorito/<int:producto_id>', methods=['DELETE'])
@login_required
def eliminar_favorito_api(producto_id):
    conn = get_db()
    conn.execute(
        'DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?',
        (session['usuario_id'], producto_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})


@app.route('/carrito')
def carrito_view():
    conn = get_db()
    productos = [dict(p) for p in conn.execute(
        'SELECT p.*, COALESCE(AVG(r.rating), 0) as rating_promedio FROM productos p LEFT JOIN resenas r ON p.id = r.producto_id GROUP BY p.id ORDER BY p.created_at DESC'
    ).fetchall()]
    conn.close()
    return render_template('carrito.html', productos_json=productos)


@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    if request.method == 'POST':
        if 'usuario_id' not in session:
            return jsonify({'error': 'Debes iniciar sesión'}), 401

        data = request.get_json()
        nombre = data.get('nombre', '').strip()
        email = data.get('email', '').strip()
        direccion = data.get('direccion', '').strip()
        items = data.get('items', [])
        metodo_pago = data.get('metodo_pago', '')

        if not all([nombre, email, direccion]):
            return jsonify({'error': 'Completa todos los campos'}), 400

        total = sum(item['precio'] * item['cantidad'] for item in items)

        conn = get_db()
        cursor = conn.execute(
            'INSERT INTO pedidos (usuario_id, nombre, email, direccion, total, metodo_pago) VALUES (?,?,?,?,?,?)',
            (session['usuario_id'], nombre, email, direccion, total, metodo_pago)
        )
        pedido_id = cursor.lastrowid

        for item in items:
            conn.execute(
                'INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio, cantidad) VALUES (?,?,?,?,?)',
                (pedido_id, item.get('id'), item['nombre'], item['precio'], item['cantidad'])
            )

        conn.commit()
        conn.close()

        add_notificacion(session['usuario_id'], '📦 Pedido confirmado',
                         f'Tu pedido #{pedido_id} por S/.{total:.2f} ha sido confirmado.', 'success')
        add_xp(session['usuario_id'], 25)

        return jsonify({'success': True, 'pedido_id': pedido_id})

    conn = get_db()
    productos = [dict(p) for p in conn.execute(
        'SELECT * FROM productos ORDER BY id DESC'
    ).fetchall()]
    conn.close()
    return render_template('checkout.html', productos_json=productos)


@app.route('/confirmacion')
def confirmacion():
    pedido_id = request.args.get('pedido_id', '')
    return render_template('confirmacion.html', pedido_id=pedido_id)


@app.route('/publicar', methods=['GET', 'POST'])
@login_required
def publicar():
    categorias = get_categorias()
    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        categoria = request.form.get('categoria', '').strip()
        precio = request.form.get('precio', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        stock = request.form.get('stock', '10').strip()
        condicion = request.form.get('condicion', 'nuevo').strip()
        especificaciones_raw = request.form.get('especificaciones', '').strip()
        imagen = get_product_image(categoria)

        # Subir imagen principal si se proporcionó
        if 'imagen' in request.files:
            file = request.files['imagen']
            if file and file.filename and allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                filename = f"{uuid.uuid4().hex}.{ext}"
                saved_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(saved_path)
                imagen = f'uploads/{filename}'

                # Generar miniatura (thumb)
                thumb_name = f"{uuid.uuid4().hex}_thumb.jpg"
                thumb_path = os.path.join(app.config['UPLOAD_FOLDER'], thumb_name)
                if _create_thumbnail(saved_path, thumb_path, max_size=800):
                    imagen_thumb = f'uploads/{thumb_name}'
                else:
                    imagen_thumb = ''
            else:
                imagen_thumb = ''
        else:
            imagen_thumb = ''

        if not all([nombre, categoria, precio, descripcion]):
            flash('Completa todos los campos obligatorios.', 'danger')
            return redirect(url_for('publicar'))

        try:
            precio_valor = float(precio)
            stock_valor = int(stock)
        except ValueError:
            flash('Precio o stock inválido.', 'danger')
            return redirect(url_for('publicar'))

        # Procesar especificaciones (formato: "clave: valor" por línea)
        especificaciones_json = ''
        if especificaciones_raw:
            specs = {}
            for linea in especificaciones_raw.split('\n'):
                if ':' in linea:
                    clave, valor = linea.split(':', 1)
                    specs[clave.strip()] = valor.strip()
            if specs:
                especificaciones_json = json.dumps(specs, ensure_ascii=False)

        conn = get_db()
        cursor = conn.execute(
            'INSERT INTO productos (nombre, categoria, precio, descripcion, imagen, imagen_thumb, stock, condicion, especificaciones, usuario_id) VALUES (?,?,?,?,?,?,?,?,?,?)',
            (nombre, categoria, precio_valor, descripcion, imagen, imagen_thumb, stock_valor, condicion, especificaciones_json, session['usuario_id'])
        )
        producto_id = cursor.lastrowid

        # Subir imágenes adicionales (galería)
        if 'imagenes_extra' in request.files:
            files = request.files.getlist('imagenes_extra')
            orden = 0
            for file in files:
                if file and file.filename and allowed_file(file.filename):
                    ext = file.filename.rsplit('.', 1)[1].lower()
                    filename = f"{uuid.uuid4().hex}.{ext}"
                    saved_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(saved_path)
                    imagen_rel = f'uploads/{filename}'

                    # Generar miniatura para la imagen de la galería
                    thumb_name = f"{uuid.uuid4().hex}_thumb.jpg"
                    thumb_path = os.path.join(app.config['UPLOAD_FOLDER'], thumb_name)
                    imagen_thumb_rel = ''
                    if _create_thumbnail(saved_path, thumb_path, max_size=800):
                        imagen_thumb_rel = f'uploads/{thumb_name}'

                    conn.execute(
                        'INSERT INTO producto_imagenes (producto_id, imagen, imagen_thumb, titulo, orden) VALUES (?,?,?,?,?)',
                        (producto_id, imagen_rel, imagen_thumb_rel, '', orden)
                    )
                    orden += 1

        conn.commit()
        conn.close()

        add_xp(session['usuario_id'], 15)
        flash('¡Producto publicado con éxito!', 'success')
        return redirect(url_for('producto_detalle', producto_id=producto_id))

    return render_template('publicar.html', categorias=categorias)


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/producto/<int:producto_id>/editar', methods=['GET', 'POST'])
@login_required
def editar_producto(producto_id):
    conn = get_db()
    producto = conn.execute('SELECT * FROM productos WHERE id = ? AND usuario_id = ?',
                            (producto_id, session['usuario_id'])).fetchone()
    if not producto:
        conn.close()
        flash('Producto no encontrado.', 'danger')
        return redirect(url_for('perfil'))

    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        categoria = request.form.get('categoria', '').strip()
        precio = request.form.get('precio', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        stock = request.form.get('stock', '10').strip()
        especificaciones_raw = request.form.get('especificaciones', '').strip()

        # Procesar especificaciones
        especificaciones_json = ''
        if especificaciones_raw:
            specs = {}
            for linea in especificaciones_raw.split('\n'):
                if ':' in linea:
                    clave, valor = linea.split(':', 1)
                    specs[clave.strip()] = valor.strip()
            if specs:
                especificaciones_json = json.dumps(specs, ensure_ascii=False)

        if all([nombre, categoria, precio, descripcion]):
            conn.execute(
                'UPDATE productos SET nombre=?, categoria=?, precio=?, descripcion=?, stock=?, especificaciones=? WHERE id=?',
                (nombre, categoria, float(precio), descripcion, int(stock), especificaciones_json, producto_id)
            )
            conn.commit()
            flash('Producto actualizado.', 'success')
        conn.close()
        return redirect(url_for('perfil'))

    conn.close()
    return render_template('publicar.html', producto=producto, editando=True)


@app.route('/producto/<int:producto_id>/eliminar', methods=['POST'])
@login_required
def eliminar_producto(producto_id):
    conn = get_db()
    conn.execute('DELETE FROM productos WHERE id = ? AND usuario_id = ?',
                 (producto_id, session['usuario_id']))
    conn.commit()
    conn.close()
    flash('Producto eliminado.', 'success')
    return redirect(url_for('perfil'))


@app.route('/terminos')
def terminos():
    return render_template('terminos.html')

@app.route('/privacidad')
def privacidad():
    return render_template('privacidad.html')

@app.route('/contacto', methods=['GET', 'POST'])
def contacto():
    if request.method == 'POST':
        flash('Mensaje enviado. Te responderemos pronto.', 'success')
        return redirect(url_for('contacto'))
    return render_template('contacto.html')


@app.route('/impacto')
def impacto():
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    categorias = conn.execute('SELECT COUNT(DISTINCT categoria) FROM productos').fetchone()[0]
    total_resenas = conn.execute('SELECT COUNT(*) FROM resenas').fetchone()[0]
    total_usuarios = conn.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0]
    total_visitas = conn.execute('SELECT COUNT(*) FROM visitas').fetchone()[0]
    total_pedidos = conn.execute('SELECT COUNT(*) FROM pedidos').fetchone()[0]
    conn.close()
    return render_template('impacto.html',
                           total_productos=total,
                           total_categorias=categorias,
                           total_resenas=total_resenas,
                           total_usuarios=total_usuarios,
                           total_visitas=total_visitas,
                           total_pedidos=total_pedidos)


# ── API Dashboard ────────────────────────────────────────────────────────────

@app.route('/api/dashboard')
@login_required
def api_dashboard():
    conn = get_db()
    user_id = session['usuario_id']

    mis_productos = conn.execute(
        'SELECT COUNT(*) FROM productos WHERE usuario_id = ?',
        (user_id,)
    ).fetchone()[0]

    mis_ventas = conn.execute('''
        SELECT COUNT(*) FROM pedido_items pi
        JOIN productos p ON pi.producto_id = p.id
        WHERE p.usuario_id = ?
    ''', (user_id,)).fetchone()[0]

    ingresos = conn.execute('''
        SELECT COALESCE(SUM(pi.precio * pi.cantidad), 0) FROM pedido_items pi
        JOIN productos p ON pi.producto_id = p.id
        WHERE p.usuario_id = ?
    ''', (user_id,)).fetchone()[0]

    resenas = conn.execute('''
        SELECT COUNT(*) FROM resenas r
        JOIN productos p ON r.producto_id = p.id
        WHERE p.usuario_id = ?
    ''', (user_id,)).fetchone()[0]

    seguidores = conn.execute(
        'SELECT COUNT(*) FROM seguidores WHERE seguido_id = ?',
        (user_id,)
    ).fetchone()[0]

    siguiendo = conn.execute(
        'SELECT COUNT(*) FROM seguidores WHERE seguidor_id = ?',
        (user_id,)
    ).fetchone()[0]

    ventas_mes = []
    for i in range(5, -1, -1):
        mes = (datetime.now() - timedelta(days=30 * i)).strftime('%Y-%m')
        count = conn.execute('''
            SELECT COUNT(*) FROM pedidos
            WHERE strftime('%Y-%m', created_at) = ?
        ''', (mes,)).fetchone()[0]
        ventas_mes.append({'mes': mes, 'ventas': count})

    conn.close()

    return jsonify({
        'mis_productos': mis_productos,
        'mis_ventas': mis_ventas,
        'ingresos': ingresos,
        'resenas': resenas,
        'seguidores': seguidores,
        'siguiendo': siguiendo,
        'ventas_mes': ventas_mes
    })


@app.route('/api/admin/dashboard')
@login_required
@admin_required
def api_admin_dashboard():
    conn = get_db()

    total_productos = conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0]
    total_usuarios = conn.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0]
    total_pedidos = conn.execute('SELECT COUNT(*) FROM pedidos').fetchone()[0]
    total_ingresos = conn.execute('SELECT COALESCE(SUM(total), 0) FROM pedidos').fetchone()[0]
    total_visitas = conn.execute('SELECT COUNT(*) FROM visitas').fetchone()[0]
    total_resenas = conn.execute('SELECT COUNT(*) FROM resenas').fetchone()[0]

    categorias = conn.execute(
        'SELECT categoria, COUNT(*) as count FROM productos GROUP BY categoria ORDER BY count DESC'
    ).fetchall()

    visitas_dia = []
    for i in range(6, -1, -1):
        dia = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        count = conn.execute(
            "SELECT COUNT(*) FROM visitas WHERE date(created_at) = ?",
            (dia,)
        ).fetchone()[0]
        visitas_dia.append({'dia': dia, 'visitas': count})

    conn.close()

    return jsonify({
        'total_productos': total_productos,
        'total_usuarios': total_usuarios,
        'total_pedidos': total_pedidos,
        'total_ingresos': total_ingresos,
        'total_visitas': total_visitas,
        'total_resenas': total_resenas,
        'categorias': [dict(c) for c in categorias],
        'visitas_dia': visitas_dia
    })


# ── API Cupones ──────────────────────────────────────────────────────────────

@app.route('/api/cupon/validar', methods=['POST'])
@login_required
def validar_cupon():
    data = request.get_json()
    codigo = data.get('codigo', '').strip().upper()
    total = float(data.get('total', 0))

    conn = get_db()
    cupon = conn.execute(
        'SELECT * FROM cupones WHERE codigo = ? AND activo = 1 AND usos_actuales < usos_maximos',
        (codigo,)
    ).fetchone()

    if not cupon:
        conn.close()
        return jsonify({'valido': False, 'error': 'Cupón inválido o expirado'})

    if cupon['expira']:
        expira = datetime.strptime(cupon['expira'], '%Y-%m-%d')
        if expira < datetime.now():
            conn.close()
            return jsonify({'valido': False, 'error': 'Cupón expirado'})

    if total < cupon['minimo']:
        conn.close()
        return jsonify({'valido': False, 'error': f'Mínimo S/.{cupon["minimo"]:.2f}'})

    descuento = 0
    if cupon['tipo'] == '%':
        descuento = total * cupon['descuento'] / 100
    elif cupon['tipo'] == 'fixed':
        descuento = cupon['descuento']
    elif cupon['tipo'] == 'shipping':
        descuento = cupon['descuento']

    conn.close()
    return jsonify({
        'valido': True,
        'descuento': round(descuento, 2),
        'total_final': round(total - descuento, 2),
        'codigo': cupon['codigo'],
        'label': cupon['codigo']
    })


# ── API Búsqueda ─────────────────────────────────────────────────────────────

@app.route('/api/buscar')
def api_buscar():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify([])

    conn = get_db()
    resultados = conn.execute('''
        SELECT id, nombre, precio, imagen, categoria
        FROM productos
        WHERE nombre LIKE ? OR descripcion LIKE ?
        LIMIT 10
    ''', (f'%{q}%', f'%{q}%')).fetchall()

    if 'usuario_id' in session:
        conn.execute(
            'INSERT INTO historial_busquedas (usuario_id, termino) VALUES (?,?)',
            (session['usuario_id'], q)
        )
        conn.commit()

    conn.close()
    return jsonify([dict(r) for r in resultados])


# ── API Seguidores ───────────────────────────────────────────────────────────

@app.route('/api/usuario/<int:usuario_id>/seguir', methods=['POST'])
@login_required
def seguir_usuario(usuario_id):
    if usuario_id == session['usuario_id']:
        return jsonify({'error': 'No puedes seguirte a ti mismo'}), 400

    conn = get_db()
    existe = conn.execute(
        'SELECT id FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?',
        (session['usuario_id'], usuario_id)
    ).fetchone()

    if existe:
        conn.execute('DELETE FROM seguidores WHERE id = ?', (existe['id'],))
        conn.commit()
        conn.close()
        return jsonify({'siguiendo': False})

    conn.execute(
        'INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?,?)',
        (session['usuario_id'], usuario_id)
    )
    conn.commit()
    conn.close()
    add_xp(session['usuario_id'], 5)
    return jsonify({'siguiendo': True})


# ── Auth ─────────────────────────────────────────────────────────────────────

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'usuario_id' in session:
        return redirect(url_for('index'))

    # ── Rate limiting: máximo 5 intentos por 15 minutos ──
    intentos = session.get('login_intentos', 0)
    bloqueo_hasta = session.get('login_bloqueo_hasta', 0)
    if bloqueo_hasta and datetime.now().timestamp() < bloqueo_hasta:
        restante = int(bloqueo_hasta - datetime.now().timestamp())
        flash(f'Demasiados intentos fallidos. Espera {restante // 60} minuto(s).', 'danger')
        return render_template('login.html')

    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        conn = get_db()
        usuario = conn.execute('SELECT * FROM usuarios WHERE email = ?', (email,)).fetchone()
        conn.close()
        if usuario and check_password_hash(usuario['password'], password):
            # Login exitoso: limpiar intentos
            session.pop('login_intentos', None)
            session.pop('login_bloqueo_hasta', None)
            session['usuario_id'] = usuario['id']
            session['nombre'] = usuario['nombre']
            session['email'] = usuario['email']
            session['rol'] = usuario['rol']
            flash(f'¡Bienvenido, {usuario["nombre"]}!', 'success')
            return redirect(url_for('index'))

        # Login fallido: incrementar intentos
        session['login_intentos'] = intentos + 1
        if session['login_intentos'] >= 5:
            session['login_bloqueo_hasta'] = datetime.now().timestamp() + 15 * 60  # 15 min
            session['login_intentos'] = 0
            flash('Demasiados intentos fallidos. Acceso bloqueado por 15 minutos.', 'danger')
        else:
            restantes = 5 - session['login_intentos']
            flash(f'Correo o contraseña incorrectos. {restantes} intento(s) restante(s).', 'danger')
    return render_template('login.html')


@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if 'usuario_id' in session:
        return redirect(url_for('index'))
    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        password2 = request.form.get('password2', '').strip()

        if not all([nombre, email, password]):
            flash('Completa todos los campos.', 'danger')
            return redirect(url_for('registro'))
        if password != password2:
            flash('Las contraseñas no coinciden.', 'danger')
            return redirect(url_for('registro'))
        if len(password) < 6:
            flash('La contraseña debe tener al menos 6 caracteres.', 'danger')
            return redirect(url_for('registro'))

        conn = get_db()
        existe = conn.execute('SELECT id FROM usuarios WHERE email = ?', (email,)).fetchone()
        if existe:
            flash('Ya existe una cuenta con ese correo.', 'danger')
            conn.close()
            return redirect(url_for('registro'))

        hashed_password = generate_password_hash(password)
        conn.execute('INSERT INTO usuarios (nombre, email, password) VALUES (?,?,?)',
                     (nombre, email, hashed_password))
        conn.commit()
        usuario = conn.execute('SELECT * FROM usuarios WHERE email = ?', (email,)).fetchone()
        conn.close()

        session['usuario_id'] = usuario['id']
        session['nombre'] = usuario['nombre']
        session['email'] = usuario['email']
        flash(f'¡Cuenta creada! Bienvenido, {nombre}.', 'success')
        return redirect(url_for('index'))
    return render_template('registro.html')


@app.route('/logout')
def logout():
    session.clear()
    flash('Sesión cerrada correctamente.', 'success')
    return redirect(url_for('index'))


@app.route('/perfil')
@login_required
def perfil():
    conn = get_db()

    usuario = conn.execute('SELECT * FROM usuarios WHERE id = ?', (session['usuario_id'],)).fetchone()

    mis_productos = conn.execute('''
        SELECT p.*,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas
        FROM productos p
        LEFT JOIN resenas r ON p.id = r.producto_id
        WHERE p.usuario_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ''', (session['usuario_id'],)).fetchall()

    favoritos = conn.execute('''
        SELECT p.*, f.created_at as fecha_favorito
        FROM favoritos f
        JOIN productos p ON f.producto_id = p.id
        WHERE f.usuario_id = ?
        ORDER BY f.created_at DESC
    ''', (session['usuario_id'],)).fetchall()

    resenas = conn.execute('''
        SELECT r.*, p.nombre as producto_nombre
        FROM resenas r
        JOIN productos p ON r.producto_id = p.id
        WHERE r.usuario_id = ?
        ORDER BY r.created_at DESC
    ''', (session['usuario_id'],)).fetchall()

    pedidos = conn.execute('''
        SELECT * FROM pedidos
        WHERE usuario_id = ?
        ORDER BY created_at DESC LIMIT 10
    ''', (session['usuario_id'],)).fetchall()

    notificaciones = conn.execute(
        'SELECT * FROM notificaciones WHERE usuario_id = ? AND leida = 0 ORDER BY created_at DESC',
        (session['usuario_id'],)
    ).fetchall()

    seguidores = conn.execute(
        'SELECT COUNT(*) FROM seguidores WHERE seguido_id = ?',
        (session['usuario_id'],)
    ).fetchone()[0]

    siguiendo = conn.execute(
        'SELECT COUNT(*) FROM seguidores WHERE seguidor_id = ?',
        (session['usuario_id'],)
    ).fetchone()[0]

    logros = conn.execute(
        'SELECT logro_id FROM logros WHERE usuario_id = ?',
        (session['usuario_id'],)
    ).fetchall()
    logros_lista = [l['logro_id'] for l in logros]

    total_publicaciones = len(mis_productos)
    total_favoritos = len(favoritos)
    total_resenas_recibidas = conn.execute(
        'SELECT COUNT(*) FROM resenas r JOIN productos p ON r.producto_id = p.id WHERE p.usuario_id = ?',
        (session['usuario_id'],)
    ).fetchone()[0]
    total_ventas = conn.execute(
        'SELECT COUNT(*) FROM pedido_items pi JOIN productos p ON pi.producto_id = p.id WHERE p.usuario_id = ?',
        (session['usuario_id'],)
    ).fetchone()[0]
    valor_total = sum(p['precio'] for p in mis_productos)

    conn.close()

    return render_template('perfil.html',
                           usuario=usuario,
                           mis_productos=mis_productos,
                           favoritos=favoritos,
                           resenas=resenas,
                           pedidos=pedidos,
                           notificaciones=notificaciones,
                           seguidores=seguidores,
                           siguiendo=siguiendo,
                           logros=logros_lista,
                           total_publicaciones=total_publicaciones,
                           total_favoritos=total_favoritos,
                           total_resenas_recibidas=total_resenas_recibidas,
                           total_ventas=total_ventas,
                           valor_total=valor_total)


@app.route('/perfil/actualizar', methods=['POST'])
@login_required
def actualizar_perfil():
    nombre = request.form.get('nombre', '').strip()
    bio = request.form.get('bio', '').strip()

    conn = get_db()
    if nombre:
        conn.execute('UPDATE usuarios SET nombre = ?, bio = ? WHERE id = ?',
                     (nombre, bio, session['usuario_id']))
        session['nombre'] = nombre
        conn.commit()
        flash('Perfil actualizado.', 'success')
    conn.close()
    return redirect(url_for('perfil'))


@app.route('/perfil/cambiar_password', methods=['POST'])
@login_required
def cambiar_password():
    actual = request.form.get('password_actual', '')
    nueva = request.form.get('password_nueva', '')
    confirmar = request.form.get('password_confirmar', '')

    if not all([actual, nueva, confirmar]):
        flash('Completa todos los campos.', 'danger')
        return redirect(url_for('perfil'))

    if nueva != confirmar:
        flash('Las contraseñas no coinciden.', 'danger')
        return redirect(url_for('perfil'))

    if len(nueva) < 6:
        flash('La contraseña debe tener al menos 6 caracteres.', 'danger')
        return redirect(url_for('perfil'))

    conn = get_db()
    usuario = conn.execute('SELECT * FROM usuarios WHERE id = ?', (session['usuario_id'],)).fetchone()
    if not usuario or not check_password_hash(usuario['password'], actual):
        flash('Contraseña actual incorrecta.', 'danger')
        conn.close()
        return redirect(url_for('perfil'))

    hashed_password = generate_password_hash(nueva)
    conn.execute('UPDATE usuarios SET password = ? WHERE id = ?',
                 (hashed_password, session['usuario_id']))
    conn.commit()
    conn.close()
    flash('Contraseña actualizada correctamente.', 'success')
    return redirect(url_for('perfil'))


@app.route('/notificaciones/leer/<int:notif_id>', methods=['POST'])
@login_required
def marcar_notificacion_leida(notif_id):
    conn = get_db()
    conn.execute('UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?',
                 (notif_id, session['usuario_id']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


@app.route('/notificaciones/leer-todas', methods=['POST'])
@login_required
def marcar_todas_leidas():
    conn = get_db()
    conn.execute('UPDATE notificaciones SET leida = 1 WHERE usuario_id = ?',
                 (session['usuario_id'],))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# ── Admin ─────────────────────────────────────────────────────────────────────

@app.route('/admin')
@login_required
@admin_required
def admin():
    conn = get_db()
    productos = conn.execute('''
        SELECT p.*, u.nombre as vendedor_nombre,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas
        FROM productos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN resenas r ON p.id = r.producto_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ''').fetchall()

    usuarios = conn.execute('SELECT * FROM usuarios ORDER BY id DESC').fetchall()

    stats = {
        'total_productos': conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0],
        'total_usuarios': conn.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0],
        'total_resenas': conn.execute('SELECT COUNT(*) FROM resenas').fetchone()[0],
        'total_pedidos': conn.execute('SELECT COUNT(*) FROM pedidos').fetchone()[0],
        'total_visitas': conn.execute('SELECT COUNT(*) FROM visitas').fetchone()[0],
    }
    conn.close()
    return render_template('admin.html', productos=productos, usuarios=usuarios, stats=stats)


@app.route('/admin/eliminar/<int:producto_id>', methods=['POST'])
@login_required
@admin_required
def eliminar_producto_admin(producto_id):
    conn = get_db()
    conn.execute('DELETE FROM productos WHERE id = ?', (producto_id,))
    conn.commit()
    conn.close()
    flash('Producto eliminado.', 'success')
    return redirect(url_for('admin'))


@app.route('/admin/usuario/<int:usuario_id>/eliminar', methods=['POST'])
@login_required
@admin_required
def eliminar_usuario_admin(usuario_id):
    conn = get_db()
    conn.execute('DELETE FROM usuarios WHERE id = ? AND email != "admin@ecomarket.com"', (usuario_id,))
    conn.commit()
    conn.close()
    flash('Usuario eliminado.', 'success')
    return redirect(url_for('admin'))


# ── API Exportar ─────────────────────────────────────────────────────────────

@app.route('/api/exportar/productos')
@login_required
def exportar_productos():
    conn = get_db()
    productos = conn.execute('''
        SELECT p.*, u.nombre as vendedor
        FROM productos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        ORDER BY p.id
    ''').fetchall()
    conn.close()
    return jsonify([dict(p) for p in productos])


# ── Static files ─────────────────────────────────────────────────────────────

@app.route('/static/manifest.json')
def manifest():
    return jsonify({
        "name": "EcoMarket",
        "short_name": "EcoMarket",
        "description": "Marketplace ecológico",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#2e7d32",
        "theme_color": "#2e7d32",
        "icons": [{"src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌱</text></svg>", "sizes": "192x192", "type": "image/svg+xml"}]
    })


# ── Error handlers ───────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500


# ── Inicio ────────────────────────────────────────────────────────────────────

# Inicializar la base de datos al importar el módulo
init_db()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
