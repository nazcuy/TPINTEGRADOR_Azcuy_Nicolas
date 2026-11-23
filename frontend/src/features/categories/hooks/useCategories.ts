import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { CategoriaCreate } from '../types/categoria';

import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from '../api/categoria';

import { useNotificationStore } from '@/store/notificationStore';

export const useCategories = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  const categoriasQuery = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  });

  const crearMutation = useMutation({
    mutationFn: createCategoria,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categorias'] });
      showNotification('Categoría creada correctamente.');
    },
    onError: () => showNotification('No se pudo crear la categoría.'),
  });

  const editarMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CategoriaCreate;
    }) => updateCategoria(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categorias'] });
      showNotification('Categoría actualizada correctamente.');
    },
    onError: () => showNotification('No se pudo actualizar la categoría.'),
  });

  const eliminarMutation = useMutation({
    mutationFn: deleteCategoria,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categorias'] });
      showNotification('Categoría eliminada correctamente.');
    },
    onError: () => showNotification('No se pudo eliminar la categoría.'),
  });

  return {
    categoriasQuery,
    crearMutation,
    editarMutation,
    eliminarMutation,
  };
};