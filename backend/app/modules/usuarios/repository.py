from sqlmodel import Session, select

from app.modules.usuarios.model import Usuario


class UsuarioRepository:
    def __init__(self, session: Session):
        self.session = session

    def add(self, usuario: Usuario) -> Usuario:
        self.session.add(usuario)
        self.session.flush()
        return usuario

    def get_by_id(self, usuario_id: int) -> Usuario | None:
        return self.session.get(Usuario, usuario_id)

    def get_by_username(self, username: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.username == username)
        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.email == email)
        return self.session.exec(statement).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Usuario]:
        statement = (
            select(Usuario)
            .order_by(Usuario.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())
