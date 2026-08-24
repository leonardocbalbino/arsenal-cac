import Link from 'next/link';
import { colors, fonts } from '@/lib/theme';

const FEATURES = [
  {
    title: 'Nunca perca um prazo',
    body: 'Guia de tráfego, CR, filiações e exames — todos os vencimentos num só lugar, com avisos automáticos em 30, 15 e 7 dias.',
  },
  {
    title: 'Prove habitualidade em segundos',
    body: 'Cada sessão de treino registrada gera o comprovante do semestre pronto para fiscalização, sem planilha e sem esquecimento.',
  },
  {
    title: 'Carteiras na palma da mão',
    body: 'Modo apresentação em tela cheia com brilho máximo — entregue o celular ao fiscal e mostre CR, filiação e registro em segundos.',
  },
  {
    title: 'Munição e arsenal auditáveis',
    body: 'Saldo por calibre, histórico de compras e uso, manutenção por arma. Tudo rastreável, tudo exportável em PDF.',
  },
];

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      <header
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          padding: '24px 24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 600, color: colors.text }}>CAC App</span>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/login" style={{ fontSize: 14, color: colors.textMuted }}>
            Entrar
          </Link>
          <Link
            href="/registro"
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: colors.onAccent,
              backgroundColor: colors.accent,
              padding: '10px 16px',
              borderRadius: 10,
            }}
          >
            Criar conta
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '96px 24px 64px', textAlign: 'center' }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.accentText }}>
          Gestão de acervo para CAC
        </span>
        <h1 style={{ fontSize: 44, fontWeight: 600, color: colors.text, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '16px 0' }}>
          Seu arsenal, documentos e habitualidade — sempre em dia.
        </h1>
        <p style={{ fontSize: 17, color: colors.textMuted, lineHeight: 1.6, maxWidth: 560, margin: '0 auto 32px' }}>
          Para colecionadores, atiradores e caçadores CAC. Prazos, munição e carteiras num só app —
          disponível no celular e aqui na web.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link
            href="/registro"
            style={{ fontSize: 15, fontWeight: 600, color: colors.onAccent, backgroundColor: colors.accent, padding: '14px 24px', borderRadius: 12 }}
          >
            Começar agora
          </Link>
          <Link
            href="/login"
            style={{ fontSize: 15, fontWeight: 500, color: colors.text, backgroundColor: colors.surfaceRaised, border: `1px solid ${colors.border}`, padding: '14px 24px', borderRadius: 12 }}
          >
            Já tenho conta
          </Link>
        </div>
      </main>

      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{ backgroundColor: colors.surface, border: `1px solid ${colors.borderSoft}`, borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>{f.title}</h2>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: colors.textMuted }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${colors.borderSoft}`, padding: '24px', textAlign: 'center' }}>
        <span style={{ fontSize: 12.5, color: colors.textFaint }}>CAC App · gestão de acervo para colecionadores, atiradores e caçadores</span>
      </footer>
    </div>
  );
}
