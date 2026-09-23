import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_registro_crea_usuario_cliente_y_su_perfil_de_cliente():
    client = APIClient()
    response = client.post('/api/v1/auth/register/', {
        'email': 'nuevo@example.com', 'password': 'clave12345',
        'first_name': 'Ana', 'last_name': 'Pérez',
    })
    assert response.status_code == 201

    from apps.identity.infrastructure.models import Role, User
    user = User.objects.get(email='nuevo@example.com')
    assert user.role.name == Role.Name.CLIENTE
    assert hasattr(user, 'customer_profile')


def test_login_devuelve_tokens_y_rol(customer_user):
    client = APIClient()
    response = client.post('/api/v1/auth/login/', {
        'email': customer_user.email, 'password': 'clave12345',
    })
    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data
    assert response.data['user']['role'] == 'CLIENTE'


def test_login_con_credenciales_invalidas_falla(customer_user):
    client = APIClient()
    response = client.post('/api/v1/auth/login/', {
        'email': customer_user.email, 'password': 'incorrecta',
    })
    assert response.status_code == 401


def test_me_requiere_autenticacion():
    client = APIClient()
    response = client.get('/api/v1/auth/me/')
    assert response.status_code == 401
