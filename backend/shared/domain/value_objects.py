from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str = 'COP'

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError('El monto no puede ser negativo.')

    def __add__(self, other: 'Money') -> 'Money':
        self._assert_same_currency(other)
        return Money(self.amount + other.amount, self.currency)

    def __mul__(self, factor: int) -> 'Money':
        return Money(self.amount * factor, self.currency)

    def _assert_same_currency(self, other: 'Money') -> None:
        if self.currency != other.currency:
            raise ValueError('No se pueden operar montos en monedas distintas.')
