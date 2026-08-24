import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_URL } from './client';
import { useAuthStore } from '@/store/authStore';

async function baixarECompartilhar(caminho: string, nomeArquivo: string) {
  const token = useAuthStore.getState().accessToken;
  const destino = `${FileSystem.cacheDirectory}${nomeArquivo}`;
  const resultado = await FileSystem.downloadAsync(`${API_URL}${caminho}`, destino, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(resultado.uri);
  }
  return resultado.uri;
}

export function baixarDossie() {
  return baixarECompartilhar('/relatorios/dossie.pdf', 'dossie-cac.pdf');
}

export function baixarComprovanteHabitualidade() {
  return baixarECompartilhar('/relatorios/habitualidade.pdf', 'comprovante-habitualidade.pdf');
}
