import { describe, expect, it, vi } from "vitest";
import {
  PREFIX,
  SCHEMA_VERSION,
  defaultData,
  loadData,
  memoryStore,
  saveField,
  type KeyValueStore,
} from "./storage";
import type { Profile } from "./types";

const profile: Profile = {
  name: "Alice",
  avatar: "chat",
  theme: "ocean",
  sound: true,
  forceKeypad: false,
  updatedAt: 1,
};

describe("loadData", () => {
  it("renvoie les valeurs par défaut et note la version au premier lancement", () => {
    const kv = memoryStore();
    expect(loadData(kv)).toEqual(defaultData());
    expect(kv.getItem(PREFIX + "version")).toBe(String(SCHEMA_VERSION));
  });

  it("relit ce qui a été enregistré", () => {
    const kv = memoryStore();
    loadData(kv);
    saveField(kv, "profile", profile);
    saveField(kv, "seenBadges", ["premiers-pas"]);
    const data = loadData(kv);
    expect(data.profile).toEqual(profile);
    expect(data.seenBadges).toEqual(["premiers-pas"]);
  });

  it("complète les réglages avec les valeurs par défaut", () => {
    const kv = memoryStore();
    kv.setItem(PREFIX + "version", "1");
    kv.setItem(PREFIX + "settings", JSON.stringify({ deviceName: "Tablette" }));
    const { settings } = loadData(kv);
    expect(settings.deviceName).toBe("Tablette");
    expect(settings.hidden).toEqual([]);
  });

  it("ignore une donnée illisible ou du mauvais type", () => {
    const kv = memoryStore();
    kv.setItem(PREFIX + "version", "1");
    kv.setItem(PREFIX + "attempts", "{pas du json");
    kv.setItem(PREFIX + "sessions", JSON.stringify({ pas: "un tableau" }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const data = loadData(kv);
    expect(data.attempts).toEqual([]);
    expect(data.sessions).toEqual([]);
  });

  it("applique les migrations dans l'ordre jusqu'à la version courante", () => {
    const kv = memoryStore();
    kv.setItem(PREFIX + "version", "1");
    kv.setItem(PREFIX + "seenBadges", JSON.stringify(["a"]));
    const calls: number[] = [];
    const migrations = {
      1: (store: KeyValueStore) => {
        calls.push(1);
        store.setItem(PREFIX + "seenBadges", JSON.stringify(["a", "b"]));
      },
      2: () => calls.push(2),
    };
    const data = loadData(kv, migrations, 3);
    expect(calls).toEqual([1, 2]);
    expect(data.seenBadges).toEqual(["a", "b"]);
    expect(kv.getItem(PREFIX + "version")).toBe("3");
  });

  it("échoue si une migration manque", () => {
    const kv = memoryStore();
    kv.setItem(PREFIX + "version", "1");
    expect(() => loadData(kv, {}, 2)).toThrow(/Migration manquante/);
  });

  it("ne touche pas au numéro de version de données plus récentes", () => {
    const kv = memoryStore();
    kv.setItem(PREFIX + "version", String(SCHEMA_VERSION + 1));
    loadData(kv);
    expect(kv.getItem(PREFIX + "version")).toBe(String(SCHEMA_VERSION + 1));
  });
});

describe("saveField", () => {
  it("renvoie false quand le navigateur refuse d'enregistrer", () => {
    const kv: KeyValueStore = {
      ...memoryStore(),
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(saveField(kv, "seenBadges", [])).toBe(false);
  });
});
