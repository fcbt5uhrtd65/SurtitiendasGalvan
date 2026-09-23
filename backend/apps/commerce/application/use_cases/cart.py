from dataclasses import dataclass

from django.db import transaction

from apps.catalog.infrastructure.models import ProductVariant
from apps.commerce.domain.exceptions import StockInsuficienteError
from apps.commerce.infrastructure.models import Cart, CartItem
from shared.domain.exceptions import EntityNotFoundError


@dataclass
class AddCartItemInput:
    variant_id: str
    quantity: int


class AddItemToCartUseCase:
    @transaction.atomic
    def execute(self, customer, data: AddCartItemInput) -> Cart:
        cart, _ = Cart.objects.get_or_create(customer=customer)
        try:
            variant = ProductVariant.objects.select_related('product').get(id=data.variant_id)
        except ProductVariant.DoesNotExist as exc:
            raise EntityNotFoundError('El producto seleccionado no existe.') from exc

        item, _ = CartItem.objects.get_or_create(cart=cart, variant=variant, defaults={'quantity': 0})
        new_quantity = item.quantity + data.quantity
        if new_quantity > variant.stock:
            raise StockInsuficienteError(variant.product.name, variant.stock)
        item.quantity = new_quantity
        item.save(update_fields=['quantity'])
        return cart


class UpdateCartItemQuantityUseCase:
    @transaction.atomic
    def execute(self, customer, variant_id: str, quantity: int) -> Cart:
        cart, _ = Cart.objects.get_or_create(customer=customer)
        try:
            item = cart.items.select_related('variant__product').get(variant_id=variant_id)
        except CartItem.DoesNotExist as exc:
            raise EntityNotFoundError('El producto no está en el carrito.') from exc

        if quantity <= 0:
            item.delete()
            return cart

        if quantity > item.variant.stock:
            raise StockInsuficienteError(item.variant.product.name, item.variant.stock)

        item.quantity = quantity
        item.save(update_fields=['quantity'])
        return cart


class RemoveCartItemUseCase:
    @transaction.atomic
    def execute(self, customer, variant_id: str) -> Cart:
        cart, _ = Cart.objects.get_or_create(customer=customer)
        cart.items.filter(variant_id=variant_id).delete()
        return cart


class ClearCartUseCase:
    def execute(self, customer) -> Cart:
        cart, _ = Cart.objects.get_or_create(customer=customer)
        cart.items.all().delete()
        return cart
