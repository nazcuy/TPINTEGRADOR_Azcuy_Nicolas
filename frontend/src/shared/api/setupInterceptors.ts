import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { api } from './api';
import { useAuthStore } from '@/features/auth';
import { useNotificationStore } from '@/store/notificationStore';

let interceptorsConfigurados = false;

export const setupInterceptors = () => {
  if (interceptorsConfigurados) {
    return;
  }

  api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig | undefined;
      const url = config?.url ?? '';

      const detail = error.response?.data &&
        typeof error.response.data === 'object'
        ? (error.response.data as { detail?: unknown }).detail
        : undefined;

      const sesionExpirada =
        error.response?.status === 401 &&
        !url.includes('/auth/token') &&
        !url.includes('/auth/me');

      const cuentaDesactivada =
        error.response?.status === 400 &&
        detail === 'Cuenta de usuario desactivada';

      if (sesionExpirada || cuentaDesactivada) {
        useAuthStore.setState({
          usuario: null,
          autenticado: false,
          inicializado: true,
        });
      }

      if (error.response?.status === 403) {
        useNotificationStore
          .getState()
          .showNotification(
            'Acceso denegado: no tenés permisos para realizar esta acción.'
          );
      }

      return Promise.reject(error);
    }
  );

  interceptorsConfigurados = true;
};