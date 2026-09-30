import { create } from "zustand";
import { useAuthStoreSlice } from "./auth.store";
import { useThemeStoreSlice } from "./theme.store";
import { persist } from "zustand/middleware";

type RootStore = ReturnType<typeof useAuthStoreSlice> &
  ReturnType<typeof useThemeStoreSlice>;

export const useStore = create<RootStore>()(
  persist(
    (...a) => ({
      ...useAuthStoreSlice(...a),
      ...useThemeStoreSlice(...a),
    }),
    {
      name: "app-store",
      partialize: (s) => ({ theme: s.theme, isSystem: s.isSystem }),
    },
  ),
);
