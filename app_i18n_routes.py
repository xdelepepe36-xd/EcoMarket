"""
EcoMarket - Rutas Backend para Soporte Multiidioma
Funciones y rutas adicionales para manejar productos y contenido multiidioma
"""
from flask import Flask, request, jsonify, session
import sqlite3
import json
import os
from functools import wraps

# Importar configuración principal
try:
    from app import app, get_db, login_required
except ImportError:
    # Si no se puede importar, definir placeholders
    app = Flask(__name__)
    def get_db():
        return None
    def login_required(f):
        return f

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'data', 'ecomarket.db')

# ── RUTAS API PARA TRADUCCIONES ────────────────────────────────────────────────

@app.route('/api/traducciones/productos', methods=['GET'])
def get_product_translations():
    """Obtiene todas las traducciones de productos"""
    lang = request.args.get('lang', 'es')
    
    try:
        conn = get_db()
        conn.row_factory = sqlite3.Row
        
        # Seleccionar campos según idioma
        if lang == 'es':
            campos = 'id, nombre, descripcion'
        elif lang == 'en':
            campos = 'id, COALESCE(nombre_en, nombre) as nombre, COALESCE(descripcion_en, descripcion) as descripcion'
        elif lang == 'pt':
            campos = 'id, COALESCE(nombre_pt, nombre) as nombre, COALESCE(descripcion_pt, descripcion) as descripcion'
        elif lang == 'fr':
            campos = 'id, COALESCE(nombre_fr, nombre) as nombre, COALESCE(descripcion_fr, descripcion) as descripcion'
        elif lang == 'de':
            campos = 'id, COALESCE(nombre_de, nombre) as nombre, COALESCE(descripcion_de, descripcion) as descripcion'
        elif lang == 'it':
            campos = 'id, COALESCE(nombre_it, nombre) as nombre, COALESCE(descripcion_it, descripcion) as descripcion'
        else:
            campos = 'id, nombre, descripcion'
        
        productos = conn.execute(f'SELECT {campos} FROM productos').fetchall()
        
        # Convertir a lista de diccionarios
        productos_list = [dict(row) for row in productos]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'productos': productos_list,
            'lang': lang
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/traducciones/producto/<int:producto_id>', methods=['GET'])
def get_product_translation(producto_id):
    """Obtiene las traducciones de un producto específico"""
    try:
        conn = get_db()
        conn.row_factory = sqlite3.Row
        
        producto = conn.execute('''
            SELECT id, nombre, nombre_en, nombre_pt, nombre_fr, nombre_de, nombre_it,
                   descripcion, descripcion_en, descripcion_pt, descripcion_fr, descripcion_de, descripcion_it,
                   categoria, idiomas_disponibles
            FROM productos 
            WHERE id = ?
        ''', (producto_id,)).fetchone()
        
        if not producto:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        # Obtener traducciones de categoría
        categoria = producto['categoria']
        traducciones_categoria = conn.execute('''
            SELECT idioma, nombre, descripcion
            FROM categoria_traducciones
            WHERE categoria_id = ?
        ''', (categoria,)).fetchall()
        
        # Organizar traducciones
        traducciones_cat_dict = {row['idioma']: {'nombre': row['nombre'], 'descripcion': row['descripcion']} 
                                       for row in traducciones_categoria}
        
        # Organizar traducciones del producto
        traducciones_producto = {
            'es': {
                'nombre': producto['nombre'],
                'descripcion': producto['descripcion']
            }
        }
        
        for lang in ['en', 'pt', 'fr', 'de', 'it']:
            nombre_key = f'nombre_{lang}'
            desc_key = f'descripcion_{lang}'
            
            if producto[nombre_key]:
                traducciones_producto[lang] = {
                    'nombre': producto[nombre_key],
                    'descripcion': producto[desc_key] if producto[desc_key] else producto['descripcion']
                }
        
        conn.close()
        
        return jsonify({
            'success': True,
            'producto': dict(producto),
            'traducciones': traducciones_producto,
            'traducciones_categoria': traducciones_cat_dict
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/traducciones/producto/<int:producto_id>', methods=['PUT'])
@login_required
def update_product_translation(producto_id):
    """Actualiza las traducciones de un producto"""
    if session.get('rol') != 'admin' and session.get('rol') != 'vendedor':
        return jsonify({
            'success': False,
            'error': 'No tienes permisos para editar traducciones'
        }), 403
    
    try:
        data = request.get_json()
        
        conn = get_db()
        
        # Verificar que el producto pertene al usuario o sea admin
        if session.get('rol') == 'vendedor':
            producto = conn.execute('SELECT usuario_id FROM productos WHERE id = ?', (producto_id,)).fetchone()
            if not producto or producto['usuario_id'] != session.get('usuario_id'):
                conn.close()
                return jsonify({
                    'success': False,
                    'error': 'No tienes permisos para editar este producto'
                }), 403
        
        # Actualizar traducciones
        updates = []
        params = []
        
        for lang in ['en', 'pt', 'fr', 'de', 'it']:
            if f'nombre_{lang}' in data:
                updates.append(f'nombre_{lang} = ?')
                params.append(data[f'nombre_{lang}'])
            
            if f'descripcion_{lang}' in data:
                updates.append(f'descripcion_{lang} = ?')
                params.append(data[f'descripcion_{lang}'])
        
        if updates:
            params.append(producto_id)
            conn.execute(f'''
                UPDATE productos 
                SET {', '.join(updates)}
                WHERE id = ?
            ''', params)
            
            # Actualizar idiomas disponibles
            idiomas_actuales = json.loads(conn.execute('SELECT idiomas_disponibles FROM productos WHERE id = ?', 
                                                           (producto_id,)).fetchone()['idiomas_disponibles'] or '[]')
            
            for lang in ['en', 'pt', 'fr', 'de', 'it']:
                if f'nombre_{lang}' in data and lang not in idiomas_actuales:
                    idiomas_actuales.append(lang)
            
            conn.execute('UPDATE productos SET idiomas_disponibles = ? WHERE id = ?',
                       (json.dumps(idiomas_actuales), producto_id))
            
            conn.commit()
        
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Traducciones actualizadas'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/traducciones/categorias', methods=['GET'])
def get_category_translations():
    """Obtiene todas las traducciones de categorías"""
    try:
        conn = get_db()
        conn.row_factory = sqlite3.Row
        
        traducciones = conn.execute('''
            SELECT categoria_id, idioma, nombre, descripcion
            FROM categoria_traducciones
            ORDER BY categoria_id, idioma
        ''').fetchall()
        
        # Organizar por categoría
        traducciones_dict = {}
        for row in traducciones:
            categoria = row['categoria_id']
            if categoria not in traducciones_dict:
                traducciones_dict[categoria] = {}
            
            traducciones_dict[categoria][row['idioma']] = {
                'nombre': row['nombre'],
                'descripcion': row['descripcion']
            }
        
        conn.close()
        
        return jsonify({
            'success': True,
            'traducciones': traducciones_dict
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/traducciones/contenido', methods=['GET'])
def get_content_translations():
    """Obtiene traducciones de contenido estático"""
    lang = request.args.get('lang', 'es')
    contexto = request.args.get('contexto', 'all')
    
    try:
        conn = get_db()
        conn.row_factory = sqlite3.Row
        
        if contexto == 'all':
            traducciones = conn.execute('''
                SELECT clave, idioma, valor, contexto
                FROM contenido_traducciones
                ORDER BY clave, idioma
            ''').fetchall()
        else:
            traducciones = conn.execute('''
                SELECT clave, idioma, valor, contexto
                FROM contenido_traducciones
                WHERE contexto = ?
                ORDER BY clave, idioma
            ''', (contexto,)).fetchall()
        
        # Organizar por clave
        traducciones_dict = {}
        for row in traducciones:
            clave = row['clave']
            if clave not in traducciones_dict:
                traducciones_dict[clave] = {}
            
            traducciones_dict[clave][row['idioma']] = row['valor']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'traducciones': traducciones_dict,
            'lang': lang
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/traducciones/contenido', methods=['POST'])
@login_required
def update_content_translation():
    """Actualiza traducciones de contenido estático"""
    if session.get('rol') != 'admin':
        return jsonify({
            'success': False,
            'error': 'No tienes permisos para editar traducciones'
        }), 403
    
    try:
        data = request.get_json()
        
        conn = get_db()
        
        clave = data.get('clave')
        idioma = data.get('idioma')
        valor = data.get('valor')
        contexto = data.get('contexto', 'general')
        
        if not clave or not idioma or not valor:
            conn.close()
            return jsonify({
                'success': False,
                'error': 'Datos incompletos'
            }), 400
        
        # Insertar o actualizar traducción
        conn.execute('''
            INSERT OR REPLACE INTO contenido_traducciones 
            (clave, idioma, valor, contexto, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (clave, idioma, valor, contexto))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Traducción actualizada'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/traducciones/idiomas-disponibles', methods=['GET'])
def get_available_languages():
    """Obtiene idiomas disponibles para el sistema"""
    idiomas = {
        'es': {'nombre': 'Español', 'nativo': 'Español', 'bandera': '🇪🇸'},
        'en': {'nombre': 'English', 'nativo': 'English', 'bandera': '🇬🇧'},
        'pt': {'nombre': 'Português', 'nativo': 'Português', 'bandera': '🇧🇷'},
        'fr': {'nombre': 'Français', 'nativo': 'Français', 'bandera': '🇫🇷'},
        'de': {'nombre': 'Deutsch', 'nativo': 'Deutsch', 'bandera': '🇩🇪'},
        'it': {'nombre': 'Italiano', 'nativo': 'Italiano', 'bandera': '🇮🇹'}
    }
    
    return jsonify({
        'success': True,
        'idiomas': idiomas
    })


@app.route('/api/traducciones/estadisticas', methods=['GET'])
def get_translation_statistics():
    """Obtiene estadísticas de traducciones"""
    try:
        conn = get_db()
        conn.row_factory = sqlite3.Row
        
        # Estadísticas de productos
        total_productos = conn.execute('SELECT COUNT(*) as count FROM productos').fetchone()['count']
        productos_con_i18n = conn.execute('SELECT COUNT(*) as count FROM productos WHERE idiomas_disponibles != \'["es"]\'').fetchone()['count']
        
        # Estadísticas de categorías
        total_categorias = conn.execute('SELECT COUNT(DISTINCT categoria) as count FROM productos').fetchone()['count']
        traducciones_categorias = conn.execute('SELECT COUNT(*) as count FROM categoria_traducciones').fetchone()['count']
        
        # Estadísticas de contenido
        traducciones_contenido = conn.execute('SELECT COUNT(*) as count FROM contenido_traducciones').fetchone()['count']
        
        # Traducciones por idioma
        traducciones_por_idioma = {}
        for lang in ['es', 'en', 'pt', 'fr', 'de', 'it']:
            count = conn.execute(f'SELECT COUNT(*) as count FROM contenido_traducciones WHERE idioma = ?', (lang,)).fetchone()['count']
            traducciones_por_idioma[lang] = count
        
        conn.close()
        
        return jsonify({
            'success': True,
            'estadisticas': {
                'productos': {
                    'total': total_productos,
                    'con_i18n': productos_con_i18n,
                    'porcentaje_completo': round((productos_con_i18n / total_productos) * 100, 2) if total_productos > 0 else 0
                },
                'categorias': {
                    'total': total_categorias,
                    'traducciones': traducciones_categorias
                },
                'contenido': {
                    'total': traducciones_contenido,
                    'por_idioma': traducciones_por_idioma
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ── FUNCIONES AUXILIARES ───────────────────────────────────────────────────────────────

def get_product_translation_field(producto_id, campo, lang='es'):
    """Obtiene un campo traducido de un producto"""
    try:
        conn = get_db()
        conn.row_factory = sqlite3.Row
        
        if lang == 'es':
            campo_sql = campo
        else:
            campo_sql = f'COALESCE({campo}_{lang}, {campo}) as {campo}'
        
        result = conn.execute(f'SELECT {campo_sql} FROM productos WHERE id = ?', (campo_sql, producto_id)).fetchone()
        
        conn.close()
        
        return result[campo] if result else None
        
    except Exception as e:
        print(f"Error getting translation: {e}")
        return None


def get_category_translation(categoria, lang='es'):
    """Obtiene la traducción de una categoría"""
    try:
        conn = get_db()
        conn.row_factory = sqlite3.Row
        
        # Si es español, usar el nombre original
        if lang == 'es':
            return categoria
        
        # Buscar traducción
        traduccion = conn.execute('''
            SELECT nombre
            FROM categoria_traducciones
            WHERE categoria_id = ? AND idioma = ?
        ''', (categoria, lang)).fetchone()
        
        conn.close()
        
        return traduccion['nombre'] if traduccion else categoria
        
    except Exception as e:
        print(f"Error getting category translation: {e}")
        return categoria


def translate_product_list(productos, lang='es'):
    """Traduce una lista de productos"""
    productos_traducidos = []
    
    for producto in productos:
        producto_traducido = producto.copy()
        
        # Traducir nombre
        if lang != 'es':
            nombre_key = f'nombre_{lang}'
            if producto.get(nombre_key):
                producto_traducido['nombre'] = producto[nombre_key]
        
        # Traducir descripción
        if lang != 'es':
            desc_key = f'descripcion_{lang}'
            if producto.get(desc_key):
                producto_traducido['descripcion'] = producto[desc_key]
        
        # Traducir categoría
        producto_traducido['categoria_traducida'] = get_category_translation(producto.get('categoria'), lang)
        
        productos_traducidos.append(producto_traducido)
    
    return productos_traducidos


def update_product_traductions(producto_id, traducciones):
    """Actualiza las traducciones de un producto"""
    try:
        conn = get_db()
        
        updates = []
        params = []
        
        for lang, datos in traducciones.items():
            if 'nombre' in datos:
                updates.append(f'nombre_{lang} = ?')
                params.append(datos['nombre'])
            
            if 'descripcion' in datos:
                updates.append(f'descripcion_{lang} = ?')
                params.append(datos['descripcion'])
        
        if updates:
            params.append(producto_id)
            conn.execute(f'''
                UPDATE productos 
                SET {', '.join(updates)}
                WHERE id = ?
            ''', params)
            
            # Actualizar idiomas disponibles
            idiomas_actuales = json.loads(conn.execute('SELECT idiomas_disponibles FROM productos WHERE id = ?', 
                                                           (producto_id,)).fetchone()['idiomas_disponibles'] or '[]')
            
            for lang in traducciones.keys():
                if lang not in idiomas_actuales:
                    idiomas_actuales.append(lang)
            
            conn.execute('UPDATE productos SET idiomas_disponibles = ? WHERE id = ?',
                       (json.dumps(idiomas_actuales), producto_id))
            
            conn.commit()
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error updating product translations: {e}")
        return False


# ── CONTEXTO TEMPLATE ───────────────────────────────────────────────────────────────

@app.context_processor
def inject_i18n():
    """Inyecta variables i18n en todas las plantillas"""
    lang = session.get('lang', 'es')
    
    # Función para obtener traducción
    def t(key, **kwargs):
        """Obtiene traducción según el idioma"""
        try:
            conn = get_db()
            traduccion = conn.execute('''
                SELECT valor
                FROM contenido_traducciones
                WHERE clave = ? AND idioma = ?
            ''', (key, lang)).fetchone()
            
            conn.close()
            
            if traduccion:
                valor = traduccion['valor']
                # Reemplazar parámetros
                for param, valor_param in kwargs.items():
                    valor = valor.replace(f'{{{param}}}', str(valor_param))
                return valor
            else:
                # Fallback a traducciones hardcoded si no está en DB
                from app_i18n_routes import get_category_translation
                if key.startswith('category.'):
                    categoria = key.replace('category.', '')
                    return get_category_translation(categoria, lang)
                return key
                
        except Exception as e:
            print(f"Error getting translation for {key}: {e}")
            return key
    
    return {
        't': t,
        'current_lang': lang,
        'available_languages': ['es', 'en', 'pt', 'fr', 'de', 'it']
    }


if __name__ == '__main__':
    print("EcoMarket - Rutas Backend para Soporte Multiidioma")
    print("Este archivo debe ser importado en app.py para agregar las rutas i18n")