import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Card,
  FAB,
  MonoLabel,
  ScreenTitle,
  SegmentedControl,
  ls,
} from '@/components/ui';
import { listarSessoesTreino, obterStatusHabitualidade } from '@/api/sessoesTreino';
import { baixarComprovanteHabitualidade } from '@/api/relatorios';
import { colors, fonts, radius } from '@/constants/theme';
import { useToastStore, useTrainingSheetStore } from '@/store/uiStore';

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function ultimos12Meses(sessoes: { data: string; municaoGastaQtd: number | null }[]) {
  const agora = new Date();
  const meses = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth() - (11 - i), 1);
    return { chave: `${d.getFullYear()}-${d.getMonth()}`, label: MESES[d.getMonth()], sessoes: 0, disparos: 0 };
  });
  for (const s of sessoes) {
    // s.data é uma data sem hora (UTC-meia-noite) — usar getters UTC para
    // recuperar o mês calendário pretendido, não o mês local de quem vê a tela.
    const d = new Date(s.data);
    const chave = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const mes = meses.find((m) => m.chave === chave);
    if (mes) {
      mes.sessoes += 1;
      mes.disparos += s.municaoGastaQtd ?? 0;
    }
  }
  return meses;
}

export default function HabitualidadeScreen() {
  const openSheet = useTrainingSheetStore((s) => s.openSheet);
  const showToast = useToastStore((s) => s.showToast);
  const [periodo, setPeriodo] = useState<'semestre' | 'ano'>('semestre');

  const status = useQuery({ queryKey: ['habitualidade'], queryFn: obterStatusHabitualidade });
  const sessoes = useQuery({ queryKey: ['sessoes-treino'], queryFn: listarSessoesTreino });

  const meses = useMemo(() => ultimos12Meses(sessoes.data ?? []), [sessoes.data]);
  const janelaMeses = periodo === 'semestre' ? 6 : 12;
  const mesesNaJanela = meses.slice(12 - janelaMeses);
  const totalSessoes = mesesNaJanela.reduce((acc, m) => acc + m.sessoes, 0);
  const totalDisparos = mesesNaJanela.reduce((acc, m) => acc + m.disparos, 0);
  const maxSessoes = Math.max(1, ...meses.map((m) => m.sessoes));

  async function gerarPdf() {
    await baixarComprovanteHabitualidade();
    showToast('PDF gerado e salvo em Documentos');
  }

  const sessoesOrdenadas = [...(sessoes.data ?? [])].sort((a, b) => (a.data > b.data ? -1 : 1));

  return (
    <ScrollView style={{ backgroundColor: colors.bg }}>
      <View style={{ gap: 18, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 24 }}>
        <ScreenTitle action={<FAB onPress={() => openSheet()} />}>Habitualidade</ScreenTitle>

        <SegmentedControl
          value={periodo}
          onChange={setPeriodo}
          options={[
            { value: 'semestre', label: 'Semestre atual' },
            { value: 'ano', label: 'Últimos 12 meses' },
          ]}
        />

        <Card style={{ gap: 16, borderRadius: radius.featureCard, padding: 16, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ gap: 4 }}>
              <MonoLabel style={{ fontSize: 10.5, letterSpacing: ls(10.5, 0.16), textTransform: 'uppercase' }}>Sessões registradas</MonoLabel>
              <Text style={{ fontSize: 15, fontFamily: fonts.sansMedium, color: colors.text }}>
                {totalSessoes} sessões · {totalDisparos} disparos
              </Text>
            </View>
            {status.data && (
              <Text
                style={{
                  fontFamily: fonts.monoSemiBold,
                  fontSize: 11,
                  color: status.data.emDia ? colors.accentText : colors.warn,
                  paddingBottom: 2,
                }}
              >
                {status.data.emDia ? 'EM DIA' : `FALTAM ${status.data.faltam}`}
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 104 }}>
            {meses.map((mes, i) => {
              const naJanela = i >= 12 - janelaMeses;
              const atual = i === 11;
              const altura = maxSessoes > 0 ? 12 + (mes.sessoes / maxSessoes) * 92 : 12;
              const cor = atual ? 'rgba(31,92,74,0.5)' : naJanela ? colors.accent : colors.chartTrack;
              return (
                <View key={mes.chave} style={{ flex: 1, gap: 6, alignItems: 'center' }}>
                  <View style={{ width: '100%', height: altura, backgroundColor: cor, borderRadius: 4 }} />
                  <Text style={{ fontFamily: fonts.mono, fontSize: 9, color: atual ? 'rgba(236,239,236,.55)' : colors.textFaint }}>
                    {mes.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Pressable onPress={gerarPdf} style={styles.pdfCard}>
          <View style={{ gap: 3 }}>
            <Text style={{ fontSize: 14, fontFamily: fonts.sansMedium, color: colors.text }}>Comprovante de habitualidade</Text>
            <Text style={{ fontSize: 11.5, color: colors.textMuted, fontFamily: fonts.sans }}>
              {periodo === 'semestre' ? 'PDF do semestre · pronto para fiscalização' : 'PDF dos últimos 12 meses · pronto para fiscalização'}
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.monoSemiBold, fontSize: 11, color: colors.accentText }}>GERAR</Text>
        </Pressable>

        <View style={{ gap: 2 }}>
          <MonoLabel style={{ fontSize: 10.5, letterSpacing: ls(10.5, 0.16), textTransform: 'uppercase', paddingBottom: 8 }}>Sessões</MonoLabel>
          {sessoesOrdenadas.length ? (
            sessoesOrdenadas.map((item, idx) => {
              const d = new Date(item.data);
              const calibre = item.armas[0]?.arma.calibre;
              return (
                <View
                  key={item.id}
                  style={[styles.sessaoRow, idx === sessoesOrdenadas.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={{ width: 42, alignItems: 'center', gap: 1 }}>
                    <Text style={{ fontSize: 17, fontFamily: fonts.sansSemiBold, color: colors.text, letterSpacing: ls(17, -0.02) }}>
                      {String(d.getUTCDate()).padStart(2, '0')}
                    </Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, color: colors.textMuted }}>{MESES[d.getUTCMonth()]}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ fontSize: 14, fontFamily: fonts.sansMedium, color: colors.text }}>{item.clube?.nome ?? 'Clube não informado'}</Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>
                      {[calibre, item.municaoGastaQtd ? `${item.municaoGastaQtd} disparos` : null, d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Badge text={item.comprovanteUrl ? 'PDF' : 'SEM PDF'} tone={item.comprovanteUrl ? 'accent' : 'neutral'} />
                </View>
              );
            })
          ) : (
            <Card>
              <Text style={{ color: colors.textMuted, fontFamily: fonts.sans }}>Nenhuma sessão de treino registrada</Text>
            </Card>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = {
  pdfCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(78,156,130,0.45)',
    borderStyle: 'dashed' as const,
    borderRadius: 14,
    padding: 14,
  },
  sessaoRow: {
    flexDirection: 'row' as const,
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    alignItems: 'center' as const,
  },
};
