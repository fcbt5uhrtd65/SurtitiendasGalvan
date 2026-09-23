from dataclasses import dataclass


@dataclass
class CustomerAddressInput:
    label: str
    city: str
    address_line: str
    is_default: bool = False


@dataclass
class UpdateCustomerInput:
    phone: str | None = None
    document_type: str | None = None
    document_number: str | None = None
