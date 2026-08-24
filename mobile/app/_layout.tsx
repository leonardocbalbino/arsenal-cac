import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
import { queryClient } from '@/query/client';
import { useAuthStore } from '@/store/authStore';
import { useLockStore } from '@/store/lockStore';
import { colors } from '@/constants/theme';
import { LockGate } from '@/components/LockGate';
import { Toast } from '@/components/Toast';
import { TrainingSessionSheet } from '@/components/TrainingSessionSheet';

function useProtectedRoute() {
  const { accessToken, hydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    const emGrupoAuth = segments[0] === '(auth)';

    if (!accessToken && !emGrupoAuth) {
      router.replace('/(auth)/login');
    } else if (accessToken && emGrupoAuth) {
      router.replace('/(app)');
    }
  }, [accessToken, hydrated, segments, router]);
}

function RootNavigation() {
  useProtectedRoute();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const loadLock = useLockStore((state) => state.load);

  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  useEffect(() => {
    hydrate();
    loadLock();
  }, [hydrate, loadLock]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <LockGate>
            <RootNavigation />
            <TrainingSessionSheet />
            <Toast />
          </LockGate>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
