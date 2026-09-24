import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def _vendedor_user():
    from apps.identity.infrastructure.models import Role, User

    role, _ = Role.objects.get_or_create(name=Role.Name.VENDEDOR)
    return User.objects.create_user(email='vendedor@example.com', password='clave12345', role=role)


def test_vendedor_puede_listar_clientes(customer):
    client = APIClient()
    client.force_authenticate(user=_vendedor_user())

    response = client.get('/api/v1/customers/')
    assert response.status_code == 200


def test_vendedor_no_puede_desactivar_clientes(customer):
    client = APIClient()
    client.force_authenticate(user=_vendedor_user())

    response = client.post(f'/api/v1/customers/{customer.id}/deactivate/')
    assert response.status_code == 403


def test_cliente_no_puede_listar_clientes(customer_user, customer):
    client = APIClient()
    client.force_authenticate(user=customer_user)

    response = client.get('/api/v1/customers/')
    assert response.status_code == 403
