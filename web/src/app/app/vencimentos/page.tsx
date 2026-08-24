'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { EmptyState, ScreenTitle, VencimentoRow, toneOf } from '@/components/ui';
import { listarVencimentos } from '@/api/documentos';
import { Documento } from '@/api/types';
import { colors, fonts } from '@/lib/theme';
import { diasRestantes, formatContagem, metaVencimento, tituloVencimento } from '@/lib/format';

const JANELA_DIAS = 730;

export default function VencimentosPage() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ['vencimentos', JANELA_DIAS],
    queryFn: () => listarVencimentos(JANELA_DIAS),
  });

  // Alertas locais: no mobile isso agenda notificações via expo-notifications.
  // Não há um equivalente de agendamento de push no navegador ainda, então este
  // switch apenas controla estado de UI local (nenhum alerta é de fato agendado).
  const [alertasAtivo, setAlertasAtivo] = useState(true);

  const grupos = useMemo(() => {
    const itens = (data ?? [])
      .map((doc) => ({ doc, dias: diasRestantes(doc.dataValidade) }))
      .filter((item): item is { doc: Documento; dias: number } => item.dias !== null && item.dias >= 0)
      .sort((a, b) => a.dias - b.dias);

    const nesteMes: typeof itens = [];
    const proximos90: typeof itens = [];
    const depois: typeof itens = [];
    for (const item of itens) {
      if (item.dias <= 30) nesteMes.push(item);
      else if (item.dias <= 90) proximos90.push(item);
      else depois.push(item);
    }
    return { nesteMes, proximos90, depois };
  }, [data]);

  const semItens = !grupos.nesteMes.length && !grupos.proximos90.length && !grupos.depois.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ScreenTitle>Vencimentos</ScreenTitle>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          backgroundColor: colors.accentWashBg,
          border: `1px solid ${colors.accentWashBorder}`,
          borderRadius: 13,
          padding: '13px 14px',
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: 99, backgroundColor: colors.accentText, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12.5, lineHeight: '17px', color: 'rgba(236,239,236,.75)', fontFamily: fonts.sans }}>
          Avisos locais em 30, 15 e 7 dias antes de cada prazo
        </span>
        <button
          onClick={() => setAlertasAtivo((v) => !v)}
          aria-pressed={alertasAtivo}
          style={{
            width: 38,
            height: 22,
            borderRadius: 99,
            backgroundColor: colors.accent,
            border: 'none',
            padding: 2,
            display: 'flex',
            justifyContent: alertasAtivo ? 'flex-end' : 'flex-start',
            flexShrink: 0,
          }}
        >
          <span style={{ width: 18, height: 18, borderRadius: 99, backgroundColor: colors.onAccent, display: 'block' }} />
        </button>
      </div>

      {semItens ? (
        <EmptyState message="Nenhum vencimento cadastrado" />
      ) : (
        <>
          {grupos.nesteMes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.danger }}>
                Neste mês
              </span>
              {grupos.nesteMes.map((item, idx) => (
                <VencimentoItem key={item.doc.id} doc={item.doc} dias={item.dias} destaque={idx === 0} onOpen={() => router.push(`/app/documentos/${item.doc.id}`)} onRenovar={() => router.push('/app/documentos/novo')} />
              ))}
            </div>
          )}

          {grupos.proximos90.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.warn }}>
                Próximos 90 dias
              </span>
              {grupos.proximos90.map((item) => (
                <VencimentoRow
                  key={item.doc.id}
                  titulo={tituloVencimento(item.doc)}
                  meta={metaVencimento(item.doc)}
                  contagem={formatContagem(item.dias)}
                  tone={toneOf(item.dias)}
                  onClick={() => router.push(`/app/documentos/${item.doc.id}`)}
                />
              ))}
            </div>
          )}

          {grupos.depois.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.textMuted }}>
                Depois
              </span>
              {grupos.depois.map((item) => (
                <VencimentoRow
                  key={item.doc.id}
                  titulo={tituloVencimento(item.doc)}
                  meta={metaVencimento(item.doc)}
                  contagem={formatContagem(item.dias)}
                  tone={toneOf(item.dias)}
                  onClick={() => router.push(`/app/documentos/${item.doc.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VencimentoItem({
  doc,
  dias,
  destaque,
  onOpen,
  onRenovar,
}: {
  doc: Documento;
  dias: number;
  destaque: boolean;
  onOpen: () => void;
  onRenovar: () => void;
}) {
  if (!destaque) {
    return (
      <VencimentoRow titulo={tituloVencimento(doc)} meta={metaVencimento(doc)} contagem={formatContagem(dias)} tone={toneOf(dias)} onClick={onOpen} />
    );
  }
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: '1px solid rgba(217,127,98,0.3)',
        borderLeft: `2px solid ${colors.dangerBar}`,
        borderRadius: 12,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          <span style={{ fontSize: 14.5, fontWeight: 500, color: colors.text }}>{tituloVencimento(doc)}</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>{metaVencimento(doc)}</span>
        </div>
        <span style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: 11, color: colors.danger }}>{formatContagem(dias)}</span>
      </div>
      <button
        onClick={onRenovar}
        style={{
          alignSelf: 'flex-start',
          backgroundColor: colors.accent,
          border: 'none',
          borderRadius: 7,
          padding: '8px 11px',
          fontFamily: fonts.mono,
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: '0.08em',
          color: colors.onAccent,
        }}
      >
        INICIAR RENOVAÇÃO
      </button>
    </div>
  );
}
