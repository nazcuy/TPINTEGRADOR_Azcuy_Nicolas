import { useQueries } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { getProducto } from '@/features/products/api/producto';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

export const CarritoPage = () => {
  const items = useCartStore((state) => state.items);
  const actualizarCantidad = useCartStore(
    (state) => state.actualizarCantidad
  );
  const quitarProducto = useCartStore(
    (state) => state.quitarProducto
  );
  const vaciarCarrito = useCartStore(
    (state) => state.vaciarCarrito
  );
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  const consultas = useQueries({
    queries: items.map((item) => ({
      queryKey: ['producto', item.producto_id],
      queryFn: () => getProducto(item.producto_id),
      staleTime: 0,
    })),
  });

  const filas = items.map((item, index) => ({
    item,
    consulta: consultas[index],
    producto: consultas[index]?.data,
  }));

  const total = filas.reduce(
    (acumulado, fila) =>
      acumulado +
      (fila.producto
        ? fila.producto.precio_base * fila.item.cantidad
        : 0),
    0
  );

  const carritoValido =
    filas.length > 0 &&
    filas.every(
      ({ item, producto }) =>
        producto !== undefined &&
        producto.activo &&
        producto.disponible &&
        producto.stock >= item.cantidad
    );

  const actualizar = (
    productoId: number,
    cantidad: number,
    stock: number
  ) => {
    const actualizado = actualizarCantidad(
      productoId,
      cantidad,
      stock
    );

    if (!actualizado) {
      showNotification('No hay stock suficiente para esa cantidad.');
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mi carrito
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Revisá tus productos antes de confirmar el pedido.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={vaciarCarrito}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
          >
            Vaciar carrito
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tu carrito está vacío
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Explorá el catálogo y agregá los productos que quieras comprar.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            Ir al catálogo
          </Link>
        </section>
      ) : (
        <>
          <section className="space-y-4">
            {filas.map(({ item, consulta, producto }) => {
              const sinDisponibilidad =
                producto !== undefined &&
                (!producto.activo ||
                  !producto.disponible ||
                  producto.stock < item.cantidad);

              return (
                <article
                  key={item.producto_id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 sm:w-28 dark:bg-gray-700">
                    {(producto?.imagen_url ?? item.imagen_url) ? (
                      <img
                        src={producto?.imagen_url ?? item.imagen_url ?? ''}
                        alt={producto?.nombre ?? item.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">
                        Sin imagen
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {producto?.nombre ?? item.nombre}
                    </h2>

                    {consulta?.isLoading ? (
                      <p className="mt-1 text-sm text-gray-500">
                        Actualizando información...
                      </p>
                    ) : consulta?.isError ? (
                      <p className="mt-1 text-sm text-red-600">
                        No se pudo consultar este producto. Podés quitarlo del carrito.
                      </p>
                    ) : producto ? (
                      <>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          Precio unitario:{' '}
                          {formatoPrecio.format(producto.precio_base)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stock actual: {producto.stock}
                        </p>
                      </>
                    ) : null}

                    {sinDisponibilidad && (
                      <p className="mt-2 text-sm font-medium text-red-600">
                        Este producto ya no tiene disponibilidad suficiente.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => quitarProducto(item.producto_id)}
                      className="mt-2 text-sm font-medium text-red-600 hover:underline"
                    >
                      Quitar producto
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        producto &&
                        actualizar(
                          item.producto_id,
                          item.cantidad - 1,
                          producto.stock
                        )
                      }
                      disabled={!producto || item.cantidad <= 1}
                      className="h-9 w-9 rounded-lg border border-gray-300 font-semibold disabled:opacity-40 dark:border-gray-600"
                      aria-label="Disminuir cantidad"
                    >
                      −
                    </button>

                    <span className="min-w-6 text-center font-semibold">
                      {item.cantidad}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        producto &&
                        actualizar(
                          item.producto_id,
                          item.cantidad + 1,
                          producto.stock
                        )
                      }
                      disabled={
                        !producto ||
                        !producto.activo ||
                        !producto.disponible ||
                        item.cantidad >= producto.stock
                      }
                      className="h-9 w-9 rounded-lg border border-gray-300 font-semibold disabled:opacity-40 dark:border-gray-600"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right sm:min-w-32">
                    <p className="text-xs text-gray-500">Subtotal</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatoPrecio.format(
                        (producto?.precio_base ?? 0) * item.cantidad
                      )}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatoPrecio.format(total)}
              </span>
            </div>

            {!carritoValido && (
              <p className="mt-3 text-sm text-red-600">
                Revisá la disponibilidad de los productos antes de continuar.
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <Link
                to="/"
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Seguir comprando
              </Link>

              {carritoValido ? (
                <Link
                  to="/checkout"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
                >
                  Continuar al pago
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg bg-gray-400 px-5 py-2.5 font-medium text-white"
                >
                  Continuar al pago
                </button>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
};