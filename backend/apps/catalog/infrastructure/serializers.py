from decimal import Decimal

from rest_framework import serializers

from apps.catalog.infrastructure.models import Category, Price, Product, ProductImage, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'color', 'parent']


class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = ['id', 'amount', 'currency', 'is_active', 'created_at']


class ProductVariantSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'presentation', 'stock', 'price', 'original_price', 'is_on_sale', 'discount_percent']

    def get_price(self, obj: ProductVariant):
        price = obj.active_price
        return PriceSerializer(price).data if price else None


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'url', 'order', 'is_primary']


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    price_from = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()
    stock = serializers.SerializerMethodField()
    primary_variant_id = serializers.SerializerMethodField()
    original_price = serializers.SerializerMethodField()
    is_on_sale = serializers.SerializerMethodField()
    discount_percent = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'category', 'price_from', 'primary_image',
            'in_stock', 'stock', 'primary_variant_id', 'is_new', 'is_best_seller',
            'original_price', 'is_on_sale', 'discount_percent',
        ]

    def _primary_variant(self, obj: Product):
        return obj.variants.first()

    def get_price_from(self, obj: Product):
        prices = [variant.active_price.amount for variant in obj.variants.all() if variant.active_price]
        return min(prices) if prices else None

    def get_primary_image(self, obj: Product):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        return image.url if image else None

    def get_in_stock(self, obj: Product) -> bool:
        return any(variant.stock > 0 for variant in obj.variants.all())

    def get_stock(self, obj: Product) -> int:
        return sum(variant.stock for variant in obj.variants.all())

    def get_primary_variant_id(self, obj: Product):
        variant = self._primary_variant(obj)
        return str(variant.id) if variant else None

    def get_original_price(self, obj: Product):
        variant = self._primary_variant(obj)
        return variant.original_price if variant and variant.is_on_sale else None

    def get_is_on_sale(self, obj: Product) -> bool:
        variant = self._primary_variant(obj)
        return bool(variant and variant.is_on_sale)

    def get_discount_percent(self, obj: Product) -> int:
        variant = self._primary_variant(obj)
        return variant.discount_percent if variant else 0


class ProductDetailSerializer(ProductListSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ['description', 'features', 'variants', 'images']


class ProductCreateSerializer(serializers.Serializer):
    """Payload plano de un solo variante/precio por producto — así es como lo
    envía el panel admin. Crear variantes adicionales no está soportado desde
    esta API todavía."""

    name = serializers.CharField(max_length=200)
    brand = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    description = serializers.CharField(required=False, allow_blank=True, default='')
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    features = serializers.ListField(child=serializers.CharField(allow_blank=True), required=False, default=list)
    is_new = serializers.BooleanField(required=False, default=False)
    is_best_seller = serializers.BooleanField(required=False, default=False)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'))
    original_price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'), required=False, allow_null=True)
    stock = serializers.IntegerField(min_value=0, default=0)
    image = serializers.URLField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        original_price = attrs.get('original_price')
        if original_price is not None and original_price <= attrs['price']:
            raise serializers.ValidationError({'original_price': 'El precio original debe ser mayor al precio de venta.'})
        return attrs


class ProductUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=False)
    brand = serializers.CharField(max_length=100, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False)
    features = serializers.ListField(child=serializers.CharField(allow_blank=True), required=False)
    is_new = serializers.BooleanField(required=False)
    is_best_seller = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'), required=False)
    original_price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'), required=False, allow_null=True)
    stock = serializers.IntegerField(min_value=0, required=False)

    def validate(self, attrs):
        original_price = attrs.get('original_price')
        price = attrs.get('price')
        if original_price is not None and price is not None and original_price <= price:
            raise serializers.ValidationError({'original_price': 'El precio original debe ser mayor al precio de venta.'})
        return attrs
