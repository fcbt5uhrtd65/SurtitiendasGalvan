from django.db import transaction

from apps.customers.application.dtos import UpdateCustomerInput
from apps.customers.infrastructure.models import Customer
from shared.domain.exceptions import EntityNotFoundError


def create_customer_profile_for_user(user) -> Customer:
    customer, _ = Customer.objects.get_or_create(user=user)
    return customer


class UpdateCustomerUseCase:
    @transaction.atomic
    def execute(self, customer_id: str, data: UpdateCustomerInput) -> Customer:
        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist as exc:
            raise EntityNotFoundError('El cliente solicitado no existe.') from exc

        for field_name in ('phone', 'document_type', 'document_number'):
            value = getattr(data, field_name)
            if value is not None:
                setattr(customer, field_name, value)
        customer.save()
        return customer


class DeactivateCustomerUseCase:
    @transaction.atomic
    def execute(self, customer_id: str) -> Customer:
        try:
            customer = Customer.objects.select_related('user').get(id=customer_id)
        except Customer.DoesNotExist as exc:
            raise EntityNotFoundError('El cliente solicitado no existe.') from exc

        customer.is_active = False
        customer.save(update_fields=['is_active'])
        customer.user.is_active = False
        customer.user.save(update_fields=['is_active'])
        return customer
