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


def test_password_reset_request_no_revela_si_el_correo_existe(customer_user, mailoutbox):
    client = APIClient()

    response_existente = client.post('/api/v1/auth/password-reset/', {'email': customer_user.email})
    assert response_existente.status_code == 200

    response_inexistente = client.post('/api/v1/auth/password-reset/', {'email': 'nadie@example.com'})
    assert response_inexistente.status_code == 200

    assert len(mailoutbox) == 1
    assert mailoutbox[0].to == [customer_user.email]


def test_password_reset_confirm_cambia_la_contrasena(customer_user):
    from django.contrib.auth.tokens import default_token_generator
    from django.utils.encoding import force_bytes
    from django.utils.http import urlsafe_base64_encode

    uid = urlsafe_base64_encode(force_bytes(customer_user.pk))
    token = default_token_generator.make_token(customer_user)

    client = APIClient()
    response = client.post('/api/v1/auth/password-reset/confirm/', {
        'uid': uid, 'token': token, 'new_password': 'nuevaClave123',
    })
    assert response.status_code == 200

    login = client.post('/api/v1/auth/login/', {'email': customer_user.email, 'password': 'nuevaClave123'})
    assert login.status_code == 200


def test_password_reset_confirm_con_token_invalido_falla(customer_user):
    from django.utils.encoding import force_bytes
    from django.utils.http import urlsafe_base64_encode

    uid = urlsafe_base64_encode(force_bytes(customer_user.pk))

    client = APIClient()
    response = client.post('/api/v1/auth/password-reset/confirm/', {
        'uid': uid, 'token': 'token-invalido', 'new_password': 'nuevaClave123',
    })
    assert response.status_code == 400
