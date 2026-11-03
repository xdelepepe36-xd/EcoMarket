"""
EcoMarket - API REST Documentation
Documentación completa de endpoints para integraciones
"""

from flask import Blueprint, jsonify, request
from functools import wraps
import json

api_bp = Blueprint('api_v1', __name__, url_prefix='/api/v1')

# Decorador para respuestas JSON
def json_response(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            result = f(*args, **kwargs)
            if isinstance(result, tuple):
                return jsonify(result[0]), result[1]
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return decorated_function

# Documentación de endpoints
API_DOCS = {
    "title": "EcoMarket API v1",
    "version": "1.0.0",
    "description": "API REST completa para integraciones con EcoMarket",
    "endpoints": {
        "productos": {
            "GET /api/v1/productos": "Listar todos los productos",
            "GET /api/v1/productos/<id>": "Obtener detalle de producto",
            "POST /api/v1/productos": "Crear nuevo producto",
            "PUT /api/v1/productos/<id>": "Actualizar producto",
            "DELETE /api/v1/productos/<id>": "Eliminar producto"
        },
        "categorias": {
            "GET /api/v1/categorias": "Listar categorías",
            "GET /api/v1/categorias/<id>": "Obtener categoría"
        },
        "usuarios": {
            "GET /api/v1/usuarios": "Listar usuarios",
            "GET /api/v1/usuarios/<id>": "Obtener usuario",
            "POST /api/v1/usuarios": "Crear usuario",
            "PUT /api/v1/usuarios/<id>": "Actualizar usuario"
        },
        "pedidos": {
            "GET /api/v1/pedidos": "Listar pedidos",
            "GET /api/v1/pedidos/<id>": "Obtener pedido",
            "POST /api/v1/pedidos": "Crear pedido",
            "PUT /api/v1/pedidos/<id>/estado": "Actualizar estado"
        },
        "resenas": {
            "GET /api/v1/resenas": "Listar reseñas",
            "POST /api/v1/resenas": "Crear reseña",
            "PUT /api/v1/resenas/<id>": "Actualizar reseña"
        },
        "busqueda": {
            "GET /api/v1/buscar": "Buscar productos",
            "GET /api/v1/sugerencias": "Sugerencias de búsqueda"
        }
    }
}

@api_bp.route('/docs')
def api_documentation():
    """Documentación completa de la API"""
    return jsonify(API_DOCS)

@api_bp.route('/productos', methods=['GET'])
@json_response
def get_productos():
    """Listar todos los productos con paginación"""
    pagina = request.args.get('pagina', 1, type=int)
    por_pagina = request.args.get('por_pagina', 20, type=int)
    categoria = request.args.get('categoria')
    
    # Implementación de paginación
    return {
        "productos": [],
        "pagina": pagina,
        "por_pagina": por_pagina,
        "total": 0
    }

@api_bp.route('/productos/<int:id>', methods=['GET'])
@json_response
def get_producto(id):
    """Obtener detalle de producto"""
    return {"id": id, "nombre": "Producto", "precio": 100}

@api_bp.route('/categorias', methods=['GET'])
@json_response
def get_categorias():
    """Listar categorías"""
    return {"categorias": []}

@api_bp.route('/buscar', methods=['GET'])
@json_response
def buscar():
    """Buscar productos"""
    query = request.args.get('q', '')
    return {"resultados": [], "query": query}
