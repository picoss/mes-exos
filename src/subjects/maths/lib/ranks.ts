// Rangs de la numération décimale.

export type DecimalScale = 1 | 2 | 3;

/** 10^n : POWERS[2] = 100. */
export const POWERS = [1, 10, 100, 1000, 10000] as const;

/**
 * Nom d'un rang, repéré par sa puissance de 10 : 1 = dizaines, 0 = unités, -1 = dixièmes…
 * Donné au pluriel, comme dans « le chiffre des dixièmes ».
 */
const PLACES: Record<number, { singular: string; plural: string }> = {
  3: { singular: "millier", plural: "milliers" },
  2: { singular: "centaine", plural: "centaines" },
  1: { singular: "dizaine", plural: "dizaines" },
  0: { singular: "unité", plural: "unités" },
  [-1]: { singular: "dixième", plural: "dixièmes" },
  [-2]: { singular: "centième", plural: "centièmes" },
  [-3]: { singular: "millième", plural: "millièmes" },
};

/** placeName(-2) → "centièmes" ; placeName(-2, 1) → "centième". */
export function placeName(power: number, count = 2): string {
  const place = PLACES[power];
  if (!place) throw new Error(`Rang inconnu : 10^${power}`);
  return count > 1 ? place.plural : place.singular;
}

/** Nom du rang du dernier chiffre d'un nombre à `scale` décimales : rankName(2) → "centièmes". */
export function rankName(scale: DecimalScale, count = 2): string {
  return placeName(-scale, count);
}

/** Chiffre d'un nombre mis à l'échelle, au rang 10^power : digitAt(2347, 2, -1) → 4. */
export function digitAt(units: number, scale: number, power: number): number {
  return Math.floor(units / 10 ** (scale + power)) % 10;
}

/** Position d'un rang en toutes lettres, pour les indices. */
export function placeHint(power: number): string {
  if (power === 0) return "Le chiffre des unités est juste avant la virgule.";
  if (power > 0)
    return `Le chiffre des ${placeName(power)} est le ${power + 1}e chiffre avant la virgule.`;
  const position = -power === 1 ? "1er" : `${-power}e`;
  return `Le chiffre des ${placeName(power)} est le ${position} chiffre après la virgule.`;
}
