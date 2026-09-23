import pytest

from apps.commerce.application.use_cases.cart import AddCartItemInput, AddItemToCartUseCase
from apps.commerce.application.use_cases.orders import ChangeOrderStatusUseCase, CheckoutInput, CheckoutUseCase
from apps.commerce.domain.exceptions import TransicionEstadoInvalidaError
from apps.commerce.domain.value_objects import OrderStatus

pytestmark = pytest.mark.django_db


def create_order(customer, product_variant, quantity=1):
    AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=quantity))
    return CheckoutUseCase().execute(customer, CheckoutInput(
        shipping_city='Bogotá', shipping_address='Calle 1 #2-3',
        payment_method='CONTRAENTREGA', delivery_method='DOMICILIO',
    ))


def test_no_permite_saltar_de_pendiente_a_enviado(customer, product_variant):
    order = create_order(customer, product_variant)
    with pytest.raises(TransicionEstadoInvalidaError):
        ChangeOrderStatusUseCase().execute(str(order.id), OrderStatus.ENVIADO)


def test_transicion_valida_actualiza_estado_y_registra_historial(customer, product_variant):
    order = create_order(customer, product_variant)
    updated = ChangeOrderStatusUseCase().execute(str(order.id), OrderStatus.CONFIRMADO)
    assert updated.status == OrderStatus.CONFIRMADO
    assert updated.status_history.count() == 2


def test_cancelar_pedido_restaura_el_stock(customer, product_variant):
    order = create_order(customer, product_variant, quantity=3)
    product_variant.refresh_from_db()
    assert product_variant.stock == 7

    ChangeOrderStatusUseCase().execute(str(order.id), OrderStatus.CANCELADO)

    product_variant.refresh_from_db()
    assert product_variant.stock == 10
