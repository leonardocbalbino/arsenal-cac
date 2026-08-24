import { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as LocalAuthentication from 'expo-local-authentication';
import { BackLink, Button, Card, Field, ls } from '@/components/ui';
import { getPerfil, updatePerfil } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useLockStore } from '@/store/lockStore';
import { baixarDossie } from '@/api/relatorios';
import { colors, fonts } from '@/constants/theme';
import { META_HABITUALIDADE_PADRAO } from '@/constants/habitualidade';

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const signOut = useAuthStore((state) => state.signOut);
  const { biometricEnabled, setBiometricEnabled, unlock } = useLockStore();

  const perfil = useQuery({ queryKey: ['perfil'], queryFn: getPerfil });
  const [crNumero, setCrNumero] = useState('');
  const [metaHabitualidade, setMetaHabitualidade] = useState('');

  useEffect(() => {
    if (!perfil.data) return;
    setCrNumero(perfil.data.crNumero ?? '');
    setMetaHabitualidade(perfil.data.metaHabitualidade != null ? String(perfil.data.metaHabitualidade) : '');
  }, [perfil.data]);

  const salvarPerfil = useMutation({
    mutationFn: updatePerfil,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['perfil'] }),
  });

  function handleSalvarPerfil() {
    const metaTrimmed = metaHabitualidade.trim();
    salvarPerfil.mutate({
      crNumero,
      metaHabitualidade: metaTrimmed ? Number(metaTrimmed) : null,
    });
  }

  async function alternarBiometria(valor: boolean) {
    if (valor) {
      const suportado = await LocalAuthentication.hasHardwareAsync();
      const cadastrado = await LocalAuthentication.isEnrolledAsync();
      if (!suportado || !cadastrado) {
        Alert.alert('Biometria indisponível', 'Configure a biometria do aparelho nas configurações do sistema primeiro.');
        return;
      }
      const resultado = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirme para ativar o bloqueio' });
      if (!resultado.success) return;
    }
    await setBiometricEnabled(valor);
    if (valor) unlock();
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }}>
      <View style={{ gap: 18, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 30 }}>
        <BackLink label="Início" onPress={() => router.back()} />
        <Text style={{ fontSize: 26, fontFamily: fonts.sansSemiBold, color: colors.text, letterSpacing: ls(26, -0.025) }}>Configurações</Text>

        <Card style={{ gap: 12 }}>
          <Text style={{ color: colors.text, fontFamily: fonts.sansSemiBold, fontSize: 15 }}>Perfil</Text>
          <View style={{ gap: 2 }}>
            <Text style={{ color: colors.textMuted, fontFamily: fonts.sans }}>{perfil.data?.nome}</Text>
            <Text style={{ color: colors.textMuted, fontFamily: fonts.sans }}>{perfil.data?.email}</Text>
          </View>
          <View style={{ gap: 12 }}>
            <Field label="Número do CR" value={crNumero} onChangeText={setCrNumero} placeholder="Atualizar número do CR" />
            <View>
              <Field
                label="Meta de habitualidade (sessões/ano)"
                value={metaHabitualidade}
                onChangeText={setMetaHabitualidade}
                placeholder={`Padrão: mínimo legal (${META_HABITUALIDADE_PADRAO})`}
                keyboardType="number-pad"
              />
              <Text style={{ color: colors.textFaint, fontFamily: fonts.sans, fontSize: 12 }}>
                Deixe em branco para usar o mínimo legal vigente ({META_HABITUALIDADE_PADRAO} sessões/ano). Cadastre sua própria
                meta se a exigência aplicável a você for diferente.
              </Text>
            </View>
            <Button title="Salvar perfil" variant="secondary" onPress={handleSalvarPerfil} loading={salvarPerfil.isPending} />
          </View>
        </Card>

        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: colors.text, fontFamily: fonts.sansSemiBold, fontSize: 15 }}>Bloqueio por biometria</Text>
            <Text style={{ color: colors.textMuted, fontFamily: fonts.sans, fontSize: 13 }}>Exige Face ID/digital para abrir o app</Text>
          </View>
          <Switch value={biometricEnabled} onValueChange={alternarBiometria} trackColor={{ true: colors.accent, false: colors.surfaceRaised }} thumbColor={colors.onAccent} />
        </Card>

        <Card style={{ gap: 10 }}>
          <Text style={{ color: colors.text, fontFamily: fonts.sansSemiBold, fontSize: 15 }}>Exportações</Text>
          <Button title="Baixar dossiê completo (PDF)" variant="secondary" onPress={() => baixarDossie()} />
        </Card>

        <Button title="Sair da conta" variant="danger" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}
