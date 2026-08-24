import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button, Field, Screen, Subtitle, Title } from '@/components/ui';
import { register } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [crNumero, setCrNumero] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit() {
    if (!nome || !email || senha.length < 8) {
      Alert.alert('Preencha nome, e-mail e uma senha com pelo menos 8 caracteres');
      return;
    }
    setCarregando(true);
    try {
      const { accessToken } = await register({ nome, email, senha, crNumero: crNumero || undefined });
      await signIn(accessToken);
      router.replace('/(app)');
    } catch (error: any) {
      Alert.alert('Erro ao cadastrar', error?.response?.data?.message ?? 'Tente novamente');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Screen>
          <Title>Criar conta</Title>
          <Subtitle>Cadastre-se para gerenciar seu arsenal e documentos CAC</Subtitle>

          <Field label="Nome completo" value={nome} onChangeText={setNome} />
          <Field label="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Field label="Senha (mín. 8 caracteres)" secureTextEntry value={senha} onChangeText={setSenha} />
          <Field label="Nº do CR (opcional)" value={crNumero} onChangeText={setCrNumero} />

          <Button title="Cadastrar" onPress={handleSubmit} loading={carregando} />

          <Link href="/(auth)/login" style={{ marginTop: 16, textAlign: 'center', color: colors.textMuted }}>
            Já tem conta? Entrar
          </Link>
        </Screen>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
