"""
EcoMarket - AI para Generar Descripciones
Genera descripciones de productos con IA
"""

class AIDescriptionGenerator:
    def __init__(self):
        self.plantillas = {
            'producto_ecologico': "Este {nombre} es 100% ecológico y sostenible. {caracteristicas}. Ideal para {uso}. Precio: S/{precio}.",
            'producto_reciclado': "Este {nombre} está hecho de materiales reciclados. {caracteristicas}. Contribuye al medio ambiente. Precio: S/{precio}.",
            'producto_natural': "Este {nombre} es 100% natural y orgánico. {caracteristicas}. Sin químicos ni aditivos. Precio: S/{precio}."
        }

    def generar_descripcion(self, producto):
        """Genera una descripción usando plantillas inteligentes"""
        categoria = producto.get('categoria', '')
        nombre = producto.get('nombre', '')
        precio = producto.get('precio', 0)
        
        # Seleccionar plantilla según categoría
        if 'higiene' in categoria.lower() or 'alimentacion' in categoria.lower():
            plantilla = self.plantillas['producto_natural']
        elif 'hogar' in categoria.lower() or 'ropa' in categoria.lower():
            plantilla = self.plantillas['producto_reciclado']
        else:
            plantilla = self.plantillas['producto_ecologico']
        
        # Generar características
        caracteristicas = self.generar_caracteristicas(producto)
        uso = self.generar_uso(categoria)
        
        descripcion = plantilla.format(
            nombre=nombre,
            caracteristicas=caracteristicas,
            uso=uso,
            precio=precio
        )
        
        return descripcion

    def generar_caracteristicas(self, producto):
        """Genera características del producto"""
        caracteristicas = []
        
        if producto.get('eco_score', 0) >= 8:
            caracteristicas.append("Alto eco-score")
        
        if producto.get('condicion') == 'nuevo':
            caracteristicas.append("Estado nuevo")
        
        if producto.get('stock', 0) > 20:
            caracteristicas.append("Stock disponible")
        
        return ". ".join(caracteristicas) if caracteristicas else "De alta calidad"

    def generar_uso(self, categoria):
        """Genera uso según categoría"""
        usos = {
            'higiene': 'cuidado personal',
            'hogar': 'decoración del hogar',
            'alimentacion': 'consumo diario',
            'ropa': 'uso diario',
            'tecnologia': 'trabajo y entretenimiento'
        }
        return usos.get(categoria.lower(), 'uso general')
