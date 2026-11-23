import { api, obtenerMensajeError } from '@/shared/api/api';
import type { UsuarioAdmin } from '../types/auth';

// Listar usuarios
export async function getUsuarios(): Promise<UsuarioAdmin[]> {
  try {
    const { data } = await api.get<UsuarioAdmin[]>('/admin/usuarios');
    return data;
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al cargar usuarios'),
      { cause: error }
    );
  }
}

// Activar usuario
export async function activarUsuario(id: number): Promise<void> {
  try {
    await api.post(`/admin/usuarios/${id}/activar`);
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al activar usuario'),
      { cause: error }
    );
  }
}

// Desactivar usuario
export async function desactivarUsuario(id: number): Promise<void> {
  try {
    await api.post(`/admin/usuarios/${id}/desactivar`);
  } catch (error) {
    throw new Error(
      obtenerMensajeError(error, 'Error al desactivar usuario'),
      { cause: error }
    );
  }
}