from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.commerce.application.use_cases.cart import (
    AddCartItemInput,
    AddItemToCartUseCase,
    ClearCartUseCase,
    RemoveCartItemUseCase,
    UpdateCartItemQuantityUseCase,
)
from apps.commerce.application.use_cases.orders import CheckoutInput, CheckoutUseCase, ChangeOrderStatusUseCase
from apps.commerce.infrastructure.models import Cart, Order
from apps.commerce.infrastructure.serializers import (
    CartSerializer,
    CheckoutRequestSerializer,
    OrderSerializer,
    UpdateOrderStatusSerializer,
)
from apps.identity.interfaces.permissions import IsAdminOrVendedor


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user.customer_profile)
        return Response(CartSerializer(cart).data)

    def post(self, request):
        data = AddCartItemInput(
            variant_id=request.data['variant_id'],
            quantity=int(request.data.get('quantity', 1)),
        )
        cart = AddItemToCartUseCase().execute(request.user.customer_profile, data)
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        cart = ClearCartUseCase().execute(request.user.customer_profile)
        return Response(CartSerializer(cart).data)


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, variant_id):
        cart = UpdateCartItemQuantityUseCase().execute(
            request.user.customer_profile, variant_id, int(request.data.get('quantity', 0)),
        )
        return Response(CartSerializer(cart).data)

    def delete(self, request, variant_id):
        cart = RemoveCartItemUseCase().execute(request.user.customer_profile, variant_id)
        return Response(CartSerializer(cart).data)


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = CheckoutUseCase().execute(request.user.customer_profile, CheckoutInput(**serializer.validated_data))
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Order.objects.select_related('customer__user').prefetch_related('lines', 'status_history')
        if self.request.user.is_admin_role or self.request.user.is_vendedor_role:
            return queryset
        return queryset.filter(customer=self.request.user.customer_profile)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrVendedor])
    def change_status(self, request, pk=None):
        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = ChangeOrderStatusUseCase().execute(
            pk,
            serializer.validated_data['status'],
            changed_by=request.user,
            note=serializer.validated_data.get('note', ''),
        )
        return Response(OrderSerializer(order).data)
