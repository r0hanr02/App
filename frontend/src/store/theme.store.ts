import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

type ThemeStore = {
  theme: Theme;
  isSystem: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setSystemTheme: () => void;
};

const media = window.matchMedia("(prefers-color-scheme: dark)");
const getSystemTheme = (): Theme => (media.matches ? "dark" : "light");

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.toggle("dark", theme === "dark");
  html.classList.toggle("light", theme === "light");
}

export const useThemeStoreSlice: StateCreator<ThemeStore> = (set, get) => ({
  theme: getSystemTheme(),
  isSystem: true,
  toggleTheme: () =>
    set({ theme: get().theme === "light" ? "dark" : "light", isSystem: false }),
  setTheme: (theme) => set({ theme, isSystem: false }),
  setSystemTheme: () => set({ theme: getSystemTheme(), isSystem: true }),
});

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: getSystemTheme(),
      isSystem: true,

      toggleTheme: () =>
        set({
          theme: get().theme === "light" ? "dark" : "light",
          isSystem: false,
        }),

      setTheme: (theme) => set({ theme, isSystem: false }),

      setSystemTheme: () => set({ theme: getSystemTheme(), isSystem: true }),
    }),
    {
      name: "theme-context",
      partialize: (state) => ({
        theme: state.theme,
        isSystem: state.isSystem,
      }),
    },
  ),
);

if (useThemeStore.getState().isSystem) {
  useThemeStore.getState().setSystemTheme();
}
applyTheme(useThemeStore.getState().theme);

useThemeStore.subscribe((state, prev) => {
  if (state.theme !== prev.theme) applyTheme(state.theme);
});

media.addEventListener("change", (e) => {
  if (!useThemeStore.getState().isSystem) return;
  useThemeStore.setState({ theme: e.matches ? "dark" : "light" });
});
