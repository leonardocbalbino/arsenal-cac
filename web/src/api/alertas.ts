import { apiClient } from './client';
import { Alerta } from './types';

export async function listarAlertas() {
  const { data } = await apiClient.get<Alerta[]>('/alertas');
  return data;
}

export async function alternarAlerta(id: string, ativo: boolean) {
  const { data } = await apiClient.patch<Alerta>(`/alertas/${id}`, { ativo });
  return data;
}
