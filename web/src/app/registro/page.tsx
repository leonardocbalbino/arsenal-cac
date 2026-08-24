'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Field } from '@/components/ui';
import { register } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { colors, fonts } from '@/lib/theme';

export default function RegistroPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [crNumero, setCrNumero] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome || !email || senha.length < 8) {
      setErro('Preencha nome, e-mail e uma senha com pelo menos 8 caracteres');
      return;
    }
    setErro(null);
    setCarregando(true);
    try {
      const { accessToken } = await register({ nome, email, senha, crNumero: crNumero || undefined });
      signIn(accessToken);
      router.replace('/app');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? // @ts-expect-error axios error shape
            (error.response?.data?.message as string | undefined)
          : undefined;
      setErro(message ?? 'Tente novamente');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: colors.text, marginBottom: 6 }}>Criar conta</h1>
        <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: fonts.sans, marginBottom: 24 }}>
          Cadastre-se para gerenciar seu arsenal e documentos CAC
        </p>

        <Field label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Field label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Senha (mín. 8 caracteres)" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <Field label="Nº do CR (opcional)" value={crNumero} onChange={(e) => setCrNumero(e.target.value)} />

        {erro && <p style={{ color: colors.danger, fontSize: 13, marginBottom: 12 }}>{erro}</p>}

        <Button title="Cadastrar" type="submit" loading={carregando} />

        <p style={{ marginTop: 16, textAlign: 'center', color: colors.textMuted, fontSize: 13.5 }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: colors.accentText, fontWeight: 500 }}>
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
