import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';

import type { Categoria } from '@/features/categories/types/categoria';
import type {
  Producto,
  ProductoCreate,
} from '../types/producto';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductoCreate) => void;
  productoToEdit: Producto | null;
  categorias: Categoria[];
  errorMessage?: string | null;
  isSaving?: boolean;
}

export const ProductoModal = ({
  isOpen,
  onClose,
  onSubmit,
  productoToEdit,
  categorias,
  errorMessage,
  isSaving = false,
}: Props) => {
  const form = useForm({
    defaultValues: {
      categoria_id: productoToEdit?.categoria_id ?? 0,
      nombre: productoToEdit?.nombre ?? '',
      descripcion: productoToEdit?.descripcion ?? '',
      precio_base: productoToEdit?.precio_base ?? 0,
      imagen_url: productoToEdit?.imagen_url ?? '',
      stock: productoToEdit?.stock ?? 0,
      disponible: productoToEdit?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        categoria_id: Number(value.categoria_id),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
      });
    },
  });

  useEffect(() => {
    form.reset({
      categoria_id: productoToEdit?.categoria_id ?? 0,
      nombre: productoToEdit?.nombre ?? '',
      descripcion: productoToEdit?.descripcion ?? '',
      precio_base: productoToEdit?.precio_base ?? 0,
      imagen_url: productoToEdit?.imagen_url ?? '',
      stock: productoToEdit?.stock ?? 0,
      disponible: productoToEdit?.disponible ?? true,
    });
  }, [productoToEdit, isOpen, form]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">
          {productoToEdit ? 'Editar producto' : 'Nuevo producto'}
        </h2>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="categoria_id">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Categoría
                </label>
                <select
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(Number(event.target.value))
                  }
                  onBlur={field.handleBlur}
                  required
                  className="w-full rounded border border-gray-300 p-2"
                >
                  <option value={0} disabled>
                    Seleccioná una categoría
                  </option>
                  {categorias
                    .filter((categoria) => categoria.activo)
                    .map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </form.Field>

          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2
                  ? 'El nombre debe tener al menos 2 caracteres.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nombre
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  onBlur={field.handleBlur}
                  required
                  maxLength={150}
                  className="w-full rounded border border-gray-300 p-2"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Descripción
                </label>
                <textarea
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  className="w-full rounded border border-gray-300 p-2"
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                Number(value) < 0
                  ? 'El precio no puede ser negativo.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Precio
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(Number(event.target.value))
                  }
                  className="w-full rounded border border-gray-300 p-2"
                  required
                />
              </div>
            )}
          </form.Field>

          <form.Field name="imagen_url">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  URL de imagen
                </label>
                <input
                  type="url"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  placeholder="https://..."
                  maxLength={500}
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="stock">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(Number(event.target.value))
                  }
                  required
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.checked)
                  }
                />
                Disponible para la venta
              </label>
            )}
          </form.Field>

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
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
                  disabled={
                    !canSubmit ||
                    isSubmitting ||
                    isSaving ||
                    categorias.filter((categoria) => categoria.activo)
                      .length === 0
                  }
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving
                    ? 'Guardando...'
                    : productoToEdit
                      ? 'Guardar cambios'
                      : 'Crear producto'}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  );
};