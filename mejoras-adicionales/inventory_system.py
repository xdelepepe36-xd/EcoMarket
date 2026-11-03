"""
EcoMarket - Sistema de Gestión de Inventario
Stock en tiempo real y alertas
"""

class InventorySystem:
    def __init__(self):
        self.inventario = {}
        self.alertas = []

    def actualizar_stock(self, producto_id, cantidad):
        """Actualiza el stock de un producto"""
        if producto_id not in self.inventario:
            self.inventario[producto_id] = 0
        
        self.inventario[producto_id] += cantidad
        
        # Verificar stock bajo
        if self.inventario[producto_id] < 5:
            self.crear_alerta(producto_id, 'stock_bajo')
        
        return self.inventario[producto_id]

    def obtener_stock(self, producto_id):
        """Obtiene el stock actual"""
        return self.inventario.get(producto_id, 0)

    def reservar_stock(self, producto_id, cantidad):
        """Reserva stock para un pedido"""
        stock_actual = self.obtener_stock(producto_id)
        if stock_actual >= cantidad:
            self.inventario[producto_id] -= cantidad
            return True
        return False

    def crear_alerta(self, producto_id, tipo):
        """Crea una alerta de inventario"""
        alerta = {
            'producto_id': producto_id,
            'tipo': tipo,
            'fecha': None,
            'resuelta': False
        }
        self.alertas.append(alerta)
        return alerta

    def obtener_alertas(self):
        """Obtiene alertas no resueltas"""
        return [a for a in self.alertas if not a['resuelta']]

    def reporte_inventario(self):
        """Genera reporte de inventario"""
        bajo_stock = [pid for pid, stock in self.inventario.items() if stock < 5]
        sin_stock = [pid for pid, stock in self.inventario.items() if stock == 0]
        
        return {
            'total_productos': len(self.inventario),
            'bajo_stock': len(bajo_stock),
            'sin_stock': len(sin_stock),
            'alertas': len(self.obtener_alertas())
        }
