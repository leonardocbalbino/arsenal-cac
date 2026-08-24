import { useEffect } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  BarRow,
  Card,
  EmDiaPill,
  GradientCard,
  MonoLabel,
  SectionHeader,
  VencimentoRow,
  ls,
  toneOf,
} from '@/components/ui';
import { getDashboard, getPerfil } from '@/api/auth';
import { obterStatusHabitualidade } from '@/api/sessoesTreino';
import { listarVencimentos } from '@/api/documentos';
import { saldoPorCalibre } from '@/api/municao';
import { colors, fonts } from '@/constants/theme';
import { diasRestantes, formatContagem, formatFimPeriodo, metaVencimento, tituloVencimento } from '@/lib/format';
import { reagendarAlertasDocumentos, solicitarPermissaoNotificacoes } from '@/notifications/scheduleAlerts';
import { useAlertasStore, useTrainingSheetStore } from '@/store/uiStore';

function iniciais(nome?: string) {
  if (!nome) return '··';
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || partes[0]?.slice(0, 2).toUpperCase();
}

export default function DashboardScreen() {
  const router = useRouter();
  const openSheet = useTrainingSheetStore((s) => s.openSheet);
  const alertasAtivo = useAlertasStore((s) => s.ativo);
  const loadAlertas = useAlertasStore((s) => s.load);

  const perfil = useQuery({ queryKey: ['perfil'], queryFn: getPerfil });
  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const habitualidade = useQuery({ queryKey: ['habitualidade'], queryFn: obterStatusHabitualidade });
  const vencimentos = useQuery({ queryKey: ['vencimentos', 90], queryFn: () => listarVencimentos(90) });
  const municao = useQuery({ queryKey: ['municao-saldo'], queryFn: saldoPorCalibre });

  useEffect(() => {
    loadAlertas();
    solicitarPermissaoNotificacoes();
  }, [loadAlertas]);

  useEffect(() => {
    if (vencimentos.data && alertasAtivo) {
      reagendarAlertasDocumentos(vencimentos.data);
    }
  }, [vencimentos.data, alertasAtivo]);

  const refrescando =
    perfil.isRefetching || dashboard.isRefetching || habitualidade.isRefetching || vencimentos.isRefetching || municao.isRefetching;

  function refrescar() {
    perfil.refetch();
    dashboard.refetch();
    habitualidade.refetch();
    vencimentos.refetch();
    municao.refetch();
  }

  const hab = habitualidade.data;
  const totalBarras = hab?.minimoSessoesExigido ?? 4;
  const barras = Array.from({ length: totalBarras }, (_, i) => ({ filled: (hab?.sessoesNoPeriodo ?? 0) > i }));

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={colors.accentText} />}
    >
      <View style={{ gap: 18, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ gap: 3 }}>
            <Text style={{ fontSize: 22, fontFamily: fonts.sansSemiBold, color: colors.text, letterSpacing: ls(22, -0.02) }}>
              {perfil.data?.nome ?? '···'}
            </Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: ls(11, 0.06), color: colors.textMuted }}>
              {[perfil.data?.crNumero ? `CR ${perfil.data.crNumero}` : null, perfil.data?.categoriaCac].filter(Boolean).join(' · ') || 'PERFIL'}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/(app)/configuracoes')} style={styles.avatar}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: 'rgba(236,239,236,.6)' }}>{iniciais(perfil.data?.nome)}</Text>
          </Pressable>
        </View>

        <GradientCard>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <MonoLabel style={{ fontSize: 10.5, letterSpacing: ls(10.5, 0.16), textTransform: 'uppercase' }}>Habitualidade</MonoLabel>
            <EmDiaPill emDia={hab?.emDia ?? true} faltam={hab?.faltam} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <Text style={{ fontSize: 44, fontFamily: fonts.sansSemiBold, color: colors.text, lineHeight: 40, letterSpacing: ls(44, -0.03) }}>
              {hab?.sessoesNoPeriodo ?? '-'}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, fontFamily: fonts.sans, paddingBottom: 4 }}>
              / {hab?.minimoSessoesExigido ?? '-'} sessões no ano
            </Text>
          </View>
          <BarRow segments={barras} />
          <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.sans }}>
            {hab ? `${formatFimPeriodo(hab.inicioPeriodo, hab.periodoMeses)} · comprovante gerado automaticamente` : 'Carregando...'}
          </Text>
        </GradientCard>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={() => openSheet()} style={[styles.quickAction, { backgroundColor: colors.accent }]}>
            <Text style={{ fontSize: 18, fontFamily: fonts.sansSemiBold, color: colors.onAccent }}>+</Text>
            <Text style={{ fontSize: 12.5, fontFamily: fonts.sansSemiBold, color: colors.onAccent, lineHeight: 16 }}>Registrar{'\n'}treino</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(app)/carteiras')} style={styles.quickActionGhost}>
            <View style={{ width: 16, height: 11, borderWidth: 1.5, borderColor: 'rgba(236,239,236,.7)', borderRadius: 2 }} />
            <Text style={styles.quickActionGhostText}>Carteiras</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(app)/documentos')} style={styles.quickActionGhost}>
            <View style={{ width: 12, height: 15, borderWidth: 1.5, borderColor: 'rgba(236,239,236,.7)', borderRadius: 2 }} />
            <Text style={styles.quickActionGhostText}>Documentos</Text>
          </Pressable>
        </View>

        <View style={{ gap: 9 }}>
          <SectionHeader label="Vencimentos" actionLabel="Ver todos" onAction={() => router.push('/(app)/vencimentos')} />
          {vencimentos.data?.length ? (
            vencimentos.data.slice(0, 3).map((doc) => {
              const dias = diasRestantes(doc.dataValidade);
              return (
                <VencimentoRow
                  key={doc.id}
                  titulo={tituloVencimento(doc)}
                  meta={metaVencimento(doc)}
                  contagem={formatContagem(dias)}
                  tone={toneOf(dias)}
                  onPress={() => router.push('/(app)/vencimentos')}
                />
              );
            })
          ) : (
            <Card>
              <Text style={{ color: colors.textMuted, fontFamily: fonts.sans }}>Nenhum vencimento nos próximos 90 dias</Text>
            </Card>
          )}
        </View>

        <View style={{ gap: 9 }}>
          <SectionHeader label="Munição em estoque" actionLabel="Ver todos" onAction={() => router.push('/(app)/municao')} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {(municao.data ?? []).slice(0, 3).map((item) => (
              <Pressable key={item.calibre} onPress={() => router.push('/(app)/municao')} style={styles.ammoTile}>
                <MonoLabel style={{ fontSize: 10.5 }}>{item.calibre}</MonoLabel>
                <Text style={{ fontSize: 19, fontFamily: fonts.sansSemiBold, color: colors.text, letterSpacing: ls(19, -0.02) }}>{item.saldo}</Text>
                <Text style={{ fontSize: 10.5, color: colors.textFaint, fontFamily: fonts.sans }}>em estoque</Text>
              </Pressable>
            ))}
            {!municao.data?.length && (
              <Card style={{ flex: 1 }}>
                <Text style={{ color: colors.textMuted, fontFamily: fonts.sans }}>Nenhum registro de munição ainda</Text>
              </Card>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = {
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  quickAction: { flex: 1, borderRadius: 14, padding: 12, paddingTop: 14, minHeight: 88, justifyContent: 'space-between' as const, gap: 8 },
  quickActionGhost: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    paddingTop: 14,
    minHeight: 88,
    justifyContent: 'space-between' as const,
    gap: 8,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionGhostText: { fontSize: 12.5, fontFamily: fonts.sansMedium, color: 'rgba(236,239,236,.85)', lineHeight: 16 },
  ammoTile: {
    flexBasis: '31%' as const,
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    padding: 12,
    paddingBottom: 11,
    gap: 5,
  },
};
