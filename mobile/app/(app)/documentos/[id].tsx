import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BackLink, Button, Card, LoadingState, ls } from '@/components/ui';
import { obterDocumento, removerDocumento } from '@/api/documentos';
import { resolveUploadUrl } from '@/api/client';
import { colors, fonts } from '@/constants/theme';
import { formatDataBr, rotuloTipo } from '@/lib/format';

export default function DocumentoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const documento = useQuery({ queryKey: ['documento', id], queryFn: () => obterDocumento(id!), enabled: !!id });

  const excluir = useMutation({
    mutationFn: () => removerDocumento(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      router.back();
    },
  });

  if (!documento.data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: 64 }}>
        <LoadingState />
      </View>
    );
  }

  const doc = documento.data;
  const arquivoUrl = resolveUploadUrl(doc.arquivoUrl);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }}>
      <View style={{ gap: 18, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 30 }}>
        <BackLink label="Documentos" onPress={() => router.back()} />
        <Text style={{ fontSize: 26, fontFamily: fonts.sansSemiBold, color: colors.text, letterSpacing: ls(26, -0.025) }}>
          {rotuloTipo[doc.tipo]}
        </Text>

        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontFamily: fonts.sans, fontSize: 14 }}>Número: {doc.numero ?? '-'}</Text>
          <Text style={{ color: colors.text, fontFamily: fonts.sans, fontSize: 14 }}>
            Emissão: {doc.dataEmissao ? formatDataBr(doc.dataEmissao) : '-'}
          </Text>
          <Text style={{ color: colors.text, fontFamily: fonts.sans, fontSize: 14 }}>
            Validade: {doc.dataValidade ? formatDataBr(doc.dataValidade) : '-'}
          </Text>
          {doc.arma && (
            <Text style={{ color: colors.text, fontFamily: fonts.sans, fontSize: 14 }}>
              Arma: {doc.arma.marca} {doc.arma.modelo}
            </Text>
          )}
          {doc.clube && <Text style={{ color: colors.text, fontFamily: fonts.sans, fontSize: 14 }}>Clube: {doc.clube.nome}</Text>}
          {doc.observacoes && <Text style={{ color: colors.textMuted, fontFamily: fonts.sans, fontSize: 13 }}>{doc.observacoes}</Text>}
        </Card>

        {arquivoUrl && <Button title="Abrir arquivo anexado" variant="secondary" onPress={() => Linking.openURL(arquivoUrl)} />}

        <Button
          title="Excluir documento"
          variant="danger"
          onPress={() =>
            Alert.alert('Excluir documento', 'Tem certeza?', [
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
