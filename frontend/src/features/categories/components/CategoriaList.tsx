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

import type { Categoria } from '../types/categoria';

interface Props {
  categorias: Categoria[];
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
  esAdmin: boolean;
}

export const CategoriaList = ({
  categorias,
  onEdit,
  onDelete,
  esAdmin,
}: Props) => {

  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Categoria>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Número',
      },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ getValue }) => getValue<string | null>() || '-',
      },
      {
        id: 'acciones',
        header: esAdmin ? 'Acciones' : '',
        enableSorting: false,
        cell: ({ row }) => esAdmin ? (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onEdit(row.original)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => onDelete(row.original.id)}
              className="text-red-600 hover:text-red-800 font-medium text-sm"
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
    data: categorias,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">

      <table className="w-full text-left">

        <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
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
                  <td key={cell.id} className="p-3">
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
                No hay categorías.
              </td>
            </tr>
          )}
        </tbody>

      </table>

      {/* Paginación */}
      <div className="flex items-center justify-between p-4 border-t">

        <span className="text-sm text-gray-600">
          Página {table.getState().pagination.pageIndex + 1} de{' '}
          {Math.max(table.getPageCount(), 1)}
        </span>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Anterior
          </button>

          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Siguiente
          </button>

        </div>
      </div>

    </div>
  );
};


