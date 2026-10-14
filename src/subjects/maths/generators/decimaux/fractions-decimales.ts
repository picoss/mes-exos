// Fraction décimale ↔ écriture décimale : [[254/100]] = 2,54 ; 0,07 = [[…/100]].

import { withDecimals } from "../../../../core/decimal";
import { chance, pick, randInt, shuffle, type Rng } from "../../../../core/rng";
import type { GeneratorModule, QuestionContent } from "../../../../core/types";
import { BLANK, dec, frac, plural, show } from "../../lib/format";
import { POWERS, digitAt, rankName, type DecimalScale } from "../../lib/ranks";

/** Entier entre min et max qui ne finit pas par 0 (sinon la fraction se simplifie). */
function numerator(rng: Rng, min: number, max: number): number {
  let n: number;
  do n = randInt(rng, min, max);
  while (n % 10 === 0);
  return n;
}

function toDecimal(num: number, scale: DecimalScale): QuestionContent {
  const den = POWERS[scale];
  const value = dec(num, scale);
  const whole = Math.floor(num / den);
  const rest = num % den;
  const fraction = frac(num, den);
  const solution = [`${fraction} = ${show(num)} ${rankName(scale, num)}.`];
  if (whole > 0) {
    solution.push(
      `${show(num)} ${rankName(scale, num)} = ${whole} ${plural(whole, "unité")} et ${rest} ${rankName(scale, rest)}.`,
    );
  } else if (String(num).length < scale) {
    solution.push(`Il faut ${scale} chiffres après la virgule : on complète avec des zéros.`);
  }
  solution.push(`Donc ${fraction} = ${show(value)}.`);
  return {
    prompt: `Écris ${fraction} en écriture décimale.`,
    answer: { type: "number", value },
    hint: `${fraction}, c'est ${show(num)} ${rankName(scale, num)} : le dernier chiffre, ${num % 10}, doit être au rang des ${rankName(scale)}.`,
    solution,
  };
}

function toFraction(num: number, scale: DecimalScale): QuestionContent {
  const den = POWERS[scale];
  const value = dec(num, scale);
  return {
    prompt: `Complète : ${show(value)} = ${frac(BLANK, den)}`,
    answer: { type: "number", value: String(num) },
    hint: `${show(value)} a ${scale} ${plural(scale, "chiffre")} après la virgule : c'est un nombre de ${rankName(scale)}.`,
    solution: [
      `${show(value)} = ${show(num)} ${rankName(scale, num)}.`,
      `Donc ${show(value)} = ${frac(num, den)}.`,
    ],
  };
}

/** 2,4 = [[…/100]] : il faut d'abord ajouter un zéro (2,40 = 240 centièmes). */
function toLargerDenominator(
  units: number,
  scale: DecimalScale,
  target: DecimalScale,
): QuestionContent {
  const value = dec(units, scale);
  const padded = withDecimals(value, target);
  const num = units * 10 ** (target - scale);
  return {
    prompt: `Complète : ${show(value)} = ${frac(BLANK, POWERS[target])}`,
    answer: { type: "number", value: String(num) },
    hint: `Écris d'abord ${show(value)} avec ${target} chiffres après la virgule.`,
    solution: [
      `${show(value)} = ${show(padded)}.`,
      `${show(padded)} = ${show(num)} ${rankName(target, num)}.`,
      `Donc ${show(value)} = ${frac(num, POWERS[target])}.`,
    ],
  };
}

/** 3 + [[4/10]] + [[5/1 000]] = 3,405 : un rang manque, il faut y écrire 0. */
function fromSum(rng: Rng): QuestionContent {
  const whole = randInt(rng, 1, 20);
  const missing = pick(rng, [1, 2] as const);
  const digits = ([1, 2, 3] as const).map((scale) => (scale === missing ? 0 : randInt(rng, 1, 9)));
  const units = whole * 1000 + digits[0]! * 100 + digits[1]! * 10 + digits[2]!;
  const value = dec(units, 3);
  const terms = [
    String(whole),
    ...([1, 2, 3] as const)
      .filter((scale) => scale !== missing)
      .map((scale) => frac(digitAt(units, 3, -scale), POWERS[scale])),
  ];
  const sum = (chance(rng, 0.3) ? shuffle(rng, terms) : terms).join(" + ");
  return {
    prompt: `Écris en écriture décimale : ${sum}`,
    answer: { type: "number", value },
    hint: `Place chaque chiffre à son rang : ${frac(1, 10)} pour les dixièmes, ${frac(1, 100)} pour les centièmes, ${frac(1, 1000)} pour les millièmes. N'oublie pas les zéros.`,
    solution: [
      `${whole} ${plural(whole, "unité")}, ${digits[0]} ${rankName(1, digits[0])}, ${digits[1]} ${rankName(2, digits[1])} et ${digits[2]} ${rankName(3, digits[2])}.`,
      `Il n'y a pas de ${rankName(missing, 1)} : on écrit 0 à ce rang.`,
      `Donc ${sum} = ${show(value)}.`,
    ],
  };
}

export const generate: GeneratorModule["generate"] = ({ level, rng }) => {
  if (level === 1) {
    const scale = pick(rng, [1, 2] as const);
    const num = scale === 1 ? randInt(rng, 1, 9) : numerator(rng, 11, 99);
    return chance(rng, 0.5) ? toDecimal(num, scale) : toFraction(num, scale);
  }
  if (level === 2) {
    const scale = pick(rng, [1, 2, 3] as const);
    const num =
      scale === 1
        ? numerator(rng, 11, 99)
        : scale === 2
          ? chance(rng, 0.3)
            ? randInt(rng, 1, 9)
            : numerator(rng, 101, 999)
          : chance(rng, 0.4)
            ? numerator(rng, 1, 99)
            : numerator(rng, 1001, 9999);
    return chance(rng, 0.6) ? toDecimal(num, scale) : toFraction(num, scale);
  }
  const variant = randInt(rng, 0, 2);
  if (variant === 0) return fromSum(rng);
  if (variant === 1) {
    const scale = pick(rng, [1, 2] as const);
    const target = (scale === 1 ? pick(rng, [2, 3] as const) : 3) as DecimalScale;
    const units = scale === 1 ? numerator(rng, 11, 99) : numerator(rng, 101, 999);
    return toLargerDenominator(units, scale, target);
  }
  // Numérateur avec un zéro au milieu : [[4 027/1 000]] = 4,027.
  const [hundreds, tens] = pick(rng, [
    [0, randInt(rng, 1, 9)],
    [randInt(rng, 1, 9), 0],
    [0, 0],
  ]);
  return toDecimal(
    randInt(rng, 1, 9) * 1000 + hundreds! * 100 + tens! * 10 + randInt(rng, 1, 9),
    3,
  );
};
