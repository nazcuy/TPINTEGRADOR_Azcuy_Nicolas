import { useState } from 'react';

import { ProductoList } from '../components/ProductoList';
import { ProductoModal } from '../components/ProductoModal';
import { useProducts } from '../hooks/useProducts';

import type {
  Producto,
  ProductoCreate,
} from '../types/producto';

export const ProductsPage = () => {
  const {
    productosQuery,
    categoriasQuery,
    crearMutation,
    editarMutation,
    stockMutation,
    eliminarMutation,
  } = useProducts();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);

  const productos = productosQuery.data?.items ?? [];
  const categorias = categoriasQuery.data ?? [];

  const errorMutation =
    crearMutation.error ??
    editarMutation.error ??
    stockMutation.error ??
    eliminarMutation.error;

  const guardando =
    crearMutation.isPending ||
    editarMutation.isPending ||
    stockMutation.isPending;

  const abrirNuevo = () => {
    setProductoSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
  };

  const guardarProducto = async (datos: ProductoCreate) => {
    try {
      if (productoSeleccionado) {
        await editarMutation.mutateAsync({
          id: productoSeleccionado.id,
          data: {
            categoria_id: datos.categoria_id,
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            precio_base: datos.precio_base,
            imagen_url: datos.imagen_url,
          },
        });

        await stockMutation.mutateAsync({
          id: productoSeleccionado.id,
          data: {
            stock: datos.stock,
            disponible: datos.disponible,
          },
        });
      } else {
        await crearMutation.mutateAsync(datos);
      }

      cerrarModal();
    } catch {
      // El error se muestra en el formulario.
    }
  };

  const eliminarProducto = (id: number) => {
    const confirmado = window.confirm(
      '¿Seguro que querés eliminar este producto?'
    );

    if (confirmado) {
      eliminarMutation.mutate(id);
    }
  };

  if (productosQuery.isLoading || categoriasQuery.isLoading) {
    return <p className="p-6">Cargando productos...</p>;
  }

  if (productosQuery.isError) {
    return (
      <p className="p-6 text-red-600">
        Error al cargar productos: {productosQuery.error.message}
      </p>
    );
  }

  if (categoriasQuery.isError) {
    return (
      <p className="p-6 text-red-600">
        Error al cargar categorías: {categoriasQuery.error.message}
      </p>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Administración de productos
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestioná el catálogo, los precios y el stock.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nuevo producto
        </button>
      </div>

      {errorMutation && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMutation.message}
        </p>
      )}

      <ProductoList
        productos={productos}
        onEdit={abrirEdicion}
        onDelete={eliminarProducto}
        esAdmin={true}
      />

      <ProductoModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onSubmit={guardarProducto}
        productoToEdit={productoSeleccionado}
        categorias={categorias}
        errorMessage={errorMutation?.message ?? null}
        isSaving={guardando}
      />
    </main>
  );
};