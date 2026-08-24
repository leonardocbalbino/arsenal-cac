'use client';

import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BackLink, Button, DateField, Field, LoadingState, StripedPlaceholder } from '@/components/ui';
import { atualizarArma, criarManutencao, listarManutencoes, obterArma, removerArma } from '@/api/armas';
import { resolveUploadUrl } from '@/api/client';
import { baixarDossie } from '@/api/relatorios';
import { colors, fonts } from '@/lib/theme';
import { formatDataBr, formatMesAno } from '@/lib/format';
import { useToastStore, useTrainingSheetStore } from '@/store/uiStore';

const gridLabelStyle = { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: '0.13em', color: colors.textMuted };
const gridValueStyle = { fontSize: 14, color: colors.text };
const sectionLabelStyle = {
  fontFamily: fonts.mono,
  fontSize: 10.5,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: colors.textMuted,
};

export default function ArmaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const openSheet = useTrainingSheetStore((s) => s.openSheet);
  const showToast = useToastStore((s) => s.showToast);

  const arma = useQuery({ queryKey: ['arma', id], queryFn: () => obterArma(id) });
  const manutencoes = useQuery({ queryKey: ['manutencoes', id], queryFn: () => listarManutencoes(id) });

  const [descricao, setDescricao] = useState('');
  const [dataManutencao, setDataManutencao] = useState('');

  const addManutencao = useMutation({
    mutationFn: () => criarManutencao(id, { data: dataManutencao, descricao }),
    onSuccess: () => {
      setDescricao('');
      setDataManutencao('');
      queryClient.invalidateQueries({ queryKey: ['manutencoes', id] });
    },
  });

  const excluir = useMutation({
    mutationFn: () => removerArma(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armas'] });
      router.push('/app/arsenal');
    },
  });

  const fotoInputRef = useRef<HTMLInputElement>(null);
  const trocarFoto = useMutation({
    mutationFn: (foto: File) => atualizarArma(id, { foto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arma', id] });
      queryClient.invalidateQueries({ queryKey: ['armas'] });
    },
  });

  function selecionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (arquivo) trocarFoto.mutate(arquivo);
  }

  async function gerarDossie() {
    await baixarDossie();
    showToast('PDF gerado e salvo em Documentos');
  }

  function handleExcluir() {
    if (window.confirm('Excluir arma? Essa ação não pode ser desfeita.')) {
      excluir.mutate();
    }
  }

  if (!arma.data) {
    return <LoadingState />;
  }

  const a = arma.data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <BackLink label="Arsenal" onClick={() => router.push('/app/arsenal')} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <h1 style={{ fontSize: 27, fontWeight: 600, color: colors.text, letterSpacing: '-0.025em' }}>
          {a.marca} {a.modelo}
        </h1>
        <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textMuted }}>
          {a.categoria} · {a.calibre} · SIGMA {a.numeroSerie}
        </span>
      </div>

      <input ref={fotoInputRef} type="file" accept="image/*" onChange={selecionarFoto} style={{ display: 'none' }} />
      <button type="button" onClick={() => fotoInputRef.current?.click()} style={{ display: 'block', width: '100%', border: 'none', padding: 0, background: 'none' }}>
        {a.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveUploadUrl(a.fotoUrl)!} alt="" style={{ height: 150, borderRadius: 14, objectFit: 'cover', width: '100%', display: 'block' }} />
        ) : (
          <StripedPlaceholder label={trocarFoto.isPending ? 'ENVIANDO...' : 'CLIQUE PARA ADICIONAR FOTO'} style={{ height: 150 }} />
        )}
      </button>

      <div style={{ display: 'flex', flexWrap: 'wrap', border: `1px solid ${colors.borderSoft}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ width: '50%', backgroundColor: colors.surface, padding: '13px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={gridLabelStyle}>Nº CRAF</span>
          <span style={gridValueStyle}>{a.crafNumero ?? '-'}</span>
        </div>
        <div
          style={{
            width: '50%',
            backgroundColor: colors.surface,
            padding: '13px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            borderLeft: `1px solid ${colors.borderSoft}`,
          }}
        >
          <span style={gridLabelStyle}>STATUS</span>
          <span style={gridValueStyle}>{a.ativa ? 'Ativa' : 'Inativa'}</span>
        </div>
        <div
          style={{
            width: '50%',
            backgroundColor: colors.surface,
            padding: '13px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            borderTop: `1px solid ${colors.borderSoft}`,
          }}
        >
          <span style={gridLabelStyle}>AQUISIÇÃO</span>
          <span style={gridValueStyle}>{new Date(a.criadoEm).toLocaleDateString('pt-BR')}</span>
        </div>
        <div
          style={{
            width: '50%',
            backgroundColor: colors.surface,
            padding: '13px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            borderTop: `1px solid ${colors.borderSoft}`,
            borderLeft: `1px solid ${colors.borderSoft}`,
          }}
        >
          <span style={gridLabelStyle}>GUIA DE TRÁFEGO</span>
          <span style={{ ...gridValueStyle, color: a.crafValidade ? colors.accentText : gridValueStyle.color }}>
            {a.crafValidade ? formatDataBr(a.crafValidade) : '-'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <span style={sectionLabelStyle}>Histórico de manutenção</span>
        {manutencoes.data?.length ? (
          manutencoes.data.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: 12,
                paddingTop: 11,
                paddingBottom: 11,
                borderBottom: idx === manutencoes.data!.length - 1 ? 'none' : `1px solid ${colors.divider}`,
              }}
            >
              <span style={{ fontFamily: fonts.mono, fontSize: 10.5, color: colors.textMuted, width: 64, flexShrink: 0 }}>
                {formatMesAno(item.data)}
              </span>
              <span style={{ flex: 1, fontSize: 13.5, lineHeight: '19px', color: colors.text }}>{item.descricao}</span>
            </div>
          ))
        ) : (
          <span style={{ color: colors.textMuted, fontSize: 14 }}>Nenhum registro ainda</span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        <DateField label="Data" value={dataManutencao} onChange={setDataManutencao} />
        <Field label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: limpeza, troca de peça" />
        <Button title="Adicionar manutenção" variant="secondary" onClick={() => addManutencao.mutate()} loading={addManutencao.isPending} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Button title="Dossiê PDF" variant="secondary" compact onClick={gerarDossie} />
        </div>
        <div style={{ flex: 1 }}>
          <Button title="Usar em treino" compact onClick={() => openSheet(a)} />
        </div>
      </div>

      <Button title="Excluir arma" variant="danger" onClick={handleExcluir} loading={excluir.isPending} />
    </div>
  );
}
