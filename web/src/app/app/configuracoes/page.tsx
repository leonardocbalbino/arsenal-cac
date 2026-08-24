'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Field, ScreenTitle } from '@/components/ui';
import { getPerfil, updatePerfil } from '@/api/auth';
import { baixarDossie } from '@/api/relatorios';
import { useAuthStore } from '@/store/authStore';
import { colors, fonts } from '@/lib/theme';
import { META_HABITUALIDADE_PADRAO } from '@/lib/habitualidade';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const signOut = useAuthStore((s) => s.signOut);

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

  function handleLogout() {
    if (!window.confirm('Deseja realmente sair da conta?')) return;
    signOut();
    router.replace('/login');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ScreenTitle>Configurações</ScreenTitle>

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ color: colors.text, fontWeight: 600, fontSize: 15 }}>Perfil</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ color: colors.textMuted, fontSize: 14, fontFamily: fonts.sans }}>{perfil.data?.nome}</span>
          <span style={{ color: colors.textMuted, fontSize: 14, fontFamily: fonts.sans }}>{perfil.data?.email}</span>
        </div>
        <Field label="Número do CR" value={crNumero} onChange={(e) => setCrNumero(e.target.value)} placeholder="Atualizar número do CR" />
        <div>
          <Field
            label="Meta de habitualidade (sessões/ano)"
            type="number"
            value={metaHabitualidade}
            onChange={(e) => setMetaHabitualidade(e.target.value)}
            placeholder={`Padrão: mínimo legal (${META_HABITUALIDADE_PADRAO})`}
          />
          <p style={{ color: colors.textFaint, fontSize: 12, marginBottom: 16 }}>
            Deixe em branco para usar o mínimo legal vigente ({META_HABITUALIDADE_PADRAO} sessões/ano). Cadastre sua própria meta
            se a exigência aplicável a você for diferente.
          </p>
        </div>
        <Button title="Salvar perfil" variant="secondary" onClick={handleSalvarPerfil} loading={salvarPerfil.isPending} />
      </Card>

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ color: colors.text, fontWeight: 600, fontSize: 15 }}>Exportações</span>
        <Button title="Baixar dossiê completo (PDF)" variant="secondary" onClick={() => baixarDossie()} />
      </Card>

      <Button title="Sair da conta" variant="danger" onClick={handleLogout} />
    </div>
  );
}
