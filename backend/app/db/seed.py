from sqlmodel import SQLModel

from app.core.database import engine
from app.core.seed import seed_datos_iniciales
from app.modules.categorias.model import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.productos.model import Producto
from app.modules.usuarios.model import Usuario

MODELOS = (Usuario, Categoria, Producto, Pedido, DetallePedido)


def main() -> None:
    SQLModel.metadata.create_all(engine)
    seed_datos_iniciales()


if __name__ == "__main__":
    main()