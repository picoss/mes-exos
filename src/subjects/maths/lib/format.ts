// Aides d'écriture pour les générateurs d'exercices.

import { formatNumber, toDecimalString } from "../../../core/decimal";

/** Écriture canonique d'un nombre mis à l'échelle : dec(325, 2) → "3,25". */
export const dec = toDecimalString;

/** Nombre prêt à afficher : show("1234,5") → "1 234,5". Accepte aussi un entier. */
export function show(value: string | number): string {
  return formatNumber(String(value));
}

/** Fraction affichée : frac(3, 4) → "[[3/4]]". Les termes peuvent être des expressions ("3 × 25"). */
export function frac(num: number | string, den: number | string): string {
  const term = (value: number | string) => (typeof value === "number" ? show(value) : value);
  return `[[${term(num)}/${term(den)}]]`;
}

/** Case à compléter dans un énoncé. */
export const BLANK = "…";

/** "unité" ou "unités" selon le nombre. */
export function plural(count: number, singular: string, pluralForm = singular + "s"): string {
  return count > 1 ? pluralForm : singular;
}
