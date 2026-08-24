'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BarRow, Card, EmDiaPill, GradientCard, MonoLabel, VencimentoRow, toneOf } from '@/components/ui';
import { getDashboard, getPerfil } from '@/api/auth';
import { obterStatusHabitualidade } from '@/api/sessoesTreino';
import { listarVencimentos } from '@/api/documentos';
import { saldoPorCalibre } from '@/api/municao';
import { colors, fonts } from '@/lib/theme';
import { diasRestantes, formatContagem, formatFimPeriodo, metaVencimento, tituloVencimento } from '@/lib/format';
import { useTrainingSheetStore } from '@/store/uiStore';

function iniciais(nome?: string) {
  if (!nome) return '··';
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || partes[0]?.slice(0, 2).toUpperCase();
}

export default function DashboardPage() {
  const router = useRouter();
  const openSheet = useTrainingSheetStore((s) => s.openSheet);

  const perfil = useQuery({ queryKey: ['perfil'], queryFn: getPerfil });
  useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
  const habitualidade = useQuery({ queryKey: ['habitualidade'], queryFn: obterStatusHabitualidade });
  const vencimentos = useQuery({ queryKey: ['vencimentos', 90], queryFn: () => listarVencimentos(90) });
  const municao = useQuery({ queryKey: ['municao-saldo'], queryFn: saldoPorCalibre });

  const hab = habitualidade.data;
  const totalBarras = hab?.minimoSessoesExigido ?? 4;
  const barras = Array.from({ length: totalBarras }, (_, i) => ({ filled: (hab?.sessoesNoPeriodo ?? 0) > i }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: colors.text, letterSpacing: '-0.02em' }}>{perfil.data?.nome ?? '···'}</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: '0.06em', color: colors.textMuted }}>
            {[perfil.data?.crNumero ? `CR ${perfil.data.crNumero}` : null, perfil.data?.categoriaCac].filter(Boolean).join(' · ') || 'PERFIL'}
          </span>
        </div>
        <button
          onClick={() => router.push('/app/configuracoes')}
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: colors.surfaceRaised,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: fonts.mono,
            fontSize: 13,
            color: 'rgba(236,239,236,.6)',
          }}
        >
          {iniciais(perfil.data?.nome)}
        </button>
      </div>

      <GradientCard>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <MonoLabel style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Habitualidade</MonoLabel>
          <EmDiaPill emDia={hab?.emDia ?? true} faltam={hab?.faltam} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: 44, fontWeight: 600, color: colors.text, lineHeight: '40px', letterSpacing: '-0.03em' }}>
            {hab?.sessoesNoPeriodo ?? '-'}
          </span>
          <span style={{ fontSize: 14, color: colors.textMuted, paddingBottom: 4 }}>/ {hab?.minimoSessoesExigido ?? '-'} sessões no ano</span>
        </div>
        <BarRow segments={barras} />
        <span style={{ fontSize: 12, color: colors.textMuted }}>
          {hab ? `${formatFimPeriodo(hab.inicioPeriodo, hab.periodoMeses)} · comprovante gerado automaticamente` : 'Carregando...'}
        </span>
      </GradientCard>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => openSheet()}
          style={{ flex: 1, borderRadius: 14, padding: '14px 12px 12px', minHeight: 88, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8, backgroundColor: colors.accent, border: 'none', textAlign: 'left' }}
        >
          <span style={{ fontSize: 18, fontWeight: 600, color: colors.onAccent }}>+</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.onAccent, lineHeight: '16px' }}>
            Registrar
            <br />
            treino
          </span>
        </button>
        <Link
          href="/app/carteiras"
          style={{ flex: 1, borderRadius: 14, padding: '14px 12px 12px', minHeight: 88, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8, backgroundColor: colors.surfaceRaised, border: `1px solid ${colors.border}` }}
        >
          <div style={{ width: 16, height: 11, border: '1.5px solid rgba(236,239,236,.7)', borderRadius: 2 }} />
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(236,239,236,.85)', lineHeight: '16px' }}>Carteiras</span>
        </Link>
        <Link
          href="/app/documentos"
          style={{ flex: 1, borderRadius: 14, padding: '14px 12px 12px', minHeight: 88, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8, backgroundColor: colors.surfaceRaised, border: `1px solid ${colors.border}` }}
        >
          <div style={{ width: 12, height: 15, border: '1.5px solid rgba(236,239,236,.7)', borderRadius: 2 }} />
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(236,239,236,.85)', lineHeight: '16px' }}>Documentos</span>
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <MonoLabel style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Vencimentos</MonoLabel>
          <Link href="/app/vencimentos" style={{ fontSize: 12, color: colors.accentText, fontWeight: 500 }}>
            Ver todos
          </Link>
        </div>
        {vencimentos.data?.length ? (
          vencimentos.data.slice(0, 5).map((doc) => {
            const dias = diasRestantes(doc.dataValidade);
            return (
              <VencimentoRow
                key={doc.id}
                titulo={tituloVencimento(doc)}
                meta={metaVencimento(doc)}
                contagem={formatContagem(dias)}
                tone={toneOf(dias)}
                onClick={() => router.push('/app/vencimentos')}
              />
            );
          })
        ) : (
          <Card>
            <span style={{ color: colors.textMuted, fontSize: 14 }}>Nenhum vencimento nos próximos 90 dias</span>
          </Card>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <MonoLabel style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Munição em estoque</MonoLabel>
          <Link href="/app/municao" style={{ fontSize: 12, color: colors.accentText, fontWeight: 500 }}>
            Ver todos
          </Link>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {(municao.data ?? []).slice(0, 4).map((item) => (
            <Link
              key={item.calibre}
              href="/app/municao"
              style={{ flexBasis: '31%', flexGrow: 1, backgroundColor: colors.surface, border: `1px solid ${colors.borderSoft}`, borderRadius: 12, padding: '12px 12px 11px', display: 'flex', flexDirection: 'column', gap: 5 }}
            >
              <MonoLabel style={{ fontSize: 10.5 }}>{item.calibre}</MonoLabel>
              <span style={{ fontSize: 19, fontWeight: 600, color: colors.text, letterSpacing: '-0.02em' }}>{item.saldo}</span>
              <span style={{ fontSize: 10.5, color: colors.textFaint }}>em estoque</span>
            </Link>
          ))}
          {!municao.data?.length && (
            <Card style={{ flex: 1 }}>
              <span style={{ color: colors.textMuted, fontSize: 14 }}>Nenhum registro de munição ainda</span>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
