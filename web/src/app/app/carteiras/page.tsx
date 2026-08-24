'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { StripedPlaceholder } from '@/components/ui';
import { getPerfil } from '@/api/auth';
import { listarFiliacoes } from '@/api/clubes';
import { colors, fonts } from '@/lib/theme';
import { formatDataBr } from '@/lib/format';
import { useToastStore } from '@/store/uiStore';

interface WalletCard {
  kind: string;
  title: string;
  numLabel: string;
  num: string;
  val: string;
  issuer: string;
}

export default function CarteirasPage() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  const perfil = useQuery({ queryKey: ['perfil'], queryFn: getPerfil });
  const filiacoes = useQuery({ queryKey: ['filiacoes'], queryFn: listarFiliacoes });

  const [idx, setIdx] = useState(0);

  // Aproximação do expo-keep-awake: mantém a tela ligada enquanto o modo
  // apresentação está aberto, usando a Screen Wake Lock API do navegador.
  // A API não é suportada em todos os navegadores, então é feature-detected
  // e qualquer falha é silenciosamente ignorada.
  useEffect(() => {
    let wakeLock: { release: () => Promise<void> } | null = null;
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as unknown as { wakeLock: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock.request('screen');
        }
      } catch {
        // Wake Lock indisponível neste navegador — segue sem manter a tela acesa
      }
    }
    requestWakeLock();
    return () => {
      wakeLock?.release().catch(() => undefined);
    };
  }, []);

  const perfilEfetivo = perfil.data;

  const wallets = useMemo<WalletCard[]>(() => {
    const filiacoesEfetivas = filiacoes.data ?? [];
    const lista: WalletCard[] = [];
    if (perfilEfetivo?.crNumero) {
      lista.push({
        kind: 'CERTIFICADO DE REGISTRO',
        title: perfilEfetivo.nome,
        numLabel: 'Nº CR',
        num: perfilEfetivo.crNumero,
        val: perfilEfetivo.crValidade ? formatDataBr(perfilEfetivo.crValidade) : '-',
        issuer: 'Exército Brasileiro · COLOG',
      });
    }
    for (const filiacao of filiacoesEfetivas) {
      lista.push({
        kind: 'FILIAÇÃO A CLUBE',
        title: filiacao.clube.nome,
        numLabel: 'Nº SÓCIO',
        num: filiacao.numeroSocio ?? '-',
        val: filiacao.dataValidade ? formatDataBr(filiacao.dataValidade) : '-',
        issuer: filiacao.clube.cbte ? `CBTE ${filiacao.clube.cbte}` : 'Confederação Brasileira de Tiro Esportivo',
      });
    }
    return lista;
  }, [perfilEfetivo, filiacoes.data]);

  const atual = wallets[Math.min(idx, wallets.length - 1)];
  const sinc = new Date().toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: colors.walletBg,
        display: 'flex',
        flexDirection: 'column',
        padding: '58px 20px 26px',
        gap: 18,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.walletTextMuted }}>
          Modo apresentação · brilho máx.
        </span>
        <button
          onClick={() => router.back()}
          style={{ width: 30, height: 30, borderRadius: 99, backgroundColor: colors.walletChip, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ fontSize: 15, color: colors.walletText }}>✕</span>
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
        {atual ? (
          <div
            style={{
              backgroundColor: colors.walletCard,
              border: `1px solid ${colors.walletCardBorder}`,
              borderRadius: 16,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 18px 40px rgba(20,23,15,0.12)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                borderBottom: `1px solid ${colors.walletDivider}`,
                paddingBottom: 14,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: '0.16em', color: colors.walletTextMuted }}>{atual.kind}</span>
                <span style={{ fontSize: 17, fontWeight: 600, color: colors.walletText, letterSpacing: '-0.01em' }}>{atual.title}</span>
              </div>
              <StripedPlaceholder label="QR" variant="light" style={{ width: 52, height: 52, borderRadius: 8, flexShrink: 0 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.14em', color: colors.walletTextFaint }}>NOME</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: colors.walletText }}>{perfilEfetivo?.nome}</span>
              </div>
              <div style={{ display: 'flex', gap: 22 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.14em', color: colors.walletTextFaint }}>{atual.numLabel}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.walletText }}>{atual.num}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.14em', color: colors.walletTextFaint }}>VALIDADE</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.walletText }}>{atual.val}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.14em', color: colors.walletTextFaint }}>EMISSOR</span>
                <span style={{ fontSize: 13.5, color: colors.walletText, fontFamily: fonts.sans }}>{atual.issuer}</span>
              </div>
            </div>
            <span style={{ fontFamily: fonts.mono, fontSize: 9.5, color: colors.walletTextFaint, lineHeight: '14px', borderTop: `1px solid ${colors.walletDivider}`, paddingTop: 12 }}>
              CÓPIA DIGITAL · CONFERIR ORIGINAL · SINC. {sinc}
            </span>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: colors.walletCard,
              border: `1px solid ${colors.walletCardBorder}`,
              borderRadius: 16,
              padding: 20,
              display: 'flex',
              boxShadow: '0 18px 40px rgba(20,23,15,0.12)',
            }}
          >
            <span style={{ color: colors.walletTextMuted, fontFamily: fonts.sans }}>Nenhuma carteira disponível ainda</span>
          </div>
        )}

        {wallets.length > 1 && (
          <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
            {wallets.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                style={{ width: 7, height: 7, borderRadius: 99, border: 'none', padding: 0, backgroundColor: i === idx ? colors.walletText : 'rgba(20,23,15,.22)' }}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => showToast('Em breve: salvar na Wallet')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20,23,15,0.07)', border: 'none', borderRadius: 12, padding: '13px 0' }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: colors.walletText }}>Salvar na Wallet</span>
        </button>
        <button
          onClick={() => router.back()}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.walletText, border: 'none', borderRadius: 12, padding: '13px 0' }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: colors.walletBg }}>Concluir</span>
        </button>
      </div>
    </div>
  );
}
