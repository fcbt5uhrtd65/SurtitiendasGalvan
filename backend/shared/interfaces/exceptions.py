from django.core.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

from shared.domain.exceptions import DomainError, EntityNotFoundError


def custom_exception_handler(exc, context):
    if isinstance(exc, EntityNotFoundError):
        return Response({'detail': exc.message}, status=status.HTTP_404_NOT_FOUND)

    if isinstance(exc, DomainError):
        return Response({'detail': exc.message}, status=status.HTTP_400_BAD_REQUEST)

    response = exception_handler(exc, context)
    if response is not None:
        return response

    if isinstance(exc, Http404):
        return Response({'detail': 'El recurso solicitado no existe.'}, status=status.HTTP_404_NOT_FOUND)

    if isinstance(exc, PermissionDenied):
        return Response({'detail': 'No tienes permisos para realizar esta acción.'}, status=status.HTTP_403_FORBIDDEN)

    return Response(
        {'detail': 'Ha ocurrido un error inesperado en el servidor.'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
