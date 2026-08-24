import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Brightness from 'expo-brightness';
import { useKeepAwake } from 'expo-keep-awake';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StripedPlaceholder, ls } from '@/components/ui';
import { getPerfil } from '@/api/auth';
import { listarFiliacoes } from '@/api/clubes';
import { Filiacao, Usuario } from '@/api/types';
import { colors, fonts } from '@/constants/theme';
import { formatDataBr } from '@/lib/format';
import { loadCache, saveCache } from '@/lib/offlineCache';
import { useToastStore } from '@/store/uiStore';

const CACHE_KEY = 'carteiras';

interface WalletCard {
  kind: string;
  title: string;
  numLabel: string;
  num: string;
  val: string;
  issuer: string;
}

export default function CarteirasScreen() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  useKeepAwake();

  const perfil = useQuery({ queryKey: ['perfil'], queryFn: getPerfil });
  const filiacoes = useQuery({ queryKey: ['filiacoes'], queryFn: listarFiliacoes });

  const [idx, setIdx] = useState(0);
  const [cache, setCache] = useState<{ perfil?: Usuario; filiacoes?: Filiacao[] } | null>(null);

  // Carrega a última cópia local (leitura offline) e mantém o cache
  // atualizado a cada carregamento bem-sucedido pela rede.
  useEffect(() => {
    loadCache<{ perfil?: Usuario; filiacoes?: Filiacao[] }>(CACHE_KEY).then(setCache);
  }, []);

  useEffect(() => {
    if (perfil.data || filiacoes.data) {
      saveCache(CACHE_KEY, {
        perfil: perfil.data ?? cache?.perfil,
        filiacoes: filiacoes.data ?? cache?.filiacoes,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil.data, filiacoes.data]);

  const perfilEfetivo = perfil.data ?? cache?.perfil;
  const filiacoesEfetivas = filiacoes.data ?? cache?.filiacoes ?? [];

  useEffect(() => {
    let brilhoOriginal: number | null = null;
    (async () => {
      try {
        brilhoOriginal = await Brightness.getBrightnessAsync();
        await Brightness.setBrightnessAsync(1);
      } catch {
        // brilho indisponível (ex: web/emulador) — segue sem ajustar
      }
    })();
    return () => {
      if (brilhoOriginal !== null) {
        Brightness.setBrightnessAsync(brilhoOriginal).catch(() => undefined);
      }
    };
  }, []);

  const wallets = useMemo<WalletCard[]>(() => {
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
  }, [perfilEfetivo, filiacoesEfetivas]);

  const atual = wallets[Math.min(idx, wallets.length - 1)];
  const sinc = new Date().toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();

  const swipe = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .onEnd((e) => {
      if (wallets.length < 2) return;
      if (e.translationX < -40) setIdx((i) => Math.min(wallets.length - 1, i + 1));
      else if (e.translationX > 40) setIdx((i) => Math.max(0, i - 1));
    });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Modo apresentação · brilho máx.</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={{ fontSize: 15, color: colors.walletText }}>✕</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={swipe}>
        <View style={styles.center}>
          {atual ? (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ gap: 3 }}>
                  <Text style={styles.kind}>{atual.kind}</Text>
                  <Text style={styles.title}>{atual.title}</Text>
                </View>
                <StripedPlaceholder label="QR" variant="light" style={styles.qr} />
              </View>
              <View style={{ gap: 12 }}>
                <View style={{ gap: 2 }}>
                  <Text style={styles.fieldLabel}>NOME</Text>
                  <Text style={styles.fieldValue}>{perfilEfetivo?.nome}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 22 }}>
                  <View style={{ gap: 2 }}>
                    <Text style={styles.fieldLabel}>{atual.numLabel}</Text>
                    <Text style={styles.fieldValueMono}>{atual.num}</Text>
                  </View>
                  <View style={{ gap: 2 }}>
                    <Text style={styles.fieldLabel}>VALIDADE</Text>
                    <Text style={styles.fieldValueMono}>{atual.val}</Text>
                  </View>
                </View>
                <View style={{ gap: 2 }}>
                  <Text style={styles.fieldLabel}>EMISSOR</Text>
                  <Text style={styles.issuer}>{atual.issuer}</Text>
                </View>
              </View>
              <Text style={styles.sinc}>CÓPIA DIGITAL · CONFERIR ORIGINAL · SINC. {sinc}</Text>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={{ color: colors.walletTextMuted, fontFamily: fonts.sans }}>Nenhuma carteira disponível ainda</Text>
            </View>
          )}

          {wallets.length > 1 && (
            <View style={{ flexDirection: 'row', gap: 7, justifyContent: 'center' }}>
              {wallets.map((_, i) => (
                <Pressable key={i} onPress={() => setIdx(i)} style={[styles.dot, { backgroundColor: i === idx ? colors.walletText : 'rgba(20,23,15,.22)' }]} />
              ))}
            </View>
          )}
        </View>
      </GestureDetector>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable onPress={() => showToast('Em breve: salvar na Wallet')} style={styles.saveBtn}>
          <Text style={{ fontSize: 13, fontFamily: fonts.sansMedium, color: colors.walletText }}>Salvar na Wallet</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.doneBtn}>
          <Text style={{ fontSize: 13, fontFamily: fonts.sansSemiBold, color: colors.walletBg }}>Concluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.walletBg, paddingHorizontal: 20, paddingTop: 58, paddingBottom: 26, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headerLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: ls(10, 0.16), textTransform: 'uppercase', color: colors.walletTextMuted },
  closeBtn: { width: 30, height: 30, borderRadius: 99, backgroundColor: colors.walletChip, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', gap: 18 },
  card: {
    backgroundColor: colors.walletCard,
    borderWidth: 1,
    borderColor: colors.walletCardBorder,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#14170F',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.walletDivider,
    paddingBottom: 14,
  },
  kind: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: ls(9.5, 0.16), color: colors.walletTextMuted },
  title: { fontSize: 17, fontFamily: fonts.sansSemiBold, color: colors.walletText, letterSpacing: ls(17, -0.01) },
  qr: { width: 52, height: 52, borderRadius: 8 },
  fieldLabel: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: ls(9, 0.14), color: colors.walletTextFaint },
  fieldValue: { fontSize: 15, fontFamily: fonts.sansMedium, color: colors.walletText },
  fieldValueMono: { fontFamily: fonts.mono, fontSize: 14, color: colors.walletText },
  issuer: { fontSize: 13.5, color: colors.walletText, fontFamily: fonts.sans },
  sinc: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    color: colors.walletTextFaint,
    lineHeight: 14,
    borderTopWidth: 1,
    borderTopColor: colors.walletDivider,
    paddingTop: 12,
  },
  dot: { width: 7, height: 7, borderRadius: 99 },
  saveBtn: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(20,23,15,0.07)', borderRadius: 12, paddingVertical: 13 },
  doneBtn: { flex: 1, alignItems: 'center', backgroundColor: colors.walletText, borderRadius: 12, paddingVertical: 13 },
});
