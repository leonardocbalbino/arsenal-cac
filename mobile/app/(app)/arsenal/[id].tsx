import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { BackLink, Button, DateField, Field, LoadingState, StripedPlaceholder, ls } from '@/components/ui';
import { atualizarArma, criarManutencao, listarManutencoes, obterArma, removerArma } from '@/api/armas';
import { resolveUploadUrl } from '@/api/client';
import { baixarDossie } from '@/api/relatorios';
import { colors, fonts } from '@/constants/theme';
import { formatDataBr, formatMesAno } from '@/lib/format';
import { useToastStore, useTrainingSheetStore } from '@/store/uiStore';

export default function ArmaDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const openSheet = useTrainingSheetStore((s) => s.openSheet);
  const showToast = useToastStore((s) => s.showToast);

  const arma = useQuery({ queryKey: ['arma', id], queryFn: () => obterArma(id!), enabled: !!id });
  const manutencoes = useQuery({ queryKey: ['manutencoes', id], queryFn: () => listarManutencoes(id!), enabled: !!id });

  const [descricao, setDescricao] = useState('');
  const [dataManutencao, setDataManutencao] = useState('');

  const addManutencao = useMutation({
    mutationFn: () => criarManutencao(id!, { data: dataManutencao, descricao }),
    onSuccess: () => {
      setDescricao('');
      setDataManutencao('');
      queryClient.invalidateQueries({ queryKey: ['manutencoes', id] });
    },
  });

  const excluir = useMutation({
    mutationFn: () => removerArma(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armas'] });
      router.back();
    },
  });

  const trocarFoto = useMutation({
    mutationFn: (foto: { uri: string; name: string; type: string }) => atualizarArma(id!, { foto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arma', id] });
      queryClient.invalidateQueries({ queryKey: ['armas'] });
    },
  });

  async function selecionarFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos para trocar a imagem da arma.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (resultado.canceled || !resultado.assets?.[0]) return;
    const asset = resultado.assets[0];
    trocarFoto.mutate({ uri: asset.uri, name: asset.fileName ?? `arma-${Date.now()}.jpg`, type: asset.mimeType ?? 'image/jpeg' });
  }

  async function gerarDossie() {
    await baixarDossie();
    showToast('PDF gerado e salvo em Documentos');
  }

  if (!arma.data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: 64 }}>
        <LoadingState />
      </View>
    );
  }

  const a = arma.data;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }}>
      <View style={{ gap: 18, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 30 }}>
        <BackLink label="Arsenal" onPress={() => router.back()} />

        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 27, fontFamily: fonts.sansSemiBold, color: colors.text, letterSpacing: ls(27, -0.025) }}>
            {a.marca} {a.modelo}
          </Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>
            {a.categoria} · {a.calibre} · SIGMA {a.numeroSerie}
          </Text>
        </View>

        <Pressable onPress={selecionarFoto}>
          {a.fotoUrl ? (
            <Image source={{ uri: resolveUploadUrl(a.fotoUrl)! }} style={{ height: 150, borderRadius: 14 }} resizeMode="cover" />
          ) : (
            <StripedPlaceholder label={trocarFoto.isPending ? 'ENVIANDO...' : 'TOCAR PARA ADICIONAR FOTO'} style={{ height: 150 }} />
          )}
        </Pressable>

        <View style={styles.grid}>
          <View style={styles.gridCell}>
            <Text style={styles.gridLabel}>Nº CRAF</Text>
            <Text style={styles.gridValue}>{a.crafNumero ?? '-'}</Text>
          </View>
          <View style={[styles.gridCell, { borderLeftWidth: 1, borderLeftColor: colors.borderSoft }]}>
            <Text style={styles.gridLabel}>STATUS</Text>
            <Text style={styles.gridValue}>{a.ativa ? 'Ativa' : 'Inativa'}</Text>
          </View>
          <View style={[styles.gridCell, { borderTopWidth: 1, borderTopColor: colors.borderSoft }]}>
            <Text style={styles.gridLabel}>AQUISIÇÃO</Text>
            <Text style={styles.gridValue}>{new Date(a.criadoEm).toLocaleDateString('pt-BR')}</Text>
          </View>
          <View style={[styles.gridCell, { borderTopWidth: 1, borderTopColor: colors.borderSoft, borderLeftWidth: 1, borderLeftColor: colors.borderSoft }]}>
            <Text style={styles.gridLabel}>GUIA DE TRÁFEGO</Text>
            <Text style={[styles.gridValue, a.crafValidade && { color: colors.accentText }]}>
              {a.crafValidade ? formatDataBr(a.crafValidade) : '-'}
            </Text>
          </View>
        </View>

        <View style={{ gap: 9 }}>
          <Text style={styles.sectionLabel}>Histórico de manutenção</Text>
          {manutencoes.data?.length ? (
            manutencoes.data.map((item, idx) => (
              <View
                key={item.id}
                style={[styles.manutRow, idx === manutencoes.data!.length - 1 && { borderBottomWidth: 0 }]}
              >
                <Text style={styles.manutData}>{formatMesAno(item.data)}</Text>
                <Text style={styles.manutDescricao}>{item.descricao}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textMuted, fontFamily: fonts.sans }}>Nenhum registro ainda</Text>
          )}
        </View>

        <View style={{ gap: 11 }}>
          <DateField label="Data" value={dataManutencao} onChange={setDataManutencao} />
          <Field label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="Ex: limpeza, troca de peça" />
          <Button title="Adicionar manutenção" variant="secondary" onPress={() => addManutencao.mutate()} loading={addManutencao.isPending} />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button title="Dossiê PDF" variant="secondary" compact onPress={gerarDossie} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Usar em treino" compact onPress={() => openSheet(a)} />
          </View>
        </View>

        <Button
          title="Excluir arma"
          variant="danger"
          onPress={() =>
            Alert.alert('Excluir arma', 'Tem certeza? Essa ação não pode ser desfeita.', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Excluir', style: 'destructive', onPress: () => excluir.mutate() },
            ])
          }
          loading={excluir.isPending}
        />
      </View>
    </ScrollView>
  );
}

const styles = {
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  gridCell: { width: '50%' as const, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 13, gap: 4 },
  gridLabel: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: ls(9.5, 0.13), color: colors.textMuted },
  gridValue: { fontSize: 14, color: colors.text, fontFamily: fonts.sans },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: ls(10.5, 0.16),
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
  manutRow: { flexDirection: 'row' as const, gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.divider },
  manutData: { fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted, width: 64 },
  manutDescricao: { flex: 1, fontSize: 13.5, lineHeight: 19, color: colors.text, fontFamily: fonts.sans },
};
