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


@dataclass
class RequestPasswordResetInput:
    email: str


class RequestPasswordResetUseCase:
    def execute(self, data: RequestPasswordResetInput) -> None:
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        from apps.identity.infrastructure.models import User
        from apps.identity.infrastructure.tasks import send_password_reset_email

        try:
            user = User.objects.get(email__iexact=data.email)
        except User.DoesNotExist:
            return

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        send_password_reset_email.delay(str(user.pk), uid, token)


@dataclass
class ResetPasswordInput:
    uid: str
    token: str
    new_password: str


class ResetPasswordUseCase:
    @transaction.atomic
    def execute(self, data: ResetPasswordInput) -> None:
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.encoding import force_str
        from django.utils.http import urlsafe_base64_decode

        from apps.identity.domain.exceptions import InvalidPasswordResetTokenError
        from apps.identity.infrastructure.models import User

        try:
            user_id = force_str(urlsafe_base64_decode(data.uid))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            raise InvalidPasswordResetTokenError()

        if not default_token_generator.check_token(user, data.token):
            raise InvalidPasswordResetTokenError()

        user.set_password(data.new_password)
        user.save(update_fields=['password'])
