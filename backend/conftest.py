from decimal import Decimal

import pytest


@pytest.fixture
def category(db):
    from apps.catalog.infrastructure.models import Category
    return Category.objects.create(name='Papelería', slug='papeleria', color='#2563EB')


@pytest.fixture
def product_variant(db, category):
    from apps.catalog.infrastructure.models import Price, Product, ProductVariant
    product = Product.objects.create(name='Cuaderno A4', brand='Norma', category=category)
    variant = ProductVariant.objects.create(product=product, sku='PAP-001', presentation='A4', stock=10)
    Price.objects.create(variant=variant, amount=Decimal('8500'), is_active=True)
    return variant


@pytest.fixture
def customer_user(db):
    from apps.identity.infrastructure.models import User
    user = User.objects.create_user(email='cliente@example.com', password='clave12345', first_name='Laura')
    return user


@pytest.fixture
def customer(db, customer_user):
    from apps.customers.application.use_cases import create_customer_profile_for_user
    return create_customer_profile_for_user(customer_user)


@pytest.fixture
def admin_user(db):
    from apps.identity.infrastructure.models import User
    return User.objects.create_superuser(email='admin@example.com', password='clave12345')
