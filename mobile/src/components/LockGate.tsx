import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLockStore } from '@/store/lockStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui';
import { colors, fonts, spacing } from '@/constants/theme';

export function LockGate({ children }: PropsWithChildren) {
  const { biometricEnabled, unlocked, loaded, unlock, lock } = useLockStore();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [tentando, setTentando] = useState(false);

  const autenticar = useCallback(async () => {
    setTentando(true);
    try {
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloqueie o CAC App',
        cancelLabel: 'Cancelar',
      });
      if (resultado.success) {
        unlock();
      }
    } finally {
      setTentando(false);
    }
  }, [unlock]);

  useEffect(() => {
    if (loaded && biometricEnabled && accessToken && !unlocked) {
      autenticar();
    }
  }, [loaded, biometricEnabled, accessToken, unlocked, autenticar]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background' && biometricEnabled) {
        lock();
      }
    });
    return () => subscription.remove();
  }, [biometricEnabled, lock]);

  const precisaDesbloquear = loaded && biometricEnabled && accessToken && !unlocked;

  if (!precisaDesbloquear) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CAC App bloqueado</Text>
      <Text style={styles.subtitle}>Use biometria para acessar seus dados</Text>
      <Button title={tentando ? 'Autenticando...' : 'Desbloquear'} onPress={autenticar} loading={tentando} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing(6) },
  title: { color: colors.text, fontSize: 20, fontFamily: fonts.sansSemiBold, marginBottom: spacing(2) },
  subtitle: { color: colors.textMuted, fontSize: 14, fontFamily: fonts.sans, marginBottom: spacing(6), textAlign: 'center' },
});
