// État de l'application, partagé par tous les écrans.

import { computed, signal } from "@preact/signals";
import { DEFAULT_AVATAR, DEFAULT_THEME } from "../config";
import { totalStars } from "../core/rewards";
import { browserStore, loadData, saveField } from "../core/storage";
import type { AppData, Profile } from "../core/types";

const { kv, persistent } = browserStore();

/** `false` si le navigateur refuse d'enregistrer (navigation privée, stockage bloqué). */
export const storagePersistent = persistent;

export const appData = signal<AppData>(loadData(kv));
export const profile = computed(() => appData.value.profile);
export const stars = computed(() => totalStars(appData.value));

function newProfile(): Profile {
  return {
    name: "",
    avatar: DEFAULT_AVATAR.id,
    theme: DEFAULT_THEME.id,
    sound: true,
    forceKeypad: false,
    updatedAt: 0,
  };
}

/** Crée le profil au premier lancement, ou le modifie ensuite. */
export function saveProfile(changes: Partial<Omit<Profile, "updatedAt">>): void {
  const next: Profile = {
    ...(appData.value.profile ?? newProfile()),
    ...changes,
    updatedAt: Date.now(),
  };
  appData.value = { ...appData.value, profile: next };
  saveField(kv, "profile", next);
}
