from dataclasses import dataclass, field
from decimal import Decimal


@dataclass
class CartLineEntity:
    variant_id: str
    quantity: int
    unit_price: Decimal

    @property
    def subtotal(self) -> Decimal:
        return self.unit_price * self.quantity


@dataclass
class CartEntity:
    id: str
    lines: list[CartLineEntity] = field(default_factory=list)

    @property
    def total(self) -> Decimal:
        return sum((line.subtotal for line in self.lines), Decimal('0'))
