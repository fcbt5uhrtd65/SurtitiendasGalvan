from django.db import models

from apps.catalog.infrastructure.models import ProductVariant
from shared.infrastructure.models import BaseModel


class Warehouse(BaseModel):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    class Meta(BaseModel.Meta):
        db_table = 'inventory_warehouse'

    def __str__(self) -> str:
        return self.name


class Stock(BaseModel):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stock_entries')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='stock_entries')
    quantity = models.PositiveIntegerField(default=0)

    class Meta(BaseModel.Meta):
        db_table = 'inventory_stock'
        constraints = [
            models.UniqueConstraint(fields=['warehouse', 'variant'], name='unique_stock_per_warehouse_variant'),
        ]

    def __str__(self) -> str:
        return f'{self.variant.sku} @ {self.warehouse.name}: {self.quantity}'
