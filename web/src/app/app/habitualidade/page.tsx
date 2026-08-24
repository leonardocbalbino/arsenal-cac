'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, Card, FAB, MonoLabel, ScreenTitle, SegmentedControl } from '@/components/ui';
import { listarSessoesTreino, obterStatusHabitualidade } from '@/api/sessoesTreino';
import { baixarComprovanteHabitualidade } from '@/api/relatorios';
import { colors, fonts, radius } from '@/lib/theme';
import { useToastStore, useTrainingSheetStore } from '@/store/uiStore';

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function ultimos12Meses(sessoes: { data: string; municaoGastaQtd: number | null }[]) {
  const agora = new Date();
  const meses = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth() - (11 - i), 1);
    return { chave: `${d.getFullYear()}-${d.getMonth()}`, label: MESES[d.getMonth()], sessoes: 0, disparos: 0 };
  });
  for (const s of sessoes) {
    // s.data é uma data sem hora (UTC-meia-noite) — usar getters UTC para
    // recuperar o mês calendário pretendido, não o mês local de quem vê a tela.
    const d = new Date(s.data);
    const chave = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const mes = meses.find((m) => m.chave === chave);
    if (mes) {
      mes.sessoes += 1;
      mes.disparos += s.municaoGastaQtd ?? 0;
    }
  }
  return meses;
}

export default function HabitualidadePage() {
  const openSheet = useTrainingSheetStore((s) => s.openSheet);
  const showToast = useToastStore((s) => s.showToast);
  const [periodo, setPeriodo] = useState<'semestre' | 'ano'>('semestre');

  const status = useQuery({ queryKey: ['habitualidade'], queryFn: obterStatusHabitualidade });
  const sessoes = useQuery({ queryKey: ['sessoes-treino'], queryFn: listarSessoesTreino });

  const meses = useMemo(() => ultimos12Meses(sessoes.data ?? []), [sessoes.data]);
  const janelaMeses = periodo === 'semestre' ? 6 : 12;
  const mesesNaJanela = meses.slice(12 - janelaMeses);
  const totalSessoes = mesesNaJanela.reduce((acc, m) => acc + m.sessoes, 0);
  const totalDisparos = mesesNaJanela.reduce((acc, m) => acc + m.disparos, 0);
  const maxSessoes = Math.max(1, ...meses.map((m) => m.sessoes));

  async function gerarPdf() {
    await baixarComprovanteHabitualidade();
    showToast('PDF gerado e salvo em Documentos');
  }

  const sessoesOrdenadas = [...(sessoes.data ?? [])].sort((a, b) => (a.data > b.data ? -1 : 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ScreenTitle action={<FAB onPress={() => openSheet()} />}>Habitualidade</ScreenTitle>

      <SegmentedControl
        value={periodo}
        onChange={setPeriodo}
        options={[
          { value: 'semestre', label: 'Semestre atual' },
          { value: 'ano', label: 'Últimos 12 meses' },
        ]}
      />

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 16, borderRadius: radius.featureCard, padding: 16, paddingBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <MonoLabel style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Sessões registradas</MonoLabel>
            <span style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>
              {totalSessoes} sessões · {totalDisparos} disparos
            </span>
          </div>
          {status.data && (
            <span
              style={{
                fontFamily: fonts.mono,
                fontWeight: 600,
                fontSize: 11,
                color: status.data.emDia ? colors.accentText : colors.warn,
                paddingBottom: 2,
              }}
            >
              {status.data.emDia ? 'EM DIA' : `FALTAM ${status.data.faltam}`}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 104 }}>
          {meses.map((mes, i) => {
            const naJanela = i >= 12 - janelaMeses;
            const atual = i === 11;
            const altura = maxSessoes > 0 ? 12 + (mes.sessoes / maxSessoes) * 92 : 12;
            const cor = atual ? 'rgba(31,92,74,0.5)' : naJanela ? colors.accent : colors.chartTrack;
            return (
              <div key={mes.chave} style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                <div style={{ width: '100%', height: altura, backgroundColor: cor, borderRadius: 4 }} />
                <span style={{ fontFamily: fonts.mono, fontSize: 9, color: atual ? 'rgba(236,239,236,.55)' : colors.textFaint }}>
                  {mes.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <button
        onClick={gerarPdf}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          backgroundColor: colors.surface,
          border: '1px solid rgba(78,156,130,0.45)',
          borderStyle: 'dashed',
          borderRadius: 14,
          padding: 14,
          width: '100%',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>Comprovante de habitualidade</span>
          <span style={{ fontSize: 11.5, color: colors.textMuted }}>
            {periodo === 'semestre' ? 'PDF do semestre · pronto para fiscalização' : 'PDF dos últimos 12 meses · pronto para fiscalização'}
          </span>
        </div>
        <span style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: 11, color: colors.accentText }}>GERAR</span>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <MonoLabel style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', paddingBottom: 8 }}>Sessões</MonoLabel>
        {sessoesOrdenadas.length ? (
          sessoesOrdenadas.map((item, idx) => {
            const d = new Date(item.data);
            const calibre = item.armas[0]?.arma.calibre;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  paddingTop: 13,
                  paddingBottom: 13,
                  borderBottom: idx === sessoesOrdenadas.length - 1 ? 'none' : `1px solid ${colors.divider}`,
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', width: 42, alignItems: 'center', gap: 1 }}>
                  <span style={{ fontSize: 17, fontWeight: 600, color: colors.text, letterSpacing: '-0.02em' }}>
                    {String(d.getUTCDate()).padStart(2, '0')}
                  </span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 9.5, color: colors.textMuted }}>{MESES[d.getUTCMonth()]}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>{item.clube?.nome ?? 'Clube não informado'}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>
                    {[calibre, item.municaoGastaQtd ? `${item.municaoGastaQtd} disparos` : null, d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>
                <Badge text={item.comprovanteUrl ? 'PDF' : 'SEM PDF'} tone={item.comprovanteUrl ? 'accent' : 'neutral'} />
              </div>
            );
          })
        ) : (
          <Card>
            <span style={{ color: colors.textMuted, fontSize: 14 }}>Nenhuma sessão de treino registrada</span>
          </Card>
        )}
      </div>
    </div>
  );
}
