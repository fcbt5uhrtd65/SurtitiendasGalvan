class DomainError(Exception):
    default_message = 'Ha ocurrido un error de negocio.'

    def __init__(self, message: str | None = None):
        self.message = message or self.default_message
        super().__init__(self.message)


class EntityNotFoundError(DomainError):
    default_message = 'El recurso solicitado no existe.'


class BusinessRuleViolationError(DomainError):
    default_message = 'La operación viola una regla de negocio.'
