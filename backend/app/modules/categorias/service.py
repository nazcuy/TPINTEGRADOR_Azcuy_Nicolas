from app.core.exceptions import ConflictError
from app.modules.categorias.model import Categoria
from app.modules.categorias.schema import CategoriaCreate, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


def obtener_todas(search: str | None = None) -> list[Categoria]:
    with CategoriaUnitOfWork() as uow:
        return uow.categorias.get_all(
            solo_activas=True,
            search=search,
        )


def obtener_por_id(categoria_id: int) -> Categoria | None:
    with CategoriaUnitOfWork() as uow:
        categoria = uow.categorias.get_by_id(categoria_id)

        if not categoria or not categoria.activo:
            return None

        return categoria


def crear(data: CategoriaCreate) -> Categoria:
    nombre = data.nombre.strip()

    if len(nombre) < 2:
        raise ValueError("El nombre debe tener al menos 2 caracteres")

    with CategoriaUnitOfWork() as uow:
        existente = uow.categorias.get_by_nombre(nombre)

        if existente:
            raise ConflictError("Ya existe una categoría con ese nombre")

        categoria = Categoria(
            nombre=nombre,
            descripcion=data.descripcion,
            activo=True,
        )

        uow.categorias.add(categoria)
        return categoria


def actualizar(
    categoria_id: int,
    data: CategoriaUpdate,
) -> Categoria | None:
    cambios = data.model_dump(exclude_unset=True)

    with CategoriaUnitOfWork() as uow:
        categoria = uow.categorias.get_by_id(categoria_id)

        if not categoria or not categoria.activo:
            return None

        if "nombre" in cambios:
            nombre = cambios["nombre"].strip()

            if len(nombre) < 2:
                raise ValueError("El nombre debe tener al menos 2 caracteres")

            existente = uow.categorias.get_by_nombre(nombre)

            if existente and existente.id != categoria_id:
                raise ConflictError("Ya existe una categoría con ese nombre")

            categoria.nombre = nombre

        if "descripcion" in cambios:
            categoria.descripcion = cambios["descripcion"]

        return categoria


def anular(categoria_id: int) -> Categoria | None:
    with CategoriaUnitOfWork() as uow:
        categoria = uow.categorias.get_by_id(categoria_id)

        if not categoria or not categoria.activo:
            return None

        categoria.activo = False

        return categoria
