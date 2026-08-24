import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { BackLink, Button, DateField, Field, Label, ls } from '@/components/ui';
import { criarDocumento } from '@/api/documentos';
import { listarArmas } from '@/api/armas';
import { EntidadeAlvo, TipoDocumento } from '@/api/types';
import { colors, fonts } from '@/constants/theme';
import { useToastStore } from '@/store/uiStore';

const TIPOS: { valor: TipoDocumento; rotulo: string }[] = [
  { valor: 'CR', rotulo: 'CR' },
  { valor: 'CRAF', rotulo: 'CRAF' },
  { valor: 'GUIA_TRAFEGO', rotulo: 'Guia de Tráfego' },
  { valor: 'ATESTADO_SANIDADE', rotulo: 'Atestado de Sanidade' },
  { valor: 'EXAME_PSICOLOGICO', rotulo: 'Exame Psicológico' },
  { valor: 'COMPROVANTE_RESIDENCIA', rotulo: 'Comprovante de Residência' },
  { valor: 'TITULO_FILIACAO', rotulo: 'Título de Filiação' },
  { valor: 'OUTRO', rotulo: 'Outro' },
];

function Selector<T extends string>({
  opcoes,
  valor,
  onChange,
}: {
  opcoes: { valor: T; rotulo: string }[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
      {opcoes.map((opcao) => {
        const ativo = valor === opcao.valor;
        return (
          <Pressable
            key={opcao.valor}
            onPress={() => onChange(opcao.valor)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 99,
              borderWidth: 1,
              borderColor: ativo ? colors.accent : 'rgba(255,255,255,0.12)',
              backgroundColor: ativo ? colors.accent : colors.surfaceRaised,
            }}
          >
            <Text style={{ color: ativo ? colors.onAccent : colors.textMuted, fontFamily: fonts.sansMedium, fontSize: 13 }}>{opcao.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function NovoDocumentoScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);
  const armas = useQuery({ queryKey: ['armas'], queryFn: listarArmas });

  const [tipo, setTipo] = useState<TipoDocumento>('CR');
  const [entidadeAlvo, setEntidadeAlvo] = useState<EntidadeAlvo>('PERFIL');
  const [armaId, setArmaId] = useState<string | undefined>();
  const [numero, setNumero] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [arquivo, setArquivo] = useState<{ uri: string; name: string; type: string } | null>(null);

  const mutation = useMutation({
    mutationFn: criarDocumento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      queryClient.invalidateQueries({ queryKey: ['vencimentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Erro ao salvar', error?.response?.data?.message ?? 'Tente novamente');
    },
  });

  async function selecionarArquivo() {
    const resultado = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    if (resultado.canceled || !resultado.assets?.[0]) return;
    const asset = resultado.assets[0];
    setArquivo({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' });
  }

  function handleSubmit() {
    if (!arquivo) {
      showToast('Selecione um arquivo para anexar');
      return;
    }
    if (entidadeAlvo === 'ARMA' && !armaId) {
      Alert.alert('Selecione a arma vinculada a este documento');
      return;
    }
    mutation.mutate({
      tipo,
      entidadeAlvo,
      armaId: entidadeAlvo === 'ARMA' ? armaId : undefined,
      numero: numero || undefined,
      dataEmissao: dataEmissao || undefined,
      dataValidade: dataValidade || undefined,
      arquivo: arquivo ?? undefined,
    });
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }}>
      <View style={{ gap: 18, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 30 }}>
        <BackLink label="Documentos" onPress={() => router.back()} />
        <Text style={{ fontSize: 26, fontFamily: fonts.sansSemiBold, color: colors.text, letterSpacing: ls(26, -0.025) }}>Novo documento</Text>

        <View>
          <Label>Tipo de documento</Label>
          <Selector opcoes={TIPOS} valor={tipo} onChange={setTipo} />

          <Label>Vinculado a</Label>
          <Selector
            opcoes={[
              { valor: 'PERFIL', rotulo: 'Meu perfil' },
              { valor: 'ARMA', rotulo: 'Uma arma' },
              { valor: 'CLUBE', rotulo: 'Um clube' },
            ]}
            valor={entidadeAlvo}
            onChange={setEntidadeAlvo}
          />

          {entidadeAlvo === 'ARMA' && (
            <>
              <Label>Arma</Label>
              <Selector
                opcoes={(armas.data ?? []).map((arma) => ({ valor: arma.id, rotulo: `${arma.marca} ${arma.modelo}` }))}
                valor={armaId ?? ''}
                onChange={setArmaId}
              />
            </>
          )}

          <Field label="Número (opcional)" value={numero} onChangeText={setNumero} />
          <DateField label="Emissão (opcional)" value={dataEmissao} onChange={setDataEmissao} />
          <DateField label="Validade (opcional)" value={dataValidade} onChange={setDataValidade} />

          <View style={{ marginBottom: 16 }}>
            <Button title={arquivo ? `Arquivo: ${arquivo.name}` : 'Anexar arquivo (PDF/foto)'} variant="secondary" onPress={selecionarArquivo} />
          </View>

          <Button title="Salvar documento" onPress={handleSubmit} loading={mutation.isPending} />
        </View>
      </View>
    </ScrollView>
  );
}
