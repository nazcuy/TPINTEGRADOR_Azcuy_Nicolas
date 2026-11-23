from datetime import datetime
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository:
    def __init__(self, session: Session):
        self.session = session

    def add(self, pedido: Pedido) -> Pedido:
        self.session.add(pedido)
        self.session.flush()
        return pedido

    def get_by_id(self, pedido_id: int) -> Pedido | None:
        statement = (
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(selectinload(Pedido.items))
        )
        return self.session.exec(statement).first()

    def list_by_usuario(
        self,
        usuario_id: int,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> list[Pedido]:
        statement = select(Pedido).where(Pedido.usuario_id == usuario_id)

        if estado:
            statement = statement.where(Pedido.estado == estado)

        statement = (
            statement.options(selectinload(Pedido.items))
            .order_by(Pedido.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        return list(self.session.exec(statement).all())

    def get_all_paginated(
        self,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> list[Pedido]:
        statement = select(Pedido)

        if estado:
            statement = statement.where(Pedido.estado == estado)

        statement = (
            statement.options(selectinload(Pedido.items))
            .order_by(Pedido.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        return list(self.session.exec(statement).all())

    def count(
        self,
        usuario_id: int | None = None,
        estado: str | None = None,
    ) -> int:
        statement = select(func.count()).select_from(Pedido)

        if usuario_id is not None:
            statement = statement.where(Pedido.usuario_id == usuario_id)

        if estado:
            statement = statement.where(Pedido.estado == estado)

        return self.session.exec(statement).one()

    def count_by_estado(self, estado: str) -> int:
        return self.count(estado=estado)

    def count_hoy(self, inicio: datetime, fin: datetime) -> int:
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(
                Pedido.created_at >= inicio,
                Pedido.created_at < fin,
            )
        )
        return self.session.exec(statement).one()

    def total_facturado(self) -> Decimal:
        statement = select(func.coalesce(func.sum(Pedido.total), 0)).where(
            Pedido.estado == "ENTREGADO"
        )
        resultado = self.session.exec(statement).one()
        return Decimal(str(resultado))


class DetallePedidoRepository:
    def __init__(self, session: Session):
        self.session = session

    def add(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def get_by_id(self, detalle_id: int) -> DetallePedido | None:
        return self.session.get(DetallePedido, detalle_id)

    def get_by_pedido(
        self,
        pedido_id: int,
    ) -> list[DetallePedido]:
        statement = (
            select(DetallePedido)
            .where(DetallePedido.pedido_id == pedido_id)
            .order_by(DetallePedido.id)
        )
        return list(self.session.exec(statement).all())
