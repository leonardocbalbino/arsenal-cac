import { create } from 'zustand';
import { Arma } from '@/api/types';
import { secureStorage } from '@/lib/storage';

const ALERTAS_KEY = 'cac_alertas_vencimento_ativos';

interface AlertasState {
  ativo: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setAtivo: (ativo: boolean) => Promise<void>;
}

export const useAlertasStore = create<AlertasState>((set) => ({
  ativo: true,
  loaded: false,
  load: async () => {
    const valor = await secureStorage.getItem(ALERTAS_KEY);
    set({ ativo: valor === null ? true : valor === 'true', loaded: true });
  },
  setAtivo: async (ativo: boolean) => {
    await secureStorage.setItem(ALERTAS_KEY, String(ativo));
    set({ ativo });
  },
}));

interface ToastState {
  toast: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  showToast: (message: string) => {
    clearTimeout(toastTimer);
    set({ toast: message });
    toastTimer = setTimeout(() => set({ toast: null }), 2600);
  },
  hideToast: () => {
    clearTimeout(toastTimer);
    set({ toast: null });
  },
}));

interface TrainingSheetState {
  open: boolean;
  armaPreselecionada: Arma | null;
  openSheet: (arma?: Arma) => void;
  closeSheet: () => void;
}

export const useTrainingSheetStore = create<TrainingSheetState>((set) => ({
  open: false,
  armaPreselecionada: null,
  openSheet: (arma) => set({ open: true, armaPreselecionada: arma ?? null }),
  closeSheet: () => set({ open: false, armaPreselecionada: null }),
}));
