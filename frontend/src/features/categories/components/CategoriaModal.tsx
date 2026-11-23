import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';

import type {
  Categoria,
  CategoriaCreate,
} from '../types/categoria';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoriaCreate) => void;
  categoriaToEdit: Categoria | null;
  errorMessage?: string | null;
  isSaving?: boolean;
}

export const CategoriaModal = ({
  isOpen,
  onClose,
  onSubmit,
  categoriaToEdit,
  errorMessage,
  isSaving = false,
}: Props) => {

  const form = useForm({
    defaultValues: {
      nombre: categoriaToEdit?.nombre ?? '',
      descripcion: categoriaToEdit?.descripcion ?? '',
    },

    onSubmit: async ({ value }) => {
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
      });
    },
  });

  useEffect(() => {
    form.reset({
      nombre: categoriaToEdit?.nombre ?? '',
      descripcion: categoriaToEdit?.descripcion ?? '',
    });
  }, [categoriaToEdit, isOpen, form]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">

        <h2 className="text-xl font-bold mb-4">
          {categoriaToEdit ? 'Editar Categoría' : 'Nueva Categoría'}
        </h2>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >

          {/* Nombre */}
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 3
                  ? 'El nombre debe tener al menos 3 caracteres.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>

                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre
                </label>

                <input
                  id="nombre"
                  type="text"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  onBlur={field.handleBlur}
                  placeholder="Ingrese el nombre de la categoría"
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-600 text-sm mt-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}

              </div>
            )}
          </form.Field>

          {/* DescripciÃ³n */}
          <form.Field name="descripcion">
            {(field) => (
              <div>

                <label
                  htmlFor="descripcion"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descripción
                </label>

                <input
                  id="descripcion"
                  type="text"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  onBlur={field.handleBlur}
                  placeholder="Descripción opcional"
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />

              </div>
            )}
          </form.Field>

          {/* Error del backend */}
          {errorMessage && (
            <p className="text-red-600 text-sm">
              {errorMessage}
            </p>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 mt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>

            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
              ]}
            >
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving
                    ? 'Guardando...'
                    : categoriaToEdit
                      ? 'Guardar cambios'
                      : 'Crear categoría'}
                </button>
              )}
            </form.Subscribe>

          </div>

        </form>

      </div>
    </div>
  );
};


