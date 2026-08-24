import { apiClient } from './client';
import { CategoriaCac, Dashboard, Usuario } from './types';

export interface RegisterInput {
  email: string;
  senha: string;
  nome: string;
  crNumero?: string;
  categoriaCac?: CategoriaCac;
}

export interface LoginInput {
  email: string;
  senha: string;
}

export async function register(input: RegisterInput) {
  const { data } = await apiClient.post<{ accessToken: string }>('/auth/register', input);
  return data;
}

export async function login(input: LoginInput) {
  const { data } = await apiClient.post<{ accessToken: string }>('/auth/login', input);
  return data;
}

export async function getPerfil() {
  const { data } = await apiClient.get<Usuario>('/perfil');
  return data;
}

export async function updatePerfil(input: Partial<Usuario>) {
  const { data } = await apiClient.patch<Usuario>('/perfil', input);
  return data;
}

export async function getDashboard() {
  const { data } = await apiClient.get<Dashboard>('/perfil/dashboard');
  return data;
}
