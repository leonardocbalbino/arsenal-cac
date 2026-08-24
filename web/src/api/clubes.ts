import { apiClient } from './client';
import { Clube, Filiacao } from './types';

export async function listarClubes() {
  const { data } = await apiClient.get<Clube[]>('/clubes');
  return data;
}

export async function criarClube(input: { nome: string; cbte?: string; cidade?: string; uf?: string }) {
  const { data } = await apiClient.post<Clube>('/clubes', input);
  return data;
}

export async function listarFiliacoes() {
  const { data } = await apiClient.get<Filiacao[]>('/filiacoes');
  return data;
}

export async function filiar(input: { clubeId: string; numeroSocio?: string; dataFiliacao?: string; dataValidade?: string }) {
  const { data } = await apiClient.post<Filiacao>('/filiacoes', input);
  return data;
}

export async function removerFiliacao(id: string) {
  await apiClient.delete(`/filiacoes/${id}`);
}
