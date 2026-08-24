'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, DateField, Field, Label } from '@/components/ui';
import { criarDocumento } from '@/api/documentos';
import { listarArmas } from '@/api/armas';
import { EntidadeAlvo, TipoDocumento } from '@/api/types';
import { colors, fonts } from '@/lib/theme';
import { useToastStore } from '@/store/uiStore';

const TIPOS: { valor: TipoDocumento; rotulo: string }[] = [
  { valor: 'CR', rotulo: 'CR' },
  { valor: 'CRAF', rotulo: 'CRAF' },
  { valor: 'GUIA_TRAFEGO', rotulo: 'Guia de Tráfego' },
  { valor: 'ATESTADO_SANIDADE', rotulo: 'Atestado de Sanidade' },
  { valor: 'EXAME_PSICOLOGICO', rotulo: 'Exame Psicológico' },
  { valor: 'COMPROVANTE_RESIDENCIA', rotulo: 'Comprovante de Residência' },
  { valor: 'TITULO_FILIACAO', rotulo: 'Título de Filiação' },
  { valor: 'OUTRO', rotulo: 'Outro' },
];

function Selector<T extends string>({
  opcoes,
  valor,
  onChange,
}: {
  opcoes: { valor: T; rotulo: string }[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
      {opcoes.map((opcao) => {
        const ativo = valor === opcao.valor;
        return (
          <button
            key={opcao.valor}
            onClick={() => onChange(opcao.valor)}
            style={{
              padding: '8px 12px',
              borderRadius: 99,
              border: `1px solid ${ativo ? colors.accent : 'rgba(255,255,255,0.12)'}`,
              backgroundColor: ativo ? colors.accent : colors.surfaceRaised,
              color: ativo ? colors.onAccent : colors.textMuted,
              fontFamily: fonts.sans,
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}

export default function NovoDocumentoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);
  const armas = useQuery({ queryKey: ['armas'], queryFn: listarArmas });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tipo, setTipo] = useState<TipoDocumento>('CR');
  const [entidadeAlvo, setEntidadeAlvo] = useState<EntidadeAlvo>('PERFIL');
  const [armaId, setArmaId] = useState<string | undefined>();
  const [numero, setNumero] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: criarDocumento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      queryClient.invalidateQueries({ queryKey: ['vencimentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.push('/app/documentos');
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
    if (!arquivo) {
      showToast('Selecione um arquivo para anexar');
      return;
    }
    if (entidadeAlvo === 'ARMA' && !armaId) {
      setErro('Selecione a arma vinculada a este documento');
      return;
    }
    setErro(null);
    mutation.mutate({
      tipo,
      entidadeAlvo,
      armaId: entidadeAlvo === 'ARMA' ? armaId : undefined,
      numero: numero || undefined,
      dataEmissao: dataEmissao || undefined,
      dataValidade: dataValidade || undefined,
      arquivo,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <button
        onClick={() => router.push('/app/documentos')}
        style={{ alignSelf: 'flex-start', fontSize: 13.5, fontWeight: 500, color: colors.accentText, background: 'none', border: 'none', padding: 0 }}
      >
        ‹ Documentos
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 600, color: colors.text, letterSpacing: '-0.025em' }}>Novo documento</h1>

      <div>
        <Label>Tipo de documento</Label>
        <Selector opcoes={TIPOS} valor={tipo} onChange={setTipo} />

        <Label>Vinculado a</Label>
        <Selector
          opcoes={[
            { valor: 'PERFIL', rotulo: 'Meu perfil' },
            { valor: 'ARMA', rotulo: 'Uma arma' },
            { valor: 'CLUBE', rotulo: 'Um clube' },
          ]}
          valor={entidadeAlvo}
          onChange={setEntidadeAlvo}
        />

        {entidadeAlvo === 'ARMA' && (
          <>
            <Label>Arma</Label>
            <Selector
              opcoes={(armas.data ?? []).map((arma) => ({ valor: arma.id, rotulo: `${arma.marca} ${arma.modelo}` }))}
              valor={armaId ?? ''}
              onChange={setArmaId}
            />
          </>
        )}

        <Field label="Número (opcional)" value={numero} onChange={(e) => setNumero(e.target.value)} />
        <DateField label="Emissão (opcional)" value={dataEmissao} onChange={setDataEmissao} />
        <DateField label="Validade (opcional)" value={dataValidade} onChange={setDataValidade} />

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          style={{ display: 'none' }}
        />
        <div style={{ marginBottom: 16 }}>
          <Button
            title={arquivo ? `Arquivo: ${arquivo.name}` : 'Anexar arquivo (PDF/foto)'}
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          />
        </div>

        {erro && <p style={{ color: colors.danger, fontSize: 13, marginBottom: 12 }}>{erro}</p>}

        <Button title="Salvar documento" onClick={handleSubmit} loading={mutation.isPending} />
      </div>
    </div>
  );
}
