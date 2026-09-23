from django.conf import settings
from django.db import models

from shared.infrastructure.models import BaseModel


class Customer(BaseModel):
    class DocumentType(models.TextChoices):
        CC = 'CC', 'Cédula de ciudadanía'
        CE = 'CE', 'Cédula de extranjería'
        NIT = 'NIT', 'NIT'
        PASSPORT = 'PASSPORT', 'Pasaporte'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer_profile')
    document_type = models.CharField(max_length=10, choices=DocumentType.choices, default=DocumentType.CC)
    document_number = models.CharField(max_length=30, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta(BaseModel.Meta):
        db_table = 'customers_customer'

    def __str__(self) -> str:
        return self.user.get_full_name() or self.user.email


class CustomerAddress(BaseModel):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50, default='Principal')
    city = models.CharField(max_length=100)
    address_line = models.CharField(max_length=255)
    is_default = models.BooleanField(default=True)

    class Meta(BaseModel.Meta):
        db_table = 'customers_address'

    def __str__(self) -> str:
        return f'{self.label} — {self.city}'
