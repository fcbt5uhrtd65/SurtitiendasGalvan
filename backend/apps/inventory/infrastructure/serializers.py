from rest_framework import serializers

from apps.inventory.infrastructure.models import Stock, Warehouse


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'city', 'is_active']


class StockSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    sku = serializers.CharField(source='variant.sku', read_only=True)

    class Meta:
        model = Stock
        fields = ['id', 'warehouse', 'warehouse_name', 'variant', 'sku', 'quantity']
