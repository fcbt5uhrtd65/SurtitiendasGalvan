from apps.catalog.domain.entities import CategoryEntity, PriceEntity, ProductEntity, ProductVariantEntity
from apps.catalog.domain.repositories import CategoryRepository, ProductRepository
from apps.catalog.infrastructure.models import Category, Product


class DjangoProductRepository(ProductRepository):
    def get_by_id(self, product_id: str) -> ProductEntity | None:
        product = Product.objects.filter(id=product_id).prefetch_related('variants__prices').first()
        return self._to_entity(product) if product else None

    def list(self, category_id: str | None = None, search: str | None = None) -> list[ProductEntity]:
        queryset = Product.objects.filter(is_active=True).prefetch_related('variants__prices')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return [self._to_entity(product) for product in queryset]

    def _to_entity(self, product: Product) -> ProductEntity:
        variants = []
        for variant in product.variants.all():
            price = variant.active_price
            variants.append(ProductVariantEntity(
                id=str(variant.id),
                sku=variant.sku,
                presentation=variant.presentation,
                current_price=PriceEntity(amount=price.amount, currency=price.currency, is_active=True) if price else None,
                stock=variant.stock,
            ))
        return ProductEntity(
            id=str(product.id),
            name=product.name,
            brand=product.brand,
            description=product.description,
            category_id=str(product.category_id),
            variants=variants,
        )


class DjangoCategoryRepository(CategoryRepository):
    def list(self) -> list[CategoryEntity]:
        return [
            CategoryEntity(
                id=str(category.id), name=category.name, slug=category.slug,
                color=category.color, parent_id=str(category.parent_id) if category.parent_id else None,
            )
            for category in Category.objects.all()
        ]
