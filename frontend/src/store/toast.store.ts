import type { StateCreator } from "zustand";
import type { MyToastContent, RootStore, ToastStoreSlice } from "./types";

const MAX_TOASTS = 5;
const LEAVE_MS = 250;

export const useToastStoreSlice: StateCreator<
  RootStore,
  [],
  [],
  ToastStoreSlice
> = (set) => ({
  toasts: [],
  addToast: (toast: MyToastContent) =>
    set((state) => ({ toasts: [...state.toasts, toast].slice(-MAX_TOASTS) })),
  removeToast: (id: string) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  dismissToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, visible: false } : t,
      ),
    }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, LEAVE_MS);
  },
  clearToasts: () => set({ toasts: [] }),
});
