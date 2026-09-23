from rest_framework.permissions import BasePermission

from apps.identity.infrastructure.models import Role


class HasRole(BasePermission):
    allowed_roles: set[str] = set()

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return bool(user.role_id) and user.role.name in self.allowed_roles


class IsAdmin(HasRole):
    allowed_roles = {Role.Name.ADMIN}


class IsAdminOrVendedor(HasRole):
    allowed_roles = {Role.Name.ADMIN, Role.Name.VENDEDOR}
