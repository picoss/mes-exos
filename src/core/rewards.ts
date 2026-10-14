// Étoiles (§7.2 des specs).

import type { AppData, Attempt } from "./types";

export function starsForAttempt(attempt: Attempt): number {
  // Les étoiles des défis se comptent par défi terminé, pas par réponse.
  if (!attempt.ok || attempt.mode === "defi") return 0;
  return attempt.tries === 1 ? 2 : 1;
}

export function totalStars(data: AppData): number {
  return data.attempts.reduce((sum, attempt) => sum + starsForAttempt(attempt), 0);
}
