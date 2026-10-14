// Aléatoire à graine : la même graine donne toujours la même suite de nombres,
// donc la même question (utile pour l'aperçu et les tests).

export type Rng = () => number;

/** Générateur mulberry32 : renvoie des nombres dans [0, 1[. */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Entier entre `min` et `max` inclus. */
export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) throw new Error("pick : liste vide");
  return items[Math.floor(rng() * items.length)]!;
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/** Vrai avec la probabilité `probability`. */
export function chance(rng: Rng, probability: number): boolean {
  return rng() < probability;
}

/** Graine aléatoire (non reproductible), pour tirer de nouvelles questions. */
export function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]!;
}
