import type { StateCreator } from "zustand";
import type { RootStore, Theme, ThemeStoreSlice } from "./types";

const getMedia = () =>
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

export const getSystemTheme = (): Theme =>
  getMedia()?.matches ? "dark" : "light";

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.toggle("dark", theme === "dark");
  html.classList.toggle("light", theme === "light");
}

export function getMediaQuery() {
  return getMedia();
}

export const useThemeStoreSlice: StateCreator<
  RootStore,
  [],
  [],
  ThemeStoreSlice
> = (set) => ({
  theme: getSystemTheme(),
  isSystem: true,
  toggleTheme: () =>
    set((s) => ({
      theme: s.theme === "light" ? "dark" : "light",
      isSystem: false,
    })),
  setTheme: (theme) => set({ theme, isSystem: false }),
  setSystemTheme: () => set({ theme: getSystemTheme(), isSystem: true }),
});
