from django.contrib import admin

from apps.commerce.infrastructure.models import Cart, CartItem, Order, OrderLine, OrderStatusHistory


class OrderLineInline(admin.TabularInline):
    model = OrderLine
    extra = 0


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'status', 'total', 'created_at']
    list_filter = ['status']
    search_fields = ['customer__user__email', 'id']
    inlines = [OrderLineInline, OrderStatusHistoryInline]


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['customer', 'created_at']
    inlines = [CartItemInline]
