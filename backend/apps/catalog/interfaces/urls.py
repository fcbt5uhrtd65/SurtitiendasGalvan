from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.catalog.interfaces.views import (
    CatalogExportStatusView,
    CatalogExportView,
    CategoryViewSet,
    ProductViewSet,
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('products', ProductViewSet, basename='product')

urlpatterns = [
    path('export/', CatalogExportView.as_view(), name='catalog-export'),
    path('export/<str:task_id>/', CatalogExportStatusView.as_view(), name='catalog-export-status'),
    *router.urls,
]
