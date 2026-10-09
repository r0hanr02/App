import { create } from "zustand";
import { useAuthStoreSlice } from "./auth.store";
import {
  applyTheme,
  getMediaQuery,
  getSystemTheme,
  useThemeStoreSlice,
} from "./theme.store";
import { useOrgStoreSlice } from "./org.store";
import { persist } from "zustand/middleware";
import { useToastStoreSlice } from "./toast.store";
import type { RootStore } from "./types";

export const useStore = create<RootStore>()(
  persist(
    (...a) => ({
      ...useAuthStoreSlice(...a),
      ...useThemeStoreSlice(...a),
      ...useToastStoreSlice(...a),
      ...useOrgStoreSlice(...a),
    }),
    {
      name: "app-store",
      partialize: (s) => ({
        theme: s.theme,
        isSystem: s.isSystem,
        activeOrgId: s.activeOrgId,
      }),
    },
  ),
);

// Keep <html> class in sync with the single theme source.
if (useStore.getState().isSystem) {
  useStore.getState().setSystemTheme();
}
applyTheme(useStore.getState().theme);

useStore.subscribe((state, prev) => {
  if (state.theme !== prev.theme) applyTheme(state.theme);
});

getMediaQuery()?.addEventListener("change", (e) => {
  if (!useStore.getState().isSystem) return;
  useStore.setState({ theme: e.matches ? "dark" : "light" });
});

export { getSystemTheme };
export type { RootStore };
