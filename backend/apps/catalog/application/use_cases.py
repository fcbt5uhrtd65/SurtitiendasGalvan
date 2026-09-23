from dataclasses import dataclass, field
from decimal import Decimal

from django.db import transaction

from apps.catalog.infrastructure.models import Category, Price, Product, ProductImage, ProductVariant
from shared.domain.exceptions import EntityNotFoundError


@dataclass
class CreateProductInput:
    name: str
    brand: str
    description: str
    category_id: str
    sku: str
    presentation: str
    price_amount: Decimal
    initial_stock: int
    currency: str = 'COP'
    features: list[str] = field(default_factory=list)
    image_urls: list[str] = field(default_factory=list)
    is_new: bool = False
    is_best_seller: bool = False
    original_price: Decimal | None = None


class CreateProductUseCase:
    @transaction.atomic
    def execute(self, data: CreateProductInput) -> Product:
        try:
            category = Category.objects.get(id=data.category_id)
        except Category.DoesNotExist as exc:
            raise EntityNotFoundError('La categoría seleccionada no existe.') from exc

        product = Product.objects.create(
            name=data.name,
            brand=data.brand,
            description=data.description,
            category=category,
            features=data.features,
            is_new=data.is_new,
            is_best_seller=data.is_best_seller,
        )
        variant = ProductVariant.objects.create(
            product=product,
            sku=data.sku,
            presentation=data.presentation,
            stock=data.initial_stock,
            original_price=data.original_price,
        )
        Price.objects.create(
            variant=variant,
            amount=data.price_amount,
            currency=data.currency,
            is_active=True,
        )
        for order, url in enumerate(data.image_urls):
            ProductImage.objects.create(product=product, url=url, order=order, is_primary=order == 0)

        return product


class UpdateVariantPriceUseCase:
    @transaction.atomic
    def execute(self, variant_id: str, amount: Decimal, currency: str = 'COP') -> Price:
        try:
            variant = ProductVariant.objects.get(id=variant_id)
        except ProductVariant.DoesNotExist as exc:
            raise EntityNotFoundError('La variante de producto no existe.') from exc

        Price.objects.filter(variant=variant, is_active=True).update(is_active=False)
        return Price.objects.create(variant=variant, amount=amount, currency=currency, is_active=True)
