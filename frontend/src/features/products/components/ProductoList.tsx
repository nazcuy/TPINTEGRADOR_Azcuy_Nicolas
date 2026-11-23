import { useMemo, useState } from 'react';

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type {
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';

import type { Producto } from '../types/producto';

interface Props {
  productos: Producto[];
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
  esAdmin: boolean;
}

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

export const ProductoList = ({
  productos,
  onEdit,
  onDelete,
  esAdmin,
}: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'N.º',
      },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
      },
      {
        accessorFn: (row) => row.categoria?.nombre ?? '-',
        id: 'categoria',
        header: 'Categoría',
      },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ getValue }) =>
          formatoPrecio.format(Number(getValue())),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
      },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        cell: ({ getValue }) => (
          <span
            className={
              getValue<boolean>()
                ? 'font-medium text-green-600'
                : 'font-medium text-red-600'
            }
          >
            {getValue<boolean>() ? 'Sí' : 'No'}
          </span>
        ),
      },
      {
        accessorKey: 'activo',
        header: 'Activo',
        cell: ({ getValue }) => (
          <span
            className={
              getValue<boolean>()
                ? 'font-medium text-green-600'
                : 'font-medium text-red-600'
            }
          >
            {getValue<boolean>() ? 'Sí' : 'No'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: esAdmin ? 'Acciones' : '',
        enableSorting: false,
        cell: ({ row }) =>
          esAdmin ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onEdit(row.original)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => onDelete(row.original.id)}
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Eliminar
              </button>
            </div>
          ) : null,
      },
    ],
    [onEdit, onDelete, esAdmin]
  );

  const table = useReactTable({
    data: productos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id} className="p-3">
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="font-semibold hover:text-blue-700"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === 'asc'
                          ? ' ↑'
                          : header.column.getIsSorted() === 'desc'
                            ? ' ↓'
                            : ' ↕'}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-6 text-center text-gray-500"
                >
                  No hay productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t p-4">
        <span className="text-sm text-gray-600">
          Página {table.getState().pagination.pageIndex + 1} de{' '}
          {Math.max(table.getPageCount(), 1)}
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Anterior
          </button>

          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};