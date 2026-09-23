from django.urls import include, path

from apps.commerce.interfaces.views import CartItemView, CartView, CheckoutView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/<uuid:variant_id>/', CartItemView.as_view(), name='cart-item'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('', include('apps.commerce.interfaces.order_urls')),
]
