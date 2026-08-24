'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { criarSessaoTreino } from '@/api/sessoesTreino';
import { listarArmas } from '@/api/armas';
import { listarClubes } from '@/api/clubes';
import { colors, fonts } from '@/lib/theme';
import { dateParaIso } from '@/lib/format';
import { useToastStore, useTrainingSheetStore } from '@/store/uiStore';
import { DateField } from './ui';

export function TrainingSessionSheet() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { open, armaPreselecionada, closeSheet } = useTrainingSheetStore();
  const showToast = useToastStore((s) => s.showToast);

  const armas = useQuery({ queryKey: ['armas'], queryFn: listarArmas, enabled: open });
  const clubes = useQuery({ queryKey: ['clubes'], queryFn: listarClubes, enabled: open });

  const [clubeId, setClubeId] = useState<string | undefined>();
  const [clubeAberto, setClubeAberto] = useState(false);
  const [data, setData] = useState(dateParaIso(new Date()));
  const [disparos, setDisparos] = useState(50);
  const [armasSelecionadas, setArmasSelecionadas] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setData(dateParaIso(new Date()));
      setDisparos(50);
      setArmasSelecionadas(armaPreselecionada ? [armaPreselecionada.id] : []);
      setClubeAberto(false);
      setErro(null);
    }
  }, [open, armaPreselecionada]);

  useEffect(() => {
    if (!clubeId && clubes.data?.length) setClubeId(clubes.data[0].id);
  }, [clubes.data, clubeId]);

  const mutation = useMutation({
    mutationFn: criarSessaoTreino,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessoes-treino'] });
      queryClient.invalidateQueries({ queryKey: ['habitualidade'] });
      queryClient.invalidateQueries({ queryKey: ['municao'] });
      queryClient.invalidateQueries({ queryKey: ['municao-saldo'] });
      closeSheet();
      router.push('/app/habitualidade');
      showToast('Sessão registrada · habitualidade em dia');
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? // @ts-expect-error axios error shape
            (error.response?.data?.message as string | undefined)
          : undefined;
      setErro(message ?? 'Tente novamente');
    },
  });

  function alternarArma(id: string) {
    setArmasSelecionadas((atual) => (atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]));
  }

  function salvar() {
    if (armasSelecionadas.length === 0) {
      setErro('Selecione ao menos uma arma usada no treino');
      return;
    }
    setErro(null);
    mutation.mutate({ data, clubeId, armasIds: armasSelecionadas, municaoGastaQtd: disparos });
  }

  if (!open) return null;

  const clubeSelecionado = clubes.data?.find((c) => c.id === clubeId);
  const calibreAviso = armas.data?.find((a) => armasSelecionadas.includes(a.id))?.calibre;

  return (
    <div
      onClick={closeSheet}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5,6,6,0.62)', zIndex: 70, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.sheet,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          padding: '14px 20px 30px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: '100%',
          maxWidth: 460,
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'center' }} />
        <h2 style={{ fontSize: 19, fontWeight: 600, color: colors.text }}>Registrar sessão de treino</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
            <span style={fieldLabelStyle}>Clube</span>
            <button onClick={() => setClubeAberto((v) => !v)} style={selectRowStyle}>
              <span style={{ color: colors.text, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {clubeSelecionado?.nome ?? 'Selecionar clube'}
              </span>
              <span style={{ color: 'rgba(236,239,236,.35)' }}>▾</span>
            </button>
            {clubeAberto && (
              <div style={{ backgroundColor: colors.surfaceRaised, border: '1px solid rgba(255,255,255,.1)', borderRadius: 11, overflow: 'hidden' }}>
                {(clubes.data ?? []).map((clube) => (
                  <button
                    key={clube.id}
                    onClick={() => {
                      setClubeId(clube.id);
                      setClubeAberto(false);
                    }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 13px', border: 'none', borderTop: '1px solid rgba(255,255,255,.06)', backgroundColor: 'transparent', color: colors.text, fontSize: 14 }}
                  >
                    {clube.nome}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 11 }}>
            <div style={{ flex: 1 }}>
              <DateField label="Data" value={data} onChange={setData} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={fieldLabelStyle}>Disparos</span>
              <div style={{ ...selectRowStyle, cursor: 'default' }}>
                <span style={{ color: colors.text, fontSize: 14 }}>{disparos}</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setDisparos((v) => Math.max(0, v - 10))} style={stepperBtnStyle}>
                    −
                  </button>
                  <button onClick={() => setDisparos((v) => v + 10)} style={stepperBtnStyle}>
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={fieldLabelStyle}>Arma utilizada</span>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {(armas.data ?? []).map((arma) => {
                const active = armasSelecionadas.includes(arma.id);
                return (
                  <button
                    key={arma.id}
                    onClick={() => alternarArma(arma.id)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 99,
                      border: `1px solid ${active ? colors.accent : 'rgba(255,255,255,.12)'}`,
                      backgroundColor: active ? colors.accent : 'transparent',
                      fontFamily: fonts.mono,
                      fontWeight: 600,
                      fontSize: 11,
                      color: active ? colors.onAccent : 'rgba(236,239,236,.55)',
                    }}
                  >
                    {arma.modelo} · {arma.calibre}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, backgroundColor: colors.accentWashBg, border: `1px solid ${colors.accentWashBorder}`, borderRadius: 11, padding: '11px 13px' }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, backgroundColor: colors.accentText, flexShrink: 0 }} />
          <span style={{ fontSize: 12, lineHeight: '17px', color: 'rgba(236,239,236,.72)' }}>
            Baixa automática de {disparos} un. de {calibreAviso ?? 'munição'} no estoque
          </span>
        </div>

        {erro && <p style={{ color: colors.danger, fontSize: 13 }}>{erro}</p>}

        <button
          onClick={salvar}
          disabled={mutation.isPending}
          style={{ backgroundColor: colors.accent, borderRadius: 13, padding: '15px 0', color: colors.onAccent, fontSize: 15, fontWeight: 600, opacity: mutation.isPending ? 0.7 : 1 }}
        >
          {mutation.isPending ? 'Salvando...' : 'Salvar sessão'}
        </button>
      </div>
    </div>
  );
}

const fieldLabelStyle = { fontFamily: fonts.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(236,239,236,.4)' };
const selectRowStyle = {
  backgroundColor: colors.surfaceRaised,
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 11,
  padding: '12px 13px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 8,
  width: '100%',
};
const stepperBtnStyle = { color: 'rgba(236,239,236,.6)', fontSize: 16, fontWeight: 500, padding: '0 2px', background: 'none', border: 'none' };
