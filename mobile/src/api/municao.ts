import { apiClient } from './client';
import { Municao } from './types';

export interface MunicaoInput {
  calibre: string;
  tipoMovimento: 'COMPRA' | 'USO';
  quantidade: number;
  armaId: string;
  lote?: string;
  data: string;
  observacoes?: string;
}

export async function listarMunicao() {
  const { data } = await apiClient.get<Municao[]>('/municao');
  return data;
}

export async function saldoPorCalibre() {
  const { data } = await apiClient.get<{ calibre: string; saldo: number }[]>('/municao/saldo');
  return data;
}

export async function criarMovimentoMunicao(input: MunicaoInput) {
  const { data } = await apiClient.post<Municao>('/municao', input);
  return data;
}

export async function removerMovimentoMunicao(id: string) {
  await apiClient.delete(`/municao/${id}`);
}
