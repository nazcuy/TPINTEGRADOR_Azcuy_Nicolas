import { useState } from 'react';

import { useAuthStore } from '@/features/auth';

import type {
  Categoria,
  CategoriaCreate,
} from '../types/categoria';

import { useCategories } from '../hooks/useCategories';

import { CategoriaList } from '../components/CategoriaList';
import { CategoriaModal } from '../components/CategoriaModal';

export const CategoriasPage = () => {
  const esAdmin = useAuthStore(
    (state) => state.usuario?.role === 'admin'
  );

  const {
    categoriasQuery,
    crearMutation,
    editarMutation,
    eliminarMutation,
  } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] =
    useState<Categoria | null>(null);

  const {
    data: categorias = [],
    isLoading,
    isError,
    error,
  } = categoriasQuery;

  // Abrir modal para crear
  const handleOpenCreate = () => {
    crearMutation.reset();
    editarMutation.reset();

    setCategoriaToEdit(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (categoria: Categoria) => {
    crearMutation.reset();
    editarMutation.reset();

    setCategoriaToEdit(categoria);
    setIsModalOpen(true);
  };

  // Guardar categoría
  const handleSubmit = (data: CategoriaCreate) => {
    if (categoriaToEdit) {
      editarMutation.mutate(
        {
          id: categoriaToEdit.id,
          data,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setCategoriaToEdit(null);
          },
        }
      );
    } else {
      crearMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  // Cerrar modal
  const handleClose = () => {
    setIsModalOpen(false);
    setCategoriaToEdit(null);

    crearMutation.reset();
    editarMutation.reset();
  };

  // Eliminar categoría
  const handleDelete = (id: number) => {
    const confirmado = window.confirm(
      '¿Estás seguro de que querés eliminar esta categoría?'
    );

    if (confirmado) {
      eliminarMutation.reset();
      eliminarMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <p className="text-center p-8">
        Cargando categorías...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-center p-8 text-red-600">
        Error al cargar categorías: {error.message}
      </p>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Categorías
        </h2>

        {esAdmin && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nueva categoría
          </button>
        )}
      </div>

      {eliminarMutation.isError && (
        <p className="text-red-600 mb-4">
          Error al eliminar: {eliminarMutation.error.message}
        </p>
      )}

      <CategoriaList
        categorias={categorias}
        onEdit={handleEdit}
        onDelete={handleDelete}
        esAdmin={esAdmin}
      />

      <CategoriaModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        categoriaToEdit={categoriaToEdit}
        errorMessage={
          crearMutation.error?.message ??
          editarMutation.error?.message ??
          null
        }
        isSaving={
          crearMutation.isPending ||
          editarMutation.isPending
        }
      />
    </main>
  );
};


