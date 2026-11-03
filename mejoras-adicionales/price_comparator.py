"""
EcoMarket - Comparador de Precios Externo
Compara precios con otros marketplaces
"""

class PriceComparator:
    def __init__(self):
        self.fuentes = {
            'amazon': {'nombre': 'Amazon', 'url': 'https://amazon.com'},
            'mercadolibre': {'nombre': 'MercadoLibre', 'url': 'https://mercadolibre.com'},
            'linio': {'nombre': 'Linio', 'url': 'https://linio.com.pe'}
        }

    def comparar_precio(self, producto_nombre, precio_actual):
        """Compara precio con otras fuentes"""
        # Simulación de comparación
        comparaciones = []
        
        for fuente, config in self.fuentes.items():
            # Simulación de precio externo (en producción sería API real)
            precio_externo = precio_actual * (0.8 + hash(fuente) % 10 / 20)
            
            comparaciones.append({
                'fuente': config['nombre'],
                'url': config['url'],
                'precio': round(precio_externo, 2),
                'diferencia': round(precio_externo - precio_actual, 2),
                'mejor_opcion': precio_externo < precio_actual
            })
        
        return sorted(comparaciones, key=lambda x: x['precio'])

    def obtener_mejor_precio(self, producto_nombre):
        """Obtiene el mejor precio entre todas las fuentes"""
        comparaciones = self.comparar_precio(producto_nombre, 1000)
        if comparaciones:
            return min(comparaciones, key=lambda x: x['precio'])
        return None
