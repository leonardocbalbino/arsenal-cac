import { apiClient } from './client';
import { Documento, EntidadeAlvo, TipoDocumento } from './types';

export interface DocumentoInput {
  tipo: TipoDocumento;
  entidadeAlvo: EntidadeAlvo;
  numero?: string;
  armaId?: string;
  clubeId?: string;
  dataEmissao?: string;
  dataValidade?: string;
  observacoes?: string;
  arquivo?: File;
}

function toFormData(input: DocumentoInput) {
  const form = new FormData();
  form.append('tipo', input.tipo);
  form.append('entidadeAlvo', input.entidadeAlvo);
  if (input.numero) form.append('numero', input.numero);
  if (input.armaId) form.append('armaId', input.armaId);
  if (input.clubeId) form.append('clubeId', input.clubeId);
  if (input.dataEmissao) form.append('dataEmissao', input.dataEmissao);
  if (input.dataValidade) form.append('dataValidade', input.dataValidade);
  if (input.observacoes) form.append('observacoes', input.observacoes);
  if (input.arquivo) form.append('arquivo', input.arquivo);
  return form;
}

export async function listarDocumentos() {
  const { data } = await apiClient.get<Documento[]>('/documentos');
  return data;
}

export async function listarVencimentos(dias = 30) {
  const { data } = await apiClient.get<Documento[]>('/documentos/vencimentos', { params: { dias } });
  return data;
}

export async function obterDocumento(id: string) {
  const { data } = await apiClient.get<Documento>(`/documentos/${id}`);
  return data;
}

export async function criarDocumento(input: DocumentoInput) {
  const { data } = await apiClient.post<Documento>('/documentos', toFormData(input), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function atualizarDocumento(id: string, input: DocumentoInput) {
  const { data } = await apiClient.patch<Documento>(`/documentos/${id}`, toFormData(input), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function removerDocumento(id: string) {
  await apiClient.delete(`/documentos/${id}`);
}
