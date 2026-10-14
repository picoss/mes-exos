// Réglages de l'application : nom, thèmes, avatars, paliers de déblocage.

export const APP_NAME = "Mes exos";
export const APP_DESCRIPTION = "Exercices de maths pour la 6e";

export interface ThemeColors {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  primaryText: string;
  accent: string;
  success: string;
  error: string;
  border: string;
}

export interface Theme {
  id: string;
  name: string;
  /** Nombre d'étoiles nécessaires pour débloquer le thème (0 = disponible dès le départ). */
  unlockAt: number;
  colors: ThemeColors;
}

export const THEMES: Theme[] = [
  {
    id: "ocean",
    name: "Océan",
    unlockAt: 0,
    colors: {
      bg: "#e0f2fe",
      surface: "#ffffff",
      text: "#0c4a6e",
      muted: "#476a80",
      primary: "#0369a1",
      primaryText: "#ffffff",
      accent: "#d97706",
      success: "#15803d",
      error: "#c2410c",
      border: "#bae6fd",
    },
  },
  {
    id: "foret",
    name: "Forêt",
    unlockAt: 0,
    colors: {
      bg: "#dcfce7",
      surface: "#ffffff",
      text: "#14532d",
      muted: "#3f6b4f",
      primary: "#15803d",
      primaryText: "#ffffff",
      accent: "#ca8a04",
      success: "#166534",
      error: "#b91c1c",
      border: "#bbf7d0",
    },
  },
  {
    id: "soleil",
    name: "Coucher de soleil",
    unlockAt: 0,
    colors: {
      bg: "#ffedd5",
      surface: "#ffffff",
      text: "#7c2d12",
      muted: "#8a5236",
      primary: "#c2410c",
      primaryText: "#ffffff",
      accent: "#7c3aed",
      success: "#15803d",
      error: "#b91c1c",
      border: "#fed7aa",
    },
  },
  {
    id: "bonbon",
    name: "Bonbon",
    unlockAt: 100,
    colors: {
      bg: "#fce7f3",
      surface: "#ffffff",
      text: "#831843",
      muted: "#8d4a6c",
      primary: "#be185d",
      primaryText: "#ffffff",
      accent: "#7c3aed",
      success: "#15803d",
      error: "#b91c1c",
      border: "#fbcfe8",
    },
  },
  {
    id: "espace",
    name: "Espace",
    unlockAt: 250,
    colors: {
      bg: "#0f172a",
      surface: "#1e293b",
      text: "#e2e8f0",
      muted: "#94a3b8",
      primary: "#818cf8",
      primaryText: "#0f172a",
      accent: "#facc15",
      success: "#4ade80",
      error: "#f87171",
      border: "#334155",
    },
  },
  {
    id: "volcan",
    name: "Volcan",
    unlockAt: 500,
    colors: {
      bg: "#1c1917",
      surface: "#292524",
      text: "#fafaf9",
      muted: "#a8a29e",
      primary: "#f97316",
      primaryText: "#1c1917",
      accent: "#facc15",
      success: "#4ade80",
      error: "#f87171",
      border: "#44403c",
    },
  },
];

export interface Avatar {
  id: string;
  emoji: string;
  name: string;
  unlockAt: number;
}

export const AVATARS: Avatar[] = [
  { id: "chat", emoji: "🐱", name: "Chat", unlockAt: 0 },
  { id: "chien", emoji: "🐶", name: "Chien", unlockAt: 0 },
  { id: "renard", emoji: "🦊", name: "Renard", unlockAt: 0 },
  { id: "panda", emoji: "🐼", name: "Panda", unlockAt: 0 },
  { id: "lapin", emoji: "🐰", name: "Lapin", unlockAt: 0 },
  { id: "koala", emoji: "🐨", name: "Koala", unlockAt: 0 },
  { id: "lion", emoji: "🦁", name: "Lion", unlockAt: 0 },
  { id: "grenouille", emoji: "🐸", name: "Grenouille", unlockAt: 0 },
  { id: "licorne", emoji: "🦄", name: "Licorne", unlockAt: 50 },
  { id: "pieuvre", emoji: "🐙", name: "Pieuvre", unlockAt: 100 },
  { id: "chouette", emoji: "🦉", name: "Chouette", unlockAt: 150 },
  { id: "tortue", emoji: "🐢", name: "Tortue", unlockAt: 200 },
  { id: "papillon", emoji: "🦋", name: "Papillon", unlockAt: 250 },
  { id: "dauphin", emoji: "🐬", name: "Dauphin", unlockAt: 300 },
  { id: "dinosaure", emoji: "🦖", name: "Dinosaure", unlockAt: 400 },
  { id: "dragon", emoji: "🐲", name: "Dragon", unlockAt: 500 },
  { id: "flamant", emoji: "🦩", name: "Flamant rose", unlockAt: 600 },
  { id: "pingouin", emoji: "🐧", name: "Pingouin", unlockAt: 700 },
  { id: "herisson", emoji: "🦔", name: "Hérisson", unlockAt: 800 },
  { id: "fusee", emoji: "🚀", name: "Fusée", unlockAt: 1000 },
];

export const DEFAULT_THEME = THEMES[0]!;
export const DEFAULT_AVATAR = AVATARS[0]!;

export function findTheme(id: string): Theme {
  return THEMES.find((theme) => theme.id === id) ?? DEFAULT_THEME;
}

export function findAvatar(id: string): Avatar {
  return AVATARS.find((avatar) => avatar.id === id) ?? DEFAULT_AVATAR;
}
