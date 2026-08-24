'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Label, LoadingState } from '@/components/ui';
import { obterDocumento, removerDocumento } from '@/api/documentos';
import { resolveUploadUrl } from '@/api/client';
import { colors, fonts } from '@/lib/theme';
import { formatDataBr, rotuloTipo } from '@/lib/format';

export default function DocumentoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const documento = useQuery({ queryKey: ['documento', id], queryFn: () => obterDocumento(id), enabled: !!id });

  const excluir = useMutation({
    mutationFn: () => removerDocumento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      router.push('/app/documentos');
    },
  });

  function handleExcluir() {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;
    excluir.mutate();
  }

  if (!documento.data) {
    return <LoadingState />;
  }

  const doc = documento.data;
  const arquivoUrl = resolveUploadUrl(doc.arquivoUrl);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <button
        onClick={() => router.push('/app/documentos')}
        style={{ alignSelf: 'flex-start', fontSize: 13.5, fontWeight: 500, color: colors.accentText, background: 'none', border: 'none', padding: 0 }}
      >
        ‹ Documentos
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 600, color: colors.text, letterSpacing: '-0.025em' }}>{rotuloTipo[doc.tipo]}</h1>

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <Label>Número</Label>
          <span style={{ color: colors.text, fontSize: 14 }}>{doc.numero ?? '-'}</span>
        </div>
        <div>
          <Label>Emissão</Label>
          <span style={{ color: colors.text, fontSize: 14 }}>{doc.dataEmissao ? formatDataBr(doc.dataEmissao) : '-'}</span>
        </div>
        <div>
          <Label>Validade</Label>
          <span style={{ color: colors.text, fontSize: 14 }}>{doc.dataValidade ? formatDataBr(doc.dataValidade) : '-'}</span>
        </div>
        {doc.arma && (
          <div>
            <Label>Arma</Label>
            <span style={{ color: colors.text, fontSize: 14 }}>{doc.arma.marca} {doc.arma.modelo}</span>
          </div>
        )}
        {doc.clube && (
          <div>
            <Label>Clube</Label>
            <span style={{ color: colors.text, fontSize: 14 }}>{doc.clube.nome}</span>
          </div>
        )}
        {doc.observacoes && (
          <div>
            <Label>Observações</Label>
            <span style={{ color: colors.textMuted, fontSize: 13, fontFamily: fonts.sans }}>{doc.observacoes}</span>
          </div>
        )}
      </Card>

      {arquivoUrl && <Button title="Abrir arquivo anexado" variant="secondary" onClick={() => window.open(arquivoUrl, '_blank')} />}

      <Button title="Excluir documento" variant="danger" onClick={handleExcluir} loading={excluir.isPending} />
    </div>
  );
}
