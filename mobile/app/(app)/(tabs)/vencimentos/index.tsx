import { useEffect, useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { BackLink, EmptyState, ScreenTitle, VencimentoRow, toneOf } from '@/components/ui';
import { listarVencimentos } from '@/api/documentos';
import { Documento } from '@/api/types';
import { colors, fonts } from '@/constants/theme';
import { diasRestantes, formatContagem, metaVencimento, tituloVencimento } from '@/lib/format';
import { reagendarAlertasDocumentos } from '@/notifications/scheduleAlerts';
import { useAlertasStore } from '@/store/uiStore';

const JANELA_DIAS = 730;

export default function VencimentosScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['vencimentos', JANELA_DIAS],
    queryFn: () => listarVencimentos(JANELA_DIAS),
  });

  const { ativo: alertasAtivo, loaded, load, setAtivo } = useAlertasStore();

  useEffect(() => {
    load();
  }, [load]);

  const grupos = useMemo(() => {
    const itens = (data ?? [])
      .map((doc) => ({ doc, dias: diasRestantes(doc.dataValidade) }))
      .filter((item) => item.dias !== null && item.dias >= 0)
      .sort((a, b) => a.dias! - b.dias!);

    const nesteMes: typeof itens = [];
    const proximos90: typeof itens = [];
    const depois: typeof itens = [];
    for (const item of itens) {
      if (item.dias! <= 30) nesteMes.push(item);
      else if (item.dias! <= 90) proximos90.push(item);
      else depois.push(item);
    }
    return { nesteMes, proximos90, depois };
  }, [data]);

  async function alternarAlertas(valor: boolean) {
    await setAtivo(valor);
    if (valor && data) {
      await reagendarAlertasDocumentos(data);
    } else {
      await reagendarAlertasDocumentos([]);
    }
  }

  const semItens = !grupos.nesteMes.length && !grupos.proximos90.length && !grupos.depois.length;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={isRefetching || isLoading} onRefresh={refetch} tintColor={colors.accentText} />}
    >
      <View style={{ gap: 18, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 24 }}>
        <View style={{ gap: 5 }}>
          <BackLink label="Início" onPress={() => router.back()} />
          <ScreenTitle>Vencimentos</ScreenTitle>
        </View>

        <View style={styles.aviso}>
          <View style={styles.avisoDot} />
          <Text style={styles.avisoText}>Avisos locais em 30, 15 e 7 dias antes de cada prazo</Text>
          <Pressable
            onPress={() => alternarAlertas(!alertasAtivo)}
            style={[styles.switchTrack, { justifyContent: alertasAtivo && loaded ? 'flex-end' : 'flex-start' }]}
          >
            <View style={styles.switchKnob} />
          </Pressable>
        </View>

        {semItens ? (
          <EmptyState message="Nenhum vencimento cadastrado" />
        ) : (
          <>
            {grupos.nesteMes.length > 0 && (
              <View style={{ gap: 9 }}>
                <Text style={[styles.grupoLabel, { color: colors.danger }]}>Neste mês</Text>
                {grupos.nesteMes.map((item, idx) => (
                  <VencimentoItem key={item.doc.id} doc={item.doc} dias={item.dias!} destaque={idx === 0} router={router} />
                ))}
              </View>
            )}

            {grupos.proximos90.length > 0 && (
              <View style={{ gap: 9 }}>
                <Text style={[styles.grupoLabel, { color: colors.warn }]}>Próximos 90 dias</Text>
                {grupos.proximos90.map((item) => (
                  <VencimentoRow
                    key={item.doc.id}
                    titulo={tituloVencimento(item.doc)}
                    meta={metaVencimento(item.doc)}
                    contagem={formatContagem(item.dias)}
                    tone={toneOf(item.dias)}
                    onPress={() => router.push(`/(app)/documentos/${item.doc.id}`)}
                  />
                ))}
              </View>
            )}

            {grupos.depois.length > 0 && (
              <View style={{ gap: 9 }}>
                <Text style={[styles.grupoLabel, { color: colors.textMuted }]}>Depois</Text>
                {grupos.depois.map((item) => (
                  <VencimentoRow
                    key={item.doc.id}
                    titulo={tituloVencimento(item.doc)}
                    meta={metaVencimento(item.doc)}
                    contagem={formatContagem(item.dias)}
                    tone={toneOf(item.dias)}
                    onPress={() => router.push(`/(app)/documentos/${item.doc.id}`)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function VencimentoItem({ doc, dias, destaque, router }: { doc: Documento; dias: number; destaque: boolean; router: ReturnType<typeof useRouter> }) {
  if (!destaque) {
    return (
      <VencimentoRow
        titulo={tituloVencimento(doc)}
        meta={metaVencimento(doc)}
        contagem={formatContagem(dias)}
        tone={toneOf(dias)}
        onPress={() => router.push(`/(app)/documentos/${doc.id}`)}
      />
    );
  }
  return (
    <View style={styles.destaqueCard}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ gap: 3, flex: 1 }}>
          <Text style={styles.destaqueTitulo}>{tituloVencimento(doc)}</Text>
          <Text style={styles.destaqueMeta}>{metaVencimento(doc)}</Text>
        </View>
        <Text style={styles.destaqueContagem}>{formatContagem(dias)}</Text>
      </View>
      <Pressable onPress={() => router.push('/(app)/documentos/novo')} style={styles.renovarBtn}>
        <Text style={styles.renovarBtnText}>INICIAR RENOVAÇÃO</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  aviso: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 11,
    backgroundColor: colors.accentWashBg,
    borderWidth: 1,
    borderColor: colors.accentWashBorder,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  avisoDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: colors.accentText },
  avisoText: { flex: 1, fontSize: 12.5, lineHeight: 17, color: 'rgba(236,239,236,.75)', fontFamily: fonts.sans },
  switchTrack: { width: 38, height: 22, borderRadius: 99, backgroundColor: colors.accent, padding: 2, flexDirection: 'row' as const },
  switchKnob: { width: 18, height: 18, borderRadius: 99, backgroundColor: colors.onAccent },
  grupoLabel: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.68, textTransform: 'uppercase' as const },
  destaqueCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(217,127,98,0.3)',
    borderLeftWidth: 2,
    borderLeftColor: colors.dangerBar,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  destaqueTitulo: { fontSize: 14.5, fontFamily: fonts.sansMedium, color: colors.text },
  destaqueMeta: { fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted },
  destaqueContagem: { fontFamily: fonts.monoSemiBold, fontSize: 11, color: colors.danger },
  renovarBtn: { alignSelf: 'flex-start' as const, backgroundColor: colors.accent, borderRadius: 7, paddingHorizontal: 11, paddingVertical: 8 },
  renovarBtnText: { fontFamily: fonts.monoSemiBold, fontSize: 10, letterSpacing: 0.8, color: colors.onAccent },
};
