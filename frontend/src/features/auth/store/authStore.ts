import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Usuario } from '../types/auth';

import {
  login,
  logout,
  obtenerPerfil,
} from '../api/auth';

import { obtenerMensajeError } from '@/shared/api/api';

interface AuthState {
  usuario: Usuario | null;
  autenticado: boolean;
  inicializado: boolean;
  cargando: boolean;
  error: string | null;

  inicializar: () => Promise<void>;
  iniciarSesion: (username: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  limpiarError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      autenticado: false,
      inicializado: false,
      cargando: false,
      error: null,

      // Verificar la sesión real utilizando la cookie HttpOnly.
      inicializar: async () => {
        try {
          const usuario = await obtenerPerfil();

          set({
            usuario,
            autenticado: true,
            inicializado: true,
            error: null,
          });
        } catch {
          set({
            usuario: null,
            autenticado: false,
            inicializado: true,
            error: null,
          });
        }
      },

      // Iniciar sesión y recuperar el perfil del usuario.
      iniciarSesion: async (username, password) => {
        set({ cargando: true, error: null });

        try {
          await login(username, password);

          const usuario = await obtenerPerfil();

          set({
            usuario,
            autenticado: true,
            cargando: false,
            error: null,
          });
        } catch (error) {
          const mensaje = obtenerMensajeError(
            error,
            'Error al iniciar sesión'
          );

          set({
            usuario: null,
            autenticado: false,
            cargando: false,
            error: mensaje,
          });

          throw error;
        }
      },

      // Cerrar la sesión y limpiar el estado local.
      cerrarSesion: async () => {
        set({ cargando: true, error: null });

        try {
          await logout();
        } finally {
          set({
            usuario: null,
            autenticado: false,
            cargando: false,
            error: null,
          });
        }
      },

      limpiarError: () => set({ error: null }),
    }),
    {
      name: 'food-store-auth',
      storage: createJSONStorage(() => localStorage),

      // No persistir autenticación, estado de carga ni tokens.
      partialize: (state) => ({
        usuario: state.usuario,
      }),
    }
  )
);