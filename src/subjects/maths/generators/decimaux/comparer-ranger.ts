// Comparer et ranger des nombres décimaux, avec les pièges classiques (2,5 > 2,15).

import { compareDecimals, scaleOf, withDecimals } from "../../../../core/decimal";
import { chance, pick, randInt, shuffle, type Rng } from "../../../../core/rng";
import type { GeneratorModule, QuestionContent } from "../../../../core/types";
import { BLANK, dec, show } from "../../lib/format";
import { placeName } from "../../lib/ranks";

const SIGNS = ["<", ">", "="];

function sign(a: string, b: string): string {
  const order = compareDecimals(a, b);
  return order < 0 ? "<" : order > 0 ? ">" : "=";
}

/** Explication pas à pas : parties entières, puis chiffres après la virgule un par un. */
function explainComparison(a: string, b: string): string[] {
  const result = sign(a, b);
  const [integerA = "", decimalsA = ""] = a.split(",");
  const [integerB = "", decimalsB = ""] = b.split(",");
  if (integerA !== integerB) {
    return [
      `Les parties entières sont différentes : ${show(integerA)} ${sign(integerA, integerB)} ${show(integerB)}.`,
      `Donc ${show(a)} ${result} ${show(b)}.`,
    ];
  }
  const decimals = Math.max(decimalsA.length, decimalsB.length);
  const paddedA = withDecimals(a, decimals);
  const paddedB = withDecimals(b, decimals);
  const steps: string[] = [];
  if (paddedA !== a || paddedB !== b) {
    steps.push(
      `On écrit les deux nombres avec ${decimals} chiffres après la virgule : ${show(paddedA)} et ${show(paddedB)}.`,
    );
  }
  const digitsA = paddedA.split(",")[1]!;
  const digitsB = paddedB.split(",")[1]!;
  const position = [...digitsA].findIndex((digit, index) => digit !== digitsB[index]);
  if (position === -1) {
    steps.push("Les deux nombres ont exactement les mêmes chiffres : ils sont égaux.");
  } else {
    const place = placeName(-(position + 1));
    steps.push(
      `Même partie entière (${show(integerA)})${position > 0 ? ", mêmes premiers chiffres après la virgule" : ""}. Chiffre des ${place} : ${digitsA[position]} ${sign(digitsA[position]!, digitsB[position]!)} ${digitsB[position]}.`,
    );
  }
  steps.push(`Donc ${show(a)} ${result} ${show(b)}.`);
  return steps;
}

const HINT =
  "Compare d'abord les parties entières, puis les dixièmes, puis les centièmes… Tu peux ajouter des zéros à la fin : 2,5 = 2,50.";

function compareQuestion(a: string, b: string): QuestionContent {
  return {
    prompt: `Complète avec <, > ou = : ${show(a)} ${BLANK} ${show(b)}`,
    answer: { type: "choice", choices: SIGNS, correct: SIGNS.indexOf(sign(a, b)) },
    hint: HINT,
    solution: explainComparison(a, b),
  };
}

/** Partie décimale à `digits` chiffres, sans 0 à la fin. */
function decimals(rng: Rng, digits: number): number {
  let n: number;
  do n = randInt(rng, 0, 10 ** digits - 1);
  while (n % 10 === 0);
  return n;
}

function sameLengthPair(rng: Rng): [string, string] {
  const scale = pick(rng, [1, 2]);
  const integerA = randInt(rng, 0, 50);
  const integerB = chance(rng, 0.6) ? integerA : integerA + randInt(rng, 1, 3);
  let a: string, b: string;
  do {
    a = dec(integerA * 10 ** scale + decimals(rng, scale), scale);
    b = dec(integerB * 10 ** scale + decimals(rng, scale), scale);
  } while (a === b);
  return chance(rng, 0.5) ? [a, b] : [b, a];
}

/** Pièges : le nombre le plus long n'est pas forcément le plus grand. */
function trapPair(rng: Rng): [string, string] {
  const whole = randInt(rng, 0, 20);
  const tenths = randInt(rng, 2, 9);
  const kind = randInt(rng, 0, 3);
  let a: string, b: string;
  if (kind === 0) {
    // 2,5 et 2,15 : moins de chiffres, mais plus grand
    a = dec(whole * 10 + tenths, 1);
    b = dec(whole * 100 + randInt(rng, 1, tenths - 1) * 10 + randInt(rng, 1, 9), 2);
  } else if (kind === 1) {
    // 2,5 et 2,53
    a = dec(whole * 10 + tenths, 1);
    b = dec(whole * 100 + tenths * 10 + randInt(rng, 1, 9), 2);
  } else if (kind === 2) {
    // 0,7 et 0,072 : un zéro juste après la virgule
    a = dec(whole * 10 + tenths, 1);
    b = dec(whole * 1000 + randInt(rng, 1, 9) * 10 + randInt(rng, 1, 9), 3);
  } else {
    // 4,3 et 4,30 : égaux
    a = dec(whole * 10 + tenths, 1);
    b = withDecimals(a, 2);
  }
  return chance(rng, 0.5) ? [a, b] : [b, a];
}

/** « Quel est le plus petit nombre ? » parmi 4 nombres de longueurs différentes. */
function extremeQuestion(rng: Rng): QuestionContent {
  const whole = randInt(rng, 0, 20);
  const smallest = chance(rng, 0.5);
  let values: string[];
  do {
    values = shuffle(rng, [1, 2, 3, 2]).map((scale) =>
      dec(whole * 10 ** scale + decimals(rng, scale), scale),
    );
  } while (new Set(values.map((value) => withDecimals(value, 3))).size < 4);
  const sorted = [...values].sort(compareDecimals);
  const target = smallest ? sorted[0]! : sorted.at(-1)!;
  const longest = Math.max(...values.map(scaleOf));
  return {
    prompt: `Quel est le plus ${smallest ? "petit" : "grand"} de ces nombres ?`,
    answer: { type: "choice", choices: values.map(show), correct: values.indexOf(target) },
    hint: `Écris tous les nombres avec ${longest} chiffres après la virgule, puis compare-les.`,
    solution: [
      `Avec ${longest} chiffres après la virgule : ${values.map((value) => show(withDecimals(value, longest))).join(" ; ")}.`,
      `Rangés dans l'ordre croissant : ${sorted.map(show).join(" < ")}.`,
      `Le plus ${smallest ? "petit" : "grand"} est ${show(target)}.`,
    ],
  };
}

export const generate: GeneratorModule["generate"] = ({ level, rng }) => {
  if (level === 1) return compareQuestion(...sameLengthPair(rng));
  if (level === 2) return compareQuestion(...trapPair(rng));
  return chance(rng, 0.7) ? extremeQuestion(rng) : compareQuestion(...trapPair(rng));
};
