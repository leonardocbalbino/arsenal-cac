import { create } from 'zustand';

const TOKEN_KEY = 'cac_access_token';

interface AuthState {
  accessToken: string | null;
  hydrated: boolean;
  hydrate: () => void;
  signIn: (token: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  hydrated: false,

  hydrate: () => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
    set({ accessToken: token, hydrated: true });
  },

  signIn: (token: string) => {
    window.localStorage.setItem(TOKEN_KEY, token);
    set({ accessToken: token });
  },

  signOut: () => {
    window.localStorage.removeItem(TOKEN_KEY);
    set({ accessToken: null });
  },
}));
