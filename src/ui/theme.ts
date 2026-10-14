// Applique les couleurs du thème choisi sous forme de variables CSS (--bg, --primary…).

import { computed, effect, signal } from "@preact/signals";
import { DEFAULT_THEME, findTheme, type Theme } from "../config";
import { appData } from "./store";

/** Thème montré pendant le choix au premier lancement, avant que le profil existe. */
export const previewThemeId = signal<string | null>(null);

export const activeTheme = computed(() =>
  findTheme(previewThemeId.value ?? appData.value.profile?.theme ?? DEFAULT_THEME.id),
);

function toCssName(key: string): string {
  return "--" + key.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
}

function isDark(hexColor: string): boolean {
  const value = parseInt(hexColor.slice(1), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  for (const [key, color] of Object.entries(theme.colors)) {
    root.style.setProperty(toCssName(key), color);
  }
  root.style.colorScheme = isDark(theme.colors.bg) ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.colors.bg);
}

export function startThemeSync(): void {
  effect(() => applyTheme(activeTheme.value));
}
