"""
EcoMarket - Sistema de Notificaciones por Email
Envío de emails para confirmaciones, actualizaciones y alertas
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class EmailNotifier:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.smtp_user = os.getenv('SMTP_USER')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@ecomarket.com')

    def enviar_email(self, to_email, subject, html_content):
        """Envía un email HTML"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            msg.attach(MIMEText(html_content, 'html'))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
            server.quit()
            return True
        except Exception as e:
            print(f"Error enviando email: {e}")
            return False

    def confirmacion_pedido(self, to_email, pedido_id, productos):
        """Envía confirmación de pedido"""
        subject = f"Tu pedido #{pedido_id} ha sido confirmado"
        html = f"""
        <h2>¡Gracias por tu compra!</h2>
        <p>Tu pedido #{pedido_id} ha sido confirmado.</p>
        <h3>Productos:</h3>
        <ul>
            {"".join([f"<li>{p['nombre']} - S/{p['precio']}</li>" for p in productos])}
        </ul>
        <p>Te notificaremos cuando tu pedido sea enviado.</p>
        """
        return self.enviar_email(to_email, subject, html)

    def actualizacion_envio(self, to_email, pedido_id, tracking):
        """Envía actualización de envío"""
        subject = f"Tu pedido #{pedido_id} ha sido enviado"
        html = f"""
        <h2>¡Tu pedido está en camino!</h2>
        <p>Número de seguimiento: {tracking}</p>
        <p>Puedes rastrear tu pedido en el enlace del courier.</p>
        """
        return self.enviar_email(to_email, subject, html)

    def alerta_precio(self, to_email, producto, precio_nuevo):
        """Envía alerta de baja de precio"""
        subject = f"¡Bajada de precio! {producto['nombre']}"
        html = f"""
        <h2>El producto que te interesa bajó de precio</h2>
        <p>{producto['nombre']}</p>
        <p>Precio anterior: S/{producto['precio']}</p>
        <p><strong>Precio nuevo: S/{precio_nuevo}</strong></p>
        <a href="/producto/{producto['id']}">Ver producto</a>
        """
        return self.enviar_email(to_email, subject, html)

    def resumen_semanal(self, to_email, metricas):
        """Envía resumen semanal de actividad"""
        subject = "Tu resumen semanal de EcoMarket"
        html = f"""
        <h2>Resumen semanal</h2>
        <p>Productos vistos: {metricas['vistos']}</p>
        <p>Productos en carrito: {metricas['carrito']}</p>
        <p>Ofertas disponibles: {metricas['ofertas']}</p>
        """
        return self.enviar_email(to_email, subject, html)
