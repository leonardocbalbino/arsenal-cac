import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/constants/theme';
import { useToastStore } from '@/store/uiStore';

export function Toast() {
  const toast = useToastStore((state) => state.toast);
  const insets = useSafeAreaInsets();

  if (!toast) return null;

  return (
    <View pointerEvents="none" style={[styles.container, { bottom: 106 + insets.bottom }]}>
      <View style={styles.dot} />
      <Text style={styles.text}>{toast}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 60,
    backgroundColor: colors.toastBg,
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 99, backgroundColor: colors.accent },
  text: { fontSize: 13, fontFamily: fonts.sansMedium, color: colors.toastText, flexShrink: 1 },
});
