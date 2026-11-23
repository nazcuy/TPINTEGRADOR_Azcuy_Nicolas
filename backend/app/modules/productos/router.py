from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.security import require_role
from app.modules.productos import schema, service
from app.modules.usuarios.model import Usuario

router = APIRouter(
    prefix="/api/v1/productos",
    tags=["Productos"],
)


@router.get(
    "",
    response_model=schema.ProductosPaginados,
)
def listar_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None, gt=0),
    disponible: bool | None = Query(default=None),
):
    return service.obtener_todos(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get(
    "/{producto_id}",
    response_model=schema.ProductoPublic,
)
def obtener_producto(
    producto_id: int = Path(..., gt=0),
):
    producto = service.obtener_por_id(producto_id)

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )

    return producto


@router.post(
    "",
    response_model=schema.ProductoPublic,
    status_code=status.HTTP_201_CREATED,
)
def crear_producto(
    data: schema.ProductoCreate,
    usuario: Usuario = Depends(require_role(["admin"])),
):
    try:
        return service.crear(data)
    except LookupError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.put(
    "/{producto_id}",
    response_model=schema.ProductoPublic,
)
def actualizar_producto(
    data: schema.ProductoUpdate,
    producto_id: int = Path(..., gt=0),
    usuario: Usuario = Depends(require_role(["admin"])),
):
    try:
        producto = service.actualizar(producto_id, data)

        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )

        return producto

    except LookupError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.patch(
    "/{producto_id}/stock",
    response_model=schema.ProductoPublic,
)
def actualizar_stock(
    data: schema.ProductoStockUpdate,
    producto_id: int = Path(..., gt=0),
    usuario: Usuario = Depends(require_role(["admin"])),
):
    producto = service.actualizar_stock(producto_id, data)

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )

    return producto


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_producto(
    producto_id: int = Path(..., gt=0),
    usuario: Usuario = Depends(require_role(["admin"])),
):
    eliminado = service.eliminar(producto_id)

    if not eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
