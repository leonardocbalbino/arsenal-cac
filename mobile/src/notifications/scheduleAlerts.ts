import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Documento } from '@/api/types';
import { dataCalendarioLocal, formatDataBr } from '@/lib/format';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const DIAS_ANTECEDENCIA = [30, 15, 7];

export async function solicitarPermissaoNotificacoes() {
  // Notificações locais agendadas não são suportadas na web.
  if (Platform.OS === 'web') return false;

  const { status } = await Notifications.requestPermissionsAsync();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('vencimentos', {
      name: 'Vencimento de documentos',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return status === 'granted';
}

const rotuloTipo: Record<string, string> = {
  CR: 'CR',
  CRAF: 'CRAF',
  GUIA_TRAFEGO: 'Guia de Tráfego',
  ATESTADO_SANIDADE: 'Atestado de Sanidade',
  EXAME_PSICOLOGICO: 'Exame Psicológico',
  COMPROVANTE_RESIDENCIA: 'Comprovante de Residência',
  TITULO_FILIACAO: 'Título de Filiação',
  OUTRO: 'Documento',
};

/**
 * Reagenda (do zero) as notificações locais de vencimento a partir da lista
 * de documentos vinda do backend. Rodar sempre que a lista de documentos
 * mudar, para o app funcionar mesmo offline / sem depender de push do servidor.
 */
export async function reagendarAlertasDocumentos(documentos: Documento[]) {
  // Notificações locais agendadas não são suportadas na web.
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const documento of documentos) {
    if (!documento.dataValidade) continue;
    const validade = dataCalendarioLocal(documento.dataValidade);

    for (const dias of DIAS_ANTECEDENCIA) {
      const disparo = new Date(validade);
      disparo.setDate(disparo.getDate() - dias);
      disparo.setHours(9, 0, 0, 0);

      if (disparo.getTime() <= Date.now()) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Documento próximo do vencimento',
          body: `${rotuloTipo[documento.tipo] ?? documento.tipo} vence em ${dias} dias (${formatDataBr(documento.dataValidade)})`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: disparo,
        },
      });
    }
  }
}
