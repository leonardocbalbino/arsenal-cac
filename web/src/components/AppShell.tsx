'use client';

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPerfil } from '@/api/auth';
import { colors, fonts } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { href: '/app', label: 'Início', match: (p: string) => p === '/app' },
  { href: '/app/habitualidade', label: 'Habitualidade', match: (p: string) => p.startsWith('/app/habitualidade') },
  { href: '/app/arsenal', label: 'Arsenal', match: (p: string) => p.startsWith('/app/arsenal') },
  { href: '/app/municao', label: 'Munição', match: (p: string) => p.startsWith('/app/municao') },
  { href: '/app/documentos', label: 'Documentos', match: (p: string) => p.startsWith('/app/documentos') },
  { href: '/app/vencimentos', label: 'Vencimentos', match: (p: string) => p.startsWith('/app/vencimentos') },
  { href: '/app/carteiras', label: 'Carteiras', match: (p: string) => p.startsWith('/app/carteiras') },
];

function iniciais(nome?: string) {
  if (!nome) return '··';
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || partes[0]?.slice(0, 2).toUpperCase();
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const perfil = useQuery({ queryKey: ['perfil'], queryFn: getPerfil });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: colors.bg }}>
      <aside
        style={{
          width: 232,
          flexShrink: 0,
          borderRight: `1px solid ${colors.borderSoft}`,
          padding: '28px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        <Link href="/app" style={{ fontSize: 17, fontWeight: 600, color: colors.text, padding: '0 8px' }}>
          CAC App
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: active ? colors.text : colors.tabInactive,
                  backgroundColor: active ? colors.surfaceRaised : 'transparent',
                }}
              >
                {item.label}
              </Link>
            );
          })}
          {perfil.data?.role === 'ADMIN' && (
            <Link
              href="/admin"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 500,
                color: pathname.startsWith('/admin') ? colors.text : colors.tabInactive,
                backgroundColor: pathname.startsWith('/admin') ? colors.surfaceRaised : 'transparent',
                marginTop: 12,
                borderTop: `1px solid ${colors.divider}`,
                paddingTop: 22,
              }}
            >
              Admin
            </Link>
          )}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: colors.surfaceRaised,
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.mono,
              fontSize: 12,
              color: 'rgba(236,239,236,.6)',
            }}
          >
            {iniciais(perfil.data?.nome)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {perfil.data?.nome ?? '···'}
            </div>
            <button
              onClick={() => {
                signOut();
                router.replace('/login');
              }}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: 11.5, color: colors.textMuted }}
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: '40px 44px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>{children}</div>
      </main>
    </div>
  );
}
