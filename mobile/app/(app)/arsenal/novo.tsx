import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { BackLink, Button, DateField, Field, Label, StripedPlaceholder, ls } from '@/components/ui';
import { criarArma } from '@/api/armas';
import { CategoriaArma } from '@/api/types';
import { colors, fonts } from '@/constants/theme';
import { MARCAS_ARMA, MARCA_OUTRA } from '@/constants/marcasArma';

export default function NovaArmaScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

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
  const [foto, setFoto] = useState<{ uri: string; name: string; type: string } | null>(null);

  const mutation = useMutation({
    mutationFn: criarArma,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Erro ao salvar', error?.response?.data?.message ?? 'Tente novamente');
    },
  });

  async function selecionarFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos para anexar uma imagem da arma.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (resultado.canceled || !resultado.assets?.[0]) return;
    const asset = resultado.assets[0];
    const nome = asset.fileName ?? `arma-${Date.now()}.jpg`;
    setFoto({ uri: asset.uri, name: nome, type: asset.mimeType ?? 'image/jpeg' });
  }

  function handleSubmit() {
    if (!marca || !modelo || !calibre || !numeroSerie) {
      Alert.alert('Preencha marca, modelo, calibre e número de série');
      return;
    }
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

  return (
    <ScrollView style={{ backgroundColor: colors.bg }}>
      <View style={{ gap: 18, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 30 }}>
        <BackLink label="Arsenal" onPress={() => router.back()} />
        <Text style={{ fontSize: 26, fontFamily: fonts.sansSemiBold, color: colors.text, letterSpacing: ls(26, -0.025) }}>Nova arma</Text>

        <View>
          <Label>Foto da arma (opcional)</Label>
          <Pressable onPress={selecionarFoto} style={{ marginBottom: 16 }}>
            {foto ? (
              <Image source={{ uri: foto.uri }} style={{ height: 150, borderRadius: 14 }} resizeMode="cover" />
            ) : (
              <StripedPlaceholder label="TOCAR PARA ADICIONAR FOTO" style={{ height: 150 }} />
            )}
          </Pressable>

          <View style={{ marginBottom: marcaSelecionada === MARCA_OUTRA ? 0 : 16 }}>
            <Label>Marca</Label>
            <Pressable
              onPress={() => setMarcaAberta((v) => !v)}
              style={{
                backgroundColor: colors.surfaceRaised,
                borderRadius: 11,
                paddingHorizontal: 13,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text style={{ color: marcaSelecionada ? colors.text : colors.textFaint, fontSize: 14, flexShrink: 1 }} numberOfLines={1}>
                {marcaSelecionada === MARCA_OUTRA ? 'Outra marca' : marcaSelecionada || 'Selecionar marca'}
              </Text>
              <Text style={{ color: 'rgba(236,239,236,.35)' }}>▾</Text>
            </Pressable>
            {marcaAberta && (
              <View style={{ backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: 11, marginTop: 6, maxHeight: 260, overflow: 'hidden' }}>
                <ScrollView>
                  {MARCAS_ARMA.map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => {
                        setMarcaSelecionada(item);
                        setMarcaAberta(false);
                      }}
                      style={{ paddingHorizontal: 13, paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.divider }}
                    >
                      <Text style={{ color: colors.text, fontSize: 14 }}>{item}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => {
                      setMarcaSelecionada(MARCA_OUTRA);
                      setMarcaAberta(false);
                    }}
                    style={{ paddingHorizontal: 13, paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.divider }}
                  >
                    <Text style={{ color: colors.accentText, fontSize: 14, fontFamily: fonts.sansMedium }}>Outra marca…</Text>
                  </Pressable>
                </ScrollView>
              </View>
            )}
          </View>
          {marcaSelecionada === MARCA_OUTRA && (
            <Field label="Qual marca?" value={marcaOutra} onChangeText={setMarcaOutra} placeholder="Digite a marca" />
          )}

          <Field label="Modelo" value={modelo} onChangeText={setModelo} placeholder="Ex: G3" />
          <Field label="Calibre" value={calibre} onChangeText={setCalibre} placeholder="Ex: 9mm" />
          <Field label="Número de série" value={numeroSerie} onChangeText={setNumeroSerie} autoCapitalize="characters" />

          <Label>Categoria</Label>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {(['PERMITIDA', 'RESTRITA'] as CategoriaArma[]).map((opcao) => {
              const ativo = categoria === opcao;
              return (
                <Pressable
                  key={opcao}
                  onPress={() => setCategoria(opcao)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 11,
                    borderWidth: 1,
                    borderColor: ativo ? colors.accent : colors.borderSoft,
                    backgroundColor: ativo ? colors.accent : colors.surfaceRaised,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: ativo ? colors.onAccent : colors.textMuted, fontFamily: fonts.sansSemiBold }}>{opcao}</Text>
                </Pressable>
              );
            })}
          </View>

          <Field label="Número do CRAF (opcional)" value={crafNumero} onChangeText={setCrafNumero} />
          <DateField label="Validade do CRAF (opcional)" value={crafValidade} onChange={setCrafValidade} />

          <Button title="Salvar arma" onPress={handleSubmit} loading={mutation.isPending} />
        </View>
      </View>
    </ScrollView>
  );
}
