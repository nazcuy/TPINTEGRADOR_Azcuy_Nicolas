import { Navigate, Route, Routes } from 'react-router-dom';

import {
  LoginPage,
  RegisterPage,
  UsuariosPage,
  useAuthStore,
} from '@/features/auth';

import {
  CatalogoPage,
  ProductsPage,
} from '@/features/products';

import { CategoriasPage } from '@/features/categories';

import {
  CarritoPage,
  CheckoutPage,
  PedidosPage,
  ResumenPage,
} from '@/features/orders';

import { ProtectedRoute } from './ProtectedRoute';
import { Navbar } from '@/shared/components/Navbar';
import { UnauthorizedPage } from '@/shared/components/UnauthorizedPage';

export const AppRouter = () => {
  const autenticado = useAuthStore((state) => state.autenticado);

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/registro"
          element={<Navigate to="/register" replace />}
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/" element={<CatalogoPage />} />
        <Route path="/productos" element={<Navigate to="/" replace />} />
        <Route path="/carrito" element={<CarritoPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/mis-pedidos" element={<PedidosPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/resumen" element={<ResumenPage />} />
          <Route path="/admin/usuarios" element={<UsuariosPage />} />
          <Route path="/admin/categorias" element={<CategoriasPage />} />
          <Route path="/admin/productos" element={<ProductsPage />} />
          <Route path="/admin/pedidos" element={<PedidosPage />} />
        </Route>

        <Route
          path="/categorias"
          element={<Navigate to="/" replace />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to={autenticado ? '/' : '/login'}
              replace
            />
          }
        />
      </Routes>
    </>
  );
};