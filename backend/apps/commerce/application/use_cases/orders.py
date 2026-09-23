from dataclasses import dataclass
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from apps.catalog.infrastructure.models import ProductVariant
from apps.commerce.domain.exceptions import CarritoVacioError, StockInsuficienteError, TransicionEstadoInvalidaError
from apps.commerce.domain.value_objects import OrderStatus
from apps.commerce.infrastructure.models import Cart, Order, OrderLine, OrderStatusHistory
from apps.commerce.infrastructure.tasks import send_order_confirmation_email, send_order_status_update_email
from shared.domain.exceptions import EntityNotFoundError


@dataclass
class CheckoutInput:
    shipping_city: str
    shipping_address: str
    payment_method: str
    delivery_method: str


class CheckoutUseCase:
    @transaction.atomic
    def execute(self, customer, data: CheckoutInput) -> Order:
        try:
            cart = Cart.objects.get(customer=customer)
        except Cart.DoesNotExist as exc:
            raise CarritoVacioError() from exc

        items = list(cart.items.select_related('variant__product').select_for_update())
        if not items:
            raise CarritoVacioError()

        for item in items:
            variant = ProductVariant.objects.select_for_update().get(id=item.variant_id)
            if item.quantity > variant.stock:
                raise StockInsuficienteError(variant.product.name, variant.stock)

        order = Order.objects.create(
            customer=customer,
            status=OrderStatus.PENDIENTE,
            shipping_city=data.shipping_city,
            shipping_address=data.shipping_address,
            payment_method=data.payment_method,
            delivery_method=data.delivery_method,
            subtotal=Decimal('0'),
            total=Decimal('0'),
        )

        order_subtotal = Decimal('0')
        for item in items:
            variant = item.variant
            price = variant.active_price
            if price is None:
                raise EntityNotFoundError(f'El producto "{variant.product.name}" no tiene un precio activo.')

            OrderLine.objects.create(
                order=order,
                variant=variant,
                product_name=variant.product.name,
                quantity=item.quantity,
                unit_price=price.amount,
            )
            order_subtotal += price.amount * item.quantity
            ProductVariant.objects.filter(id=variant.id).update(stock=F('stock') - item.quantity)

        order.subtotal = order_subtotal
        order.total = order_subtotal
        order.save(update_fields=['subtotal', 'total'])

        OrderStatusHistory.objects.create(order=order, from_status='', to_status=OrderStatus.PENDIENTE)
        cart.items.all().delete()

        transaction.on_commit(lambda: send_order_confirmation_email.delay(str(order.id)))
        return order


class ChangeOrderStatusUseCase:
    @transaction.atomic
    def execute(self, order_id: str, target_status: str, changed_by=None, note: str = '') -> Order:
        try:
            order = Order.objects.select_for_update().get(id=order_id)
        except Order.DoesNotExist as exc:
            raise EntityNotFoundError('El pedido solicitado no existe.') from exc

        if not OrderStatus.can_transition(order.status, target_status):
            raise TransicionEstadoInvalidaError(order.status, target_status)

        if target_status == OrderStatus.CANCELADO:
            for line in order.lines.select_related('variant'):
                ProductVariant.objects.filter(id=line.variant_id).update(stock=F('stock') + line.quantity)

        previous_status = order.status
        order.status = target_status
        order.save(update_fields=['status'])
        OrderStatusHistory.objects.create(
            order=order, from_status=previous_status, to_status=target_status,
            changed_by=changed_by, note=note,
        )
        transaction.on_commit(lambda: send_order_status_update_email.delay(str(order.id)))
        return order
