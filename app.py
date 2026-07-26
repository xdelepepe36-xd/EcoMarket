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
import uuid

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'eco_secret_2026')
DB_PATH = os.environ.get('DATABASE_URL', os.path.join(os.path.dirname(__file__), 'data', 'ecomarket.db'))

# Configuración de subida de imágenes
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Asegurar que la carpeta de uploads existe
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ── DB ──────────────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            avatar TEXT DEFAULT '',
            avatar_color TEXT DEFAULT '#2e7d32',
            bio TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            categoria TEXT NOT NULL,
            precio REAL NOT NULL,
            precio_original REAL,
            descripcion TEXT NOT NULL,
            imagen TEXT DEFAULT 'uploads/placeholder.svg',
            stock INTEGER DEFAULT 10,
            condicion TEXT DEFAULT 'nuevo',
            etiquetas TEXT DEFAULT '',
            usuario_id INTEGER,
            vistas INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
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
    ''')

    # Seed productos si la tabla está vacía
    if conn.execute('SELECT COUNT(*) FROM productos').fetchone()[0] == 0:
        seed_path = os.path.join(os.path.dirname(__file__), 'data', 'products.json')
        if os.path.exists(seed_path):
            with open(seed_path, 'r', encoding='utf-8') as f:
                try:
                    productos = json.load(f)
                    for p in productos:
                        conn.execute(
                            'INSERT INTO productos (nombre, categoria, precio, precio_original, descripcion, imagen, stock, condicion, vistas) VALUES (?,?,?,?,?,?,?,?,?)',
                            (p['nombre'], p['categoria'], p['precio'], p.get('precio_original', p['precio']),
                             p['descripcion'], p.get('imagen', 'uploads/placeholder.svg'),
                             p.get('stock', 10), p.get('condicion', 'nuevo'), p.get('vistas', 0))
                        )
                except json.JSONDecodeError:
                    pass
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
        if session.get('email') != 'admin@ecomarket.com':
            flash('Acceso restringido.', 'danger')
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

        conn.close()
        return {
            'producto': producto,
            'relacionados': relacionados,
            'resenas': resenas,
            'estrellas': estrellas
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

    query = '''
        SELECT p.*, u.nombre as vendedor_nombre,
            COALESCE(AVG(r.rating), 0) as rating_promedio,
            COUNT(DISTINCT r.id) as total_resenas
        FROM productos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN resenas r ON p.id = r.producto_id
        WHERE 1=1
    '''
    params = []

    if categoria and categoria != 'Todas':
        query += ' AND p.categoria = ?'
        params.append(categoria)
    if busqueda:
        query += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)'
        params.extend([f'%{busqueda}%', f'%{busqueda}%'])
    if precio_min:
        query += ' AND p.precio >= ?'
        params.append(float(precio_min))
    if precio_max:
        query += ' AND p.precio <= ?'
        params.append(float(precio_max))

    query += ' GROUP BY p.id'

    ordenes = {
        'nuevos': 'ORDER BY p.created_at DESC',
        'populares': 'ORDER BY p.vistas DESC',
        'baratos': 'ORDER BY p.precio ASC',
        'caros': 'ORDER BY p.precio DESC',
        'mejor_valorados': 'ORDER BY rating_promedio DESC'
    }
    query += ' ' + ordenes.get(orden, 'ORDER BY p.created_at DESC')

    productos = conn.execute(query, params).fetchall()
    categorias = [r['categoria'] for r in
                  conn.execute('SELECT DISTINCT categoria FROM productos ORDER BY categoria').fetchall()]
    conn.close()

    return render_template('productos.html',
                           productos=productos,
                           categorias=categorias,
                           total_productos=len(productos),
                           categoria_sel=categoria,
                           orden_sel=orden,
                           busqueda=busqueda)


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

        if not all([nombre, email, direccion]):
            return jsonify({'error': 'Completa todos los campos'}), 400

        total = sum(item['precio'] * item['cantidad'] for item in items)

        conn = get_db()
        cursor = conn.execute(
            'INSERT INTO pedidos (usuario_id, nombre, email, direccion, total) VALUES (?,?,?,?,?)',
            (session['usuario_id'], nombre, email, direccion, total)
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
        imagen = 'uploads/placeholder.svg'

        # Subir imagen si se proporcionó
        if 'imagen' in request.files:
            file = request.files['imagen']
            if file and file.filename and allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                filename = f"{uuid.uuid4().hex}.{ext}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                imagen = f'uploads/{filename}'

        if not all([nombre, categoria, precio, descripcion]):
            flash('Completa todos los campos obligatorios.', 'danger')
            return redirect(url_for('publicar'))

        try:
            precio_valor = float(precio)
            stock_valor = int(stock)
        except ValueError:
            flash('Precio o stock inválido.', 'danger')
            return redirect(url_for('publicar'))

        conn = get_db()
        conn.execute(
            'INSERT INTO productos (nombre, categoria, precio, descripcion, imagen, stock, condicion, usuario_id) VALUES (?,?,?,?,?,?,?,?)',
            (nombre, categoria, precio_valor, descripcion, imagen, stock_valor, condicion, session['usuario_id'])
        )
        conn.commit()
        conn.close()

        flash('¡Producto publicado con éxito!', 'success')
        return redirect(url_for('productos_view'))

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

        if all([nombre, categoria, precio, descripcion]):
            conn.execute(
                'UPDATE productos SET nombre=?, categoria=?, precio=?, descripcion=?, stock=? WHERE id=?',
                (nombre, categoria, float(precio), descripcion, int(stock), producto_id)
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

    # Mis productos
    mis_productos = conn.execute(
        'SELECT COUNT(*) FROM productos WHERE usuario_id = ?',
        (user_id,)
    ).fetchone()[0]

    # Mis ventas
    mis_ventas = conn.execute('''
        SELECT COUNT(*) FROM pedido_items pi
        JOIN productos p ON pi.producto_id = p.id
        WHERE p.usuario_id = ?
    ''', (user_id,)).fetchone()[0]

    # Ingresos totales
    ingresos = conn.execute('''
        SELECT COALESCE(SUM(pi.precio * pi.cantidad), 0) FROM pedido_items pi
        JOIN productos p ON pi.producto_id = p.id
        WHERE p.usuario_id = ?
    ''', (user_id,)).fetchone()[0]

    # Reseñas recibidas
    resenas = conn.execute('''
        SELECT COUNT(*) FROM resenas r
        JOIN productos p ON r.producto_id = p.id
        WHERE p.usuario_id = ?
    ''', (user_id,)).fetchone()[0]

    # Ventas por mes (últimos 6)
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

    # Productos por categoría
    categorias = conn.execute(
        'SELECT categoria, COUNT(*) as count FROM productos GROUP BY categoria ORDER BY count DESC'
    ).fetchall()

    # Visitas por día (últimos 7)
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


# ── Auth ─────────────────────────────────────────────────────────────────────

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'usuario_id' in session:
        return redirect(url_for('index'))
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        conn = get_db()
        usuario = conn.execute('SELECT * FROM usuarios WHERE email = ? AND password = ?',
                               (email, password)).fetchone()
        conn.close()
        if usuario:
            session['usuario_id'] = usuario['id']
            session['nombre'] = usuario['nombre']
            session['email'] = usuario['email']
            flash(f'¡Bienvenido, {usuario["nombre"]}!', 'success')
            return redirect(url_for('index'))
        flash('Correo o contraseña incorrectos.', 'danger')
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

        conn.execute('INSERT INTO usuarios (nombre, email, password) VALUES (?,?,?)',
                     (nombre, email, password))
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
                           mis_productos=mis_productos,
                           favoritos=favoritos,
                           resenas=resenas,
                           pedidos=pedidos,
                           notificaciones=notificaciones,
                           total_publicaciones=total_publicaciones,
                           total_favoritos=total_favoritos,
                           total_resenas_recibidas=total_resenas_recibidas,
                           total_ventas=total_ventas,
                           valor_total=valor_total)


@app.route('/notificaciones/leer/<int:notif_id>', methods=['POST'])
@login_required
def marcar_notificacion_leida(notif_id):
    conn = get_db()
    conn.execute('UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?',
                 (notif_id, session['usuario_id']))
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


# ── Inicio ────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)