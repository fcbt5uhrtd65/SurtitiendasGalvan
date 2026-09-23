from django.conf import settings
from django.db import models

from apps.catalog.infrastructure.models import ProductVariant
from apps.commerce.domain.value_objects import OrderStatus
from apps.customers.infrastructure.models import Customer
from shared.infrastructure.models import BaseModel


class Cart(BaseModel):
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='cart')

    class Meta(BaseModel.Meta):
        db_table = 'commerce_cart'

    def __str__(self) -> str:
        return f'Carrito de {self.customer}'

    @property
    def total(self):
        return sum((item.subtotal for item in self.items.all()), 0)


class CartItem(BaseModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)

    class Meta(BaseModel.Meta):
        db_table = 'commerce_cart_item'
        constraints = [models.UniqueConstraint(fields=['cart', 'variant'], name='unique_cart_variant')]

    @property
    def subtotal(self):
        price = self.variant.active_price
        return (price.amount * self.quantity) if price else 0


class Order(BaseModel):
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='orders')
    status = models.CharField(max_length=20, choices=OrderStatus.CHOICES, default=OrderStatus.PENDIENTE)
    shipping_city = models.CharField(max_length=100)
    shipping_address = models.CharField(max_length=255)
    payment_method = models.CharField(max_length=50, default='CONTRAENTREGA')
    delivery_method = models.CharField(max_length=50, default='DOMICILIO')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta(BaseModel.Meta):
        db_table = 'commerce_order'

    def __str__(self) -> str:
        return f'Pedido {self.id} — {self.status}'


class OrderLine(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='lines')
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, related_name='order_lines')
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta(BaseModel.Meta):
        db_table = 'commerce_order_line'

    @property
    def subtotal(self):
        return self.unit_price * self.quantity


class OrderStatusHistory(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    from_status = models.CharField(max_length=20, blank=True)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+',
    )
    note = models.CharField(max_length=255, blank=True)

    class Meta(BaseModel.Meta):
        db_table = 'commerce_order_status_history'
        verbose_name_plural = 'order status histories'
