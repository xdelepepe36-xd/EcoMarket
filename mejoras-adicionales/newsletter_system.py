"""
EcoMarket - Sistema de Newsletter
Marketing por email automatizado
"""

class NewsletterSystem:
    def __init__(self):
        self.suscriptores = []
        self.campañas = []

    def suscribir(self, email, nombre='', preferencias=[]):
        """Suscribe un usuario al newsletter"""
        if email in [s['email'] for s in self.suscriptores]:
            return {'error': 'Email ya suscrito'}
        
        suscriptor = {
            'id': len(self.suscriptores) + 1,
            'email': email,
            'nombre': nombre,
            'preferencias': preferencias,
            'fecha_suscripcion': None,
            'activo': True
        }
        self.suscriptores.append(suscriptor)
        return suscriptor

    def desuscribir(self, email):
        """Desuscribe un usuario"""
        suscriptor = next((s for s in self.suscriptores if s['email'] == email), None)
        if suscriptor:
            suscriptor['activo'] = False
            return suscriptor
        return None

    def crear_campana(self, asunto, contenido_html, segmento='todos'):
        """Crea una campaña de email"""
        campana = {
            'id': len(self.campañas) + 1,
            'asunto': asunto,
            'contenido': contenido_html,
            'segmento': segmento,
            'estado': 'borrador',
            'fecha_creacion': None,
            'enviada': False
        }
        self.campañas.append(campana)
        return campana

    def enviar_campana(self, campana_id):
        """Envía una campaña a los suscriptores"""
        campana = next((c for c in self.campañas if c['id'] == campana_id), None)
        if campana:
            campana['estado'] = 'enviada'
            campana['enviada'] = True
            campana['fecha_envio'] = None
            return campana
        return None

    def obtener_suscriptores_activos(self):
        """Obtiene suscriptores activos"""
        return [s for s in self.suscriptores if s['activo']]
