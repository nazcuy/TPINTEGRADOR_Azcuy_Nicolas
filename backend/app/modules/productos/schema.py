from decimal import Decimal

from pydantic import ConfigDict, Field, model_validator
from sqlmodel import SQLModel


class ProductoCreate(SQLModel):
    categoria_id: int = Field(gt=0)
    nombre: str = Field(min_length=2, max_length=150)
    descripcion: str | None = None

    precio_base: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2,
    )

    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True


class ProductoUpdate(SQLModel):
    categoria_id: int | None = Field(default=None, gt=0)
    nombre: str | None = Field(default=None, min_length=2, max_length=150)
    descripcion: str | None = None

    precio_base: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=10,
        decimal_places=2,
    )

    imagen_url: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validar_campos_obligatorios(self):
        for campo in ("categoria_id", "nombre", "precio_base"):
            if campo in self.model_fields_set and getattr(self, campo) is None:
                raise ValueError(f"{campo} no puede ser nulo")

        return self


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class CategoriaPublicSimple(SQLModel):
    id: int
    nombre: str
    activo: bool

    model_config = ConfigDict(from_attributes=True)


class ProductoPublic(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str | None = None
    precio_base: Decimal
    imagen_url: str | None = None
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaPublicSimple

    model_config = ConfigDict(from_attributes=True)


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoPublic]
