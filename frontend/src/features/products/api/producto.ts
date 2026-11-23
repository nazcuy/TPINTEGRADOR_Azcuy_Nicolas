import { api, obtenerMensajeError } from '@/shared/api/api';

import type {
  Producto,
  ProductoCreate,
  ProductoUpdate,
  ProductoStockUpdate,
  ProductosPaginados,
} from '../types/producto';

export async function getProductos(
  params: {
    skip?: number;
    limit?: number;
    search?: string;
    categoria_id?: number;
    disponible?: boolean;
  } = {}
): Promise<ProductosPaginados> {
  try {
    const { data } = await api.get<ProductosPaginados>('/productos', {
      params,
    });

    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al cargar productos'),
      { cause: error }
    );
  }
}

export async function getProducto(id: number): Promise<Producto> {
  try {
    const { data } = await api.get<Producto>(`/productos/${id}`);
    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al cargar el producto'),
      { cause: error }
    );
  }
}

export async function createProducto(
  producto: ProductoCreate
): Promise<Producto> {
  try {
    const { data } = await api.post<Producto>('/productos', producto);
    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al crear el producto'),
      { cause: error }
    );
  }
}

export async function updateProducto(
  id: number,
  producto: ProductoUpdate
): Promise<Producto> {
  try {
    const { data } = await api.put<Producto>(
      `/productos/${id}`,
      producto
    );

    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al actualizar el producto'),
      { cause: error }
    );
  }
}

export async function updateStockProducto(
  id: number,
  datos: ProductoStockUpdate
): Promise<Producto> {
  try {
    const { data } = await api.patch<Producto>(
      `/productos/${id}/stock`,
      datos
    );

    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al actualizar el stock'),
      { cause: error }
    );
  }
}

export async function deleteProducto(id: number): Promise<void> {
  try {
    await api.delete(`/productos/${id}`);
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al eliminar el producto'),
      { cause: error }
    );
  }
}

