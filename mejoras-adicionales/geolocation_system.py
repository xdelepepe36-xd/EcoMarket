"""
EcoMarket - Sistema de Geolocalización
Ubicación de usuarios y vendedores
"""

class GeolocationSystem:
    def __init__(self):
        self.ubicaciones = {}

    def registrar_ubicacion(self, usuario_id, latitud, longitud, direccion):
        """Registra la ubicación de un usuario"""
        self.ubicaciones[usuario_id] = {
            'latitud': latitud,
            'longitud': longitud,
            'direccion': direccion,
            'fecha_actualizacion': None
        }
        return self.ubicaciones[usuario_id]

    def obtener_ubicacion(self, usuario_id):
        """Obtiene la ubicación de un usuario"""
        return self.ubicaciones.get(usuario_id)

    def calcular_distancia(self, usuario_id1, usuario_id2):
        """Calcula distancia entre dos usuarios (fórmula Haversine)"""
        loc1 = self.obtener_ubicacion(usuario_id1)
        loc2 = self.obtener_ubicacion(usuario_id2)
        
        if not loc1 or not loc2:
            return None
        
        from math import radians, sin, cos, sqrt, atan2
        
        lat1, lon1 = radians(loc1['latitud']), radians(loc1['longitud'])
        lat2, lon2 = radians(loc2['latitud']), radians(loc2['longitud'])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        radio_tierra = 6371  # km
        return radio_tierra * c

    def buscar_vendedores_cercanos(self, usuario_id, radio_km=10):
        """Busca vendedores cercanos"""
        cercanos = []
        for vendedor_id, ubicacion in self.ubicaciones.items():
            if vendedor_id != usuario_id:
                distancia = self.calcular_distancia(usuario_id, vendedor_id)
                if distancia and distancia <= radio_km:
                    cercanos.append({
                        'vendedor_id': vendedor_id,
                        'distancia': round(distancia, 2)
                    })
        return sorted(cercanos, key=lambda x: x['distancia'])
