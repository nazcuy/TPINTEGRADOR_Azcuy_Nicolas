from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.modules.productos.model import Producto


class ProductoRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, producto_id: int) -> Producto | None:
        statement = (
            select(Producto)
            .where(Producto.id == producto_id)
            .options(selectinload(Producto.categoria))
        )

        return self.session.exec(statement).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        solo_activos: bool = True,
    ) -> list[Producto]:

        statement = select(Producto).options(selectinload(Producto.categoria))

        if solo_activos:
            statement = statement.where(Producto.activo.is_(True))

        if search:
            statement = statement.where(Producto.nombre.ilike(f"%{search}%"))

        if categoria_id is not None:
            statement = statement.where(Producto.categoria_id == categoria_id)

        if disponible is not None:
            statement = statement.where(Producto.disponible == disponible)

        statement = statement.order_by(Producto.id).offset(skip).limit(limit)

        return list(self.session.exec(statement).all())

    def count(
        self,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        solo_activos: bool = True,
    ) -> int:

        statement = select(func.count()).select_from(Producto)

        if solo_activos:
            statement = statement.where(Producto.activo.is_(True))

        if search:
            statement = statement.where(Producto.nombre.ilike(f"%{search}%"))

        if categoria_id is not None:
            statement = statement.where(Producto.categoria_id == categoria_id)

        if disponible is not None:
            statement = statement.where(Producto.disponible == disponible)

        return self.session.exec(statement).one()

    def add(self, producto: Producto) -> Producto:
        self.session.add(producto)
        self.session.flush()
        return producto
