from dataclasses import dataclass, field
from decimal import Decimal


@dataclass(frozen=True)
class PriceEntity:
    amount: Decimal
    currency: str
    is_active: bool


@dataclass(frozen=True)
class ProductVariantEntity:
    id: str
    sku: str
    presentation: str
    current_price: PriceEntity | None
    stock: int


@dataclass(frozen=True)
class CategoryEntity:
    id: str
    name: str
    slug: str
    color: str
    parent_id: str | None = None


@dataclass
class ProductEntity:
    id: str
    name: str
    brand: str
    description: str
    category_id: str
    variants: list[ProductVariantEntity] = field(default_factory=list)

    @property
    def is_available(self) -> bool:
        return any(variant.stock > 0 for variant in self.variants)

    @property
    def lowest_price(self) -> Decimal | None:
        prices = [v.current_price.amount for v in self.variants if v.current_price]
        return min(prices) if prices else None
