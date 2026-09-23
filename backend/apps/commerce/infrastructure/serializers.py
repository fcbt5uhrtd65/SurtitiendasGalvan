from rest_framework import serializers

from apps.commerce.infrastructure.models import Cart, CartItem, Order, OrderLine, OrderStatusHistory


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    unit_price = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'variant', 'product_name', 'quantity', 'unit_price', 'subtotal']

    def get_unit_price(self, obj: CartItem):
        price = obj.variant.active_price
        return price.amount if price else None

    def get_subtotal(self, obj: CartItem):
        return obj.subtotal


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total']

    def get_total(self, obj: Cart):
        return obj.total


class OrderLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderLine
        fields = ['id', 'variant', 'product_name', 'quantity', 'unit_price', 'subtotal']


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'from_status', 'to_status', 'note', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    lines = OrderLineSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name', 'customer_email', 'status',
            'shipping_city', 'shipping_address', 'payment_method', 'delivery_method',
            'subtotal', 'total', 'lines', 'status_history', 'created_at',
        ]
        read_only_fields = fields


class CheckoutRequestSerializer(serializers.Serializer):
    shipping_city = serializers.CharField(max_length=100)
    shipping_address = serializers.CharField(max_length=255)
    payment_method = serializers.CharField(max_length=50)
    delivery_method = serializers.CharField(max_length=50)


class UpdateOrderStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
    note = serializers.CharField(required=False, allow_blank=True, default='')
