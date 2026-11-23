import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getProductos } from '../api/producto';
import { getCategorias } from '@/features/categories/api/categoria';

import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';

const LIMITE = 12;

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

export const CatalogoPage = () => {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [pagina, setPagina] = useState(0);

  const agregarProducto = useCartStore(
    (state) => state.agregarProducto
  );

  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  const categoriasQuery = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  });

  const productosQuery = useQuery({
    queryKey: ['catalogo', busqueda, categoriaId, pagina],
    queryFn: () =>
      getProductos({
        skip: pagina * LIMITE,
        limit: LIMITE,
        search: busqueda.trim() || undefined,
        categoria_id: categoriaId ? Number(categoriaId) : undefined,
        disponible: true,
      }),
  });

  const productos = productosQuery.data?.items ?? [];
  const total = productosQuery.data?.total ?? 0;
  const totalPaginas = Math.ceil(total / LIMITE);

  const cambiarBusqueda = (valor: string) => {
    setBusqueda(valor);
    setPagina(0);
  };

  const cambiarCategoria = (valor: string) => {
    setCategoriaId(valor);
    setPagina(0);
  };

  const handleAgregar = (producto: (typeof productos)[number]) => {
    const agregado = agregarProducto(producto);

    showNotification(
      agregado
        ? `${producto.nombre} agregado al carrito.`
        : 'No hay stock suficiente para agregar ese producto.'
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nuestro catálogo
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Explorá nuestros productos y agregá tus favoritos al carrito.
        </p>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="buscar-producto"
            className="mb-1 block text-sm font-medium"
          >
            Buscar producto
          </label>
          <input
            id="buscar-producto"
            type="search"
            value={busqueda}
            onChange={(event) => cambiarBusqueda(event.target.value)}
            placeholder="Escribí el nombre de un producto..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        <div>
          <label
            htmlFor="filtrar-categoria"
            className="mb-1 block text-sm font-medium"
          >
            Categoría
          </label>
          <select
            id="filtrar-categoria"
            value={categoriaId}
            onChange={(event) => cambiarCategoria(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">Todas las categorías</option>
            {(categoriasQuery.data ?? []).map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
      </section>

      {categoriasQuery.isError && (
        <p className="mb-4 text-sm text-red-600">
          No se pudieron cargar las categorías.
        </p>
      )}

      {productosQuery.isLoading ? (
        <p className="py-12 text-center text-gray-500">
          Cargando catálogo...
        </p>
      ) : productosQuery.isError ? (
        <p className="py-12 text-center text-red-600">
          Error al cargar productos: {productosQuery.error.message}
        </p>
      ) : productos.length === 0 ? (
        <div className="rounded-xl border border-gray-200 p-10 text-center dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            No encontramos productos
          </h2>
          <p className="mt-2 text-gray-500">
            Probá cambiar la búsqueda o seleccionar otra categoría.
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.map((producto) => (
              <article
                key={producto.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-48 items-center justify-center bg-gray-100 dark:bg-gray-700">
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">
                      Sin imagen disponible
                    </span>
                  )}
                </div>

                <div className="flex min-h-52 flex-col p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                    {producto.categoria?.nombre ?? 'Sin categoría'}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {producto.nombre}
                  </h2>

                  <p className="mt-2 flex-1 text-sm text-gray-600 dark:text-gray-300">
                    {producto.descripcion || 'Sin descripción.'}
                  </p>

                  <div className="mt-4">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatoPrecio.format(producto.precio_base)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Stock disponible: {producto.stock}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAgregar(producto)}
                      disabled={
                        !producto.activo ||
                        !producto.disponible ||
                        producto.stock < 1
                      }
                      className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {total} producto(s) encontrado(s)
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPagina((actual) => Math.max(0, actual - 1))}
                disabled={pagina === 0}
                className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-40 dark:border-gray-600"
              >
                Anterior
              </button>

              <span className="text-sm">
                Página {pagina + 1} de {Math.max(1, totalPaginas)}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPagina((actual) =>
                    Math.min(totalPaginas - 1, actual + 1)
                  )
                }
                disabled={pagina + 1 >= totalPaginas}
                className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-40 dark:border-gray-600"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
};