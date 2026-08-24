import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button, Field, Screen, Subtitle, Title } from '@/components/ui';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit() {
    if (!email || !senha) {
      Alert.alert('Preencha e-mail e senha');
      return;
    }
    setCarregando(true);
    try {
      const { accessToken } = await login({ email, senha });
      await signIn(accessToken);
      router.replace('/(app)');
    } catch (error: any) {
      Alert.alert('Erro ao entrar', error?.response?.data?.message ?? 'Verifique suas credenciais');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Screen>
          <Title>Entrar</Title>
          <Subtitle>Acesse seu arsenal, documentos e habitualidade CAC</Subtitle>

          <Field label="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Field label="Senha" secureTextEntry value={senha} onChangeText={setSenha} />

          <Button title="Entrar" onPress={handleSubmit} loading={carregando} />

          <Link href="/(auth)/register" style={{ marginTop: 16, textAlign: 'center', color: colors.textMuted }}>
            Não tem conta? Cadastre-se
          </Link>
        </Screen>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
