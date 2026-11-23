import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/features/auth';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';

export const Navbar = () => {
  const navigate = useNavigate();

  const usuario = useAuthStore((state) => state.usuario);
  const cerrarSesion = useAuthStore((state) => state.cerrarSesion);
  const cargando = useAuthStore((state) => state.cargando);

  const cantidadCarrito = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.cantidad, 0)
  );

  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const esAdmin = usuario?.role === 'admin';

  const handleLogout = async () => {
    try {
      await cerrarSesion();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const linkClass = 'transition-colors hover:text-blue-200';

  return (
    <nav className="mb-8 bg-blue-700 p-4 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold">
          Food Store
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <Link to="/" className={linkClass}>
            Catálogo
          </Link>

          <Link to="/carrito" className={linkClass}>
            Carrito
            {cantidadCarrito > 0 && (
              <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs font-bold text-blue-700">
                {cantidadCarrito}
              </span>
            )}
          </Link>

          {usuario && !esAdmin && (
            <Link to="/mis-pedidos" className={linkClass}>
              Mis pedidos
            </Link>
          )}

          {esAdmin && (
            <>
              <Link to="/admin/resumen" className={linkClass}>
                Resumen
              </Link>

              <Link to="/admin/productos" className={linkClass}>
                Productos
              </Link>

              <Link to="/admin/categorias" className={linkClass}>
                Categorías
              </Link>

              <Link to="/admin/pedidos" className={linkClass}>
                Pedidos
              </Link>

              <Link to="/admin/usuarios" className={linkClass}>
                Usuarios
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right text-sm">
                <p className="font-semibold">{usuario.full_name}</p>
                <p className="text-blue-200">
                  {esAdmin ? 'Administrador' : 'Usuario'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={cargando}
                className="rounded-lg bg-white px-3 py-2 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                {cargando ? 'Saliendo...' : 'Cerrar sesión'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Iniciar sesión
              </Link>

              <Link to="/register" className={linkClass}>
                Registrarse
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg bg-white px-3 py-2 text-blue-700 hover:bg-blue-100"
          >
            {darkMode ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>
      </div>
    </nav>
  );
};