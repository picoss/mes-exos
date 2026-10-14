// Ce que l'élève a déjà fait, déduit de l'historique des réponses.

import type { AppData } from "./types";

/** Dernière compétence travaillée en série, pour le bouton « Continuer ». */
export function lastPracticedSkill(data: AppData): string | null {
  let latest: { skill: string; ts: number } | null = null;
  for (const attempt of data.attempts) {
    if (attempt.mode === "serie" && (!latest || attempt.ts >= latest.ts)) latest = attempt;
  }
  return latest?.skill ?? null;
}
