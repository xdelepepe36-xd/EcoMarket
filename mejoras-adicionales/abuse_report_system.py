"""
EcoMarket - Sistema de Reportes de Abuso
Denuncias y moderación
"""

class AbuseReportSystem:
    def __init__(self):
        self.reportes = []
        self.tipos_reporte = [
            'producto_inapropiado',
            'spam',
            'contenido_ofensivo',
            'precio_falso',
            'fraude',
            'otro'
        ]

    def crear_reporte(self, usuario_id, reportado_id, tipo, descripcion):
        """Crea un reporte de abuso"""
        reporte = {
            'id': len(self.reportes) + 1,
            'usuario_id': usuario_id,
            'reportado_id': reportado_id,
            'tipo': tipo,
            'descripcion': descripcion,
            'estado': 'pendiente',
            'fecha': None,
            'revisado_por': None
        }
        self.reportes.append(reporte)
        return reporte

    def revisar_reporte(self, reporte_id, moderador_id, accion, notas):
        """Revisa un reporte de abuso"""
        reporte = next((r for r in self.reportes if r['id'] == reporte_id), None)
        if reporte:
            reporte['estado'] = accion  # 'aprobado', 'rechazado'
            reporte['revisado_por'] = moderador_id
            reporte['notas'] = notas
            return reporte
        return None

    def obtener_reportes_pendientes(self):
        """Obtiene reportes pendientes de revisión"""
        return [r for r in self.reportes if r['estado'] == 'pendiente']

    def obtener_estadisticas(self):
        """Obtiene estadísticas de reportes"""
        total = len(self.reportes)
        pendientes = len(self.obtener_reportes_pendientes())
        resueltos = total - pendientes
        
        return {
            'total': total,
            'pendientes': pendientes,
            'resueltos': resueltos,
            'por_tipo': self.contar_por_tipo()
        }

    def contar_por_tipo(self):
        """Cuenta reportes por tipo"""
        conteo = {}
        for reporte in self.reportes:
            tipo = reporte['tipo']
            conteo[tipo] = conteo.get(tipo, 0) + 1
        return conteo
