from django.contrib import admin

from apps.catalog.infrastructure.models import Category, Price, Product, ProductImage, ProductVariant


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'category', 'is_active', 'is_new', 'is_best_seller']
    list_filter = ['category', 'is_active', 'is_new', 'is_best_seller']
    search_fields = ['name', 'brand']
    inlines = [ProductVariantInline, ProductImageInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['sku', 'product', 'presentation', 'stock']
    search_fields = ['sku', 'product__name']


@admin.register(Price)
class PriceAdmin(admin.ModelAdmin):
    list_display = ['variant', 'amount', 'currency', 'is_active', 'created_at']
    list_filter = ['is_active', 'currency']
