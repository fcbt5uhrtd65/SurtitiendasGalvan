import django_filters

from apps.catalog.infrastructure.models import Product


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category_id')
    search = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    min_price = django_filters.NumberFilter(field_name='variants__prices__amount', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='variants__prices__amount', lookup_expr='lte')
    is_new = django_filters.BooleanFilter()
    is_best_seller = django_filters.BooleanFilter()

    class Meta:
        model = Product
        fields = ['category', 'search', 'min_price', 'max_price', 'is_new', 'is_best_seller']
