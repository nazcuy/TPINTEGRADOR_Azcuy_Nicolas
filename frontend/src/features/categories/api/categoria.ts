import { api, obtenerMensajeError } from '@/shared/api/api';

import type {
  Categoria,
  CategoriaCreate,
} from '../types/categoria';

export async function getCategorias(): Promise<Categoria[]> {
  try {
    const { data } = await api.get<Categoria[]>('/categorias');
    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al cargar categorías'),
      { cause: error }
    );
  }
}

export async function createCategoria(
  categoria: CategoriaCreate
): Promise<Categoria> {
  try {
    const { data } = await api.post<Categoria>(
      '/categorias',
      categoria
    );

    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al crear la categoría'),
      { cause: error }
    );
  }
}

export async function updateCategoria(
  id: number,
  categoria: CategoriaCreate
): Promise<Categoria> {
  try {
    const { data } = await api.put<Categoria>(
      `/categorias/${id}`,
      categoria
    );

    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al actualizar la categoría'),
      { cause: error }
    );
  }
}

export async function deleteCategoria(id: number): Promise<void> {
  try {
    await api.delete(`/categorias/${id}`);
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al eliminar la categoría'),
      { cause: error }
    );
  }
}

