from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.customers.application.dtos import UpdateCustomerInput
from apps.customers.application.use_cases import DeactivateCustomerUseCase, UpdateCustomerUseCase
from apps.customers.infrastructure.models import Customer, CustomerAddress
from apps.customers.infrastructure.serializers import CustomerAddressSerializer, CustomerSerializer
from apps.customers.interfaces.filters import CustomerFilter
from apps.identity.interfaces.permissions import IsAdmin, IsAdminOrVendedor
from shared.interfaces.viewsets import SoftDeleteModelViewSet

UPDATABLE_FIELDS = ('phone', 'document_type', 'document_number')


class CustomerViewSet(SoftDeleteModelViewSet):
    queryset = Customer.objects.select_related('user').prefetch_related('addresses').all()
    serializer_class = CustomerSerializer
    filterset_class = CustomerFilter

    def get_permissions(self):
        if self.action == 'me':
            return [IsAuthenticated()]
        if self.action in ('list', 'retrieve'):
            return [IsAdminOrVendedor()]
        return [IsAdmin()]

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        customer = request.user.customer_profile
        if request.method == 'PATCH':
            payload = {key: request.data[key] for key in UPDATABLE_FIELDS if key in request.data}
            customer = UpdateCustomerUseCase().execute(str(customer.id), UpdateCustomerInput(**payload))
        return Response(CustomerSerializer(customer).data)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        customer = DeactivateCustomerUseCase().execute(pk)
        return Response(CustomerSerializer(customer).data)


class CustomerAddressViewSet(SoftDeleteModelViewSet):
    serializer_class = CustomerAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomerAddress.objects.filter(customer=self.request.user.customer_profile)

    def perform_create(self, serializer):
        self._enforce_single_default(serializer.validated_data.get('is_default'))
        serializer.save(customer=self.request.user.customer_profile)

    def perform_update(self, serializer):
        self._enforce_single_default(serializer.validated_data.get('is_default'), exclude_id=serializer.instance.id)
        serializer.save()

    def _enforce_single_default(self, is_default, exclude_id=None):
        if not is_default:
            return
        queryset = CustomerAddress.objects.filter(customer=self.request.user.customer_profile, is_default=True)
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)
        queryset.update(is_default=False)
