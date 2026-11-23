import { api } from '@/shared/api/api';

import type {
  Usuario,
  RegistroUsuario,
} from '../types/auth';

// Iniciar sesión
export async function login(
  username: string,
  password: string
): Promise<void> {
  const formData = new URLSearchParams();

  formData.append('username', username);
  formData.append('password', password);

  await api.post('/auth/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

// Registrar usuario
export async function registrar(
  data: RegistroUsuario
): Promise<Usuario> {
  const response = await api.post<Usuario>(
    '/auth/register',
    data
  );

  return response.data;
}

// Obtener perfil
export async function obtenerPerfil(): Promise<Usuario> {
  const response = await api.get<Usuario>('/auth/me');

  return response.data;
}

// Cerrar sesión
export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

