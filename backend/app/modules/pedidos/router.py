from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.security import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.usuarios.model import Usuario

router = APIRouter(
    prefix="/api/v1/pedidos",
    tags=["Pedidos"],
)


def get_pedido_service() -> PedidoService:
    return PedidoService()


def traducir_error(error: Exception) -> HTTPException:
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    if isinstance(error, PedidoAjeno):
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        )

    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(error),
    )


# Crear pedido
@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.crear(data, usuario.id)
    except (
        PedidoNoEncontrado,
        ProductoNoEncontrado,
        ProductoRepetido,
        ProductoNoDisponible,
        StockInsuficiente,
    ) as e:
        raise traducir_error(e) from e


# Listar pedidos propios o todos si es administrador
@router.get(
    "",
    response_model=PedidosPaginados,
)
def listar_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: EstadoPedido | None = Query(default=None),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.listar(
        usuario=usuario,
        skip=skip,
        limit=limit,
        estado=estado,
    )


# Resumen administrativo. Debe declararse antes de /{pedido_id}
@router.get(
    "/resumen",
    response_model=ResumenPedidos,
)
def resumen_pedidos(
    usuario: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.resumen()


# Obtener detalle. Solo el dueño o un administrador
@router.get(
    "/{pedido_id}",
    response_model=PedidoRead,
)
def obtener_pedido(
    pedido_id: int = Path(..., gt=0),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.obtener_por_id(pedido_id, usuario)
    except (PedidoNoEncontrado, PedidoAjeno) as e:
        raise traducir_error(e) from e


# Avanzar estado o cancelar como administrador
@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
)
def cambiar_estado_pedido(
    data: CambioEstado,
    pedido_id: int = Path(..., gt=0),
    usuario: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cambiar_estado(pedido_id, data)
    except (
        PedidoNoEncontrado,
        ProductoNoEncontrado,
        TransicionInvalida,
    ) as e:
        raise traducir_error(e) from e


# Cancelar un pedido propio, solamente en PENDIENTE
@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead,
)
def cancelar_pedido(
    pedido_id: int = Path(..., gt=0),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cancelar_propio(pedido_id, usuario.id)
    except (
        PedidoNoEncontrado,
        ProductoNoEncontrado,
        PedidoAjeno,
        TransicionInvalida,
    ) as e:
        raise traducir_error(e) from e
