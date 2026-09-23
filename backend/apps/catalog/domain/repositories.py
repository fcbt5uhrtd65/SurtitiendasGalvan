from abc import ABC, abstractmethod

from apps.catalog.domain.entities import CategoryEntity, ProductEntity


class ProductRepository(ABC):
    @abstractmethod
    def get_by_id(self, product_id: str) -> ProductEntity | None: ...

    @abstractmethod
    def list(self, category_id: str | None = None, search: str | None = None) -> list[ProductEntity]: ...


class CategoryRepository(ABC):
    @abstractmethod
    def list(self) -> list[CategoryEntity]: ...
