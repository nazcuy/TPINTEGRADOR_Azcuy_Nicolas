import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({
  allowedRoles,
}: ProtectedRouteProps) => {
  const autenticado = useAuthStore((state) => state.autenticado);
  const inicializado = useAuthStore((state) => state.inicializado);
  const usuario = useAuthStore((state) => state.usuario);

  const location = useLocation();

  if (!inicializado) {
    return <main>Verificando sesión...</main>;
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (
    allowedRoles &&
    (!usuario || !allowedRoles.includes(usuario.role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};