"""
EcoMarket - Sistema de Subastas
Subastas de productos por tiempo limitado
"""

from datetime import datetime, timedelta

class AuctionSystem:
    def __init__(self):
        self.subastas = []
        self.estados = ['programada', 'activa', 'finalizada', 'cancelada']

    def crear_subasta(self, producto_id, vendedor_id, precio_base, duracion_horas):
        """Crea una subasta"""
        subasta = {
            'id': len(self.subastas) + 1,
            'producto_id': producto_id,
            'vendedor_id': vendedor_id,
            'precio_base': precio_base,
            'precio_actual': precio_base,
            'puja_maxima': precio_base,
            'fecha_inicio': None,
            'fecha_fin': None,
            'estado': 'programada',
            'pujas': [],
            'ganador': None
        }
        self.subastas.append(subasta)
        return subasta

    def iniciar_subasta(self, subasta_id):
        """Inicia una subasta"""
        subasta = next((s for s in self.subastas if s['id'] == subasta_id), None)
        if subasta:
            subasta['estado'] = 'activa'
            subasta['fecha_inicio'] = datetime.now()
            subasta['fecha_fin'] = datetime.now() + timedelta(hours=24)
            return subasta
        return None

    def hacer_puja(self, subasta_id, usuario_id, monto):
        """Hace una puja en una subasta"""
        subasta = next((s for s in self.subastas if s['id'] == subasta_id), None)
        if subasta and subasta['estado'] == 'activa':
            if monto > subasta['puja_maxima']:
                subasta['puja_maxima'] = monto
                subasta['precio_actual'] = monto
                subasta['pujas'].append({
                    'usuario_id': usuario_id,
                    'monto': monto,
                    'fecha': datetime.now()
                })
                return subasta
        return None

    def finalizar_subasta(self, subasta_id):
        """Finaliza una subasta y determina ganador"""
        subasta = next((s for s in self.subastas if s['id'] == subasta_id), None)
        if subasta and subasta['estado'] == 'activa':
            subasta['estado'] = 'finalizada'
            if subasta['pujas']:
                ultima_puja = max(subasta['pujas'], key=lambda x: x['monto'])
                subasta['ganador'] = ultima_puja['usuario_id']
            return subasta
        return None

    def obtener_subastas_activas(self):
        """Obtiene subastas activas"""
        return [s for s in self.subastas if s['estado'] == 'activa']
