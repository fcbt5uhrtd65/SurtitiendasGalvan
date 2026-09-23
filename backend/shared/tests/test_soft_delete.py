import pytest

pytestmark = pytest.mark.django_db


def test_soft_delete_oculta_el_registro_del_manager_por_defecto(category):
    from apps.catalog.infrastructure.models import Category

    category.soft_delete()

    assert Category.objects.filter(id=category.id).count() == 0
    assert Category.all_objects.filter(id=category.id).count() == 1


def test_destroy_del_viewset_hace_soft_delete_no_borrado_fisico(admin_user, category):
    from rest_framework.test import APIClient

    from apps.catalog.infrastructure.models import Category

    client = APIClient()
    client.force_authenticate(user=admin_user)
    response = client.delete(f'/api/v1/catalog/categories/{category.id}/')

    assert response.status_code == 204
    assert Category.all_objects.get(id=category.id).deleted_at is not None
