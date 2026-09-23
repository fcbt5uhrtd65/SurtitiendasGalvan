from django.db import models

from shared.infrastructure.models import BaseModel


class Category(BaseModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    color = models.CharField(max_length=7, default='#374151')
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='subcategories',
    )

    class Meta(BaseModel.Meta):
        db_table = 'catalog_category'
        verbose_name_plural = 'categories'

    def __str__(self) -> str:
        return self.name


class Product(BaseModel):
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    features = models.JSONField(default=list, blank=True)
    is_new = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta(BaseModel.Meta):
        db_table = 'catalog_product'

    def __str__(self) -> str:
        return self.name


class ProductVariant(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=50, unique=True)
    presentation = models.CharField(max_length=100, blank=True)
    stock = models.PositiveIntegerField(default=0)
    original_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta(BaseModel.Meta):
        db_table = 'catalog_product_variant'

    def __str__(self) -> str:
        return f'{self.product.name} — {self.presentation or self.sku}'

    @property
    def active_price(self) -> 'Price | None':
        return self.prices.filter(is_active=True).order_by('-created_at').first()

    @property
    def is_on_sale(self) -> bool:
        price = self.active_price
        return bool(price and self.original_price and self.original_price > price.amount)

    @property
    def discount_percent(self) -> int:
        price = self.active_price
        if not self.is_on_sale or not price:
            return 0
        return round((1 - price.amount / self.original_price) * 100)


class Price(BaseModel):
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='prices')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='COP')
    is_active = models.BooleanField(default=True)

    class Meta(BaseModel.Meta):
        db_table = 'catalog_price'

    def __str__(self) -> str:
        return f'{self.amount} {self.currency}'


class ProductImage(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    url = models.URLField(max_length=500)
    order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta(BaseModel.Meta):
        db_table = 'catalog_product_image'
        ordering = ['order']
