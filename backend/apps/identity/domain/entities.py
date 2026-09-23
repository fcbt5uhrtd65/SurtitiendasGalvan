from dataclasses import dataclass


@dataclass(frozen=True)
class UserEntity:
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
