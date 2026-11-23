from decimal import Decimal
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.model import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: int | None = Field(default=None, primary_key=True)

    categoria_id: int = Field(
        foreign_key="categorias.id",
        index=True,
    )

    nombre: str = Field(
        min_length=2,
        max_length=150,
        index=True,
    )

    descripcion: str | None = Field(default=None)

    precio_base: Decimal = Field(
        max_digits=10,
        decimal_places=2,
        ge=0,
    )

    imagen_url: str | None = Field(default=None, max_length=500)

    stock: int = Field(default=0, ge=0)

    disponible: bool = Field(default=True)

    activo: bool = Field(default=True)

    categoria: "Categoria" = Relationship(back_populates="productos")

    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
