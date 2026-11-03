"""
EcoMarket - Sistema de Pagos Reales con Stripe
Integración completa de procesamiento de pagos
"""

import stripe
from flask import request, jsonify
import os

class StripePaymentSystem:
    def __init__(self):
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        self.public_key = os.getenv('STRIPE_PUBLIC_KEY')

    def crear_intent_pago(self, monto, descripcion, metadata=None):
        """Crea un intento de pago con Stripe"""
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(monto * 100),  # Stripe usa centavos
                currency='pen',
                description=descripcion,
                metadata=metadata or {}
            )
            return {
                'client_secret': intent.client_secret,
                'public_key': self.public_key,
                'amount': monto
            }
        except Exception as e:
            return {'error': str(e)}

    def confirmar_pago(self, payment_intent_id):
        """Confirma el estado de un pago"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                'status': intent.status,
                'amount': intent.amount / 100
            }
        except Exception as e:
            return {'error': str(e)}

    def crear_suscripcion(self, customer_id, price_id):
        """Crea una suscripción recurrente"""
        try:
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{'price': price_id}]
            )
            return subscription
        except Exception as e:
            return {'error': str(e)}

    def reembolso(self, payment_intent_id, monto=None):
        """Procesa un reembolso"""
        try:
            if monto:
                refund = stripe.Refund.create(
                    payment_intent=payment_intent_id,
                    amount=int(monto * 100)
                )
            else:
                refund = stripe.Refund.create(payment_intent=payment_intent_id)
            return refund
        except Exception as e:
            return {'error': str(e)}
