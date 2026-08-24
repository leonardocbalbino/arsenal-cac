import { create } from 'zustand';
import { secureStorage } from '@/lib/storage';

const TOKEN_KEY = 'cac_access_token';

interface AuthState {
  accessToken: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  hydrated: false,

  hydrate: async () => {
    const token = await secureStorage.getItem(TOKEN_KEY);
    set({ accessToken: token, hydrated: true });
  },

  signIn: async (token: string) => {
    await secureStorage.setItem(TOKEN_KEY, token);
    set({ accessToken: token });
  },

  signOut: () => {
    secureStorage.removeItem(TOKEN_KEY).catch(() => undefined);
    set({ accessToken: null });
  },
}));
