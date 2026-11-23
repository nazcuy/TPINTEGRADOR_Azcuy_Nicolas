import { useForm } from '@tanstack/react-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export const LoginPage = () => {
  const navigate = useNavigate();

  const {
    autenticado,
    iniciarSesion,
    cargando,
    error,
    limpiarError,
  } = useAuth();

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      limpiarError();

      try {
        await iniciarSesion(value.username.trim(), value.password);
        navigate('/', { replace: true });
      } catch {
        // El store conserva el mensaje de error.
      }
    },
  });

  if (autenticado) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Iniciar sesión
        </h1>

        <p className="mb-6 text-center text-gray-500">
          Ingresá a tu cuenta de Food Store
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length === 0
                  ? 'Ingresá tu nombre de usuario.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="username"
                  className="mb-1 block text-sm font-medium"
                >
                  Nombre de usuario
                </label>

                <input
                  id="username"
                  type="text"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  onBlur={field.handleBlur}
                  required
                  autoComplete="username"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Tu usuario"
                />

                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length === 0
                  ? 'Ingresá tu contraseña.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium"
                >
                  Contraseña
                </label>

                <input
                  id="password"
                  type="password"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  onBlur={field.handleBlur}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Tu contraseña"
                />

                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
            ]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting || cargando}
                className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {cargando || isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Todavía no tenés cuenta?{' '}
          <Link
            to="/registro"
            className="font-medium text-blue-600 hover:underline"
          >
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
};