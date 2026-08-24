import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="arsenal/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="arsenal/novo" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="documentos/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="documentos/novo" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="carteiras/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="configuracoes/index" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
