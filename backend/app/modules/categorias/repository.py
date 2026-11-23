from sqlmodel import Session, select

from app.modules.categorias.model import Categoria


class CategoriaRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, categoria_id: int) -> Categoria | None:
        return self.session.get(Categoria, categoria_id)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()

    def get_all(
        self,
        solo_activas: bool = True,
        search: str | None = None,
    ) -> list[Categoria]:
        statement = select(Categoria)

        if solo_activas:
            statement = statement.where(Categoria.activo.is_(True))

        if search:
            statement = statement.where(Categoria.nombre.ilike(f"%{search}%"))

        statement = statement.order_by(Categoria.nombre)

        return list(self.session.exec(statement).all())

    def add(self, categoria: Categoria) -> Categoria:
        self.session.add(categoria)
        self.session.flush()
        return categoria
