"""
EcoMarket - Sistema de Soporte al Cliente
Tickets y chat de soporte
"""

class SupportSystem:
    def __init__(self):
        self.tickets = []
        self.prioridades = {
            'baja': 1,
            'media': 2,
            'alta': 3,
            'urgente': 4
        }

    def crear_ticket(self, usuario_id, asunto, descripcion, prioridad='media'):
        """Crea un ticket de soporte"""
        ticket = {
            'id': len(self.tickets) + 1,
            'usuario_id': usuario_id,
            'asunto': asunto,
            'descripcion': descripcion,
            'prioridad': prioridad,
            'estado': 'abierto',
            'fecha_creacion': None,
            'mensajes': [],
            'asignado_a': None
        }
        self.tickets.append(ticket)
        return ticket

    def agregar_mensaje_ticket(self, ticket_id, mensaje, usuario_id):
        """Agrega un mensaje a un ticket"""
        ticket = next((t for t in self.tickets if t['id'] == ticket_id), None)
        if ticket:
            ticket['mensajes'].append({
                'mensaje': mensaje,
                'usuario_id': usuario_id,
                'fecha': None
            })
            return ticket
        return None

    def asignar_ticket(self, ticket_id, agente_id):
        """Asigna un ticket a un agente"""
        ticket = next((t for t in self.tickets if t['id'] == ticket_id), None)
        if ticket:
            ticket['asignado_a'] = agente_id
            ticket['estado'] = 'en_proceso'
            return ticket
        return None

    def cerrar_ticket(self, ticket_id):
        """Cierra un ticket"""
        ticket = next((t for t in self.tickets if t['id'] == ticket_id), None)
        if ticket:
            ticket['estado'] = 'cerrado'
            return ticket
        return None

    def obtener_tickets_usuario(self, usuario_id):
        """Obtiene tickets de un usuario"""
        return [t for t in self.tickets if t['usuario_id'] == usuario_id]

    def obtener_tickets_abiertos(self):
        """Obtiene tickets abiertos ordenados por prioridad"""
        abiertos = [t for t in self.tickets if t['estado'] != 'cerrado']
        return sorted(abiertos, key=lambda x: self.prioridades[x['prioridad']], reverse=True)
