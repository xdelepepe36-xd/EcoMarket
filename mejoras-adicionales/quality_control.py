"""
EcoMarket - Sistema de Calidad de Productos
Inspección y validación antes de publicar
"""

class QualityControlSystem:
    def __init__(self):
        self.reglas = {
            'titulo_min_caracteres': 10,
            'titulo_max_caracteres': 100,
            'descripcion_min_caracteres': 50,
            'descripcion_max_caracteres': 2000,
            'precio_min': 1,
            'precio_max': 100000,
            'imagenes_min': 1,
            'imagenes_max': 10
        }

    def validar_producto(self, producto):
        """Valida un producto antes de publicar"""
        errores = []
        advertencias = []

        # Validar título
        titulo = producto.get('nombre', '')
        if len(titulo) < self.reglas['titulo_min_caracteres']:
            errores.append('El título debe tener al menos 10 caracteres')
        if len(titulo) > self.reglas['titulo_max_caracteres']:
            errores.append('El título no puede exceder 100 caracteres')

        # Validar descripción
        descripcion = producto.get('descripcion', '')
        if len(descripcion) < self.reglas['descripcion_min_caracteres']:
            errores.append('La descripción debe tener al menos 50 caracteres')
        if len(descripcion) > self.reglas['descripcion_max_caracteres']:
            errores.append('La descripción no puede exceder 2000 caracteres')

        # Validar precio
        precio = producto.get('precio', 0)
        if precio < self.reglas['precio_min']:
            errores.append('El precio debe ser mayor a S/1')
        if precio > self.reglas['precio_max']:
            advertencias.append('El precio es muy alto, considera reducirlo')

        # Validar imágenes
        imagenes = producto.get('imagenes', [])
        if len(imagenes) < self.reglas['imagenes_min']:
            errores.append('Debes subir al menos 1 imagen')
        if len(imagenes) > self.reglas['imagenes_max']:
            advertencias.append('Máximo 10 imágenes permitidas')

        # Validar categoría
        categoria = producto.get('categoria', '')
        if not categoria:
            errores.append('Debes seleccionar una categoría')

        return {
            'valido': len(errores) == 0,
            'errores': errores,
            'advertencias': advertencias,
            'puntaje_calidad': self.calcular_puntaje(producto)
        }

    def calcular_puntaje(self, producto):
        """Calcula un puntaje de calidad del producto"""
        puntaje = 0

        # Título
        titulo = producto.get('nombre', '')
        if 20 <= len(titulo) <= 50:
            puntaje += 20

        # Descripción
        descripcion = producto.get('descripcion', '')
        if len(descripcion) >= 200:
            puntaje += 30

        # Imágenes
        imagenes = producto.get('imagenes', [])
        if len(imagenes) >= 3:
            puntaje += 20

        # Precio competitivo
        precio = producto.get('precio', 0)
        if 10 <= precio <= 500:
            puntaje += 15

        # Eco score
        eco_score = producto.get('eco_score', 0)
        if eco_score >= 7:
            puntaje += 15

        return min(puntaje, 100)
