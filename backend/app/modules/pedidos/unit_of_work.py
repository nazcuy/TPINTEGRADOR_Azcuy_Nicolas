from app.core.database import create_session
from app.core.repository import BaseRepository
from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import (
    DetallePedidoRepository,
    PedidoRepository,
)
from app.modules.productos.model import Producto


class PedidoUnitOfWork(UnitOfWork):
    def __init__(self):
        super().__init__(create_session)

    def __enter__(self):
        super().__enter__()

        self.pedidos = PedidoRepository(self.session)

        self.detalles = DetallePedidoRepository(self.session)

        self.productos = BaseRepository(
            self.session,
            Producto,
        )

        return self
