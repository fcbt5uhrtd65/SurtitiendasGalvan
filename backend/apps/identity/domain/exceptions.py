from shared.domain.exceptions import DomainError


class InvalidPasswordResetTokenError(DomainError):
    default_message = 'El enlace para restablecer la contraseña no es válido o ha expirado.'
