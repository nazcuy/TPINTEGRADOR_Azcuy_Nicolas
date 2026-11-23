import { useForm } from '@tanstack/react-form';
import {
  useMutation,
  useQueries,
  useQueryClient,
} from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import { getProducto } from '@/features/products/api/producto';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';

import { createPedido } from '../api/pedido';
import type { FormaPago } from '../types/pedido';

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const items = useCartStore((state) => state.items);
  const vaciarCarrito = useCartStore((state) => state.vaciarCarrito);

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

  const productosValidos =
    items.length > 0 &&
    consultas.length === items.length &&
    consultas.every((consulta, index) => {
      const producto = consulta.data;
      const item = items[index];

      return Boolean(
        producto &&
          item &&
          producto.activo &&
          producto.disponible &&
          producto.stock >= item.cantidad
      );
    });

  const productosCargando = consultas.some(
    (consulta) => consulta.isLoading
  );

  const total = items.reduce(
    (acumulado, item, index) =>
      acumulado +
      (consultas[index]?.data?.precio_base ?? 0) * item.cantidad,
    0
  );

  const crearPedidoMutation = useMutation({
    mutationFn: createPedido,
    onSuccess: async () => {
      vaciarCarrito();

      await queryClient.invalidateQueries({
        queryKey: ['pedidos'],
      });

      showNotification('El pedido se creó correctamente.');
      navigate('/mis-pedidos', { replace: true });
    },
  });

  const form = useForm({
    defaultValues: {
      direccion: '',
      formaPago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      if (!productosValidos || productosCargando) {
        return;
      }

      crearPedidoMutation.mutate({
        items: items.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
        })),
        forma_pago: value.formaPago,
        direccion_entrega: value.direccion.trim(),
        notas: value.notas.trim() || null,
      });
    },
  });

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          No hay productos para confirmar
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Agregá productos al carrito antes de continuar.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Ir al catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
        Confirmar pedido
      </h1>

      <p className="mb-8 text-gray-600 dark:text-gray-300">
        Completá los datos de entrega y revisá el importe antes de confirmar.
      </p>

      {productosCargando && (
        <p className="mb-4 text-sm text-gray-500">
          Verificando precios y disponibilidad...
        </p>
      )}

      {!productosCargando && !productosValidos && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Uno o más productos ya no están disponibles o no tienen stock
          suficiente. Volvé al carrito para revisar las cantidades.
          <Link to="/carrito" className="ml-1 font-semibold underline">
            Revisar carrito
          </Link>
        </div>
      )}

      {crearPedidoMutation.isError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          No se pudo crear el pedido: {crearPedidoMutation.error.message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-5 lg:col-span-3"
        >
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-5 text-xl font-semibold">
              Datos de entrega
            </h2>

            <form.Field
              name="direccion"
              validators={{
                onChange: ({ value }) =>
                  value.trim().length < 5
                    ? 'La dirección debe tener al menos 5 caracteres.'
                    : value.length > 200
                      ? 'La dirección no puede superar los 200 caracteres.'
                      : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor="direccion-entrega"
                    className="mb-1 block text-sm font-medium"
                  >
                    Dirección de entrega
                  </label>

                  <textarea
                    id="direccion-entrega"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    onBlur={field.handleBlur}
                    required
                    minLength={5}
                    maxLength={200}
                    rows={3}
                    autoComplete="street-address"
                    placeholder="Ingresá la dirección completa"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
                  />

                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="formaPago">
              {(field) => (
                <div className="mt-5">
                  <label
                    htmlFor="forma-pago"
                    className="mb-1 block text-sm font-medium"
                  >
                    Forma de pago
                  </label>

                  <select
                    id="forma-pago"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(event.target.value as FormaPago)
                    }
                    onBlur={field.handleBlur}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field name="notas">
              {(field) => (
                <div className="mt-5">
                  <label
                    htmlFor="notas-pedido"
                    className="mb-1 block text-sm font-medium"
                  >
                    Notas (opcional)
                  </label>

                  <textarea
                    id="notas-pedido"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    onBlur={field.handleBlur}
                    rows={3}
                    placeholder="Indicaciones adicionales para la entrega"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
                  />
                </div>
              )}
            </form.Field>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/carrito"
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Volver al carrito
            </Link>

            <form.Subscribe
              selector={(state) =>
                [
                  state.canSubmit,
                  state.isSubmitting,
                  state.values.direccion,
                ] as const
              }
            >
              {([canSubmit, isSubmitting, direccion]) => (
                <button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    isSubmitting ||
                    !direccion.trim() ||
                    !productosValidos ||
                    productosCargando ||
                    crearPedidoMutation.isPending
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {crearPedidoMutation.isPending
                    ? 'Creando pedido...'
                    : 'Confirmar pedido'}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>

        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <h2 className="mb-5 text-xl font-semibold">
            Resumen de compra
          </h2>

          <div className="space-y-4">
            {items.map((item, index) => {
              const producto = consultas[index]?.data;

              return (
                <div
                  key={item.producto_id}
                  className="flex justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {producto?.nombre ?? item.nombre}
                    </p>

                    <p className="text-gray-500">
                      Cantidad: {item.cantidad}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold">
                    {producto
                      ? formatoPrecio.format(
                          producto.precio_base * item.cantidad
                        )
                      : '—'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t border-gray-200 pt-5 dark:border-gray-700">
            <div className="flex justify-between gap-3">
              <span className="font-semibold">Total</span>

              <span className="text-xl font-bold">
                {formatoPrecio.format(total)}
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              El importe definitivo será calculado y validado por el servidor.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};