import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, DateField, EmptyState, FAB, Field, Label, ScreenTitle, ls } from '@/components/ui';
import { criarMovimentoMunicao, listarMunicao, saldoPorCalibre } from '@/api/municao';
import { listarArmas } from '@/api/armas';
import { colors, fonts } from '@/constants/theme';
import { formatDataMono, formatDiaMes } from '@/lib/format';

export default function MunicaoScreen() {
  const queryClient = useQueryClient();
  const saldo = useQuery({ queryKey: ['municao-saldo'], queryFn: saldoPorCalibre });
  const movimentos = useQuery({ queryKey: ['municao'], queryFn: listarMunicao });
  const armas = useQuery({ queryKey: ['armas'], queryFn: listarArmas });

  const [novoAberto, setNovoAberto] = useState(false);
  const [calibre, setCalibre] = useState('');
  const [tipoMovimento, setTipoMovimento] = useState<'COMPRA' | 'USO'>('COMPRA');
  const [quantidade, setQuantidade] = useState('');
  const [armaId, setArmaId] = useState<string | undefined>();
  const [data, setData] = useState('');

  const mutation = useMutation({
    mutationFn: criarMovimentoMunicao,
    onSuccess: () => {
      setCalibre('');
      setQuantidade('');
      setData('');
      setArmaId(undefined);
      setNovoAberto(false);
      queryClient.invalidateQueries({ queryKey: ['municao-saldo'] });
      queryClient.invalidateQueries({ queryKey: ['municao'] });
    },
    onError: (error: any) => Alert.alert('Erro ao salvar', error?.response?.data?.message ?? 'Tente novamente'),
  });

  function handleSubmit() {
    if (!calibre || !quantidade || !data) {
      Alert.alert('Preencha calibre, quantidade e data');
      return;
    }
    if (!armaId) {
      Alert.alert('Selecione a arma vinculada a este movimento');
      return;
    }
    mutation.mutate({ calibre, tipoMovimento, quantidade: Number(quantidade), armaId, data });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView>
        <View style={{ gap: 17, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 100 }}>
          <ScreenTitle action={<FAB onPress={() => setNovoAberto(true)} />}>Munição</ScreenTitle>

          <View style={{ gap: 10 }}>
            {saldo.data?.length ? (
              saldo.data.map((item) => {
                const movsCalibre = (movimentos.data ?? []).filter((m) => m.calibre === item.calibre);
                const ultimo = movsCalibre
                  .filter((m) => m.tipoMovimento === 'COMPRA')
                  .sort((a, b) => (a.data > b.data ? -1 : 1))[0];
                const usos = movsCalibre.filter((m) => m.tipoMovimento === 'USO');
                let consumoMedio: number | null = null;
                if (usos.length) {
                  const datas = usos.map((u) => new Date(u.data).getTime());
                  const totalUso = usos.reduce((acc, u) => acc + u.quantidade, 0);
                  const meses = Math.max(1, Math.round((Math.max(...datas) - Math.min(...datas)) / (1000 * 60 * 60 * 24 * 30)) + 1);
                  consumoMedio = Math.round(totalUso / meses);
                }
                return (
                  <View key={item.calibre} style={styles.ammoCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: ls(12, 0.06), color: colors.text }}>{item.calibre}</Text>
                      <Text style={{ fontSize: 15, fontFamily: fonts.sansSemiBold, color: colors.text }}>
                        {item.saldo.toLocaleString('pt-BR')}{' '}
                        <Text style={{ fontSize: 11.5, fontFamily: fonts.sans, color: colors.textMuted }}>un. em estoque</Text>
                      </Text>
                    </View>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted }}>
                      {ultimo ? `ÚLT. COMPRA ${formatDiaMes(ultimo.data)}` : 'SEM COMPRAS REGISTRADAS'}
                      {consumoMedio ? ` · CONSUMO MÉDIO ${consumoMedio}/MÊS` : ''}
                    </Text>
                  </View>
                );
              })
            ) : (
              <EmptyState message="Nenhum registro de munição ainda" />
            )}
          </View>

          <View style={{ gap: 2 }}>
            <Text style={styles.sectionLabel}>Movimentações</Text>
            {movimentos.data?.length ? (
              movimentos.data.slice(0, 20).map((item, idx) => (
                <View
                  key={item.id}
                  style={[styles.movRow, idx === Math.min(20, movimentos.data!.length) - 1 && { borderBottomWidth: 0 }]}
                >
                  <Text style={{ width: 22, textAlign: 'center', fontSize: 15, color: item.tipoMovimento === 'COMPRA' ? colors.accentText : colors.textMuted }}>
                    {item.tipoMovimento === 'COMPRA' ? '+' : '−'}
                  </Text>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ fontSize: 14, fontFamily: fonts.sansMedium, color: colors.text }}>
                      {item.tipoMovimento === 'COMPRA' ? 'Compra' : 'Uso em treino'} · {item.quantidade} un. {item.calibre}
                    </Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, color: 'rgba(236,239,236,.42)' }}>
                      {formatDataMono(item.data)}
                      {item.arma ? ` · ${item.arma.marca} ${item.arma.modelo}` : ''}
                    </Text>
                  </View>
                  {item.notaFiscalUrl && <Badge text="NF" tone="accent" />}
                </View>
              ))
            ) : (
              <EmptyState message="Nenhuma movimentação registrada" />
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={novoAberto} transparent animationType="slide" onRequestClose={() => setNovoAberto(false)}>
        <Pressable style={styles.overlay} onPress={() => setNovoAberto(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={{ fontSize: 19, fontFamily: fonts.sansSemiBold, color: colors.text }}>Registrar movimento</Text>

            <Label>Tipo</Label>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {(['COMPRA', 'USO'] as const).map((opcao) => (
                <Pressable
                  key={opcao}
                  onPress={() => setTipoMovimento(opcao)}
                  style={[styles.tipoOpcao, tipoMovimento === opcao && styles.tipoOpcaoAtiva]}
                >
                  <Text style={{ color: tipoMovimento === opcao ? colors.onAccent : colors.textMuted, fontFamily: fonts.sansSemiBold }}>{opcao}</Text>
                </Pressable>
              ))}
            </View>

            <Field label="Calibre" value={calibre} onChangeText={setCalibre} placeholder="Ex: 9x19" />
            <Field label="Quantidade" value={quantidade} onChangeText={setQuantidade} keyboardType="number-pad" />
            <DateField label="Data" value={data} onChange={setData} />

            <Label>Arma vinculada</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {(armas.data ?? []).map((arma) => (
                <Pressable
                  key={arma.id}
                  onPress={() => setArmaId(arma.id === armaId ? undefined : arma.id)}
                  style={[styles.tipoOpcao, { flex: undefined, paddingHorizontal: 12 }, armaId === arma.id && styles.tipoOpcaoAtiva]}
                >
                  <Text style={{ color: armaId === arma.id ? colors.onAccent : colors.textMuted, fontFamily: fonts.sans }}>
                    {arma.marca} {arma.modelo}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Button title="Registrar movimento" onPress={handleSubmit} loading={mutation.isPending} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = {
  ammoCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: 14, padding: 15, gap: 11 },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: ls(10.5, 0.16),
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
    paddingBottom: 8,
  },
  movRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 13, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  overlay: { flex: 1, backgroundColor: 'rgba(5,6,6,0.62)', justifyContent: 'flex-end' as const },
  sheet: {
    backgroundColor: colors.sheet,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  handle: { width: 38, height: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'center' as const },
  tipoOpcao: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center' as const,
  },
  tipoOpcaoAtiva: { backgroundColor: colors.accent, borderColor: colors.accent },
};
