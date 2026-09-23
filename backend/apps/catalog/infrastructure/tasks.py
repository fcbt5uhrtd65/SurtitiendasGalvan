from pathlib import Path

from celery import shared_task
from django.conf import settings


@shared_task
def export_catalog_to_excel() -> str:
    from openpyxl import Workbook

    from apps.catalog.infrastructure.models import Product

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = 'Catálogo'
    sheet.append(['Producto', 'Marca', 'Categoría', 'SKU', 'Presentación', 'Precio', 'Stock'])

    products = Product.objects.filter(is_active=True).select_related('category').prefetch_related('variants__prices')
    for product in products:
        for variant in product.variants.all():
            price = variant.active_price
            sheet.append([
                product.name,
                product.brand,
                product.category.name,
                variant.sku,
                variant.presentation,
                float(price.amount) if price else None,
                variant.stock,
            ])

    export_dir = Path(settings.MEDIA_ROOT) / 'exports'
    export_dir.mkdir(parents=True, exist_ok=True)
    file_path = export_dir / 'catalogo.xlsx'
    workbook.save(file_path)

    return str(file_path)
