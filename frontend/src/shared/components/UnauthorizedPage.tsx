import { Link } from 'react-router-dom';

export const UnauthorizedPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">
        Acceso denegado
      </h1>

      <p>
        No tenés permisos para acceder a esta página.
      </p>

      <Link
        to="/categorias"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </main>
  );
};
