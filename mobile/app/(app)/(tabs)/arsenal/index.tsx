import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Badge, EmptyState, FAB, MonoLabel, ScreenTitle, StripedPlaceholder, Tone, ls, toneOf } from '@/components/ui';
import { listarArmas, listarManutencoes } from '@/api/armas';
import { resolveUploadUrl } from '@/api/client';
import { Arma } from '@/api/types';
import { colors, fonts } from '@/constants/theme';
import { diasRestantes, formatDataMono, formatMesAno } from '@/lib/format';

function statusArma(arma: Arma): { label: string; tone: Tone } {
  const dias = diasRestantes(arma.crafValidade);
  if (dias === null) return { label: 'SEM GT', tone: 'neutral' };
  if (dias < 0) return { label: 'GT VENCIDA', tone: 'danger' };
  if (dias <= 90) return { label: `GT ${dias} DIAS`, tone: toneOf(dias) };
  return { label: 'GUIA OK', tone: 'accent' };
}

function ArmaCard({ item, primeira, onPress }: { item: Arma; primeira: boolean; onPress: () => void }) {
  const status = statusArma(item);
  const manutencoes = useQuery({ queryKey: ['manutencoes', item.id], queryFn: () => listarManutencoes(item.id) });
  const ultimaManutencao = [...(manutencoes.data ?? [])].sort((a, b) => (a.data > b.data ? -1 : 1))[0];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { gap: primeira ? 13 : 11 }, status.tone === 'danger' && { borderLeftWidth: 2, borderLeftColor: colors.dangerBar }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ gap: 4, flex: 1 }}>
          <Text style={{ fontSize: 16, fontFamily: fonts.sansSemiBold, color: colors.text, letterSpacing: ls(16, -0.01) }}>
            {item.marca} {item.modelo}
          </Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>
            {item.categoria} · {item.calibre} · SIGMA {item.numeroSerie}
          </Text>
        </View>
        <Badge text={status.label} tone={status.tone} />
      </View>

      {primeira &&
        (item.fotoUrl ? (
          <Image source={{ uri: resolveUploadUrl(item.fotoUrl)! }} style={{ height: 64, borderRadius: 10 }} resizeMode="cover" />
        ) : (
          <StripedPlaceholder label="FOTO DA ARMA" style={{ height: 64, borderRadius: 10 }} />
        ))}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted }}>
          {item.crafValidade ? `GT ATÉ ${formatDataMono(item.crafValidade)}` : 'SEM GUIA DE TRÁFEGO'}
        </Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted }}>
          {ultimaManutencao ? `MANUT. ${formatMesAno(ultimaManutencao.data)}` : 'SEM MANUT.'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ArsenalListScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['armas'], queryFn: listarArmas });
  const [busca, setBusca] = useState('');

  const armas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return data ?? [];
    return (data ?? []).filter((a) =>
      [a.marca, a.modelo, a.calibre, a.numeroSerie].some((v) => v?.toLowerCase().includes(termo))
    );
  }, [data, busca]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={armas}
        keyExtractor={(item) => item.id}
        refreshing={isRefetching || isLoading}
        onRefresh={refetch}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 64, paddingBottom: 24, gap: 16 }}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            <ScreenTitle
              action={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <MonoLabel style={{ fontSize: 11 }}>{armas.length} ARMA{armas.length === 1 ? '' : 'S'}</MonoLabel>
                  <FAB onPress={() => router.push('/(app)/arsenal/novo')} />
                </View>
              }
            >
              Arsenal
            </ScreenTitle>
            <View style={styles.search}>
              <View style={styles.searchDot} />
              <TextInput
                value={busca}
                onChangeText={setBusca}
                placeholder="Buscar por modelo, calibre ou SIGMA"
                placeholderTextColor="rgba(236,239,236,.35)"
                style={styles.searchInput}
              />
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState message="Nenhuma arma cadastrada ainda" />}
        renderItem={({ item, index }) => (
          <ArmaCard item={item} primeira={index === 0} onPress={() => router.push(`/(app)/arsenal/${item.id}`)} />
        )}
      />
    </View>
  );
}

const styles = {
  search: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  searchDot: { width: 11, height: 11, borderRadius: 99, borderWidth: 1.5, borderColor: 'rgba(236,239,236,.4)' },
  searchInput: { flex: 1, fontSize: 13.5, color: colors.text, fontFamily: fonts.sans, padding: 0 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 15 },
};
