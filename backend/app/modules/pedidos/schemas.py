from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import ConfigDict, Field
from sqlmodel import SQLModel

EstadoPedido = Literal[
    "PENDIENTE",
    "EN_PREPARACION",
    "ENTREGADO",
    "CANCELADO",
]

FormaPago = Literal[
    "EFECTIVO",
    "TRANSFERENCIA",
]


class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = None


class CambioEstado(SQLModel):
    estado: EstadoPedido


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: Decimal
    cantidad: int
    subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None = None
    total: Decimal
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]

    model_config = ConfigDict(from_attributes=True)


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: Decimal
