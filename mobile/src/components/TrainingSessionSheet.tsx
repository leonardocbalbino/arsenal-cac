import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { criarSessaoTreino } from '@/api/sessoesTreino';
import { listarArmas } from '@/api/armas';
import { listarClubes } from '@/api/clubes';
import { colors, fonts, ls } from '@/constants/theme';
import { dateParaIso, formatDataBr, isoParaDateLocal } from '@/lib/format';
import { useToastStore, useTrainingSheetStore } from '@/store/uiStore';

export function TrainingSessionSheet() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { open, armaPreselecionada, closeSheet } = useTrainingSheetStore();
  const showToast = useToastStore((state) => state.showToast);

  const armas = useQuery({ queryKey: ['armas'], queryFn: listarArmas, enabled: open });
  const clubes = useQuery({ queryKey: ['clubes'], queryFn: listarClubes, enabled: open });

  const [clubeId, setClubeId] = useState<string | undefined>();
  const [clubeAberto, setClubeAberto] = useState(false);
  const [data, setData] = useState(dateParaIso(new Date()));
  const [dataAberta, setDataAberta] = useState(false);
  const [disparos, setDisparos] = useState(50);
  const [armasSelecionadas, setArmasSelecionadas] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setData(dateParaIso(new Date()));
      setDisparos(50);
      setArmasSelecionadas(armaPreselecionada ? [armaPreselecionada.id] : []);
      setClubeAberto(false);
      setDataAberta(false);
    }
  }, [open, armaPreselecionada]);

  useEffect(() => {
    if (!clubeId && clubes.data?.length) setClubeId(clubes.data[0].id);
  }, [clubes.data, clubeId]);

  const mutation = useMutation({
    mutationFn: criarSessaoTreino,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes-treino'] });
      queryClient.invalidateQueries({ queryKey: ['habitualidade'] });
      queryClient.invalidateQueries({ queryKey: ['municao'] });
      queryClient.invalidateQueries({ queryKey: ['municao-saldo'] });
      closeSheet();
      router.push('/(app)/habitualidade');
      showToast('Sessão registrada · habitualidade em dia');
    },
    onError: (error: any) => {
      Alert.alert('Erro ao salvar', error?.response?.data?.message ?? 'Tente novamente');
    },
  });

  function alternarArma(id: string) {
    setArmasSelecionadas((atual) => (atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]));
  }

  function salvar() {
    if (armasSelecionadas.length === 0) {
      Alert.alert('Selecione ao menos uma arma usada no treino');
      return;
    }
    mutation.mutate({
      data,
      clubeId,
      armasIds: armasSelecionadas,
      municaoGastaQtd: disparos,
    });
  }

  const clubeSelecionado = clubes.data?.find((c) => c.id === clubeId);
  const calibreAviso = armas.data?.find((a) => armasSelecionadas.includes(a.id))?.calibre;

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={closeSheet}>
      <Pressable style={styles.overlay} onPress={closeSheet}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Registrar sessão de treino</Text>

          <View style={{ gap: 11 }}>
            <View style={{ gap: 6 }}>
              <Text style={styles.fieldLabel}>Clube</Text>
              <Pressable style={styles.selectRow} onPress={() => setClubeAberto((v) => !v)}>
                <Text style={styles.selectText} numberOfLines={1}>
                  {clubeSelecionado?.nome ?? 'Selecionar clube'}
                </Text>
                <Text style={{ color: 'rgba(236,239,236,.35)' }}>▾</Text>
              </Pressable>
              {clubeAberto && (
                <View style={styles.dropdown}>
                  {(clubes.data ?? []).map((clube) => (
                    <Pressable
                      key={clube.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setClubeId(clube.id);
                        setClubeAberto(false);
                      }}
                    >
                      <Text style={styles.selectText}>{clube.nome}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 11 }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.fieldLabel}>Data</Text>
                <Pressable onPress={() => setDataAberta(true)} style={styles.dateInput}>
                  <Text style={{ color: colors.text, fontSize: 14, fontFamily: fonts.sans }}>{formatDataBr(data)}</Text>
                </Pressable>
                {dataAberta && (
                  <DateTimePicker
                    value={isoParaDateLocal(data)}
                    mode="date"
                    display="default"
                    onChange={(event, selecionada) => {
                      setDataAberta(false);
                      if (event.type === 'set' && selecionada) setData(dateParaIso(selecionada));
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.fieldLabel}>Disparos</Text>
                <View style={styles.stepperRow}>
                  <Text style={styles.stepperValue}>{disparos}</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable onPress={() => setDisparos((v) => Math.max(0, v - 10))} hitSlop={8}>
                      <Text style={styles.stepperBtn}>−</Text>
                    </Pressable>
                    <Pressable onPress={() => setDisparos((v) => v + 10)} hitSlop={8}>
                      <Text style={styles.stepperBtn}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={styles.fieldLabel}>Arma utilizada</Text>
              <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>
                {(armas.data ?? []).map((arma) => {
                  const active = armasSelecionadas.includes(arma.id);
                  return (
                    <Pressable key={arma.id} onPress={() => alternarArma(arma.id)} style={[styles.armaChip, active && styles.armaChipActive]}>
                      <Text style={[styles.armaChipText, active && styles.armaChipTextActive]}>
                        {arma.modelo} · {arma.calibre}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.notice}>
            <View style={styles.noticeDot} />
            <Text style={styles.noticeText}>
              Baixa automática de {disparos} un. de {calibreAviso ?? 'munição'} no estoque
            </Text>
          </View>

          <Pressable
            onPress={salvar}
            disabled={mutation.isPending}
            style={({ pressed }) => [styles.saveButton, (pressed || mutation.isPending) && { backgroundColor: colors.accentHover }]}
          >
            <Text style={styles.saveButtonText}>{mutation.isPending ? 'Salvando...' : 'Salvar sessão'}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(5,6,6,0.62)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.sheet,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 16,
  },
  handle: { width: 38, height: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'center' },
  title: { fontSize: 19, fontFamily: fonts.sansSemiBold, color: colors.text, letterSpacing: ls(19, -0.02) },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: ls(10, 0.14),
    textTransform: 'uppercase',
    color: 'rgba(236,239,236,.4)',
  },
  selectRow: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  selectText: { color: colors.text, fontSize: 14, fontFamily: fonts.sans, flexShrink: 1 },
  dropdown: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
    borderRadius: 11,
    overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 13, paddingVertical: 11, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.06)' },
  dateInput: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.sans,
  },
  stepperRow: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperValue: { color: colors.text, fontSize: 14, fontFamily: fonts.sans },
  stepperBtn: { color: 'rgba(236,239,236,.6)', fontSize: 16, fontFamily: fonts.sansMedium, paddingHorizontal: 2 },
  armaChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(255,255,255,.12)' },
  armaChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  armaChipText: { fontFamily: fonts.monoSemiBold, fontSize: 11, color: 'rgba(236,239,236,.55)' },
  armaChipTextActive: { color: colors.onAccent },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.accentWashBg,
    borderWidth: 1,
    borderColor: colors.accentWashBorder,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  noticeDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: colors.accentText },
  noticeText: { fontSize: 12, lineHeight: 17, color: 'rgba(236,239,236,.72)', fontFamily: fonts.sans, flex: 1 },
  saveButton: { backgroundColor: colors.accent, borderRadius: 13, paddingVertical: 15, alignItems: 'center' },
  saveButtonText: { color: colors.onAccent, fontSize: 15, fontFamily: fonts.sansSemiBold },
});
