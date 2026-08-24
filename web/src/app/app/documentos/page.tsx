'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Chip, EmptyState, GhostFAB, LoadingState, ScreenTitle, StripedPlaceholder } from '@/components/ui';
import { listarDocumentos } from '@/api/documentos';
import { TipoDocumento } from '@/api/types';
import { colors, fonts } from '@/lib/theme';
import { diasRestantes, formatDataMono, rotuloTipo } from '@/lib/format';

const FILTROS: { chave: string; label: string; tipos: TipoDocumento[] | null }[] = [
  { chave: 'todos', label: 'TODOS', tipos: null },
  { chave: 'cr', label: 'CR', tipos: ['CR', 'CRAF'] },
  { chave: 'guias', label: 'GUIAS', tipos: ['GUIA_TRAFEGO'] },
  { chave: 'clube', label: 'CLUBE', tipos: ['TITULO_FILIACAO'] },
  { chave: 'psico', label: 'PSICO', tipos: ['EXAME_PSICOLOGICO', 'ATESTADO_SANIDADE'] },
];

export default function DocumentosPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({ queryKey: ['documentos'], queryFn: listarDocumentos });
  const [filtro, setFiltro] = useState('todos');

  const documentos = useMemo(() => {
    const ativo = FILTROS.find((f) => f.chave === filtro);
    if (!ativo?.tipos) return data ?? [];
    return (data ?? []).filter((d) => ativo.tipos!.includes(d.tipo));
  }, [data, filtro]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 6 }}>
        <ScreenTitle action={<GhostFAB onPress={() => router.push('/app/documentos/novo')} />}>Documentos</ScreenTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {FILTROS.map((f) => (
            <Chip
              key={f.chave}
              label={f.chave === 'todos' ? `TODOS · ${data?.length ?? 0}` : f.label}
              active={filtro === f.chave}
              onPress={() => setFiltro(f.chave)}
            />
          ))}
        </div>
      </div>

      {isLoading && !data ? (
        <LoadingState />
      ) : documentos.length === 0 ? (
        <EmptyState message="Nenhum documento cadastrado ainda" />
      ) : (
        documentos.map((item) => {
          const dias = diasRestantes(item.dataValidade);
          const extensao = item.arquivoUrl?.split('.').pop()?.toUpperCase();
          const vencendo = dias !== null && dias <= 30;
          const meta = item.dataValidade
            ? `${extensao ?? 'ARQUIVO'} · ${vencendo ? `vence em ${dias! < 0 ? '0' : dias} dias` : `val. ${formatDataMono(item.dataValidade)}`}`
            : extensao
              ? `${extensao} · sem validade`
              : 'Sem arquivo anexado';
          return (
            <button
              key={item.id}
              onClick={() => router.push(`/app/documentos/${item.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.borderSoft}`,
                borderRadius: 13,
                padding: '13px 14px',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <StripedPlaceholder label="" style={{ width: 32, height: 40, borderRadius: 4, border: `1px solid ${colors.borderSoft}`, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>{rotuloTipo[item.tipo]}</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 10.5, color: vencendo ? colors.danger : 'rgba(236,239,236,.42)' }}>{meta}</span>
              </div>
              <span style={{ fontSize: 16, color: 'rgba(236,239,236,.3)' }}>›</span>
            </button>
          );
        })
      )}
    </div>
  );
}
