import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, Navigate } from 'react-router-dom';

import { registrar } from '../api/auth';
import { obtenerMensajeError } from '@/shared/api/api';
import { useAuth } from '../hooks/useAuth';

export const RegisterPage = () => {
  const { autenticado } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [registrado, setRegistrado] = useState(false);

  const form = useForm({
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        await registrar({
          username: value.username.trim(),
          full_name: value.fullName.trim(),
          email: value.email.trim(),
          password: value.password,
        });

        setRegistrado(true);
      } catch (error) {
        setError(
          obtenerMensajeError(error, 'No se pudo completar el registro')
        );
      }
    },
  });

  if (autenticado) {
    return <Navigate to="/" replace />;
  }

  if (registrado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-md">
          <h1 className="mb-3 text-2xl font-bold text-gray-800">
            ¡Registro exitoso!
          </h1>

          <p className="mb-6 text-gray-600">
            Tu cuenta fue creada correctamente. Ahora podés iniciar sesión.
          </p>

          <Link
            to="/login"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Crear cuenta
        </h1>

        <p className="mb-6 text-center text-gray-500">
          Registrate en Food Store
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
                value.trim().length < 3
                  ? 'El usuario debe tener al menos 3 caracteres.'
                  : value.length > 50
                    ? 'El usuario no puede superar los 50 caracteres.'
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
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  onBlur={field.handleBlur}
                  required
                  minLength={3}
                  maxLength={50}
                  autoComplete="username"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
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
            name="fullName"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2
                  ? 'El nombre completo debe tener al menos 2 caracteres.'
                  : value.length > 150
                    ? 'El nombre completo no puede superar los 150 caracteres.'
                    : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1 block text-sm font-medium"
                >
                  Nombre completo
                </label>

                <input
                  id="fullName"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  onBlur={field.handleBlur}
                  required
                  minLength={2}
                  maxLength={150}
                  autoComplete="name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
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
            name="email"
            validators={{
              onChange: ({ value }) =>
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                  ? 'Ingresá un correo electrónico válido.'
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium"
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  type="email"
                  value={field.state.value}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                  onBlur={field.handleBlur}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
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
                value.length < 8
                  ? 'La contraseña debe tener al menos 8 caracteres.'
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
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />

                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}

                <p className="mt-1 text-xs text-gray-500">
                  Debe tener al menos 8 caracteres.
                </p>
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
                disabled={!canSubmit || isSubmitting}
                className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
              </button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
};