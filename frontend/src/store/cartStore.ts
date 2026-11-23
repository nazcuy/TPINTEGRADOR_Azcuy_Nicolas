import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { Producto } from '@/features/products/types/producto';

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  cantidad: number;
}

interface CartState {
  items: ItemCarrito[];
  agregarProducto: (producto: Producto, cantidad?: number) => boolean;
  actualizarCantidad: (
    productoId: number,
    cantidad: number,
    stockActual?: number
  ) => boolean;
  quitarProducto: (productoId: number) => void;
  vaciarCarrito: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregarProducto: (producto, cantidad = 1) => {
        if (
          !producto.activo ||
          !producto.disponible ||
          producto.stock < 1 ||
          !Number.isInteger(cantidad) ||
          cantidad < 1
        ) {
          return false;
        }

        const existente = get().items.find(
          (item) => item.producto_id === producto.id
        );

        const cantidadActual = existente?.cantidad ?? 0;

        if (cantidadActual + cantidad > producto.stock) {
          return false;
        }

        set((state) => {
          if (existente) {
            return {
              items: state.items.map((item) =>
                item.producto_id === producto.id
                  ? {
                      ...item,
                      nombre: producto.nombre,
                      precio_base: producto.precio_base,
                      imagen_url: producto.imagen_url,
                      stock: producto.stock,
                      cantidad: item.cantidad + cantidad,
                    }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_base: producto.precio_base,
                imagen_url: producto.imagen_url,
                stock: producto.stock,
                cantidad,
              },
            ],
          };
        });

        return true;
      },

      actualizarCantidad: (productoId, cantidad, stockActual) => {
        const item = get().items.find(
          (actual) => actual.producto_id === productoId
        );

        const stockDisponible = stockActual ?? item?.stock ?? 0;

        if (
          !item ||
          !Number.isInteger(cantidad) ||
          cantidad < 1 ||
          cantidad > stockDisponible
        ) {
          return false;
        }

        set((state) => ({
          items: state.items.map((actual) =>
            actual.producto_id === productoId
              ? {
                  ...actual,
                  cantidad,
                  stock: stockDisponible,
                }
              : actual
          ),
        }));

        return true;
      },

      quitarProducto: (productoId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.producto_id !== productoId
          ),
        }));
      },

      vaciarCarrito: () => set({ items: [] }),
    }),
    {
      name: 'food-store-carrito',
      storage: createJSONStorage(() => localStorage),
    }
  )
);