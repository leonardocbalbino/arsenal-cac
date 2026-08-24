import { create } from 'zustand';
import { secureStorage } from '@/lib/storage';

const BIOMETRIC_ENABLED_KEY = 'cac_biometric_enabled';

interface LockState {
  biometricEnabled: boolean;
  unlocked: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  unlock: () => void;
  lock: () => void;
}

export const useLockStore = create<LockState>((set) => ({
  biometricEnabled: false,
  unlocked: false,
  loaded: false,

  load: async () => {
    const value = await secureStorage.getItem(BIOMETRIC_ENABLED_KEY);
    set({ biometricEnabled: value === 'true', loaded: true });
  },

  setBiometricEnabled: async (enabled: boolean) => {
    await secureStorage.setItem(BIOMETRIC_ENABLED_KEY, String(enabled));
    set({ biometricEnabled: enabled });
  },

  unlock: () => set({ unlocked: true }),
  lock: () => set({ unlocked: false }),
}));
