from app.core.database import create_session
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    def __init__(self):
        super().__init__(create_session)

    def __enter__(self):
        super().__enter__()

        self.usuarios = UsuarioRepository(self.session)

        return self
