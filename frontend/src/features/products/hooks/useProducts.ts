import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  ProductoUpdate,
  ProductoStockUpdate,
} from '../types/producto';

import {
  getProductos,
  createProducto,
  updateProducto,
  updateStockProducto,
  deleteProducto,
} from '../api/producto';

import { getCategorias } from '@/features/categories/api/categoria';

export const useProducts = () => {
  const queryClient = useQueryClient();

  const productosQuery = useQuery({
    queryKey: ['productos'],
    queryFn: () => getProductos({ skip: 0, limit: 100 }),
  });

  const categoriasQuery = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  });

  const crearMutation = useMutation({
    mutationFn: createProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const editarMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ProductoUpdate;
    }) => updateProducto(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ProductoStockUpdate;
    }) => updateStockProducto(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  return {
    productosQuery,
    categoriasQuery,
    crearMutation,
    editarMutation,
    stockMutation,
    eliminarMutation,
  };
};