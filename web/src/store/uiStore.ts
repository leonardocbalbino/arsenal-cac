import { create } from 'zustand';
import { Arma } from '@/api/types';

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
