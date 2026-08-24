'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Field } from '@/components/ui';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { colors, fonts } from '@/lib/theme';

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !senha) {
      setErro('Preencha e-mail e senha');
      return;
    }
    setErro(null);
    setCarregando(true);
    try {
      const { accessToken } = await login({ email, senha });
      signIn(accessToken);
      router.replace('/app');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? // @ts-expect-error axios error shape
            (error.response?.data?.message as string | undefined)
          : undefined;
      setErro(message ?? 'Verifique suas credenciais');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: colors.text, marginBottom: 6 }}>Entrar</h1>
        <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: fonts.sans, marginBottom: 24 }}>
          Acesse seu arsenal, documentos e habitualidade CAC
        </p>

        <Field label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />

        {erro && <p style={{ color: colors.danger, fontSize: 13, marginBottom: 12 }}>{erro}</p>}

        <Button title="Entrar" type="submit" loading={carregando} />

        <p style={{ marginTop: 16, textAlign: 'center', color: colors.textMuted, fontSize: 13.5 }}>
          Não tem conta?{' '}
          <Link href="/registro" style={{ color: colors.accentText, fontWeight: 500 }}>
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
