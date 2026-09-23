from decimal import Decimal

import pytest

from apps.commerce.application.use_cases.cart import AddCartItemInput, AddItemToCartUseCase
from apps.commerce.application.use_cases.orders import CheckoutInput, CheckoutUseCase
from apps.commerce.domain.exceptions import CarritoVacioError, StockInsuficienteError
from apps.commerce.infrastructure.models import Order

pytestmark = pytest.mark.django_db


def checkout_input():
    return CheckoutInput(
        shipping_city='Bogotá', shipping_address='Calle 1 #2-3',
        payment_method='CONTRAENTREGA', delivery_method='DOMICILIO',
    )


def test_checkout_falla_con_carrito_vacio(customer):
    with pytest.raises(CarritoVacioError):
        CheckoutUseCase().execute(customer, checkout_input())


def test_agregar_al_carrito_falla_si_supera_el_stock(customer, product_variant):
    with pytest.raises(StockInsuficienteError):
        AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=999))


def test_checkout_crea_pedido_y_descuenta_stock_usando_precio_del_backend(customer, product_variant):
    AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=2))

    order = CheckoutUseCase().execute(customer, checkout_input())

    product_variant.refresh_from_db()
    assert product_variant.stock == 8
    assert order.status == 'PENDIENTE'
    assert order.total == Decimal('17000')
    assert order.lines.count() == 1
    assert order.lines.first().unit_price == Decimal('8500')
    assert Order.objects.filter(customer=customer).count() == 1


def test_checkout_vacia_el_carrito_despues_de_confirmar(customer, product_variant):
    AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=1))
    CheckoutUseCase().execute(customer, checkout_input())

    assert customer.cart.items.count() == 0
