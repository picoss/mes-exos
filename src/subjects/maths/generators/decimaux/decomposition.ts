// Décomposer un nombre décimal : valeur d'un chiffre, nombre de dixièmes ou de centièmes,
// décompositions à compléter.

import { parseDecimal, withDecimals } from "../../../../core/decimal";
import { chance, pick, randInt, shuffle, type Rng } from "../../../../core/rng";
import type { GeneratorModule, QuestionContent } from "../../../../core/types";
import { BLANK, dec, frac, show } from "../../lib/format";
import {
  POWERS,
  digitAt,
  placeHint,
  placeName,
  rankName,
  type DecimalScale,
} from "../../lib/ranks";

/** Nombre aux chiffres tous différents et non nuls (aucune ambiguïté sur « le chiffre des… »). */
function distinctDigitsNumber(rng: Rng, integerDigits: number, scale: number): number {
  const digits = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, integerDigits + scale);
  return Number(digits.join(""));
}

/** Liste des chiffres par rang : « 2 dizaines, 3 unités, 4 dixièmes et 7 centièmes ». */
function describeDigits(units: number, scale: number): string {
  const highest = String(units).length - scale - 1;
  const parts: string[] = [];
  for (let power = Math.max(highest, 0); power >= -scale; power--) {
    const digit = digitAt(units, scale, power);
    parts.push(`${digit} ${placeName(power, digit)}`);
  }
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} et ${parts.at(-1)}` : parts[0]!;
}

function digitQuestion(units: number, scale: number, power: number): QuestionContent {
  const value = dec(units, scale);
  const digit = digitAt(units, scale, power);
  return {
    prompt: `Quel est le chiffre des ${placeName(power)} dans ${show(value)} ?`,
    answer: { type: "number", value: String(digit) },
    hint: placeHint(power),
    solution: [
      `Dans ${show(value)} : ${describeDigits(units, scale)}.`,
      `Le chiffre des ${placeName(power)} est ${digit}.`,
    ],
  };
}

/** « Combien y a-t-il de centièmes en tout dans 23,47 ? » → 2 347. */
function countQuestion(value: string, scale: DecimalScale): QuestionContent {
  const { units, scale: valueScale } = parseDecimal(value);
  const count =
    valueScale <= scale
      ? units * 10 ** (scale - valueScale)
      : Math.floor(units / 10 ** (valueScale - scale));
  const solution: string[] = [];
  if (valueScale < scale) {
    solution.push(`${show(value)} = ${show(withDecimals(value, scale))}.`);
    solution.push(`On lit ${show(withDecimals(value, scale))} sans la virgule : ${show(count)}.`);
  } else if (valueScale > scale) {
    const rest = units % 10 ** (valueScale - scale);
    solution.push(
      `On lit ${show(value)} jusqu'au rang des ${rankName(scale)}, sans la virgule : ${show(count)}.`,
    );
    solution.push(
      `${show(value)} = ${show(count)} ${rankName(scale, count)} et ${rest} ${rankName(valueScale as DecimalScale, rest)}.`,
    );
  } else {
    solution.push(`On lit ${show(value)} sans la virgule : ${show(count)}.`);
  }
  solution.push(`Il y a ${show(count)} ${rankName(scale, count)} en tout dans ${show(value)}.`);
  return {
    prompt: `Combien y a-t-il de ${rankName(scale)} en tout dans ${show(value)} ?`,
    answer: { type: "number", value: String(count) },
    hint: `Lis le nombre jusqu'au rang des ${rankName(scale)}, sans la virgule.`,
    solution,
  };
}

/** 5,36 = 5 + [[…/10]] + [[6/100]] */
function missingTerm(rng: Rng): QuestionContent {
  const scale = pick(rng, [2, 3] as const);
  const units = distinctDigitsNumber(rng, 1, scale);
  const value = dec(units, scale);
  const whole = Math.floor(units / POWERS[scale]);
  const missing = randInt(rng, 1, scale);
  const terms = Array.from({ length: scale }, (_, index) => {
    const position = index + 1;
    const digit = digitAt(units, scale, -position);
    return frac(position === missing ? BLANK : digit, POWERS[position]!);
  });
  return {
    prompt: `Complète : ${show(value)} = ${whole} + ${terms.join(" + ")}`,
    answer: { type: "number", value: String(digitAt(units, scale, -missing)) },
    hint: `${frac(BLANK, POWERS[missing]!)} correspond au chiffre des ${placeName(-missing)}.`,
    solution: [
      `Dans ${show(value)} : ${describeDigits(units, scale)}.`,
      `Le chiffre des ${placeName(-missing)} est ${digitAt(units, scale, -missing)}.`,
    ],
  };
}

/** « Écris le nombre qui a 2 dizaines, 5 unités, 3 dixièmes et 8 millièmes. » */
function fromPlaces(rng: Rng): QuestionContent {
  const powers = [1, 0, -1, -2, -3];
  const missing = pick(rng, [-1, -2]);
  const digits = new Map(
    powers.map((power) => [power, power === missing ? 0 : randInt(rng, 1, 9)]),
  );
  const units = powers.reduce((sum, power) => sum + digits.get(power)! * 10 ** (power + 3), 0);
  const value = dec(units, 3);
  const parts = powers
    .filter((power) => power !== missing)
    .map((power) => `${digits.get(power)} ${placeName(power, digits.get(power))}`);
  const ordered = chance(rng, 0.5) ? shuffle(rng, parts) : parts;
  const list = `${ordered.slice(0, -1).join(", ")} et ${ordered.at(-1)}`;
  return {
    prompt: `Écris le nombre qui a ${list}.`,
    answer: { type: "number", value },
    hint: "Range les chiffres dans l'ordre : dizaines, unités, puis dixièmes, centièmes, millièmes. Mets un 0 au rang qui manque.",
    solution: [
      `${powers.map((power) => `${placeName(power)} : ${digits.get(power)}`).join(" ; ")}.`,
      `Le nombre est ${show(value)}.`,
    ],
  };
}

export const generate: GeneratorModule["generate"] = ({ level, rng }) => {
  if (level === 1) {
    const integerDigits = pick(rng, [1, 2]);
    const units = distinctDigitsNumber(rng, integerDigits, 2);
    const powers = integerDigits === 2 ? [1, 0, -1, -2] : [0, -1, -2];
    return digitQuestion(units, 2, pick(rng, powers));
  }
  if (level === 2) {
    if (chance(rng, 0.5)) {
      return digitQuestion(
        distinctDigitsNumber(rng, pick(rng, [1, 2]), 3),
        3,
        pick(rng, [-1, -2, -3]),
      );
    }
    const value = dec(distinctDigitsNumber(rng, pick(rng, [1, 2]), 2), 2);
    return countQuestion(value, pick(rng, [1, 2] as const));
  }
  const variant = randInt(rng, 0, 2);
  if (variant === 0) return missingTerm(rng);
  if (variant === 1) return fromPlaces(rng);
  // Piège : moins de décimales que le rang demandé (0,7 = 70 centièmes).
  const scale = pick(rng, [1, 2] as const);
  const value = dec(distinctDigitsNumber(rng, pick(rng, [0, 1]), scale), scale);
  return countQuestion(value, (scale + 1) as DecimalScale);
};
