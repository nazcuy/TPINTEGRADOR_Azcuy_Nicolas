from datetime import UTC, datetime, timedelta
from decimal import Decimal
from typing import ClassVar

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.model import Usuario


# Excepciones de dominio
class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoService:
    TRANSICIONES_VALIDAS: ClassVar[dict[str, set[str]]] = {
        "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
        "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
        "ENTREGADO": set(),
        "CANCELADO": set(),
    }

    def __init__(self):
        self.uow_factory = PedidoUnitOfWork

    def listar(
        self,
        usuario: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:

        with self.uow_factory() as uow:
            if usuario.role == "admin":
                total = uow.pedidos.count(estado=estado)

                pedidos = uow.pedidos.get_all_paginated(
                    skip=skip,
                    limit=limit,
                    estado=estado,
                )
            else:
                total = uow.pedidos.count(
                    usuario_id=usuario.id,
                    estado=estado,
                )

                pedidos = uow.pedidos.list_by_usuario(
                    usuario_id=usuario.id,
                    skip=skip,
                    limit=limit,
                    estado=estado,
                )

            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(pedido) for pedido in pedidos],
            )

    def obtener_por_id(
        self,
        pedido_id: int,
        usuario: Usuario,
    ) -> PedidoRead:

        with self.uow_factory() as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)

            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")

            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No tenÃ©s permiso para consultar este pedido")

            return PedidoRead.model_validate(pedido)

    def crear(
        self,
        data: PedidoCreate,
        usuario_id: int,
    ) -> PedidoRead:

        with self.uow_factory() as uow:
            # RN-01: no se permiten productos repetidos.
            ids_productos = [item.producto_id for item in data.items]

            if len(ids_productos) != len(set(ids_productos)):
                raise ProductoRepetido("No se puede repetir un producto en el pedido")

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=Decimal("0.00"),
            )

            uow.pedidos.add(pedido)

            total = Decimal("0.00")

            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)

                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto {item.producto_id} no encontrado"
                    )

                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto {producto.nombre} no estÃ¡ disponible"
                    )

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para {producto.nombre}. "
                        f"Disponible: {producto.stock}"
                    )

                # Descuento de stock dentro de la transacciÃ³n.
                producto.stock -= item.cantidad

                subtotal = producto.precio_base * item.cantidad

                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )

                uow.detalles.add(detalle)

                total += subtotal

            pedido.total = total
            pedido.updated_at = datetime.now(UTC)

            # Se construye el schema antes de salir del UoW.
            pedido_completo = uow.pedidos.get_by_id(pedido.id)

            return PedidoRead.model_validate(pedido_completo)

    def _restituir_stock(self, uow, pedido: Pedido) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)

            if producto is None:
                raise ProductoNoEncontrado(
                    f"No se encontrÃ³ el producto {item.producto_id} "
                    "para restituir el stock"
                )

            producto.stock += item.cantidad

    def _validar_transicion(
        self,
        estado_actual: str,
        estado_nuevo: str,
    ) -> None:

        permitidos = self.TRANSICIONES_VALIDAS.get(
            estado_actual,
            set(),
        )

        if estado_nuevo not in permitidos:
            raise TransicionInvalida(
                f"No se permite pasar de {estado_actual} a {estado_nuevo}"
            )

    def cambiar_estado(
        self,
        pedido_id: int,
        data: CambioEstado,
    ) -> PedidoRead:

        with self.uow_factory() as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)

            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")

            self._validar_transicion(pedido.estado, data.estado)

            if data.estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now(UTC)

            pedido_actualizado = uow.pedidos.get_by_id(pedido_id)

            return PedidoRead.model_validate(pedido_actualizado)

    def cancelar_propio(
        self,
        pedido_id: int,
        usuario_id: int,
    ) -> PedidoRead:

        with self.uow_factory() as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)

            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")

            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No podÃ©s cancelar un pedido de otro usuario")

            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo podÃ©s cancelar tus pedidos pendientes")

            self._restituir_stock(uow, pedido)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(UTC)

            pedido_actualizado = uow.pedidos.get_by_id(pedido_id)

            return PedidoRead.model_validate(pedido_actualizado)

    def resumen(self) -> ResumenPedidos:
        ahora = datetime.now(UTC)

        inicio_dia = ahora.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )
        fin_dia = inicio_dia + timedelta(days=1)

        with self.uow_factory() as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_hoy(
                    inicio_dia,
                    fin_dia,
                ),
                ingresos_entregados=uow.pedidos.total_facturado(),
            )
