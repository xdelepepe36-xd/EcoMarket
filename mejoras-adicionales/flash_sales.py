"""
EcoMarket - Sistema de Descuentos Temporales
Flash sales y ofertas por tiempo limitado
"""

from datetime import datetime, timedelta

class FlashSaleSystem:
    def __init__(self):
        self.ofertas = []
        self.estados = ['programada', 'activa', 'finalizada', 'cancelada']

    def crear_oferta(self, producto_id, descuento, fecha_inicio, duracion_horas, stock_maximo=None):
        """Crea una oferta flash"""
        oferta = {
            'id': len(self.ofertas) + 1,
            'producto_id': producto_id,
            'descuento': descuento,  # Porcentaje (0-100)
            'fecha_inicio': fecha_inicio,
            'fecha_fin': fecha_inicio + timedelta(hours=duracion_horas),
            'stock_maximo': stock_maximo,
            'stock_vendido': 0,
            'estado': 'programada',
            'precio_original': 0,
            'precio_oferta': 0
        }
        self.ofertas.append(oferta)
        return oferta

    def activar_oferta(self, oferta_id, precio_original):
        """Activa una oferta flash"""
        oferta = next((o for o in self.ofertas if o['id'] == oferta_id), None)
        if oferta:
            oferta['estado'] = 'activa'
            oferta['precio_original'] = precio_original
            oferta['precio_oferta'] = precio_original * (1 - oferta['descuento'] / 100)
            return oferta
        return None

    def finalizar_oferta(self, oferta_id):
        """Finaliza una oferta flash"""
        oferta = next((o for o in self.ofertas if o['id'] == oferta_id), None)
        if oferta:
            oferta['estado'] = 'finalizada'
            return oferta
        return None

    def obtener_ofertas_activas(self):
        """Obtiene ofertas activas actualmente"""
        ahora = datetime.now()
        return [o for o in self.ofertas 
                if o['estado'] == 'activa' 
                and o['fecha_inicio'] <= ahora 
                and o['fecha_fin'] > ahora]

    def aplicar_descuento(self, oferta_id):
        """Aplica el descuento a un producto"""
        oferta = next((o for o in self.ofertas if o['id'] == oferta_id), None)
        if oferta and oferta['estado'] == 'activa':
            # Verificar stock
            if oferta['stock_maximo'] and oferta['stock_vendido'] >= oferta['stock_maximo']:
                return {'error': 'Stock agotado'}
            
            oferta['stock_vendido'] += 1
            return {
                'precio_original': oferta['precio_original'],
                'precio_oferta': oferta['precio_oferta'],
                'descuento': oferta['descuento']
            }
        return None

    def obtener_estadisticas(self):
        """Obtiene estadísticas de ofertas"""
        activas = len(self.obtener_ofertas_activas())
        finalizadas = len([o for o in self.ofertas if o['estado'] == 'finalizada'])
        
        return {
            'total_ofertas': len(self.ofertas),
            'activas': activas,
            'finalizadas': finalizadas,
            'ahorro_total': sum(o['precio_original'] - o['precio_oferta'] for o in self.ofertas if o['estado'] == 'finalizada')
        }
