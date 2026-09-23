from django.contrib import admin

from apps.inventory.infrastructure.models import Stock, Warehouse


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'is_active']


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['variant', 'warehouse', 'quantity']
    search_fields = ['variant__sku']
