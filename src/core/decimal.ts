// Nombres décimaux exacts, sans les erreurs d'arrondi des nombres flottants (0,1 + 0,2).
// Un nombre est manipulé sous forme d'entier « mis à l'échelle » : 3,25 = 325 centièmes,
// ou sous forme de texte canonique : écriture française, sans espace ni zéro inutile ("3,25").

export interface ScaledDecimal {
  /** Valeur multipliée par 10^scale (entier positif). */
  units: number;
  /** Nombre de chiffres après la virgule. */
  scale: number;
}

const NUMBER_INPUT = /^(\d*)(?:,(\d*))?$/;

/** 325, 2 → "3,25" ; 3250, 3 → "3,25" ; 7, 3 → "0,007". */
export function toDecimalString(units: number, scale: number): string {
  if (!Number.isSafeInteger(units) || units < 0) throw new Error(`Nombre non géré : ${units}`);
  const digits = String(units).padStart(scale + 1, "0");
  const integerPart = digits.slice(0, digits.length - scale);
  const decimals = digits.slice(digits.length - scale).replace(/0+$/, "");
  return decimals ? `${integerPart},${decimals}` : integerPart;
}

/**
 * Lit un nombre tapé par l'élève et renvoie son écriture canonique, ou `null` s'il est illisible.
 * Accepte le point comme la virgule, les espaces et les zéros inutiles : " 03.50 " → "3,5".
 */
export function normalizeNumber(input: string): string | null {
  const compact = input.replace(/[\s\u00a0\u202f]/g, "").replace(/\./g, ",");
  const match = NUMBER_INPUT.exec(compact);
  if (!match) return null;
  const [, integerDigits = "", decimalDigits = ""] = match;
  if (!integerDigits && !decimalDigits) return null;
  const integerPart = integerDigits.replace(/^0+(?=\d)/, "") || "0";
  const decimals = decimalDigits.replace(/0+$/, "");
  return decimals ? `${integerPart},${decimals}` : integerPart;
}

export function parseDecimal(value: string): ScaledDecimal {
  const canonical = normalizeNumber(value);
  if (canonical === null) throw new Error(`Nombre invalide : ${value}`);
  const [integerPart = "", decimals = ""] = canonical.split(",");
  const units = Number(integerPart + decimals);
  if (!Number.isSafeInteger(units)) throw new Error(`Nombre trop grand : ${value}`);
  return { units, scale: decimals.length };
}

/** Nombre de chiffres après la virgule : "3,25" → 2. */
export function scaleOf(value: string): number {
  return parseDecimal(value).scale;
}

/** Valeur mise à l'échelle demandée : toScale("3,25", 3) → 3250. */
export function toScale(value: string, scale: number): number {
  const parsed = parseDecimal(value);
  if (parsed.scale > scale)
    throw new Error(`${value} a plus de ${scale} chiffres après la virgule`);
  return parsed.units * 10 ** (scale - parsed.scale);
}

/** Négatif si a < b, positif si a > b, 0 si égaux. */
export function compareDecimals(a: string, b: string): number {
  const scale = Math.max(scaleOf(a), scaleOf(b));
  return Math.sign(toScale(a, scale) - toScale(b, scale));
}

/** Valeur de la graduation numéro `index` : start + index × step. */
export function decimalAt(start: string, step: string, index: number): string {
  const scale = Math.max(scaleOf(start), scaleOf(step));
  return toDecimalString(toScale(start, scale) + index * toScale(step, scale), scale);
}

/** Écrit le nombre avec au moins `decimals` chiffres après la virgule : ("2,5", 2) → "2,50". */
export function withDecimals(value: string, decimals: number): string {
  const [integerPart = "", existing = ""] = value.split(",");
  if (decimals <= existing.length) return value;
  return `${integerPart},${existing.padEnd(decimals, "0")}`;
}

/** Affichage : espace fine insécable entre les classes de chiffres ("12 345,6"). */
export function formatNumber(value: string): string {
  const [integerPart = "", decimals] = value.split(",");
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
  return decimals === undefined ? grouped : `${grouped},${decimals}`;
}
