export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  disabled: boolean;
  created_at: string;
}

export interface RegistroUsuario {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export type UsuarioAdmin = Usuario;

