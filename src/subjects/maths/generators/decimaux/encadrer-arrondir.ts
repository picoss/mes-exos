// Encadrer, intercaler, arrondir un nombre décimal (à l'unité, au dixième, au centième).

import { compareDecimals, parseDecimal, toScale, withDecimals } from "../../../../core/decimal";
import { chance, pick, randInt, shuffle, type Rng } from "../../../../core/rng";
import type { GeneratorModule, QuestionContent } from "../../../../core/types";
import { dec, show } from "../../lib/format";
import { digitAt, placeName } from "../../lib/ranks";

/** Précision : 0 = unité, 1 = dixième, 2 = centième. */
type Precision = 0 | 1 | 2;

const PRECISION_NAMES = ["à l'unité", "au dixième", "au centième"];
const BOUND_NAMES = [
  "nombres entiers consécutifs",
  "nombres consécutifs à un chiffre après la virgule",
  "nombres consécutifs à deux chiffres après la virgule",
];

/** Nombre au hasard qui n'est pas déjà « rond » à la précision demandée. */
function numberToRound(rng: Rng, precision: Precision, scale: number): string {
  let units: number;
  do units = randInt(rng, 10 ** scale, 100 * 10 ** scale - 1);
  while (units % 10 === 0 || units % 10 ** (scale - precision) === 0);
  return dec(units, scale);
}

/** Valeur approchée par défaut (troncature) et par excès, à la précision demandée. */
function bounds(value: string, precision: Precision): [string, string] {
  const { units, scale } = parseDecimal(value);
  const factor = 10 ** (scale - precision);
  const lower = Math.floor(units / factor);
  return [dec(lower, precision), dec(lower + 1, precision)];
}

function rounded(value: string, precision: Precision): string {
  const { units, scale } = parseDecimal(value);
  const nextDigit = digitAt(units, scale, -(precision + 1));
  const [lower, upper] = bounds(value, precision);
  return nextDigit >= 5 ? upper : lower;
}

function frameQuestion(value: string, precision: Precision): QuestionContent {
  const [lower, upper] = bounds(value, precision);
  return {
    prompt: `Encadre ${show(value)} par deux ${BOUND_NAMES[precision]}.`,
    answer: {
      type: "multi",
      fields: [
        { label: "Nombre de gauche", value: lower },
        { label: "Nombre de droite", value: upper },
      ],
      layout: `{0} < ${show(value)} < {1}`,
    },
    hint:
      precision === 0
        ? `Le premier nombre est la partie entière de ${show(value)}.`
        : `Garde ${precision} ${precision > 1 ? "chiffres" : "chiffre"} après la virgule pour le premier nombre, puis ajoute ${show(dec(1, precision))}.`,
    solution: [
      `On garde ${show(value)} jusqu'au rang ${precision === 0 ? "des unités" : `des ${placeName(-precision)}`} : ${show(lower)}.`,
      `Le nombre suivant est ${show(upper)}.`,
      `${show(lower)} < ${show(value)} < ${show(upper)}.`,
    ],
  };
}

function roundQuestion(value: string, precision: Precision): QuestionContent {
  const { units, scale } = parseDecimal(value);
  const nextPower = -(precision + 1);
  const nextDigit = digitAt(units, scale, nextPower);
  const [lower, upper] = bounds(value, precision);
  const result = rounded(value, precision);
  const written = withDecimals(result, precision);
  return {
    prompt: `Arrondis ${show(value)} ${PRECISION_NAMES[precision]}.`,
    answer: { type: "number", value: result },
    hint: `Regarde le chiffre des ${placeName(nextPower)} : s'il vaut 5 ou plus, on arrondit au nombre du dessus.`,
    solution: [
      `${show(lower)} < ${show(value)} < ${show(upper)}.`,
      `Le chiffre des ${placeName(nextPower)} est ${nextDigit} : ${nextDigit >= 5 ? "c'est 5 ou plus, on prend le nombre du dessus" : "c'est moins de 5, on prend le nombre du dessous"}.`,
      `L'arrondi ${PRECISION_NAMES[precision]} de ${show(value)} est ${show(written)}${written !== result ? `, c'est-à-dire ${show(result)}` : ""}.`,
    ],
  };
}

/** « Quel nombre est compris entre 3,4 et 3,5 ? » */
function betweenQuestion(rng: Rng): QuestionContent {
  const lowerUnits = randInt(rng, 10, 199);
  const lower = dec(lowerUnits, 1);
  const upper = dec(lowerUnits + 1, 1);
  const inside = dec(lowerUnits * 10 + randInt(rng, 1, 9), 2);
  const [, insideDigits = ""] = inside.split(",");
  const whole = lower.split(",")[0]!;
  const reversed = `${whole},${[...insideDigits].reverse().join("")}`;
  const candidates = [
    reversed,
    `${whole},0${insideDigits.at(-1)}`,
    dec(toScale(upper, 2) + randInt(rng, 1, 9), 2),
    dec(toScale(lower, 2) - randInt(rng, 1, 9), 2),
    dec(lowerUnits + 2, 1),
  ];
  const outside = (value: string) =>
    compareDecimals(value, lower) <= 0 || compareDecimals(value, upper) >= 0;
  const seen = new Set([inside]);
  const wrong = shuffle(rng, candidates)
    .filter((value) => outside(value) && !seen.has(value) && seen.add(value))
    .slice(0, 3);
  const choices = shuffle(rng, [inside, ...wrong]);
  return {
    prompt: `Quel nombre est compris entre ${show(lower)} et ${show(upper)} ?`,
    answer: { type: "choice", choices: choices.map(show), correct: choices.indexOf(inside) },
    hint: `Écris ${show(lower)} et ${show(upper)} avec 2 chiffres après la virgule.`,
    solution: [
      `${show(lower)} = ${show(withDecimals(lower, 2))} et ${show(upper)} = ${show(withDecimals(upper, 2))}.`,
      `${show(withDecimals(lower, 2))} < ${show(inside)} < ${show(withDecimals(upper, 2))}.`,
      `Donc ${show(inside)} est compris entre ${show(lower)} et ${show(upper)}.`,
    ],
  };
}

export const generate: GeneratorModule["generate"] = ({ level, rng }) => {
  if (level === 1) {
    const value = numberToRound(rng, 0, 2);
    return chance(rng, 0.5) ? frameQuestion(value, 0) : roundQuestion(value, 0);
  }
  if (level === 2) {
    const value = numberToRound(rng, 1, pick(rng, [2, 3]));
    return chance(rng, 0.4) ? frameQuestion(value, 1) : roundQuestion(value, 1);
  }
  const variant = randInt(rng, 0, 9);
  if (variant < 3) return betweenQuestion(rng);
  if (variant < 5) return frameQuestion(numberToRound(rng, 2, 3), 2);
  // Arrondi au centième, avec parfois une retenue (3,996 → 4).
  if (chance(rng, 0.2)) {
    const whole = randInt(rng, 1, 30);
    return roundQuestion(dec(whole * 1000 + 990 + randInt(rng, 5, 9), 3), 2);
  }
  return roundQuestion(numberToRound(rng, 2, 3), 2);
};
