import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Chip, EmptyState, GhostFAB, ScreenTitle, StripedPlaceholder } from '@/components/ui';
import { listarDocumentos } from '@/api/documentos';
import { TipoDocumento } from '@/api/types';
import { colors, fonts } from '@/constants/theme';
import { diasRestantes, formatDataMono, rotuloTipo } from '@/lib/format';

const FILTROS: { chave: string; label: string; tipos: TipoDocumento[] | null }[] = [
  { chave: 'todos', label: 'TODOS', tipos: null },
  { chave: 'cr', label: 'CR', tipos: ['CR', 'CRAF'] },
  { chave: 'guias', label: 'GUIAS', tipos: ['GUIA_TRAFEGO'] },
  { chave: 'clube', label: 'CLUBE', tipos: ['TITULO_FILIACAO'] },
  { chave: 'psico', label: 'PSICO', tipos: ['EXAME_PSICOLOGICO', 'ATESTADO_SANIDADE'] },
];

export default function DocumentosListScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['documentos'], queryFn: listarDocumentos });
  const [filtro, setFiltro] = useState('todos');

  const documentos = useMemo(() => {
    const ativo = FILTROS.find((f) => f.chave === filtro);
    if (!ativo?.tipos) return data ?? [];
    return (data ?? []).filter((d) => ativo.tipos!.includes(d.tipo));
  }, [data, filtro]);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={documentos}
      keyExtractor={(item) => item.id}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 64, paddingBottom: 24, gap: 10 }}
      ListHeaderComponent={
        <View style={{ gap: 16, marginBottom: 10 }}>
          <ScreenTitle action={<GhostFAB onPress={() => router.push('/(app)/documentos/novo')} />}>Documentos</ScreenTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
            {FILTROS.map((f) => (
              <Chip
                key={f.chave}
                label={f.chave === 'todos' ? `TODOS · ${data?.length ?? 0}` : f.label}
                active={filtro === f.chave}
                onPress={() => setFiltro(f.chave)}
              />
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={<EmptyState message="Nenhum documento cadastrado ainda" />}
      renderItem={({ item }) => {
        const dias = diasRestantes(item.dataValidade);
        const extensao = item.arquivoUrl?.split('.').pop()?.toUpperCase();
        const vencendo = dias !== null && dias <= 30;
        const meta = item.dataValidade
          ? `${extensao ?? 'ARQUIVO'} · ${vencendo ? `vence em ${dias! < 0 ? '0' : dias} dias` : `val. ${formatDataMono(item.dataValidade)}`}`
          : extensao
            ? `${extensao} · sem validade`
            : 'Sem arquivo anexado';
        return (
          <Pressable onPress={() => router.push(`/(app)/documentos/${item.id}`)} style={styles.row}>
            <StripedPlaceholder label="" style={{ width: 32, height: 40, borderRadius: 4, borderWidth: 1, borderColor: colors.borderSoft }} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontSize: 14, fontFamily: fonts.sansMedium, color: colors.text }}>{rotuloTipo[item.tipo]}</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, color: vencendo ? colors.danger : 'rgba(236,239,236,.42)' }}>{meta}</Text>
            </View>
            <Text style={{ fontSize: 16, color: 'rgba(236,239,236,.3)' }}>›</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
};
