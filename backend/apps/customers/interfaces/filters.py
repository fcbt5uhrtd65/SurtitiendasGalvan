import django_filters
from django.db.models import Q

from apps.customers.infrastructure.models import Customer


class CustomerFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')
    city = django_filters.CharFilter(field_name='addresses__city', lookup_expr='iexact')

    class Meta:
        model = Customer
        fields = ['search', 'city', 'is_active']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(user__email__icontains=value)
            | Q(user__first_name__icontains=value)
            | Q(user__last_name__icontains=value)
        )
