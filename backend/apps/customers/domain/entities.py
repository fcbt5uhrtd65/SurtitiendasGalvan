from dataclasses import dataclass


@dataclass(frozen=True)
class CustomerEntity:
    id: str
    email: str
    full_name: str
    phone: str
    document_number: str
    is_active: bool
