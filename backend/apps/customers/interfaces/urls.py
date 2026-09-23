from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.customers.interfaces.views import CustomerAddressViewSet, CustomerViewSet

address_list = CustomerAddressViewSet.as_view({'get': 'list', 'post': 'create'})
address_detail = CustomerAddressViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'put': 'update', 'delete': 'destroy'})

router = DefaultRouter()
router.register('', CustomerViewSet, basename='customer')

urlpatterns = [
    path('addresses/', address_list, name='customer-address-list'),
    path('addresses/<uuid:pk>/', address_detail, name='customer-address-detail'),
    *router.urls,
]
