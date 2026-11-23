
import { useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth';

import {
  cancelPedido,
  getPedido,
  getPedidos,
  updatePedido,
} from '../api/pedido';

import type {
  EstadoPedido,
  Pedido,
} from '../types/pedido';

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

const formatoFecha = (fecha: string) =>
  new Date(fecha).toLocaleString('es-AR');

const etiquetasEstado: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const clasesEstado: Record<EstadoPedido, string> = {
  PENDIENTE:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  EN_PREPARACION:
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ENTREGADO:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELADO:
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const obtenerEstadosPermitidos = (
  estado: EstadoPedido
): EstadoPedido[] => {
  if (estado === 'PENDIENTE') {
    return ['EN_PREPARACION', 'CANCELADO'];
  }

  if (estado === 'EN_PREPARACION') {
    return ['ENTREGADO', 'CANCELADO'];
  }

  return [];
};

export const PedidosPage = () => {
  const queryClient = useQueryClient();

  const usuario = useAuthStore((state) => state.usuario);
  const esAdmin = usuario?.role === 'admin';

  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<number | null>(null);

  const [nuevoEstado, setNuevoEstado] =
    useState<EstadoPedido>('PENDIENTE');

  const [estadoFiltro, setEstadoFiltro] =
    useState<EstadoPedido | 'TODOS'>('TODOS');

  const pedidosQuery = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => getPedidos({ skip: 0, limit: 100 }),
  });

  const detalleQuery = useQuery({
    queryKey: ['pedido', pedidoSeleccionado],
    queryFn: () => getPedido(pedidoSeleccionado as number),
    enabled: pedidoSeleccionado !== null,
  });

  const cancelarMutation = useMutation({
    mutationFn: cancelPedido,
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({
        queryKey: ['pedidos'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['pedido', id],
      });
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({
      id,
      estado,
    }: {
      id: number;
      estado: EstadoPedido;
    }) => updatePedido(id, { estado }),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['pedidos'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['pedido', variables.id],
      });

      const pedidoActualizado = queryClient.getQueryData<Pedido>([
        'pedido',
        variables.id,
      ]);

      const estadoActual = pedidoActualizado?.estado ?? variables.estado;
      const siguientesEstados = obtenerEstadosPermitidos(estadoActual);

      setNuevoEstado(siguientesEstados[0] ?? estadoActual);
    },
  });

  const pedidos = pedidosQuery.data?.items ?? [];

  const pedidosFiltrados =
    estadoFiltro === 'TODOS'
      ? pedidos
      : pedidos.filter((pedido) => pedido.estado === estadoFiltro);

  const abrirDetalle = (pedido: Pedido) => {
    const estadosPermitidos = obtenerEstadosPermitidos(pedido.estado);

    setNuevoEstado(
      esAdmin && estadosPermitidos.length > 0
        ? estadosPermitidos[0]
        : pedido.estado
    );

    setPedidoSeleccionado(pedido.id);
    cancelarMutation.reset();
    actualizarMutation.reset();
  };

  const cerrarDetalle = () => {
    setPedidoSeleccionado(null);
    cancelarMutation.reset();
    actualizarMutation.reset();
  };

  const cancelarPedido = (pedido: Pedido) => {
    const confirmado = window.confirm(
      `¿Querés cancelar el pedido #${pedido.id}?`
    );

    if (confirmado) {
      cancelarMutation.mutate(pedido.id);
    }
  };

  const cambiarEstado = () => {
    if (pedidoSeleccionado === null) return;

    actualizarMutation.mutate({
      id: pedidoSeleccionado,
      estado: nuevoEstado,
    });
  };

  if (pedidosQuery.isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-center">
        Cargando pedidos...
      </main>
    );
  }

  if (pedidosQuery.isError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <p className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-200">
          Error al cargar los pedidos: {pedidosQuery.error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {esAdmin ? 'Administración de pedidos' : 'Mis pedidos'}
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {esAdmin
            ? 'Consultá todos los pedidos y gestioná sus estados.'
            : 'Consultá el estado y los detalles de tus compras.'}
        </p>
      </header>

      {cancelarMutation.isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          No se pudo cancelar el pedido:{' '}
          {cancelarMutation.error.message}
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-5 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {esAdmin ? 'Todos los pedidos' : 'Historial de compras'}
          </h2>

          <select
            value={estadoFiltro}
            onChange={(event) =>
              setEstadoFiltro(
                event.target.value as EstadoPedido | 'TODOS'
              )
            }
            className="mt-3 rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="EN_PREPARACION">En preparación</option>
            <option value="ENTREGADO">Entregados</option>
            <option value="CANCELADO">Cancelados</option>
          </select>

          <p className="mt-2 text-sm text-gray-500">
            {pedidosFiltrados.length} pedido(s) encontrado(s)
          </p>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="font-semibold">
              No hay pedidos para este filtro
            </h3>
            {!esAdmin && (
              <p className="mt-2 text-sm text-gray-500">
                Cuando realices una compra, aparecerá en esta sección.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm dark:bg-gray-700">
                <tr>
                  <th className="px-5 py-3">Pedido</th>
                  {esAdmin && (
                    <th className="px-5 py-3">Usuario</th>
                  )}
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pedidosFiltrados.map((pedido) => (
                  <tr
                    key={pedido.id}
                    className="border-t border-gray-100 dark:border-gray-700"
                  >
                    <td className="px-5 py-4 font-semibold">
                      #{pedido.id}
                    </td>

                    {esAdmin && (
                      <td className="px-5 py-4">
                        {pedido.usuario_id}
                      </td>
                    )}

                    <td className="px-5 py-4 text-sm">
                      {formatoFecha(pedido.created_at)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${clasesEstado[pedido.estado]}`}
                      >
                        {etiquetasEstado[pedido.estado]}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatoPrecio.format(pedido.total)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => abrirDetalle(pedido)}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Ver detalle
                        </button>

                        {!esAdmin &&
                          pedido.estado === 'PENDIENTE' && (
                            <button
                              type="button"
                              onClick={() => cancelarPedido(pedido)}
                              disabled={cancelarMutation.isPending}
                              className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pedidoSeleccionado !== null && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              Detalle del pedido #{pedidoSeleccionado}
            </h2>

            <button
              type="button"
              onClick={cerrarDetalle}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>

          {detalleQuery.isLoading && (
            <p className="py-6 text-center text-gray-500">
              Cargando detalle del pedido...
            </p>
          )}

          {detalleQuery.isError && (
            <p className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-950 dark:text-red-200">
              No se pudo cargar el detalle:{' '}
              {detalleQuery.error.message}
            </p>
          )}

          {detalleQuery.data && (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">
                    {formatoFecha(detalleQuery.data.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${clasesEstado[detalleQuery.data.estado]}`}
                  >
                    {etiquetasEstado[detalleQuery.data.estado]}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Dirección de entrega
                  </p>
                  <p className="font-medium">
                    {detalleQuery.data.direccion_entrega}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Forma de pago</p>
                  <p className="font-medium">
                    {detalleQuery.data.forma_pago === 'EFECTIVO'
                      ? 'Efectivo'
                      : 'Transferencia'}
                  </p>
                </div>

                {detalleQuery.data.notas && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500">Notas</p>
                    <p>{detalleQuery.data.notas}</p>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-sm dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3">Cantidad</th>
                      <th className="px-4 py-3">Precio unitario</th>
                      <th className="px-4 py-3">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {detalleQuery.data.items.map((item, index) => (
                      <tr
                        key={`${item.producto_id}-${index}`}
                        className="border-t border-gray-100 dark:border-gray-700"
                      >
                        <td className="px-4 py-3">
                          {item.nombre_producto}
                        </td>
                        <td className="px-4 py-3">{item.cantidad}</td>
                        <td className="px-4 py-3">
                          {formatoPrecio.format(item.precio_unitario)}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {formatoPrecio.format(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex justify-end border-t border-gray-200 pt-5 dark:border-gray-700">
                <p className="text-xl font-bold">
                  Total: {formatoPrecio.format(detalleQuery.data.total)}
                </p>
              </div>

              {esAdmin &&
                obtenerEstadosPermitidos(detalleQuery.data.estado).length >
                  0 && (
                  <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-700">
                    <h3 className="mb-3 font-semibold">
                      Gestionar estado del pedido
                    </h3>

                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label
                          htmlFor="nuevo-estado"
                          className="mb-1 block text-sm font-medium"
                        >
                          Nuevo estado
                        </label>

                        <select
                          id="nuevo-estado"
                          value={nuevoEstado}
                          onChange={(event) =>
                            setNuevoEstado(
                              event.target.value as EstadoPedido
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
                        >
                          {obtenerEstadosPermitidos(
                            detalleQuery.data.estado
                          ).map((estado) => (
                            <option key={estado} value={estado}>
                              {etiquetasEstado[estado]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={cambiarEstado}
                        disabled={
                          actualizarMutation.isPending ||
                          obtenerEstadosPermitidos(
                            detalleQuery.data.estado
                          ).length === 0
                        }
                        className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actualizarMutation.isPending
                          ? 'Guardando...'
                          : 'Actualizar estado'}
                      </button>
                    </div>

                    {actualizarMutation.isError && (
                      <p className="mt-3 text-sm text-red-600">
                        No se pudo actualizar el pedido:{' '}
                        {actualizarMutation.error.message}
                      </p>
                    )}
                  </div>
                )}
            </>
          )}
        </section>
      )}
    </main>
  );
};
