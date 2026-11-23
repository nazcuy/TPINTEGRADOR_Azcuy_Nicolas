import { api, obtenerMensajeError } from '@/shared/api/api';

import type {
  Pedido,
  PedidoCreate,
  PedidoUpdate,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido';

interface ParametrosPedidos {
  skip?: number;
  limit?: number;
  estado?: string;
}

// Listar pedidos propios o todos si es administrador
export async function getPedidos(
  params: ParametrosPedidos = {}
): Promise<PedidosPaginados> {
  try {
    const { data } = await api.get<PedidosPaginados>('/pedidos', {
      params,
    });
    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al cargar pedidos'),
      { cause: error }
    );
  }
}

// Obtener un pedido
export async function getPedido(id: number): Promise<Pedido> {
  try {
    const { data } = await api.get<Pedido>(`/pedidos/${id}`);
    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al consultar el pedido'),
      { cause: error }
    );
  }
}

// Crear pedido
export async function createPedido(
  pedido: PedidoCreate
): Promise<Pedido> {
  try {
    const { data } = await api.post<Pedido>('/pedidos', pedido);
    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al crear el pedido'),
      { cause: error }
    );
  }
}

// Cambiar estado como administrador
export async function updatePedido(
  id: number,
  pedido: PedidoUpdate
): Promise<Pedido> {
  try {
    const { data } = await api.patch<Pedido>(
      `/pedidos/${id}/estado`,
      pedido
    );
    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al actualizar el estado'),
      { cause: error }
    );
  }
}

// Cancelar pedido propio pendiente
export async function cancelPedido(id: number): Promise<Pedido> {
  try {
    const { data } = await api.patch<Pedido>(
      `/pedidos/${id}/cancelar`
    );
    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al cancelar el pedido'),
      { cause: error }
    );
  }
}

// Obtener resumen administrativo
export async function getResumenPedidos(): Promise<ResumenPedidos> {
  try {
    const { data } = await api.get<ResumenPedidos>('/pedidos/resumen');
    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al cargar el resumen'),
      { cause: error }
    );
  }
}
