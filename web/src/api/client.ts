import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().signOut();
    }
    return Promise.reject(error);
  },
);

/** Resolve um caminho relativo do backend (ex: "/uploads/foto.png") em uma
 * URL absoluta. Arquivos enviados (fotos, anexos) sempre chegam da API como
 * caminho relativo — sem isso, `<img>` tenta carregar em relação à origem
 * errada (a do próprio app web) e a imagem nunca aparece. */
export function resolveUploadUrl(caminho: string | null | undefined): string | null {
  if (!caminho) return null;
  if (/^https?:\/\//.test(caminho)) return caminho;
  return `${API_URL.replace('/api', '')}${caminho}`;
}
