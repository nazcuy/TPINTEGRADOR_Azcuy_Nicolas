from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.exceptions import ConflictError
from app.core.security import require_role
from app.modules.categorias import schema, service
from app.modules.usuarios.model import Usuario

router = APIRouter(
    prefix="/api/v1/categorias",
    tags=["Categorías"],
)


@router.get("", response_model=list[schema.CategoriaPublic])
def listar_categorias(
    search: str | None = Query(default=None),
):
    return service.obtener_todas(search)


@router.get("/{categoria_id}", response_model=schema.CategoriaPublic)
def obtener_categoria(categoria_id: int):
    categoria = service.obtener_por_id(categoria_id)

    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )

    return categoria


@router.post(
    "",
    response_model=schema.CategoriaPublic,
    status_code=status.HTTP_201_CREATED,
)
def crear_categoria(
    data: schema.CategoriaCreate,
    usuario: Usuario = Depends(require_role(["admin"])),
):
    try:
        return service.crear(data)
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )


@router.put(
    "/{categoria_id}",
    response_model=schema.CategoriaPublic,
)
def actualizar_categoria(
    categoria_id: int,
    data: schema.CategoriaUpdate,
    usuario: Usuario = Depends(require_role(["admin"])),
):
    try:
        categoria = service.actualizar(categoria_id, data)

        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada",
            )

        return categoria

    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_categoria(
    categoria_id: int,
    usuario: Usuario = Depends(require_role(["admin"])),
):
    categoria = service.anular(categoria_id)

    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )
