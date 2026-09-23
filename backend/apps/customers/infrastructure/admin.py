from django.contrib import admin

from apps.customers.infrastructure.models import Customer, CustomerAddress


class CustomerAddressInline(admin.TabularInline):
    model = CustomerAddress
    extra = 0


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['user', 'document_type', 'document_number', 'phone', 'is_active']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'document_number']
    list_filter = ['is_active', 'document_type']
    inlines = [CustomerAddressInline]
