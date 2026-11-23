export { useProducts } from './hooks/useProducts';

export {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  updateStockProducto,
  deleteProducto,
} from './api/producto';

export type {
  Producto,
  ProductoCreate,
  ProductoUpdate,
  ProductoStockUpdate,
  ProductosPaginados,
} from './types/producto';

export { ProductsPage } from './pages/ProductsPage';
export { CatalogoPage } from './pages/CatalogoPage';