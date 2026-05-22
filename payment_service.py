from abc import ABC, abstractmethod
import os
import logging
import random
import string
import re

# Configuración de logging estructurado
logger = logging.getLogger(__name__)

class PaymentProvider(ABC):
    """Interfaz abstracta para proveedores de pago."""
    @abstractmethod
    def create_preference(self, reservation_data, user_data):
        pass


class NequiProvider(PaymentProvider):
    """
    Proveedor para pagos interactivos de Nequi Negocios.
    Soporta generación de QR e inicio de simulación de cobro push.
    """
    def __init__(self, negocio_celular, negocio_nombre, negocio_link=None):
        self.negocio_celular = negocio_celular or "3112345678"
        self.negocio_nombre = negocio_nombre or "StayHuila Reservas"
        self.negocio_link = negocio_link or "https://link.nequi.co/stayhuila"

    def create_preference(self, reservation_data, user_data):
        """
        Crea una intención/preferencia de pago de Nequi.
        Retorna la URL local para procesar el pago Nequi dentro del sitio.
        """
        reserva_id = reservation_data['id']
        base_url = reservation_data.get('base_url', 'http://localhost:5000')
        
        # Generar un ID de transacción Nequi simulado (ej: TXN-7A4B29)
        txn_id = "NEQ-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        logger.info(f"[Nequi] Generando intención de pago para reserva {reserva_id}. Txn={txn_id}")
        
        return {
            "id": txn_id,
            "checkout_url": f"{base_url}/pago/nequi/{reserva_id}",
            "celular_negocio": self.negocio_celular,
            "nombre_negocio": self.negocio_nombre,
            "link_negocio": self.negocio_link
        }

    def validar_celular(self, celular: str) -> bool:
        """Valida que sea un número de celular de Nequi Colombia (10 dígitos empezando con 3)"""
        return bool(re.match(r"^3\d{9}$", celular))


class PaymentService:
    """Servicio desacoplado para gestionar pagos."""
    def __init__(self, provider: PaymentProvider):
        self.provider = provider

    def generate_payment_link(self, reservation_data, user_data):
        return self.provider.create_preference(reservation_data, user_data)
