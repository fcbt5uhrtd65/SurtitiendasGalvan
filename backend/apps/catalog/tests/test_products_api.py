from decimal import Decimal

import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_listar_productos_es_publico(product_variant):
    client = APIClient()
    response = client.get('/api/v1/catalog/products/')
    assert response.status_code == 200
    assert response.data['count'] == 1
    assert response.data['results'][0]['price_from'] == Decimal('8500')


def test_crear_producto_requiere_rol_admin_o_vendedor(category):
    client = APIClient()
    response = client.post('/api/v1/catalog/products/', {
        'name': 'Nuevo producto', 'brand': 'Marca', 'description': 'Desc',
        'category': str(category.id), 'features': [],
    })
    assert response.status_code == 401


def test_admin_puede_crear_producto(admin_user, category):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.post('/api/v1/catalog/products/', {
        'name': 'Nuevo producto', 'brand': 'Marca', 'description': 'Desc',
        'category': str(category.id), 'features': [], 'price': '19900', 'stock': 5,
    })
    assert response.status_code == 201
    assert response.data['variants'][0]['stock'] == 5
    assert response.data['variants'][0]['price']['amount'] == Decimal('19900')


def test_admin_puede_editar_precio_y_stock(admin_user, product_variant):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.patch(f'/api/v1/catalog/products/{product_variant.product_id}/', {
        'price': '9999', 'stock': 3,
    }, format='json')
    assert response.status_code == 200
    assert response.data['variants'][0]['stock'] == 3
    assert response.data['variants'][0]['price']['amount'] == Decimal('9999')


def test_producto_con_precio_original_mayor_aparece_en_oferta(admin_user, category):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.post('/api/v1/catalog/products/', {
        'name': 'Producto en oferta', 'category': str(category.id),
        'price': '8000', 'original_price': '10000', 'stock': 5,
    }, format='json')
    assert response.status_code == 201
    assert response.data['is_on_sale'] is True
    assert response.data['discount_percent'] == 20

    listing = client.get('/api/v1/catalog/products/')
    result = next(r for r in listing.data['results'] if r['id'] == response.data['id'])
    assert result['is_on_sale'] is True
    assert result['original_price'] == Decimal('10000')


def test_precio_original_menor_o_igual_al_precio_es_rechazado(admin_user, category):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.post('/api/v1/catalog/products/', {
        'name': 'Producto inválido', 'category': str(category.id),
        'price': '10000', 'original_price': '9000', 'stock': 5,
    }, format='json')
    assert response.status_code == 400
