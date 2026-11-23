from datetime import UTC, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.model import Producto
    from app.modules.usuarios.model import Usuario


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: int | None = Field(default=None, primary_key=True)

    usuario_id: int = Field(
        foreign_key="usuarios.id",
        index=True,
    )

    estado: str = Field(default="PENDIENTE", max_length=30)

    forma_pago: str = Field(max_length=30)

    direccion_entrega: str = Field(
        min_length=5,
        max_length=200,
    )

    notas: str | None = Field(default=None)

    total: Decimal = Field(
        default=Decimal("0.00"),
        max_digits=12,
        decimal_places=2,
        ge=0,
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    usuario: "Usuario" = Relationship(back_populates="pedidos")

    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalles_pedido"

    id: int | None = Field(default=None, primary_key=True)

    pedido_id: int = Field(
        foreign_key="pedidos.id",
        index=True,
    )

    producto_id: int = Field(
        foreign_key="productos.id",
        index=True,
    )

    cantidad: int = Field(ge=1)

    nombre_producto: str = Field(max_length=150)

    precio_unitario: Decimal = Field(
        max_digits=10,
        decimal_places=2,
        ge=0,
    )

    subtotal: Decimal = Field(
        max_digits=12,
        decimal_places=2,
        ge=0,
    )

    pedido: "Pedido" = Relationship(back_populates="items")

    producto: "Producto" = Relationship(back_populates="detalles")
