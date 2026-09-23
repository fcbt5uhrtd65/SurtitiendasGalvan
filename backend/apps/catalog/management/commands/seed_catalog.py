from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.catalog.infrastructure.models import Category, Price, Product, ProductImage, ProductVariant

CATEGORIES = [
    {'slug': 'papeleria', 'name': 'Papelería', 'color': '#2563EB'},
    {'slug': 'belleza', 'name': 'Belleza', 'color': '#DB2777'},
    {'slug': 'capilar', 'name': 'Cuidado capilar', 'color': '#7C3AED'},
    {'slug': 'facial', 'name': 'Cuidado facial', 'color': '#0D9488'},
    {'slug': 'libros', 'name': 'Libros', 'color': '#B45309'},
    {'slug': 'pinturas', 'name': 'Pinturas', 'color': '#DC2626'},
    {'slug': 'hogar', 'name': 'Hogar', 'color': '#059669'},
]

PRODUCTS = [
    {'sku': 'PAP-001', 'name': 'Cuaderno Universitario Rayado A4', 'brand': 'Norma', 'category': 'papeleria',
     'price': 8500, 'original_price': 12000, 'stock': 45, 'is_best_seller': True,
     'image': 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&h=900&fit=crop&auto=format',
     'description': 'Cuaderno universitario de 100 hojas con papel bond de alta calidad. Ideal para estudiantes y profesionales.',
     'features': ['100 hojas bond 75g', 'Pasta dura reforzada', 'Espiral metálico calibre 14', 'Formato A4']},
    {'sku': 'PAP-002', 'name': 'Set de Colores Largos x24', 'brand': 'Faber-Castell', 'category': 'papeleria',
     'price': 32000, 'stock': 23, 'is_best_seller': True,
     'image': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&h=900&fit=crop&auto=format',
     'description': 'Set profesional de 24 colores largos con pigmentación intensa y punta resistente a la rotura.',
     'features': ['24 colores únicos', 'Punta resistente 3.8 mm', 'Madera de cedro certificada']},
    {'sku': 'BEL-001', 'name': 'Paleta de Sombras 18 Tonos Nude', 'brand': 'NYX Professional', 'category': 'belleza',
     'price': 65000, 'original_price': 85000, 'stock': 12, 'is_new': False,
     'image': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=900&fit=crop&auto=format',
     'description': 'Paleta de sombras profesional con 18 tonos en acabados mate, satinado y glitter.',
     'features': ['18 tonos', 'Alta pigmentación', 'Incluye espejo de doble cara']},
    {'sku': 'CAP-001', 'name': 'Shampoo Hidratante Aceite de Argán', 'brand': "L'Oréal Paris", 'category': 'capilar',
     'price': 28000, 'original_price': 35000, 'stock': 67, 'is_best_seller': True,
     'image': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=900&h=900&fit=crop&auto=format',
     'description': 'Shampoo hidratante con aceite de argán marroquí de primera prensada.',
     'features': ['Frasco 400 ml', 'Sin sulfatos agresivos', 'pH balanceado 5.5']},
    {'sku': 'FAC-001', 'name': 'Crema Hidratante Facial SPF 50+', 'brand': 'Neutrogena', 'category': 'facial',
     'price': 48000, 'stock': 34, 'is_new': True,
     'image': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&h=900&fit=crop&auto=format',
     'description': 'Crema hidratante de amplio espectro con FPS 50+. Protección UVA/UVB sin residuo blanco.',
     'features': ['FPS 50+ amplio espectro', 'Textura ultraligera', 'No comedogénica']},
    {'sku': 'LIB-001', 'name': 'El Principito — Edición Ilustrada', 'brand': 'Editorial Salamandra', 'category': 'libros',
     'price': 35000, 'stock': 18, 'is_best_seller': True,
     'image': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=900&h=900&fit=crop&auto=format',
     'description': 'Edición especial ilustrada de El Principito con tapa dura e ilustraciones originales a color.',
     'features': ['Tapa dura con sobrecubierta', 'Ilustraciones originales a color', '112 páginas']},
    {'sku': 'PIN-001', 'name': 'Set Pinturas Acrílicas x12 — 20 ml', 'brand': 'Titan', 'category': 'pinturas',
     'price': 42000, 'original_price': 55000, 'stock': 9, 'is_new': True,
     'image': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&h=900&fit=crop&auto=format',
     'description': 'Set de 12 pinturas acrílicas colores básicos y complementarios en tubos de 20 ml.',
     'features': ['12 colores × 20 ml', 'Secado rápido', 'Alta pigmentación']},
    {'sku': 'HOG-001', 'name': 'Organizador de Cocina en Bambú', 'brand': 'Casa Bella', 'category': 'hogar',
     'price': 89000, 'stock': 15, 'is_new': True,
     'image': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=900&fit=crop&auto=format',
     'description': 'Organizador de cocina fabricado en bambú natural certificado, resistente a la humedad.',
     'features': ['Bambú natural certificado FSC', '3 compartimentos ajustables']},
    {'sku': 'FAC-002', 'name': 'Sérum Vitamina C 23% + Ácido Ferúlico', 'brand': 'The Ordinary', 'category': 'facial',
     'price': 72000, 'original_price': 95000, 'stock': 28, 'is_best_seller': True,
     'image': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=900&h=900&fit=crop&auto=format',
     'description': 'Sérum con vitamina C estabilizada al 23% y ácido ferúlico. Ilumina y unifica el tono.',
     'features': ['Vitamina C estabilizada 23%', 'Frasco cuentagotas 30 ml', 'Vegano']},
    {'sku': 'CAP-002', 'name': 'Mascarilla Capilar Reparadora Keratina', 'brand': 'Pantene Pro-V', 'category': 'capilar',
     'price': 22000, 'stock': 41,
     'image': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=900&h=900&fit=crop&auto=format',
     'description': 'Mascarilla reparadora intensiva con complejo de keratina y proteínas de seda.',
     'features': ['Complejo keratina + proteínas de seda', 'Frasco 300 ml']},
    {'sku': 'PAP-003', 'name': 'Bolígrafos BIC Cristal x10 Surtidos', 'brand': 'BIC', 'category': 'papeleria',
     'price': 12000, 'stock': 200, 'is_best_seller': True,
     'image': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&h=900&fit=crop&auto=format',
     'description': 'Pack de 10 bolígrafos BIC Cristal en colores azul, negro y rojo.',
     'features': ['10 unidades surtidas', 'Punta media 1.0 mm', 'Dura hasta 3 km de escritura']},
    {'sku': 'BEL-002', 'name': 'Labial Matte Larga Duración 16H', 'brand': 'MAC Cosmetics', 'category': 'belleza',
     'price': 95000, 'original_price': 120000, 'stock': 7,
     'image': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=900&fit=crop&auto=format',
     'description': 'Labial de efecto mate con fórmula cremosa que dura hasta 16 horas.',
     'features': ['Duración hasta 16 horas', 'Fórmula mate sin transferencia', 'Peso neto 3 g']},
]


class Command(BaseCommand):
    help = 'Carga categorías y productos de ejemplo para desarrollo (misma data que el mock del frontend).'

    def handle(self, *args, **options):
        categories_by_slug = {}
        for entry in CATEGORIES:
            category, _ = Category.objects.update_or_create(
                slug=entry['slug'], defaults={'name': entry['name'], 'color': entry['color']},
            )
            categories_by_slug[entry['slug']] = category

        for entry in PRODUCTS:
            product, _ = Product.objects.update_or_create(
                name=entry['name'],
                defaults={
                    'brand': entry['brand'],
                    'description': entry['description'],
                    'category': categories_by_slug[entry['category']],
                    'features': entry['features'],
                    'is_new': entry.get('is_new', False),
                    'is_best_seller': entry.get('is_best_seller', False),
                },
            )
            variant, _ = ProductVariant.objects.update_or_create(
                sku=entry['sku'],
                defaults={
                    'product': product,
                    'stock': entry['stock'],
                    'original_price': entry.get('original_price'),
                },
            )
            Price.objects.filter(variant=variant, is_active=True).update(is_active=False)
            Price.objects.create(variant=variant, amount=Decimal(entry['price']), is_active=True)
            ProductImage.objects.get_or_create(
                product=product, url=entry['image'], defaults={'is_primary': True},
            )

        self.stdout.write(self.style.SUCCESS(
            f'Catálogo de ejemplo cargado: {len(CATEGORIES)} categorías, {len(PRODUCTS)} productos.'
        ))
