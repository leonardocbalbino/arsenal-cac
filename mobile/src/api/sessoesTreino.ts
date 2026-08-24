import { apiClient } from './client';
import { SessaoTreino, StatusHabitualidade } from './types';

export interface SessaoTreinoInput {
  data: string;
  clubeId?: string;
  armasIds: string[];
  municaoGastaQtd?: number;
  observacoes?: string;
  comprovante?: { uri: string; name: string; type: string };
}

export async function listarSessoesTreino() {
  const { data } = await apiClient.get<SessaoTreino[]>('/sessoes-treino');
  return data;
}

export async function obterStatusHabitualidade() {
  const { data } = await apiClient.get<StatusHabitualidade>('/sessoes-treino/habitualidade');
  return data;
}

export async function criarSessaoTreino(input: SessaoTreinoInput) {
  const form = new FormData();
  form.append('data', input.data);
  if (input.clubeId) form.append('clubeId', input.clubeId);
  form.append('armasIds', JSON.stringify(input.armasIds));
  if (input.municaoGastaQtd !== undefined) form.append('municaoGastaQtd', String(input.municaoGastaQtd));
  if (input.observacoes) form.append('observacoes', input.observacoes);
  if (input.comprovante) {
    // @ts-expect-error React Native FormData aceita este formato de arquivo
    form.append('comprovante', { uri: input.comprovante.uri, name: input.comprovante.name, type: input.comprovante.type });
  }
  const { data } = await apiClient.post<SessaoTreino>('/sessoes-treino', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function removerSessaoTreino(id: string) {
  await apiClient.delete(`/sessoes-treino/${id}`);
}
