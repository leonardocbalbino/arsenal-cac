'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, DateField, EmptyState, FAB, Field, Label, ScreenTitle } from '@/components/ui';
import { criarMovimentoMunicao, listarMunicao, saldoPorCalibre } from '@/api/municao';
import { listarArmas } from '@/api/armas';
import { colors, fonts } from '@/lib/theme';
import { formatDataMono, formatDiaMes } from '@/lib/format';

export default function MunicaoPage() {
  const queryClient = useQueryClient();
  const saldo = useQuery({ queryKey: ['municao-saldo'], queryFn: saldoPorCalibre });
  const movimentos = useQuery({ queryKey: ['municao'], queryFn: listarMunicao });
  const armas = useQuery({ queryKey: ['armas'], queryFn: listarArmas });

  const [novoAberto, setNovoAberto] = useState(false);
  const [calibre, setCalibre] = useState('');
  const [tipoMovimento, setTipoMovimento] = useState<'COMPRA' | 'USO'>('COMPRA');
  const [quantidade, setQuantidade] = useState('');
  const [armaId, setArmaId] = useState<string | undefined>();
  const [data, setData] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: criarMovimentoMunicao,
    onSuccess: () => {
      setCalibre('');
      setQuantidade('');
      setData('');
      setArmaId(undefined);
      setErro(null);
      setNovoAberto(false);
      queryClient.invalidateQueries({ queryKey: ['municao-saldo'] });
      queryClient.invalidateQueries({ queryKey: ['municao'] });
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

  function handleSubmit() {
    if (!calibre || !quantidade || !data) {
      setErro('Preencha calibre, quantidade e data');
      return;
    }
    if (!armaId) {
      setErro('Selecione a arma vinculada a este movimento');
      return;
    }
    setErro(null);
    mutation.mutate({ calibre, tipoMovimento, quantidade: Number(quantidade), armaId, data });
  }

  function fecharModal() {
    setNovoAberto(false);
    setErro(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 17 }}>
      <ScreenTitle action={<FAB onPress={() => setNovoAberto(true)} />}>Munição</ScreenTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {saldo.data?.length ? (
          saldo.data.map((item) => {
            const movsCalibre = (movimentos.data ?? []).filter((m) => m.calibre === item.calibre);
            const ultimo = movsCalibre
              .filter((m) => m.tipoMovimento === 'COMPRA')
              .sort((a, b) => (a.data > b.data ? -1 : 1))[0];
            const usos = movsCalibre.filter((m) => m.tipoMovimento === 'USO');
            let consumoMedio: number | null = null;
            if (usos.length) {
              const datas = usos.map((u) => new Date(u.data).getTime());
              const totalUso = usos.reduce((acc, u) => acc + u.quantidade, 0);
              const meses = Math.max(1, Math.round((Math.max(...datas) - Math.min(...datas)) / (1000 * 60 * 60 * 24 * 30)) + 1);
              consumoMedio = Math.round(totalUso / meses);
            }
            return (
              <div key={item.calibre} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.borderSoft}`, borderRadius: 14, padding: 15, display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 12, letterSpacing: '0.06em', color: colors.text }}>{item.calibre}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>
                    {item.saldo.toLocaleString('pt-BR')}{' '}
                    <span style={{ fontSize: 11.5, fontWeight: 400, color: colors.textMuted }}>un. em estoque</span>
                  </span>
                </div>
                <span style={{ fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted }}>
                  {ultimo ? `ÚLT. COMPRA ${formatDiaMes(ultimo.data)}` : 'SEM COMPRAS REGISTRADAS'}
                  {consumoMedio ? ` · CONSUMO MÉDIO ${consumoMedio}/MÊS` : ''}
                </span>
              </div>
            );
          })
        ) : (
          <EmptyState message="Nenhum registro de munição ainda" />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.textMuted, paddingBottom: 8 }}>
          Movimentações
        </span>
        {movimentos.data?.length ? (
          movimentos.data.slice(0, 20).map((item, idx, arr) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                paddingTop: 12,
                paddingBottom: 12,
                borderBottom: idx === arr.length - 1 ? 'none' : `1px solid ${colors.divider}`,
              }}
            >
              <span style={{ width: 22, textAlign: 'center', fontSize: 15, color: item.tipoMovimento === 'COMPRA' ? colors.accentText : colors.textMuted }}>
                {item.tipoMovimento === 'COMPRA' ? '+' : '−'}
              </span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>
                  {item.tipoMovimento === 'COMPRA' ? 'Compra' : 'Uso em treino'} · {item.quantidade} un. {item.calibre}
                </span>
                <span style={{ fontFamily: fonts.mono, fontSize: 10.5, color: 'rgba(236,239,236,.42)' }}>
                  {formatDataMono(item.data)}
                  {item.arma ? ` · ${item.arma.marca} ${item.arma.modelo}` : ''}
                </span>
              </div>
              {item.notaFiscalUrl && <Badge text="NF" tone="accent" />}
            </div>
          ))
        ) : (
          <EmptyState message="Nenhuma movimentação registrada" />
        )}
      </div>

      {novoAberto && (
        <div
          onClick={fecharModal}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5,6,6,0.62)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.sheet,
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '22px 22px 26px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              width: '100%',
              maxWidth: 440,
            }}
          >
            <span style={{ fontSize: 19, fontWeight: 600, color: colors.text }}>Registrar movimento</span>

            <div>
              <Label>Tipo</Label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {(['COMPRA', 'USO'] as const).map((opcao) => {
                  const ativo = tipoMovimento === opcao;
                  return (
                    <button
                      key={opcao}
                      onClick={() => setTipoMovimento(opcao)}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        border: `1px solid ${ativo ? colors.accent : colors.borderSoft}`,
                        backgroundColor: ativo ? colors.accent : colors.surfaceRaised,
                        color: ativo ? colors.onAccent : colors.textMuted,
                        fontWeight: 600,
                      }}
                    >
                      {opcao}
                    </button>
                  );
                })}
              </div>
            </div>

            <Field label="Calibre" value={calibre} onChange={(e) => setCalibre(e.target.value)} placeholder="Ex: 9x19" />
            <Field label="Quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} inputMode="numeric" />
            <DateField label="Data" value={data} onChange={setData} />

            <div>
              <Label>Arma vinculada</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {(armas.data ?? []).map((arma) => {
                  const ativo = armaId === arma.id;
                  return (
                    <button
                      key={arma.id}
                      onClick={() => setArmaId(ativo ? undefined : arma.id)}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: `1px solid ${ativo ? colors.accent : colors.borderSoft}`,
                        backgroundColor: ativo ? colors.accent : colors.surfaceRaised,
                        color: ativo ? colors.onAccent : colors.textMuted,
                      }}
                    >
                      {arma.marca} {arma.modelo}
                    </button>
                  );
                })}
              </div>
            </div>

            {erro && <p style={{ color: colors.danger, fontSize: 13 }}>{erro}</p>}

            <Button title="Registrar movimento" onClick={handleSubmit} loading={mutation.isPending} />
          </div>
        </div>
      )}
    </div>
  );
}
