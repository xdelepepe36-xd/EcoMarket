"""
EcoMarket - Integración Redes Sociales
Login social y compartir
"""

class SocialIntegration:
    def __init__(self):
        self.proveedores = {
            'facebook': {
                'app_id': '',
                'app_secret': '',
                'auth_url': 'https://www.facebook.com/v18.0/dialog/oauth'
            },
            'google': {
                'client_id': '',
                'client_secret': '',
                'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth'
            },
            'twitter': {
                'api_key': '',
                'api_secret': '',
                'auth_url': 'https://twitter.com/i/oauth2/authorize'
            }
        }

    def obtener_url_auth(self, proveedor, redirect_uri):
        """Obtiene URL de autenticación"""
        config = self.proveedores.get(proveedor)
        if not config:
            return None
        
        # Simulación de URL de auth
        return f"{config['auth_url']}?client_id={config['client_id']}&redirect_uri={redirect_uri}"

    def compartir_producto(self, proveedor, producto_url, titulo, descripcion):
        """Genera URL para compartir producto"""
        urls = {
            'facebook': f"https://www.facebook.com/sharer/sharer.php?u={producto_url}",
            'twitter': f"https://twitter.com/intent/tweet?url={producto_url}&text={titulo}",
            'whatsapp': f"https://wa.me/?text={titulo} {producto_url}",
            'pinterest': f"https://pinterest.com/pin/create/button/?url={producto_url}&description={descripcion}",
            'linkedin': f"https://www.linkedin.com/sharing/share-offsite/?url={producto_url}"
        }
        return urls.get(proveedor)

    def compartir_perfil_vendedor(self, proveedor, perfil_url, nombre):
        """Genera URL para compartir perfil de vendedor"""
        urls = {
            'facebook': f"https://www.facebook.com/sharer/sharer.php?u={perfil_url}",
            'twitter': f"https://twitter.com/intent/tweet?url={perfil_url}&text=Compra en {nombre}",
            'whatsapp': f"https://wa.me/?text=Mira este vendedor: {nombre} {perfil_url}"
        }
        return urls.get(proveedor)
