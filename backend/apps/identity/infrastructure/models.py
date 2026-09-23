import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

from shared.infrastructure.models import BaseModel


class Role(models.Model):
    class Name(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        CLIENTE = 'CLIENTE', 'Cliente'
        VENDEDOR = 'VENDEDOR', 'Vendedor'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20, choices=Name.choices, unique=True)

    class Meta:
        db_table = 'identity_role'

    def __str__(self) -> str:
        return self.get_name_display()


class UserManager(BaseUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es obligatorio.')
        email = self.normalize_email(email)
        if 'role' not in extra_fields:
            extra_fields['role'], _ = Role.objects.get_or_create(name=Role.Name.CLIENTE)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields['role'], _ = Role.objects.get_or_create(name=Role.Name.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(BaseModel, AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name='users')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    class Meta:
        db_table = 'identity_user'
        ordering = ['-date_joined']

    def __str__(self) -> str:
        return self.email

    @property
    def is_admin_role(self) -> bool:
        return self.role_id is not None and self.role.name == Role.Name.ADMIN

    @property
    def is_vendedor_role(self) -> bool:
        return self.role_id is not None and self.role.name == Role.Name.VENDEDOR
