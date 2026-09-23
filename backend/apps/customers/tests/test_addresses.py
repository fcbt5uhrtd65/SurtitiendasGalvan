import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_requiere_autenticacion(customer):
    client = APIClient()
    response = client.get('/api/v1/customers/addresses/')
    assert response.status_code == 401


def test_cliente_crea_y_lista_su_propia_direccion(customer_user, customer):
    client = APIClient()
    client.force_authenticate(user=customer_user)

    response = client.post('/api/v1/customers/addresses/', {
        'label': 'Casa', 'city': 'Bogotá', 'address_line': 'Calle 1 #2-3', 'is_default': True,
    })
    assert response.status_code == 201

    response = client.get('/api/v1/customers/addresses/')
    assert response.status_code == 200
    assert response.data['count'] == 1
    assert response.data['results'][0]['label'] == 'Casa'


def test_marcar_nueva_direccion_como_default_desmarca_las_demas(customer_user, customer):
    client = APIClient()
    client.force_authenticate(user=customer_user)

    client.post('/api/v1/customers/addresses/', {
        'label': 'Casa', 'city': 'Bogotá', 'address_line': 'Calle 1 #2-3', 'is_default': True,
    })
    response = client.post('/api/v1/customers/addresses/', {
        'label': 'Oficina', 'city': 'Bogotá', 'address_line': 'Calle 4 #5-6', 'is_default': True,
    })
    assert response.status_code == 201

    from apps.customers.infrastructure.models import CustomerAddress
    addresses = CustomerAddress.objects.filter(customer=customer)
    assert addresses.filter(is_default=True).count() == 1
    assert addresses.get(label='Oficina').is_default is True


def test_no_puede_ver_direcciones_de_otro_cliente():
    from apps.identity.infrastructure.models import User
    from apps.customers.application.use_cases import create_customer_profile_for_user

    owner = User.objects.create_user(email='owner@example.com', password='clave12345')
    create_customer_profile_for_user(owner)
    intruder = User.objects.create_user(email='intruder@example.com', password='clave12345')
    create_customer_profile_for_user(intruder)

    owner_client = APIClient()
    owner_client.force_authenticate(user=owner)
    created = owner_client.post('/api/v1/customers/addresses/', {
        'label': 'Casa', 'city': 'Bogotá', 'address_line': 'Calle 1 #2-3',
    })
    address_id = created.data['id']

    intruder_client = APIClient()
    intruder_client.force_authenticate(user=intruder)
    response = intruder_client.get(f'/api/v1/customers/addresses/{address_id}/')
    assert response.status_code == 404
