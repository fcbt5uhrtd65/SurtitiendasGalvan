from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def send_order_confirmation_email(order_id: str) -> None:
    from apps.commerce.infrastructure.models import Order

    order = Order.objects.select_related('customer__user').prefetch_related('lines').get(id=order_id)
    lines = '\n'.join(f'- {line.product_name} x{line.quantity}: ${line.subtotal}' for line in order.lines.all())
    send_mail(
        subject=f'Confirmación de tu pedido {order.id}',
        message=(
            f'Hola {order.customer.user.first_name or order.customer.user.email},\n\n'
            f'Hemos recibido tu pedido {order.id} por un total de ${order.total}.\n\n'
            f'{lines}\n\n'
            f'Te notificaremos cuando cambie de estado.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.customer.user.email],
        fail_silently=False,
    )


@shared_task
def send_order_status_update_email(order_id: str) -> None:
    from apps.commerce.infrastructure.models import Order

    order = Order.objects.select_related('customer__user').get(id=order_id)
    send_mail(
        subject=f'Tu pedido {order.id} cambió de estado: {order.get_status_display()}',
        message=(
            f'Hola {order.customer.user.first_name or order.customer.user.email},\n\n'
            f'Tu pedido {order.id} ahora está: {order.get_status_display()}.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.customer.user.email],
        fail_silently=False,
    )
