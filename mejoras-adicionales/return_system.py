"""
EcoMarket - Sistema de Devoluciones
Proceso automatizado de devoluciones
"""

class ReturnSystem:
    def __init__(self):
        self.devoluciones = []
        self.razones = [
            'producto_defectuoso',
            'no_coincide_descripcion',
            'cambio_opinion',
            'llego_danado',
            'otro'
        ]
        self.plazo_dias = 30

    def crear_solicitud_devolucion(self, pedido_id, producto_id, usuario_id, razon, descripcion):
        """Crea una solicitud de devolución"""
        devolucion = {
            'id': len(self.devoluciones) + 1,
            'pedido_id': pedido_id,
            'producto_id': producto_id,
            'usuario_id': usuario_id,
            'razon': razon,
            'descripcion': descripcion,
            'estado': 'pendiente',
            'fecha_solicitud': None,
            'fecha_aprobacion': None,
            'reembolso_completado': False
        }
        self.devoluciones.append(devolucion)
        return devolucion

    def aprobar_devolucion(self, devolucion_id, aprobador_id):
        """Aprueba una devolución"""
        devolucion = next((d for d in self.devoluciones if d['id'] == devolucion_id), None)
        if devolucion:
            devolucion['estado'] = 'aprobada'
            devolucion['aprobado_por'] = aprobador_id
            devolucion['fecha_aprobacion'] = None
            return devolucion
        return None

    def procesar_reembolso(self, devolucion_id, monto):
        """Procesa el reembolso"""
        devolucion = next((d for d in self.devoluciones if d['id'] == devolucion_id), None)
        if devolucion and devolucion['estado'] == 'aprobada':
            devolucion['reembolso_completado'] = True
            devolucion['monto_reembolso'] = monto
            devolucion['estado'] = 'completada'
            return devolucion
        return None

    def rechazar_devolucion(self, devolucion_id, motivo):
        """Rechaza una devolución"""
        devolucion = next((d for d in self.devoluciones if d['id'] == devolucion_id), None)
        if devolucion:
            devolucion['estado'] = 'rechazada'
            devolucion['motivo_rechazo'] = motivo
            return devolucion
        return None

    def obtener_devoluciones_usuario(self, usuario_id):
        """Obtiene devoluciones de un usuario"""
        return [d for d in self.devoluciones if d['usuario_id'] == usuario_id]
