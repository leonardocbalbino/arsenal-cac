'use client';

import { useQuery } from '@tanstack/react-query';
import { ScreenTitle, LoadingState } from '@/components/ui';
import { StatTile, BarList } from '@/components/admin/Stats';
import { getAdminStats } from '@/api/admin';

const ROTULO_CATEGORIA: Record<string, string> = {
  ATIRADOR: 'Atirador',
  CACADOR: 'Caçador',
  COLECIONADOR: 'Colecionador',
  NAO_INFORMADA: 'Não informada',
};

export default function AdminPage() {
  const stats = useQuery({ queryKey: ['admin-stats'], queryFn: getAdminStats });

  if (stats.isLoading || !stats.data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <ScreenTitle>Admin</ScreenTitle>
        <LoadingState />
      </div>
    );
  }

  const d = stats.data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ScreenTitle>Admin</ScreenTitle>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <StatTile label="Usuários" value={d.totalUsuarios} />
        <StatTile label="Novos (30 dias)" value={d.novosUsuarios30Dias} />
        <StatTile label="Armas ativas" value={d.totalArmas} />
        <StatTile label="Documentos" value={d.totalDocumentos} />
      </div>

      <BarList
        title="Modelos mais comuns"
        items={d.armasPorModelo.map((item) => ({ label: `${item.marca} ${item.modelo}`, value: item.total }))}
      />

      <BarList title="Calibres mais comuns" items={d.armasPorCalibre.map((item) => ({ label: item.calibre, value: item.total }))} />

      <BarList
        title="Usuários por categoria"
        items={d.usuariosPorCategoria.map((item) => ({ label: ROTULO_CATEGORIA[item.categoria] ?? item.categoria, value: item.total }))}
      />
    </div>
  );
}
