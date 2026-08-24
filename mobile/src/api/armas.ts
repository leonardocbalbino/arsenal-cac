import { apiClient } from './client';
import { Arma, CategoriaArma } from './types';

export interface ArmaInput {
  marca: string;
  modelo: string;
  calibre: string;
  numeroSerie: string;
  categoria: CategoriaArma;
  crafNumero?: string;
  crafValidade?: string;
  fotoUrl?: string;
  foto?: { uri: string; name: string; type: string };
}

function toFormData(input: Partial<ArmaInput>) {
  const form = new FormData();
  if (input.marca !== undefined) form.append('marca', input.marca);
  if (input.modelo !== undefined) form.append('modelo', input.modelo);
  if (input.calibre !== undefined) form.append('calibre', input.calibre);
  if (input.numeroSerie !== undefined) form.append('numeroSerie', input.numeroSerie);
  if (input.categoria !== undefined) form.append('categoria', input.categoria);
  if (input.crafNumero) form.append('crafNumero', input.crafNumero);
  if (input.crafValidade) form.append('crafValidade', input.crafValidade);
  if (input.foto) {
    // @ts-expect-error React Native FormData aceita este formato de arquivo
    form.append('foto', { uri: input.foto.uri, name: input.foto.name, type: input.foto.type });
  }
  return form;
}

export async function listarArmas() {
  const { data } = await apiClient.get<Arma[]>('/armas');
  return data;
}

export async function obterArma(id: string) {
  const { data } = await apiClient.get<Arma>(`/armas/${id}`);
  return data;
}

export async function criarArma(input: ArmaInput) {
  const { data } = await apiClient.post<Arma>('/armas', toFormData(input), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function atualizarArma(id: string, input: Partial<ArmaInput>) {
  const { data } = await apiClient.patch<Arma>(`/armas/${id}`, toFormData(input), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function removerArma(id: string) {
  await apiClient.delete(`/armas/${id}`);
}

export interface Manutencao {
  id: string;
  armaId: string;
  data: string;
  descricao: string;
  custo: string | null;
}

export async function listarManutencoes(armaId: string) {
  const { data } = await apiClient.get<Manutencao[]>(`/armas/${armaId}/manutencoes`);
  return data;
}

export async function criarManutencao(armaId: string, input: { data: string; descricao: string; custo?: number }) {
  const { data } = await apiClient.post<Manutencao>(`/armas/${armaId}/manutencoes`, input);
  return data;
}
