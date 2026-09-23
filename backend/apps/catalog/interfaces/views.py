import uuid

from celery.result import AsyncResult
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.application.use_cases import CreateProductInput, CreateProductUseCase, UpdateVariantPriceUseCase
from apps.catalog.infrastructure.models import Category, Product
from apps.catalog.infrastructure.serializers import (
    CategorySerializer,
    ProductCreateSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductUpdateSerializer,
)
from apps.catalog.infrastructure.tasks import export_catalog_to_excel
from apps.catalog.interfaces.filters import ProductFilter
from apps.identity.interfaces.permissions import IsAdminOrVendedor
from shared.interfaces.viewsets import SoftDeleteModelViewSet


class CategoryViewSet(SoftDeleteModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdminOrVendedor()]


class CatalogExportView(APIView):
    permission_classes = [IsAdminOrVendedor]

    def post(self, request):
        task = export_catalog_to_excel.delay()
        return Response({'task_id': task.id, 'status': task.status})


class CatalogExportStatusView(APIView):
    permission_classes = [IsAdminOrVendedor]

    def get(self, request, task_id):
        result = AsyncResult(task_id)
        payload = {'task_id': task_id, 'status': result.status}
        if result.successful():
            payload['file_path'] = result.result
        elif result.failed():
            payload['error'] = str(result.result)
        return Response(payload)


class ProductViewSet(SoftDeleteModelViewSet):
    queryset = Product.objects.filter(is_active=True).prefetch_related('variants__prices', 'images')
    filterset_class = ProductFilter
    search_fields = ['name', 'brand', 'description']
    ordering_fields = ['name', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdminOrVendedor()]

    def create(self, request, *args, **kwargs):
        payload = ProductCreateSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        data = payload.validated_data
        category = data['category']
        sku = f'{category.slug[:4].upper()}-{uuid.uuid4().hex[:8].upper()}'

        product = CreateProductUseCase().execute(CreateProductInput(
            name=data['name'],
            brand=data.get('brand', ''),
            description=data.get('description', ''),
            category_id=str(category.id),
            sku=sku,
            presentation='',
            price_amount=data['price'],
            initial_stock=data.get('stock', 0),
            features=data.get('features', []),
            image_urls=[data['image']] if data.get('image') else [],
            is_new=data.get('is_new', False),
            is_best_seller=data.get('is_best_seller', False),
            original_price=data.get('original_price'),
        ))
        return Response(ProductDetailSerializer(product).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        payload = ProductUpdateSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        data = payload.validated_data

        product_fields = ('name', 'brand', 'description', 'category', 'features', 'is_new', 'is_best_seller', 'is_active')
        changed_fields = [field for field in product_fields if field in data]
        for field in changed_fields:
            setattr(instance, field, data[field])
        if changed_fields:
            instance.save(update_fields=changed_fields)

        variant = instance.variants.first()
        if variant:
            variant_fields = []
            if 'stock' in data:
                variant.stock = data['stock']
                variant_fields.append('stock')
            if 'original_price' in data:
                variant.original_price = data['original_price']
                variant_fields.append('original_price')
            if variant_fields:
                variant.save(update_fields=variant_fields)
            if 'price' in data:
                UpdateVariantPriceUseCase().execute(str(variant.id), data['price'])

        instance.refresh_from_db()
        return Response(ProductDetailSerializer(instance).data)
