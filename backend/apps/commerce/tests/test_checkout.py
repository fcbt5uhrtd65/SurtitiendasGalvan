from decimal import Decimal

import pytest

from apps.commerce.application.use_cases.cart import AddCartItemInput, AddItemToCartUseCase
from apps.commerce.application.use_cases.orders import CheckoutInput, CheckoutUseCase
from apps.commerce.domain.exceptions import CarritoVacioError, StockInsuficienteError
from apps.commerce.domain.value_objects import OrderStatus
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


def test_decima_compra_recibe_descuento_de_fidelidad(customer, product_variant):
    for _ in range(9):
        AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=1))
        order = CheckoutUseCase().execute(customer, checkout_input())
        assert order.discount_amount == Decimal('0.00')

    AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=1))
    tenth_order = CheckoutUseCase().execute(customer, checkout_input())

    assert tenth_order.discount_amount == Decimal('850.00')
    assert tenth_order.total == Decimal('7650.00')
    assert tenth_order.discount_reason


def test_compra_numero_once_no_recibe_descuento(customer, product_variant):
    product_variant.stock = 11
    product_variant.save(update_fields=['stock'])

    for _ in range(10):
        AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=1))
        CheckoutUseCase().execute(customer, checkout_input())

    AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=1))
    eleventh_order = CheckoutUseCase().execute(customer, checkout_input())

    assert eleventh_order.discount_amount == Decimal('0.00')


def test_pedidos_cancelados_no_cuentan_para_el_descuento_de_fidelidad(customer, product_variant):
    product_variant.stock = 20
    product_variant.save(update_fields=['stock'])

    for _ in range(9):
        AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=1))
        order = CheckoutUseCase().execute(customer, checkout_input())
        order.status = OrderStatus.CANCELADO
        order.save(update_fields=['status'])

    # A pesar de ser el 10º pedido creado, solo 0 cuentan como compra válida (los 9 anteriores están cancelados)
    AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=1))
    order = CheckoutUseCase().execute(customer, checkout_input())

    assert order.discount_amount == Decimal('0.00')
