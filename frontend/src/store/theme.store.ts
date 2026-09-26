import { observable, observe } from "@legendapp/state";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { syncObservable } from "@legendapp/state/sync";

type Theme = "light" | "dark";

const systemPreference: Theme = window.matchMedia(
  "(prefers-color-scheme: dark)",
).matches
  ? "dark"
  : "light";

export const themeContext = observable({
  theme: systemPreference as Theme,
  isSystem: true,
});

syncObservable(themeContext, {
  persist: {
    name: "project-theme-context",
    plugin: ObservablePersistLocalStorage,
  },
});

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  if (theme === "dark") {
    html.classList.add("dark");
    html.classList.remove("light");
  } else {
    html.classList.add("light");
    html.classList.remove("dark");
  }
}

observe(() => {
  applyTheme(themeContext.theme.get());
});

export function toggleTheme() {
  const next: Theme = themeContext.theme.get() === "light" ? "dark" : "light";
  themeContext.theme.set(next);
  themeContext.isSystem.set(false);
  applyTheme(next);
}

export function setTheme(theme: Theme) {
  themeContext.theme.set(theme);
  themeContext.isSystem.set(false);
  applyTheme(theme);
}

export function useSystemTheme() {
  const sys: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  themeContext.theme.set(sys);
  themeContext.isSystem.set(true);
  applyTheme(sys);
}

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!themeContext.isSystem.get()) return;
    const updated: Theme = e.matches ? "dark" : "light";
    themeContext.theme.set(updated);
    applyTheme(updated);
  });
