import { apiClient } from './client';

async function baixarECompartilhar(caminho: string, nomeArquivo: string) {
  const { data } = await apiClient.get(caminho, { responseType: 'blob' });
  const url = window.URL.createObjectURL(data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function baixarDossie() {
  return baixarECompartilhar('/relatorios/dossie.pdf', 'dossie-cac.pdf');
}

export function baixarComprovanteHabitualidade() {
  return baixarECompartilhar('/relatorios/habitualidade.pdf', 'comprovante-habitualidade.pdf');
}
