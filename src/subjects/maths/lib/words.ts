// Nombres en lettres, en orthographe rectifiée de 1990 (traits d'union entre tous les mots),
// recommandée par l'Éducation nationale : 21 → « vingt-et-un », 280 → « deux-cent-quatre-vingts ».

const UNITS = [
  "zéro",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
];

const TENS = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante"];

/**
 * `final` : rien ne suit ce groupe de chiffres. « vingt » (dans 80) et « cent » ne prennent
 * un s que dans ce cas : « deux-cents », mais « deux-cent-mille ».
 */
function below100(n: number, final: boolean): string {
  if (n <= 16) return UNITS[n]!;
  if (n < 20) return `dix-${UNITS[n - 10]}`;
  const tens = Math.floor(n / 10);
  const unit = n % 10;
  if (tens === 7) return unit === 1 ? "soixante-et-onze" : `soixante-${below100(10 + unit, final)}`;
  if (tens === 8)
    return unit === 0 ? (final ? "quatre-vingts" : "quatre-vingt") : `quatre-vingt-${UNITS[unit]}`;
  if (tens === 9) return `quatre-vingt-${below100(10 + unit, final)}`;
  if (unit === 0) return TENS[tens]!;
  return unit === 1 ? `${TENS[tens]}-et-un` : `${TENS[tens]}-${UNITS[unit]}`;
}

function below1000(n: number, final: boolean): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds === 0) return below100(rest, final);
  const head = hundreds === 1 ? "cent" : `${UNITS[hundreds]}-cent${rest === 0 && final ? "s" : ""}`;
  return rest === 0 ? head : `${head}-${below100(rest, final)}`;
}

/** Nombre entier de 0 à 999 999 en lettres. `feminine` : « une » au lieu de « un » (une unité). */
export function numberToWords(n: number, options: { feminine?: boolean } = {}): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999) throw new Error(`Nombre non géré : ${n}`);
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  let words: string;
  if (thousands === 0) words = below1000(rest, true);
  else {
    const head = thousands === 1 ? "mille" : `${below1000(thousands, false)}-mille`;
    words = rest === 0 ? head : `${head}-${below1000(rest, true)}`;
  }
  return options.feminine ? words.replace(/(^|-)un$/, "$1une") : words;
}
