import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const autenticado = useAuthStore((state) => state.autenticado);
  const inicializado = useAuthStore((state) => state.inicializado);
  const cargando = useAuthStore((state) => state.cargando);
  const error = useAuthStore((state) => state.error);

  const inicializar = useAuthStore((state) => state.inicializar);
  const iniciarSesion = useAuthStore((state) => state.iniciarSesion);
  const cerrarSesion = useAuthStore((state) => state.cerrarSesion);
  const limpiarError = useAuthStore((state) => state.limpiarError);

  return {
    usuario,
    autenticado,
    inicializado,
    cargando,
    error,
    inicializar,
    iniciarSesion,
    cerrarSesion,
    limpiarError,
  };
};
