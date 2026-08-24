'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BackLink, Button, DateField, Field, Label, StripedPlaceholder } from '@/components/ui';
import { criarArma } from '@/api/armas';
import { CategoriaArma } from '@/api/types';
import { colors } from '@/lib/theme';
import { MARCAS_ARMA, MARCA_OUTRA } from '@/lib/marcasArma';

export default function NovaArmaPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [marcaAberta, setMarcaAberta] = useState(false);
  const [marcaOutra, setMarcaOutra] = useState('');
  const marca = marcaSelecionada === MARCA_OUTRA ? marcaOutra.trim() : marcaSelecionada;
  const [modelo, setModelo] = useState('');
  const [calibre, setCalibre] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [categoria, setCategoria] = useState<CategoriaArma>('PERMITIDA');
  const [crafNumero, setCrafNumero] = useState('');
  const [crafValidade, setCrafValidade] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: criarArma,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.push('/app/arsenal');
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
    if (!marca || !modelo || !calibre || !numeroSerie) {
      setErro('Preencha marca, modelo, calibre e número de série');
      return;
    }
    setErro(null);
    mutation.mutate({
      marca,
      modelo,
      calibre,
      numeroSerie,
      categoria,
      crafNumero: crafNumero || undefined,
      crafValidade: crafValidade || undefined,
      foto: foto ?? undefined,
    });
  }

  function selecionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setFoto(arquivo);
    setFotoPreview(URL.createObjectURL(arquivo));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <BackLink label="Arsenal" onClick={() => router.push('/app/arsenal')} />
      <h1 style={{ fontSize: 26, fontWeight: 600, color: colors.text, letterSpacing: '-0.025em' }}>Nova arma</h1>

      <div>
        <Label>Foto da arma (opcional)</Label>
        <input ref={fotoInputRef} type="file" accept="image/*" onChange={selecionarFoto} style={{ display: 'none' }} />
        <button type="button" onClick={() => fotoInputRef.current?.click()} style={{ display: 'block', width: '100%', marginBottom: 16, border: 'none', padding: 0, background: 'none' }}>
          {fotoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoPreview} alt="" style={{ height: 150, width: '100%', borderRadius: 14, objectFit: 'cover' }} />
          ) : (
            <StripedPlaceholder label="CLIQUE PARA ADICIONAR FOTO" style={{ height: 150 }} />
          )}
        </button>

        <div style={{ marginBottom: marcaSelecionada === MARCA_OUTRA ? 0 : 16, position: 'relative' }}>
          <Label>Marca</Label>
          <button
            type="button"
            onClick={() => setMarcaAberta((v) => !v)}
            style={{
              backgroundColor: colors.surfaceRaised,
              borderRadius: 11,
              padding: '12px 13px',
              border: `1px solid ${colors.borderSoft}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
              width: '100%',
            }}
          >
            <span style={{ color: marcaSelecionada ? colors.text : colors.textFaint, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {marcaSelecionada === MARCA_OUTRA ? 'Outra marca' : marcaSelecionada || 'Selecionar marca'}
            </span>
            <span style={{ color: 'rgba(236,239,236,.35)' }}>▾</span>
          </button>
          {marcaAberta && (
            <div
              style={{
                backgroundColor: colors.surfaceRaised,
                border: `1px solid ${colors.borderSoft}`,
                borderRadius: 11,
                marginTop: 6,
                maxHeight: 260,
                overflowY: 'auto',
                position: 'absolute',
                zIndex: 5,
                width: '100%',
              }}
            >
              {MARCAS_ARMA.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMarcaSelecionada(item);
                    setMarcaAberta(false);
                  }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 13px', border: 'none', borderTop: `1px solid ${colors.divider}`, backgroundColor: 'transparent', color: colors.text, fontSize: 14 }}
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMarcaSelecionada(MARCA_OUTRA);
                  setMarcaAberta(false);
                }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 13px', border: 'none', borderTop: `1px solid ${colors.divider}`, backgroundColor: 'transparent', color: colors.accentText, fontWeight: 500, fontSize: 14 }}
              >
                Outra marca…
              </button>
            </div>
          )}
        </div>
        {marcaSelecionada === MARCA_OUTRA && (
          <Field label="Qual marca?" value={marcaOutra} onChange={(e) => setMarcaOutra(e.target.value)} placeholder="Digite a marca" />
        )}

        <Field label="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Ex: G3" />
        <Field label="Calibre" value={calibre} onChange={(e) => setCalibre(e.target.value)} placeholder="Ex: 9mm" />
        <Field label="Número de série" value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} />

        <Label>Categoria</Label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['PERMITIDA', 'RESTRITA'] as CategoriaArma[]).map((opcao) => {
            const ativo = categoria === opcao;
            return (
              <button
                key={opcao}
                type="button"
                onClick={() => setCategoria(opcao)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 11,
                  border: `1px solid ${ativo ? colors.accent : colors.borderSoft}`,
                  backgroundColor: ativo ? colors.accent : colors.surfaceRaised,
                  color: ativo ? colors.onAccent : colors.textMuted,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {opcao}
              </button>
            );
          })}
        </div>

        <Field label="Número do CRAF (opcional)" value={crafNumero} onChange={(e) => setCrafNumero(e.target.value)} />
        <DateField label="Validade do CRAF (opcional)" value={crafValidade} onChange={setCrafValidade} />

        {erro && <p style={{ color: colors.danger, fontSize: 13, marginBottom: 12 }}>{erro}</p>}

        <Button title="Salvar arma" onClick={handleSubmit} loading={mutation.isPending} />
      </div>
    </div>
  );
}
