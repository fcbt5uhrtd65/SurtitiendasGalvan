from shared.domain.exceptions import DomainError


class CarritoVacioError(DomainError):
    default_message = 'El carrito está vacío.'


class StockInsuficienteError(DomainError):
    def __init__(self, product_name: str, available: int):
        super().__init__(f'Stock insuficiente para "{product_name}". Disponible: {available}.')
        self.product_name = product_name
        self.available = available


class TransicionEstadoInvalidaError(DomainError):
    def __init__(self, current: str, target: str):
        super().__init__(f'No se puede cambiar el pedido de "{current}" a "{target}".')
        self.current = current
        self.target = target
