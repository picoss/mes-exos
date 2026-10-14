// Enregistrement des données dans le navigateur (localStorage), avec numéro de version
// et migrations. Chaque collection a sa propre clé, préfixée par `exos.`.

import type { AppData, Settings } from "./types";

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const PREFIX = "exos.";
export const SCHEMA_VERSION = 1;

const VERSION_KEY = "version";
const FIELDS = ["profile", "settings", "attempts", "sessions", "seenBadges"] as const;

/**
 * Migration de la version `n` vers `n + 1`, indexée par `n`.
 * Elle lit et réécrit directement les clés concernées.
 */
export type Migration = (kv: KeyValueStore) => void;

export const MIGRATIONS: Record<number, Migration> = {};

export function defaultSettings(): Settings {
  return { pinHash: null, hidden: [], deviceName: "", lastExportAt: null, updatedAt: 0 };
}

export function defaultData(): AppData {
  return { profile: null, settings: defaultSettings(), attempts: [], sessions: [], seenBadges: [] };
}

function readJson(kv: KeyValueStore, field: string): unknown {
  const raw = kv.getItem(PREFIX + field);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    console.error(`Donnée illisible ignorée : ${PREFIX + field}`);
    return undefined;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasStoredData(kv: KeyValueStore): boolean {
  return FIELDS.some((field) => kv.getItem(PREFIX + field) !== null);
}

/**
 * Charge les données, en appliquant les migrations si elles viennent d'une version plus ancienne.
 * Si elles viennent d'une version plus récente (retour en arrière du site), elles sont lues
 * telles quelles et le numéro de version n'est pas modifié.
 */
export function loadData(
  kv: KeyValueStore,
  migrations: Record<number, Migration> = MIGRATIONS,
  currentVersion: number = SCHEMA_VERSION,
): AppData {
  const storedVersion = Number(kv.getItem(PREFIX + VERSION_KEY) ?? 0);

  if (storedVersion === 0 && !hasStoredData(kv)) {
    kv.setItem(PREFIX + VERSION_KEY, String(currentVersion));
  } else if (storedVersion < currentVersion) {
    for (let version = Math.max(storedVersion, 1); version < currentVersion; version++) {
      const migrate = migrations[version];
      if (!migrate) throw new Error(`Migration manquante : version ${version} → ${version + 1}`);
      migrate(kv);
    }
    kv.setItem(PREFIX + VERSION_KEY, String(currentVersion));
  }

  const data = defaultData();
  const profile = readJson(kv, "profile");
  if (isObject(profile)) data.profile = profile as unknown as AppData["profile"];
  const settings = readJson(kv, "settings");
  if (isObject(settings)) data.settings = { ...defaultSettings(), ...settings };
  const attempts = readJson(kv, "attempts");
  if (Array.isArray(attempts)) data.attempts = attempts;
  const sessions = readJson(kv, "sessions");
  if (Array.isArray(sessions)) data.sessions = sessions;
  const seenBadges = readJson(kv, "seenBadges");
  if (Array.isArray(seenBadges)) data.seenBadges = seenBadges;
  return data;
}

/** Enregistre une collection. Renvoie `false` si le navigateur a refusé (quota dépassé…). */
export function saveField<K extends keyof AppData>(
  kv: KeyValueStore,
  field: K,
  value: AppData[K],
): boolean {
  try {
    kv.setItem(PREFIX + field, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Enregistrement impossible : ${PREFIX + field}`, error);
    return false;
  }
}

export function memoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  };
}

/**
 * Renvoie le localStorage du navigateur s'il est utilisable, sinon un stockage en mémoire
 * (navigation privée, stockage bloqué) : l'appli marche, mais rien n'est conservé.
 */
export function browserStore(): { kv: KeyValueStore; persistent: boolean } {
  try {
    const probe = PREFIX + "probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return { kv: window.localStorage, persistent: true };
  } catch {
    return { kv: memoryStore(), persistent: false };
  }
}
