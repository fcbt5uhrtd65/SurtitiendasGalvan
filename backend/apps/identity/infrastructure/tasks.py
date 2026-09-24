from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def send_password_reset_email(user_id: str, uid: str, token: str) -> None:
    from apps.identity.infrastructure.models import User

    user = User.objects.get(id=user_id)
    reset_link = f'{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}'
    send_mail(
        subject='Restablece tu contraseña de Surtitiendas Galván',
        message=(
            f'Hola {user.first_name or user.email},\n\n'
            f'Recibimos una solicitud para restablecer tu contraseña. '
            f'Si fuiste tú, sigue este enlace:\n\n{reset_link}\n\n'
            f'Si no solicitaste esto, puedes ignorar este correo.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
