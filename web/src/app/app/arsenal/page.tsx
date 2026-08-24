'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Badge, EmptyState, FAB, LoadingState, MonoLabel, ScreenTitle, StripedPlaceholder, Tone, toneOf } from '@/components/ui';
import { listarArmas, listarManutencoes } from '@/api/armas';
import { resolveUploadUrl } from '@/api/client';
import { Arma } from '@/api/types';
import { colors, fonts } from '@/lib/theme';
import { diasRestantes, formatDataMono, formatMesAno } from '@/lib/format';

function statusArma(arma: Arma): { label: string; tone: Tone } {
  const dias = diasRestantes(arma.crafValidade);
  if (dias === null) return { label: 'SEM GT', tone: 'neutral' };
  if (dias < 0) return { label: 'GT VENCIDA', tone: 'danger' };
  if (dias <= 90) return { label: `GT ${dias} DIAS`, tone: toneOf(dias) };
  return { label: 'GUIA OK', tone: 'accent' };
}

function ArmaCard({ item, primeira, onClick }: { item: Arma; primeira: boolean; onClick: () => void }) {
  const status = statusArma(item);
  const manutencoes = useQuery({ queryKey: ['manutencoes', item.id], queryFn: () => listarManutencoes(item.id) });
  const ultimaManutencao = [...(manutencoes.data ?? [])].sort((a, b) => (a.data > b.data ? -1 : 1))[0];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: primeira ? 13 : 11,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderLeft: status.tone === 'danger' ? `2px solid ${colors.dangerBar}` : undefined,
        borderRadius: 16,
        padding: 15,
        width: '100%',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: colors.text, letterSpacing: '-0.01em' }}>
            {item.marca} {item.modelo}
          </span>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>
            {item.categoria} · {item.calibre} · SIGMA {item.numeroSerie}
          </span>
        </div>
        <Badge text={status.label} tone={status.tone} />
      </div>

      {primeira &&
        (item.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveUploadUrl(item.fotoUrl)!} alt="" style={{ height: 64, borderRadius: 10, objectFit: 'cover', width: '100%', display: 'block' }} />
        ) : (
          <StripedPlaceholder label="FOTO DA ARMA" style={{ height: 64, borderRadius: 10 }} />
        ))}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted }}>
          {item.crafValidade ? `GT ATÉ ${formatDataMono(item.crafValidade)}` : 'SEM GUIA DE TRÁFEGO'}
        </span>
        <span style={{ fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted }}>
          {ultimaManutencao ? `MANUT. ${formatMesAno(ultimaManutencao.data)}` : 'SEM MANUT.'}
        </span>
      </div>
    </button>
  );
}

export default function ArsenalPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({ queryKey: ['armas'], queryFn: listarArmas });
  const [busca, setBusca] = useState('');

  const armas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return data ?? [];
    return (data ?? []).filter((a) =>
      [a.marca, a.modelo, a.calibre, a.numeroSerie].some((v) => v?.toLowerCase().includes(termo))
    );
  }, [data, busca]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ScreenTitle
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MonoLabel style={{ fontSize: 11 }}>
              {armas.length} ARMA{armas.length === 1 ? '' : 'S'}
            </MonoLabel>
            <FAB onPress={() => router.push('/app/arsenal/novo')} />
          </div>
        }
      >
        Arsenal
      </ScreenTitle>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.borderSoft}`,
          borderRadius: 11,
          padding: '11px 13px',
        }}
      >
        <div style={{ width: 11, height: 11, borderRadius: 99, border: '1.5px solid rgba(236,239,236,.4)', flexShrink: 0 }} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por modelo, calibre ou SIGMA"
          style={{ flex: 1, fontSize: 13.5, color: colors.text, background: 'none', border: 'none', outline: 'none', padding: 0, width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isLoading ? (
          <LoadingState />
        ) : armas.length ? (
          armas.map((item, index) => (
            <ArmaCard key={item.id} item={item} primeira={index === 0} onClick={() => router.push(`/app/arsenal/${item.id}`)} />
          ))
        ) : (
          <EmptyState message="Nenhuma arma cadastrada ainda" />
        )}
      </div>
    </div>
  );
}
