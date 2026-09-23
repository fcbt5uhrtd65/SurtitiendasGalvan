from dataclasses import dataclass

from django.db import transaction


@dataclass
class RegisterUserInput:
    email: str
    password: str
    first_name: str
    last_name: str
    phone: str = ''


class RegisterUserUseCase:
    @transaction.atomic
    def execute(self, data: RegisterUserInput):
        from apps.customers.application.use_cases import create_customer_profile_for_user
        from apps.identity.infrastructure.models import User

        user = User.objects.create_user(
            email=data.email,
            password=data.password,
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
        )
        create_customer_profile_for_user(user)
        return user
