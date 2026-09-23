from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.identity.interfaces.urls')),
    path('api/v1/catalog/', include('apps.catalog.interfaces.urls')),
    path('api/v1/customers/', include('apps.customers.interfaces.urls')),
    path('api/v1/', include('apps.commerce.interfaces.urls')),
    path('api/v1/inventory/', include('apps.inventory.interfaces.urls')),
]
