import pytest

from apps.commerce.application.use_cases.cart import AddCartItemInput, AddItemToCartUseCase
from apps.commerce.application.use_cases.orders import ChangeOrderStatusUseCase, CheckoutInput, CheckoutUseCase
from apps.commerce.domain.value_objects import OrderStatus

pytestmark = pytest.mark.django_db


def checkout_input():
    return CheckoutInput(
        shipping_city='Bogotá', shipping_address='Calle 1 #2-3',
        payment_method='CONTRAENTREGA', delivery_method='DOMICILIO',
    )


def test_checkout_envia_correo_de_confirmacion(customer, product_variant, mailoutbox, django_capture_on_commit_callbacks):
    AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=1))

    with django_capture_on_commit_callbacks(execute=True):
        order = CheckoutUseCase().execute(customer, checkout_input())

    assert len(mailoutbox) == 1
    assert str(order.id) in mailoutbox[0].subject
    assert mailoutbox[0].to == [customer.user.email]


def test_cambio_de_estado_envia_correo_de_actualizacion(customer, product_variant, mailoutbox, django_capture_on_commit_callbacks):
    AddItemToCartUseCase().execute(customer, AddCartItemInput(variant_id=str(product_variant.id), quantity=1))
    with django_capture_on_commit_callbacks(execute=True):
        order = CheckoutUseCase().execute(customer, checkout_input())

    with django_capture_on_commit_callbacks(execute=True):
        ChangeOrderStatusUseCase().execute(str(order.id), OrderStatus.CONFIRMADO)

    assert len(mailoutbox) == 2
    assert 'CONFIRMADO' in mailoutbox[1].subject or 'Confirmado' in mailoutbox[1].subject
