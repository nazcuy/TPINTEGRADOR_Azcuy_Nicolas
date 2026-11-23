import { useQuery } from '@tanstack/react-query';

import { getResumenPedidos } from '../api/pedido';
import type { ResumenPedidos } from '../types/pedido';

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

const estados: {
  clave: keyof Pick<
    ResumenPedidos,
    'pendientes' | 'en_preparacion' | 'entregados' | 'cancelados'
  >;
  nombre: string;
  color: string;
  fondo: string;
}[] = [
  {
    clave: 'pendientes',
    nombre: 'Pendientes',
    color: 'bg-yellow-500',
    fondo: 'bg-yellow-100 dark:bg-yellow-950',
  },
  {
    clave: 'en_preparacion',
    nombre: 'En preparación',
    color: 'bg-blue-500',
    fondo: 'bg-blue-100 dark:bg-blue-950',
  },
  {
    clave: 'entregados',
    nombre: 'Entregados',
    color: 'bg-green-500',
    fondo: 'bg-green-100 dark:bg-green-950',
  },
  {
    clave: 'cancelados',
    nombre: 'Cancelados',
    color: 'bg-red-500',
    fondo: 'bg-red-100 dark:bg-red-950',
  },
];

export const ResumenPage = () => {
  const resumenQuery = useQuery({
    queryKey: ['pedidos', 'resumen'],
    queryFn: getResumenPedidos,
  });

  if (resumenQuery.isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-center">
        Cargando resumen administrativo...
      </main>
    );
  }

  if (resumenQuery.isError || !resumenQuery.data) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
          <h1 className="text-xl font-bold text-red-800 dark:text-red-200">
            No se pudo cargar el resumen
          </h1>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {resumenQuery.error?.message ?? 'No hay datos disponibles.'}
          </p>
          <button
            type="button"
            onClick={() => void resumenQuery.refetch()}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-white hover:bg-red-800"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  const resumen = resumenQuery.data;

  const totalPedidos =
    resumen.pendientes +
    resumen.en_preparacion +
    resumen.entregados +
    resumen.cancelados;

  const tarjetas = [
    {
      titulo: 'Pedidos de hoy',
      valor: resumen.pedidos_hoy.toLocaleString('es-AR'),
      descripcion: 'Pedidos registrados durante el día',
      color: 'border-blue-500',
    },
    {
      titulo: 'Pendientes',
      valor: resumen.pendientes.toLocaleString('es-AR'),
      descripcion: 'Esperando preparación',
      color: 'border-yellow-500',
    },
    {
      titulo: 'En preparación',
      valor: resumen.en_preparacion.toLocaleString('es-AR'),
      descripcion: 'Pedidos en proceso',
      color: 'border-indigo-500',
    },
    {
      titulo: 'Ingresos entregados',
      valor: formatoPrecio.format(resumen.ingresos_entregados),
      descripcion: 'Total de pedidos entregados',
      color: 'border-green-500',
    },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Resumen administrativo
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Indicadores generales de actividad y estado de los pedidos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void resumenQuery.refetch()}
          disabled={resumenQuery.isFetching}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resumenQuery.isFetching ? 'Actualizando...' : 'Actualizar datos'}
        </button>
      </header>

      {resumenQuery.isError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudieron actualizar los datos. Se muestran los últimos valores
          disponibles.
        </p>
      )}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map((tarjeta) => (
          <article
            key={tarjeta.titulo}
            className={`rounded-xl border-l-4 ${tarjeta.color} bg-white p-6 shadow-sm dark:bg-gray-800`}
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {tarjeta.titulo}
            </p>
            <p className="mt-3 break-words text-2xl font-bold text-gray-900 dark:text-white">
              {tarjeta.valor}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {tarjeta.descripcion}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Distribución de pedidos
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Cantidad de pedidos según su estado actual.
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
            {totalPedidos.toLocaleString('es-AR')} en total
          </span>
        </div>

        <div className="space-y-6">
          {estados.map((estado) => {
            const cantidad = resumen[estado.clave];
            const porcentaje =
              totalPedidos > 0
                ? (cantidad / totalPedidos) * 100
                : 0;

            return (
              <div key={estado.clave}>
                <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {estado.nombre}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {cantidad.toLocaleString('es-AR')} (
                    {porcentaje.toFixed(1)}%)
                  </span>
                </div>

                <div
                  className={`h-3 overflow-hidden rounded-full ${estado.fondo}`}
                >
                  <div
                    className={`h-full rounded-full transition-all ${estado.color}`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {totalPedidos === 0 && (
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Todavía no hay pedidos para mostrar.
          </p>
        )}
      </section>
    </main>
  );
};