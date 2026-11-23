from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.model import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: int | None = Field(default=None, primary_key=True)

    nombre: str = Field(
        min_length=2,
        max_length=100,
        unique=True,
        index=True,
    )

    descripcion: str | None = Field(default=None)

    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")
