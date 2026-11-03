"""
EcoMarket - Sistema de Recomendaciones Simple
Recomendaciones basadas en historial de compras
"""

class RecommendationSystem:
    def __init__(self):
        self.historial_compras = []
        self.productos_vistos = []

    def agregar_compra(self, producto_id, categoria):
        """Registra una compra para análisis"""
        self.historial_compras.append({
            'producto_id': producto_id,
            'categoria': categoria,
            'fecha': None
        })

    def agregar_vista(self, producto_id, categoria):
        """Registra una vista de producto"""
        self.productos_vistos.append({
            'producto_id': producto_id,
            'categoria': categoria,
            'fecha': None
        })

    def obtener_recomendaciones(self, usuario_id, limite=10):
        """Obtiene recomendaciones personalizadas"""
        # Análisis de categorías más compradas
        categorias_compradas = [c['categoria'] for c in self.historial_compras]
        categorias_vistas = [c['categoria'] for c in self.productos_vistos]
        
        # Contar frecuencia
        from collections import Counter
        top_categorias = Counter(categorias_compradas + categorias_vistas).most_common(3)
        
        # Recomendar productos de categorías populares
        recomendaciones = []
        for categoria, _ in top_categorias:
            # Aquí se obtendrían productos de la base de datos
            recomendaciones.extend(self.obtener_productos_categoria(categoria, limite // 3))
        
        return recomendaciones[:limite]

    def obtener_productos_similares(self, producto_id, limite=5):
        """Obtiene productos similares"""
        # Simulación de productos similares
        return []

    def obtener_comprados_juntos(self, producto_id, limite=5):
        """Obtiene productos que se compran juntos"""
        # Simulación de compras cruzadas
        return []
