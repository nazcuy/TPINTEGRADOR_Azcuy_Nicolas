from app.modules.productos.model import Producto
from app.modules.productos.schema import (
    ProductoCreate,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


def obtener_todos(
    skip: int = 0,
    limit: int = 20,
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
) -> dict:

    with ProductoUnitOfWork() as uow:
        filtros = {
            "search": search,
            "categoria_id": categoria_id,
            "disponible": disponible,
            "solo_activos": True,
        }

        total = uow.productos.count(**filtros)

        productos = uow.productos.get_all(
            skip=skip,
            limit=limit,
            **filtros,
        )

        return {
            "total": total,
            "items": productos,
        }


def obtener_por_id(producto_id: int) -> Producto | None:
    with ProductoUnitOfWork() as uow:
        producto = uow.productos.get_by_id(producto_id)

        if not producto or not producto.activo:
            return None

        return producto


def crear(data: ProductoCreate) -> Producto:
    with ProductoUnitOfWork() as uow:
        categoria = uow.categorias.get_by_id(data.categoria_id)

        if not categoria or not categoria.activo:
            raise LookupError("Categoría no encontrada o inactiva")

        producto = Producto(
            categoria_id=data.categoria_id,
            nombre=data.nombre.strip(),
            descripcion=data.descripcion,
            precio_base=data.precio_base,
            imagen_url=data.imagen_url,
            stock=data.stock,
            disponible=data.disponible,
            activo=True,
        )

        uow.productos.add(producto)

        # Recuperamos el producto con su categoría cargada.
        return uow.productos.get_by_id(producto.id)


def actualizar(
    producto_id: int,
    data: ProductoUpdate,
) -> Producto | None:

    cambios = data.model_dump(exclude_unset=True)

    with ProductoUnitOfWork() as uow:
        producto = uow.productos.get_by_id(producto_id)

        if not producto or not producto.activo:
            return None

        if "categoria_id" in cambios:
            categoria = uow.categorias.get_by_id(cambios["categoria_id"])

            if not categoria or not categoria.activo:
                raise LookupError("Categoría no encontrada o inactiva")

        if "nombre" in cambios:
            cambios["nombre"] = cambios["nombre"].strip()

        for campo, valor in cambios.items():
            setattr(producto, campo, valor)

        return uow.productos.get_by_id(producto_id)


def actualizar_stock(
    producto_id: int,
    data: ProductoStockUpdate,
) -> Producto | None:

    with ProductoUnitOfWork() as uow:
        producto = uow.productos.get_by_id(producto_id)

        if not producto or not producto.activo:
            return None

        producto.stock = data.stock
        producto.disponible = data.disponible

        return uow.productos.get_by_id(producto_id)


def eliminar(producto_id: int) -> bool:
    with ProductoUnitOfWork() as uow:
        producto = uow.productos.get_by_id(producto_id)

        if not producto or not producto.activo:
            return False

        producto.activo = False

        return True
