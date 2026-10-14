// Fractions simples ↔ écriture décimale : [[3/4]] = [[75/100]] = 0,75.
// Méthode de 6e : transformer la fraction en fraction décimale (dénominateur 10 ou 100).

import { chance, pick, shuffle, type Rng } from "../../../../core/rng";
import type { GeneratorModule, QuestionContent } from "../../../../core/types";
import { BLANK, dec, frac, show } from "../../lib/format";
import type { DecimalScale } from "../../lib/ranks";

interface Usual {
  num: number;
  den: number;
  /** Multiplicateur pour obtenir un dénominateur 10 ou 100. */
  factor: number;
  decimalNum: number;
  decimalDen: number;
  value: string;
}

const FACTORS: Record<number, number> = { 2: 5, 4: 25, 5: 2, 20: 5, 25: 4 };

function usual(num: number, den: number): Usual {
  const factor = FACTORS[den]!;
  const decimalDen = den * factor;
  const scale = (decimalDen === 10 ? 1 : 2) as DecimalScale;
  return {
    num,
    den,
    factor,
    decimalNum: num * factor,
    decimalDen,
    value: dec(num * factor, scale),
  };
}

const LEVEL_FRACTIONS: Record<number, [number, number][]> = {
  1: [
    [1, 2],
    [1, 4],
    [3, 4],
  ],
  2: [
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [3, 2],
    [1, 2],
    [1, 4],
    [3, 4],
  ],
  3: [
    [5, 2],
    [7, 2],
    [5, 4],
    [7, 4],
    [9, 4],
    [6, 5],
    [8, 5],
    [3, 2],
  ],
};

function conversionSteps(f: Usual): string[] {
  return [
    `${frac(f.num, f.den)} = ${frac(`${f.num} × ${f.factor}`, `${f.den} × ${f.factor}`)} = ${frac(f.decimalNum, f.decimalDen)}.`,
    `${frac(f.decimalNum, f.decimalDen)} = ${show(f.value)}.`,
  ];
}

function toDecimal(f: Usual): QuestionContent {
  return {
    prompt: `Écris ${frac(f.num, f.den)} en écriture décimale.`,
    answer: { type: "number", value: f.value },
    hint: `Transforme ${frac(f.num, f.den)} en fraction décimale : ${f.den} × ${f.factor} = ${f.decimalDen}.`,
    solution: conversionSteps(f),
  };
}

/** [[3/4]] = [[…/100]] */
function toDecimalFraction(f: Usual): QuestionContent {
  return {
    prompt: `Complète : ${frac(f.num, f.den)} = ${frac(BLANK, f.decimalDen)}`,
    answer: { type: "number", value: String(f.decimalNum) },
    hint: `Par quel nombre faut-il multiplier ${f.den} pour obtenir ${f.decimalDen} ?`,
    solution: [
      `${f.den} × ${f.factor} = ${f.decimalDen}.`,
      `On multiplie aussi le numérateur par ${f.factor} : ${f.num} × ${f.factor} = ${f.decimalNum}.`,
      `Donc ${frac(f.num, f.den)} = ${frac(f.decimalNum, f.decimalDen)}.`,
    ],
  };
}

/** 0,75 = [[…/4]] */
function fromDecimal(f: Usual): QuestionContent {
  return {
    prompt: `Complète : ${show(f.value)} = ${frac(BLANK, f.den)}`,
    answer: { type: "number", value: String(f.num) },
    hint: `Écris d'abord ${show(f.value)} sous forme de fraction décimale : ${frac(f.decimalNum, f.decimalDen)}.`,
    solution: [
      `${show(f.value)} = ${frac(f.decimalNum, f.decimalDen)}.`,
      `${f.decimalDen} ÷ ${f.factor} = ${f.den}, et ${f.decimalNum} ÷ ${f.factor} = ${f.num}.`,
      `Donc ${show(f.value)} = ${frac(f.num, f.den)}.`,
    ],
  };
}

/** « Quelle fraction est égale à 0,5 ? » : pièges [[1/5]] (on lit les chiffres) et [[2/1]] (inversée). */
function chooseFraction(rng: Rng, f: Usual, pool: [number, number][]): QuestionContent {
  const digits = f.value.replace(/^\d+,/, "");
  const traps: [number, number][] = [
    [f.den, f.num],
    [1, Number(digits)],
    [Number(f.value.split(",")[0]) || f.num, Number(digits)],
    ...shuffle(rng, pool),
  ];
  const equal = (a: [number, number]) => a[0] * f.den === a[1] * f.num;
  const seen = new Set<string>();
  const wrong = traps
    .filter((trap) => trap[1] > 0 && !equal(trap))
    .map(([num, den]) => frac(num, den))
    .filter((text) => !seen.has(text) && seen.add(text))
    .slice(0, 3);
  const correct = frac(f.num, f.den);
  const choices = shuffle(rng, [correct, ...wrong]);
  return {
    prompt: `Quelle fraction est égale à ${show(f.value)} ?`,
    answer: { type: "choice", choices, correct: choices.indexOf(correct) },
    hint: `Écris ${show(f.value)} sous forme de fraction décimale, puis simplifie-la.`,
    solution: [
      `${show(f.value)} = ${frac(f.decimalNum, f.decimalDen)}.`,
      `${frac(f.decimalNum, f.decimalDen)} = ${frac(`${f.num} × ${f.factor}`, `${f.den} × ${f.factor}`)} = ${frac(f.num, f.den)}.`,
    ],
  };
}

/** « Quel nombre est égal à [[7/4]] ? » : pièges 7,4 et 1,74. */
function chooseDecimal(rng: Rng, f: Usual): QuestionContent {
  const whole = Math.floor(f.num / f.den);
  const traps = [
    `${f.num},${f.den}`,
    `${f.den},${f.num}`,
    `${whole},${f.num}${f.den}`,
    `0,${f.num}${f.den}`,
  ];
  const seen = new Set([f.value]);
  const wrong = traps.filter((trap) => !seen.has(trap) && seen.add(trap)).slice(0, 3);
  const choices = shuffle(rng, [f.value, ...wrong]);
  return {
    prompt: `Quel nombre est égal à ${frac(f.num, f.den)} ?`,
    answer: { type: "choice", choices: choices.map(show), correct: choices.indexOf(f.value) },
    hint: `Transforme ${frac(f.num, f.den)} en fraction décimale : ${f.den} × ${f.factor} = ${f.decimalDen}.`,
    solution: conversionSteps(f),
  };
}

export const generate: GeneratorModule["generate"] = ({ level, rng }) => {
  const pool = LEVEL_FRACTIONS[level]!;
  const [num, den] = pick(rng, pool);
  const f = usual(num, den);
  const others = pool.filter(([n, d]) => n * f.den !== d * f.num);
  if (level === 1) {
    return pick(rng, [
      () => toDecimal(f),
      () => toDecimal(f),
      () => fromDecimal(f),
      () => chooseFraction(rng, f, others),
    ])();
  }
  if (level === 2) {
    return pick(rng, [
      () => toDecimal(f),
      () => toDecimalFraction(f),
      () => toDecimalFraction(f),
      () => (chance(rng, 0.5) ? fromDecimal(f) : chooseFraction(rng, f, others)),
    ])();
  }
  return pick(rng, [() => toDecimal(f), () => fromDecimal(f), () => chooseDecimal(rng, f)])();
};
