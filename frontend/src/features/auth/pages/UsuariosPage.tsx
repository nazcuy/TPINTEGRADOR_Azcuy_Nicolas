import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useAuth } from '../hooks/useAuth';
import {
  getUsuarios,
  activarUsuario,
  desactivarUsuario,
} from '../api/usuario';
import type { UsuarioAdmin } from '../types/auth';

export const UsuariosPage = () => {
  const queryClient = useQueryClient();
  const { usuario: usuarioActual } = useAuth();

  const {
    data: usuarios = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['usuarios-admin'],
    queryFn: getUsuarios,
  });

  const activarMutation = useMutation({
    mutationFn: activarUsuario,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['usuarios-admin'] }),
  });

  const desactivarMutation = useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['usuarios-admin'] }),
  });

  const handleCambiarEstado = (id: number, desactivado: boolean) => {
    const accion = desactivado ? 'activar' : 'desactivar';

    if (!window.confirm(`¿Estás seguro de que querés ${accion} este usuario?`)) {
      return;
    }

    if (desactivado) {
      activarMutation.mutate(id);
    } else {
      desactivarMutation.mutate(id);
    }
  };

  const mutationError = activarMutation.error ?? desactivarMutation.error;

  const columns: ColumnDef<UsuarioAdmin>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'username',
      header: 'Usuario',
    },
    {
      accessorKey: 'full_name',
      header: 'Nombre completo',
      cell: ({ row }) => (
        <div>
          {row.original.full_name}
          {row.original.id === usuarioActual?.id && (
            <span className="block text-xs text-gray-500">Tu cuenta</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) =>
        row.original.role === 'admin' ? 'Administrador' : 'Usuario',
    },
    {
      accessorKey: 'disabled',
      header: 'Estado',
      cell: ({ row }) => {
        const activo = !row.original.disabled;

        return (
          <span
            className={
              activo
                ? 'font-medium text-green-700'
                : 'font-medium text-red-600'
            }
          >
            {activo ? 'Activo' : 'Desactivado'}
          </span>
        );
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const usuario = row.original;
        const esUsuarioActual = usuario.id === usuarioActual?.id;
        const activo = !usuario.disabled;

        if (esUsuarioActual) {
          return <span className="text-sm text-gray-400">Cuenta actual</span>;
        }

        return (
          <button
            type="button"
            onClick={() =>
              handleCambiarEstado(usuario.id, usuario.disabled)
            }
            disabled={
              activarMutation.isPending || desactivarMutation.isPending
            }
            className={
              activo
                ? 'text-red-600 hover:underline disabled:opacity-50'
                : 'text-green-600 hover:underline disabled:opacity-50'
            }
          >
            {activo ? 'Desactivar' : 'Activar'}
          </button>
        );
      },
    },
  ];

  const tabla = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <p className="p-8 text-center">Cargando usuarios...</p>;
  }

  if (isError) {
    return (
      <p className="p-8 text-center text-red-600">
        Error al cargar usuarios: {error.message}
      </p>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
        Administración de usuarios
      </h1>

      <p className="mb-5 text-gray-600 dark:text-gray-300">
        Consultá las cuentas y administrá su estado.
      </p>

      {mutationError && (
        <p className="mb-4 rounded bg-red-50 p-3 text-red-600">
          {mutationError.message}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-200">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th key={header.id} className="p-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {tabla.getRowModel().rows.map((fila) => (
              <tr
                key={fila.id}
                className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="p-3">
                    {flexRender(
                      celda.column.columnDef.cell,
                      celda.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}

            {tabla.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={tabla.getAllColumns().length}
                  className="p-6 text-center text-gray-500"
                >
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};