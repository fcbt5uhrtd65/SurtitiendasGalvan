from apps.identity.interfaces.permissions import IsAdminOrVendedor
from apps.inventory.infrastructure.models import Stock, Warehouse
from apps.inventory.infrastructure.serializers import StockSerializer, WarehouseSerializer
from shared.interfaces.viewsets import SoftDeleteModelViewSet


class WarehouseViewSet(SoftDeleteModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAdminOrVendedor]


class StockViewSet(SoftDeleteModelViewSet):
    queryset = Stock.objects.select_related('warehouse', 'variant').all()
    serializer_class = StockSerializer
    permission_classes = [IsAdminOrVendedor]
    filterset_fields = ['warehouse', 'variant']
