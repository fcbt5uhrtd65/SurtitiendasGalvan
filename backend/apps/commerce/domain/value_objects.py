class OrderStatus:
    PENDIENTE = 'PENDIENTE'
    CONFIRMADO = 'CONFIRMADO'
    EMPACADO = 'EMPACADO'
    ENVIADO = 'ENVIADO'
    ENTREGADO = 'ENTREGADO'
    CANCELADO = 'CANCELADO'

    CHOICES = [
        (PENDIENTE, 'Pendiente'),
        (CONFIRMADO, 'Confirmado'),
        (EMPACADO, 'Empacado'),
        (ENVIADO, 'Enviado'),
        (ENTREGADO, 'Entregado'),
        (CANCELADO, 'Cancelado'),
    ]

    TRANSITIONS: dict[str, set[str]] = {
        PENDIENTE: {CONFIRMADO, CANCELADO},
        CONFIRMADO: {EMPACADO, CANCELADO},
        EMPACADO: {ENVIADO, CANCELADO},
        ENVIADO: {ENTREGADO},
        ENTREGADO: set(),
        CANCELADO: set(),
    }

    @classmethod
    def can_transition(cls, current: str, target: str) -> bool:
        return target in cls.TRANSITIONS.get(current, set())
